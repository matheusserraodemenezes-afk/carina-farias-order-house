CREATE TABLE public.sales_history (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL DEFAULT auth.uid(),
 period text NOT NULL,
 orders jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT sales_period_length CHECK (char_length(trim(period)) BETWEEN 1 AND 80),
 CONSTRAINT sales_orders_array CHECK (jsonb_typeof(orders) = 'array' AND jsonb_array_length(orders) BETWEEN 1 AND 200)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales_history TO authenticated;
GRANT ALL ON public.sales_history TO service_role;
ALTER TABLE public.sales_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY sales_history_select ON public.sales_history FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY sales_history_insert ON public.sales_history FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY sales_history_update ON public.sales_history FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY sales_history_delete ON public.sales_history FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE INDEX sales_history_owner_date ON public.sales_history(user_id, updated_at DESC);