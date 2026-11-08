import { SEVERITY_META } from '@/lib/severity';
import type { Severity } from '@/types/scan';

export function SeverityBadge({ severity }: { severity: Severity }) {
  const meta = SEVERITY_META[severity];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.bg} ${meta.border} ${meta.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.bar}`} aria-hidden />
      {meta.label}
    </span>
  );
}

const SCAN_STATUS: Record<string, { label: string; className: string }> = {
  completed: { label: 'Completed', className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' },
  processing: { label: 'Processing', className: 'border-electric-400/40 bg-electric-500/10 text-electric-300' },
  queued: { label: 'Queued', className: 'border-night-500 bg-night-800 text-night-200' },
  failed: { label: 'Failed', className: 'border-red-500/40 bg-red-500/10 text-red-300' },
};

export function StatusBadge({ status }: { status: string }) {
  const meta = SCAN_STATUS[status] ?? SCAN_STATUS.queued;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${meta.className}`}>
      {meta.label}
    </span>
  );
}

export function DemoBadge() {
  return (
    <span className="inline-flex items-center rounded-md border border-amber-400/50 bg-amber-400/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
      Demo data
    </span>
  );
}

export function VerificationBadge({ status }: { status: string }) {
  const labels: Record<string, { label: string; className: string }> = {
    scanner_reported: { label: 'Scanner reported', className: 'text-amber-300' },
    unverified: { label: 'Unverified', className: 'text-night-300' },
    verified: { label: 'Verified', className: 'text-emerald-300' },
    false_positive: { label: 'False positive', className: 'text-slate-400' },
  };
  const meta = labels[status] ?? labels.unverified;
  return <span className={`text-xs font-medium ${meta.className}`}>{meta.label}</span>;
}
