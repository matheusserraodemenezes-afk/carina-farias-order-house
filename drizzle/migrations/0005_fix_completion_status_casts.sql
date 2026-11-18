CREATE OR REPLACE FUNCTION public.update_order_with_completion(_id uuid, _status text DEFAULT NULL, _payment_status text DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE current_order public.orders%ROWTYPE; first_completion boolean;
BEGIN
 IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Acesso restrito'; END IF;
 IF _status IS NOT NULL AND _status NOT IN ('novo','em_preparo','pronto','saiu_entrega','entregue','cancelado') THEN RAISE EXCEPTION 'Status inválido'; END IF;
 IF _payment_status IS NOT NULL AND _payment_status NOT IN ('pendente','pago','estornado') THEN RAISE EXCEPTION 'Pagamento inválido'; END IF;
 IF _status IS NULL AND _payment_status IS NULL THEN RAISE EXCEPTION 'Alteração vazia'; END IF;
 SELECT * INTO current_order FROM public.orders WHERE id = _id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Pedido não encontrado'; END IF;
 first_completion := current_order.completed_at IS NULL AND current_order.status = 'em_preparo' AND COALESCE(_status IN ('pronto','entregue'), false);
 UPDATE public.orders SET status = COALESCE(_status::public.order_status, status), payment_status = COALESCE(_payment_status::public.payment_status, payment_status), completed_at = CASE WHEN first_completion THEN now() ELSE completed_at END WHERE id = _id;
 RETURN first_completion;
END; $$;
REVOKE ALL ON FUNCTION public.update_order_with_completion(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_order_with_completion(uuid, text, text) TO authenticated;