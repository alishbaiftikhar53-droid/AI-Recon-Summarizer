/*
# Create reconnaissance scan schema

Plain-English summary: this migration creates the storage for imported network scans. Each imported scan is saved as one record, with its discovered hosts, open ports and the security findings derived from them. A single database function saves a whole scan in one step so a scan is never left half-saved.

1. New Tables
- `scans`: one row per imported scan (name, source format, timing, status, summary counts, demo flag).
- `scan_hosts`: every host that appeared in a scan (address, hostname, state, OS guess).
- `scan_ports`: every port result for a host (number, protocol, state, service, product, version, script output).
- `findings`: security findings for a scan. Each has a severity, confidence level, verification status, evidence text and optional CVE identifier and CVSS score.

2. New Function
- `import_scan(p_scan, p_hosts, p_ports, p_findings)`: inserts a scan and its child rows in one transaction. Runs as the calling role, so the table policies still apply.

3. Security
- Row level security is enabled on every table.
- This app has no sign-in screen, so policies target `anon` and `authenticated` roles. Data is intentionally shared by everyone who uses the app.
- Only the verbs the app uses are granted.
- The import function is not callable by PUBLIC; it is granted to `anon` and `authenticated` only.

4. Important Notes
- Child rows are removed automatically when their scan is deleted (cascading delete).
- Severity values are restricted to critical, high, medium, low and informational.
- Ports must be between 1 and 65535.
- Statements use IF NOT EXISTS and DROP POLICY IF EXISTS so the migration can safely be re-run.
*/

CREATE TABLE IF NOT EXISTS public.scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  source_format text NOT NULL CHECK (source_format IN ('nmap_xml', 'json')),
  source_filename text,
  target_label text,
  nmap_args text,
  scan_started_at timestamptz,
  scan_finished_at timestamptz,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  status_message text,
  host_count integer NOT NULL DEFAULT 0 CHECK (host_count >= 0),
  open_port_count integer NOT NULL DEFAULT 0 CHECK (open_port_count >= 0),
  finding_count integer NOT NULL DEFAULT 0 CHECK (finding_count >= 0),
  severity_counts jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.scan_hosts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  address text NOT NULL,
  hostname text,
  host_state text,
  os_guess text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.scan_ports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  host_id uuid NOT NULL REFERENCES public.scan_hosts(id) ON DELETE CASCADE,
  port_number integer NOT NULL CHECK (port_number BETWEEN 1 AND 65535),
  protocol text NOT NULL,
  state text NOT NULL,
  service_name text,
  product text,
  version text,
  extra_info text,
  script_output text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id uuid NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  host_id uuid REFERENCES public.scan_hosts(id) ON DELETE CASCADE,
  port_number integer CHECK (port_number IS NULL OR port_number BETWEEN 1 AND 65535),
  title text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low', 'informational')),
  category text NOT NULL CHECK (category IN ('exposure', 'vulnerability', 'configuration')),
  confidence text NOT NULL CHECK (confidence IN ('confirmed', 'high', 'medium', 'low')),
  verification_status text NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('scanner_reported', 'unverified', 'verified', 'false_positive')),
  description text,
  evidence text,
  cve_id text,
  cvss_score numeric(3, 1) CHECK (cvss_score IS NULL OR (cvss_score >= 0 AND cvss_score <= 10)),
  source text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scans_created_at ON public.scans (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scan_hosts_scan_id ON public.scan_hosts (scan_id);
CREATE INDEX IF NOT EXISTS idx_scan_ports_scan_id ON public.scan_ports (scan_id);
CREATE INDEX IF NOT EXISTS idx_scan_ports_host_id ON public.scan_ports (host_id);
CREATE INDEX IF NOT EXISTS idx_findings_scan_id ON public.findings (scan_id);
CREATE INDEX IF NOT EXISTS idx_findings_severity ON public.findings (severity);

ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_ports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.findings ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.scans TO anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.scan_hosts TO anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.scan_ports TO anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.findings TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_scans" ON public.scans;
CREATE POLICY "anon_select_scans" ON public.scans FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_scans" ON public.scans;
CREATE POLICY "anon_insert_scans" ON public.scans FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_scans" ON public.scans;
CREATE POLICY "anon_update_scans" ON public.scans FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_scans" ON public.scans;
CREATE POLICY "anon_delete_scans" ON public.scans FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_scan_hosts" ON public.scan_hosts;
CREATE POLICY "anon_select_scan_hosts" ON public.scan_hosts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_scan_hosts" ON public.scan_hosts;
CREATE POLICY "anon_insert_scan_hosts" ON public.scan_hosts FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_scan_hosts" ON public.scan_hosts;
CREATE POLICY "anon_update_scan_hosts" ON public.scan_hosts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_scan_hosts" ON public.scan_hosts;
CREATE POLICY "anon_delete_scan_hosts" ON public.scan_hosts FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_scan_ports" ON public.scan_ports;
CREATE POLICY "anon_select_scan_ports" ON public.scan_ports FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_scan_ports" ON public.scan_ports;
CREATE POLICY "anon_insert_scan_ports" ON public.scan_ports FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_scan_ports" ON public.scan_ports;
CREATE POLICY "anon_update_scan_ports" ON public.scan_ports FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_scan_ports" ON public.scan_ports;
CREATE POLICY "anon_delete_scan_ports" ON public.scan_ports FOR DELETE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_findings" ON public.findings;
CREATE POLICY "anon_select_findings" ON public.findings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_findings" ON public.findings;
CREATE POLICY "anon_insert_findings" ON public.findings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_findings" ON public.findings;
CREATE POLICY "anon_update_findings" ON public.findings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_findings" ON public.findings;
CREATE POLICY "anon_delete_findings" ON public.findings FOR DELETE TO anon, authenticated USING (true);

CREATE OR REPLACE FUNCTION public.import_scan(
  p_scan jsonb,
  p_hosts jsonb,
  p_ports jsonb,
  p_findings jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_scan_id uuid := (p_scan->>'id')::uuid;
BEGIN
  INSERT INTO public.scans (
    id, name, source_format, source_filename, target_label, nmap_args,
    scan_started_at, scan_finished_at, status, host_count, open_port_count,
    finding_count, severity_counts, is_demo
  ) VALUES (
    v_scan_id,
    p_scan->>'name',
    p_scan->>'source_format',
    p_scan->>'source_filename',
    p_scan->>'target_label',
    p_scan->>'nmap_args',
    (p_scan->>'scan_started_at')::timestamptz,
    (p_scan->>'scan_finished_at')::timestamptz,
    'completed',
    COALESCE((p_scan->>'host_count')::integer, 0),
    COALESCE((p_scan->>'open_port_count')::integer, 0),
    COALESCE((p_scan->>'finding_count')::integer, 0),
    COALESCE(p_scan->'severity_counts', '{}'::jsonb),
    COALESCE((p_scan->>'is_demo')::boolean, false)
  );

  INSERT INTO public.scan_hosts (id, scan_id, address, hostname, host_state, os_guess)
  SELECT h.id, v_scan_id, h.address, h.hostname, h.host_state, h.os_guess
  FROM jsonb_to_recordset(COALESCE(p_hosts, '[]'::jsonb))
    AS h(id uuid, address text, hostname text, host_state text, os_guess text);

  INSERT INTO public.scan_ports (
    scan_id, host_id, port_number, protocol, state, service_name, product, version, extra_info, script_output
  )
  SELECT v_scan_id, p.host_id, p.port_number, p.protocol, p.state, p.service_name,
         p.product, p.version, p.extra_info, p.script_output
  FROM jsonb_to_recordset(COALESCE(p_ports, '[]'::jsonb))
    AS p(host_id uuid, port_number integer, protocol text, state text, service_name text,
         product text, version text, extra_info text, script_output text);

  INSERT INTO public.findings (
    scan_id, host_id, port_number, title, severity, category, confidence,
    verification_status, description, evidence, cve_id, cvss_score, source
  )
  SELECT v_scan_id, f.host_id, f.port_number, f.title, f.severity, f.category, f.confidence,
         f.verification_status, f.description, f.evidence, f.cve_id, f.cvss_score, f.source
  FROM jsonb_to_recordset(COALESCE(p_findings, '[]'::jsonb))
    AS f(host_id uuid, port_number integer, title text, severity text, category text,
         confidence text, verification_status text, description text, evidence text,
         cve_id text, cvss_score numeric, source text);

  RETURN v_scan_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.import_scan(jsonb, jsonb, jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.import_scan(jsonb, jsonb, jsonb, jsonb) TO anon, authenticated;
