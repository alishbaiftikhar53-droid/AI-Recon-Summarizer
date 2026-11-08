import { SeverityBadge } from '@/components/ui/Badges';
import VerificationSelect from '@/components/scans/VerificationSelect';
import { severityRank } from '@/lib/severity';
import type { FindingRecord, ScanHostRecord } from '@/types/scan';

interface FindingListProps {
  findings: FindingRecord[];
  hosts: ScanHostRecord[];
  onChanged: () => void;
}

function locationLabel(finding: FindingRecord, hosts: ScanHostRecord[]): string {
  const address = hosts.find((host) => host.id === finding.host_id)?.address ?? 'Scan-wide';
  return finding.port_number ? `${address}:${finding.port_number}` : address;
}

const CATEGORY_LABEL: Record<FindingRecord['category'], string> = {
  exposure: 'Exposure',
  vulnerability: 'Vulnerability',
  configuration: 'Configuration',
};

export default function FindingList({ findings, hosts, onChanged }: FindingListProps) {
  if (findings.length === 0) {
    return <p className="text-sm text-night-300">No findings were recorded for this scan.</p>;
  }

  const ordered = [...findings].sort((a, b) => severityRank(b.severity) - severityRank(a.severity));

  return (
    <ul className="space-y-3">
      {ordered.map((finding) => (
        <li key={finding.id} className="rounded-xl border border-night-700/70 bg-night-900/60 p-4 transition hover:border-night-600">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <SeverityBadge severity={finding.severity} />
                <span className="text-xs uppercase tracking-wider text-night-400">{CATEGORY_LABEL[finding.category]}</span>
              </div>
              <p className="font-medium text-night-100">{finding.title}</p>
              <p className="text-xs text-night-400">
                {locationLabel(finding, hosts)} · Confidence: {finding.confidence}
                {finding.cve_id && ` · ${finding.cve_id}`}
                {finding.cvss_score !== null && ` · CVSS ${finding.cvss_score}`}
              </p>
              {finding.description && <p className="text-sm leading-relaxed text-night-300">{finding.description}</p>}
              {finding.evidence && (
                <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-night-950 p-3 font-mono text-xs text-night-200">
                  {finding.evidence}
                </pre>
              )}
            </div>
            <VerificationSelect findingId={finding.id} value={finding.verification_status} onSaved={onChanged} />
          </div>
        </li>
      ))}
    </ul>
  );
}
