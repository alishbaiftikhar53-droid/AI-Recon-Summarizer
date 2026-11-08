export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'informational';
export type FindingCategory = 'exposure' | 'vulnerability' | 'configuration';
export type Confidence = 'confirmed' | 'high' | 'medium' | 'low';
export type VerificationStatus = 'scanner_reported' | 'unverified' | 'verified' | 'false_positive';
export type ScanStatus = 'queued' | 'processing' | 'completed' | 'failed';
export type SourceFormat = 'nmap_xml' | 'json';

export interface ParsedPort {
  portNumber: number;
  protocol: string;
  state: string;
  serviceName: string | null;
  product: string | null;
  version: string | null;
  extraInfo: string | null;
  scripts: Record<string, string>;
}

export interface ParsedHost {
  ref: string;
  address: string;
  hostname: string | null;
  state: string;
  osGuess: string | null;
  ports: ParsedPort[];
}

export interface ParsedScan {
  format: SourceFormat;
  name: string | null;
  targetLabel: string | null;
  nmapArgs: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  hosts: ParsedHost[];
}

export interface DerivedFinding {
  hostRef: string | null;
  portNumber: number | null;
  title: string;
  severity: Severity;
  category: FindingCategory;
  confidence: Confidence;
  verificationStatus: VerificationStatus;
  description: string;
  evidence: string;
  cveId: string | null;
  cvssScore: number | null;
  source: string;
}

export interface ScanRecord {
  id: string;
  name: string;
  source_format: SourceFormat;
  source_filename: string | null;
  target_label: string | null;
  nmap_args: string | null;
  scan_started_at: string | null;
  scan_finished_at: string | null;
  status: ScanStatus;
  status_message: string | null;
  host_count: number;
  open_port_count: number;
  finding_count: number;
  severity_counts: Partial<Record<Severity, number>>;
  is_demo: boolean;
  created_at: string;
}

export interface ScanHostRecord {
  id: string;
  scan_id: string;
  address: string;
  hostname: string | null;
  host_state: string | null;
  os_guess: string | null;
}

export interface ScanPortRecord {
  id: string;
  scan_id: string;
  host_id: string;
  port_number: number;
  protocol: string;
  state: string;
  service_name: string | null;
  product: string | null;
  version: string | null;
  extra_info: string | null;
  script_output: string | null;
}

export interface FindingRecord {
  id: string;
  scan_id: string;
  host_id: string | null;
  port_number: number | null;
  title: string;
  severity: Severity;
  category: FindingCategory;
  confidence: Confidence;
  verification_status: VerificationStatus;
  description: string | null;
  evidence: string | null;
  cve_id: string | null;
  cvss_score: number | null;
  source: string;
  created_at: string;
}

export interface ScanBundle {
  scan: ScanRecord;
  hosts: ScanHostRecord[];
  ports: ScanPortRecord[];
  findings: FindingRecord[];
}
