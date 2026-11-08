GRANT UPDATE (verification_status) ON public.findings TO anon, authenticated;

DROP POLICY IF EXISTS "anon_update_findings" ON public.findings;
CREATE POLICY "anon_update_findings" ON public.findings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
