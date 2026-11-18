CREATE TABLE public.order_status_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  payment_status text NOT NULL,
  order_status text NOT NULL,
  mode text NOT NULL,
  payment_method text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX order_status_checks_created_idx ON public.order_status_checks (created_at DESC);
GRANT SELECT ON public.order_status_checks TO authenticated;
GRANT ALL ON public.order_status_checks TO service_role;
ALTER TABLE public.order_status_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read status checks" ON public.order_status_checks FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));