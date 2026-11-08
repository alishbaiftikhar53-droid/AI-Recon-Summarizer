import { deriveFindings } from '@/lib/findings';
import { supabase } from '@/lib/supabase';
import { countBySeverity } from '@/lib/severity';
import type {
  DerivedFinding,
  FindingRecord,
  ParsedScan,
  ScanBundle,
  ScanHostRecord,
  ScanPortRecord,
  ScanRecord,
  VerificationStatus,
} from '@/types/scan';

function toDatabaseError(action: string, error: { message: string }): Error {
  return new Error(`Could not ${action}. ${error.message}`);
}

export async function listScans(): Promise<ScanRecord[]> {
  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw toDatabaseError('load scans', error);
  return (data ?? []) as ScanRecord[];
}

export async function listFindings(): Promise<FindingRecord[]> {
  const { data, error } = await supabase
    .from('findings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5000);
  if (error) throw toDatabaseError('load findings', error);
  return (data ?? []) as FindingRecord[];
}

export async function getScanBundle(scanId: string): Promise<ScanBundle | null> {
  const scanResult = await supabase.from('scans').select('*').eq('id', scanId).maybeSingle();
  if (scanResult.error) throw toDatabaseError('load this scan', scanResult.error);
  if (!scanResult.data) return null;

  const [hostsResult, portsResult, findingsResult] = await Promise.all([
    supabase.from('scan_hosts').select('*').eq('scan_id', scanId).order('address'),
    supabase.from('scan_ports').select('*').eq('scan_id', scanId).order('port_number'),
    supabase.from('findings').select('*').eq('scan_id', scanId).order('created_at'),
  ]);
  if (hostsResult.error) throw toDatabaseError('load hosts', hostsResult.error);
  if (portsResult.error) throw toDatabaseError('load ports', portsResult.error);
  if (findingsResult.error) throw toDatabaseError('load findings', findingsResult.error);

  return {
    scan: scanResult.data as ScanRecord,
    hosts: (hostsResult.data ?? []) as ScanHostRecord[],
    ports: (portsResult.data ?? []) as ScanPortRecord[],
    findings: (findingsResult.data ?? []) as FindingRecord[],
  };
}

function scriptOutputText(scripts: Record<string, string>): string | null {
  const entries = Object.entries(scripts);
  if (entries.length === 0) return null;
  return entries.map(([id, output]) => `[${id}]\n${output}`).join('\n\n');
}

interface ImportOptions {
  name: string;
  sourceFilename: string | null;
  isDemo: boolean;
}

export async function importScan(parsed: ParsedScan, options: ImportOptions): Promise<string> {
  const scanId = crypto.randomUUID();
  const hostIds = new Map<string, string>();

  const hostRows = parsed.hosts.map((host) => {
    const id = crypto.randomUUID();
    hostIds.set(host.ref, id);
    return {
      id,
      address: host.address,
      hostname: host.hostname,
      host_state: host.state,
      os_guess: host.osGuess,
    };
  });

  const portRows = parsed.hosts.flatMap((host) =>
    host.ports.map((port) => ({
      host_id: hostIds.get(host.ref),
      port_number: port.portNumber,
      protocol: port.protocol,
      state: port.state,
      service_name: port.serviceName,
      product: port.product,
      version: port.version,
      extra_info: port.extraInfo,
      script_output: scriptOutputText(port.scripts),
    }))
  );

  const derived: DerivedFinding[] = deriveFindings(parsed);
  const findingRows = derived.map((finding) => ({
    host_id: finding.hostRef ? hostIds.get(finding.hostRef) : null,
    port_number: finding.portNumber,
    title: finding.title,
    severity: finding.severity,
    category: finding.category,
    confidence: finding.confidence,
    verification_status: finding.verificationStatus,
    description: finding.description,
    evidence: finding.evidence,
    cve_id: finding.cveId,
    cvss_score: finding.cvssScore,
    source: finding.source,
  }));

  const openPortCount = portRows.filter((port) => port.state === 'open').length;
  const scanRow = {
    id: scanId,
    name: options.name,
    source_format: parsed.format,
    source_filename: options.sourceFilename,
    target_label: parsed.targetLabel,
    nmap_args: parsed.nmapArgs,
    scan_started_at: parsed.startedAt,
    scan_finished_at: parsed.finishedAt,
    host_count: hostRows.length,
    open_port_count: openPortCount,
    finding_count: findingRows.length,
    severity_counts: countBySeverity(derived.map((finding) => finding.severity)),
    is_demo: options.isDemo,
  };

  const { data, error } = await supabase.rpc('import_scan', {
    p_scan: scanRow,
    p_hosts: hostRows,
    p_ports: portRows,
    p_findings: findingRows,
  });
  if (error) throw toDatabaseError('save this scan', error);
  return data as string;
}

export async function deleteScan(scanId: string): Promise<void> {
  const { error } = await supabase.from('scans').delete().eq('id', scanId);
  if (error) throw toDatabaseError('delete this scan', error);
}

export async function deleteDemoScans(): Promise<void> {
  const { error } = await supabase.from('scans').delete().eq('is_demo', true);
  if (error) throw toDatabaseError('delete demo data', error);
}

export async function setFindingVerification(
  findingId: string,
  status: VerificationStatus
): Promise<void> {
  const { error } = await supabase
    .from('findings')
    .update({ verification_status: status })
    .eq('id', findingId);
  if (error) throw toDatabaseError('update this finding', error);
}
