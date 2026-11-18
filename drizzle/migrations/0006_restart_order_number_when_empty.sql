CREATE OR REPLACE FUNCTION public.reset_order_number_when_empty()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.orders) THEN
    PERFORM setval(pg_get_serial_sequence('public.orders','number'), 1001, false);
  END IF;
  RETURN NULL;
END $$;
REVOKE EXECUTE ON FUNCTION public.reset_order_number_when_empty() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER orders_reset_number_when_empty AFTER DELETE ON public.orders
FOR EACH STATEMENT EXECUTE FUNCTION public.reset_order_number_when_empty();
SELECT setval(pg_get_serial_sequence('public.orders','number'), 1001, false) WHERE NOT EXISTS (SELECT 1 FROM public.orders);