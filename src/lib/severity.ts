import type { Severity } from '@/types/scan';

export const SEVERITY_ORDER: Severity[] = ['critical', 'high', 'medium', 'low', 'informational'];

export const SEVERITY_META: Record<
  Severity,
  { label: string; text: string; bg: string; border: string; bar: string; hex: string; rank: number }
> = {
  critical: { label: 'Critical', text: 'text-red-300', bg: 'bg-red-500/15', border: 'border-red-500/40', bar: 'bg-red-500', hex: '#ef4444', rank: 5 },
  high: { label: 'High', text: 'text-orange-300', bg: 'bg-orange-500/15', border: 'border-orange-500/40', bar: 'bg-orange-500', hex: '#f97316', rank: 4 },
  medium: { label: 'Medium', text: 'text-amber-300', bg: 'bg-amber-400/15', border: 'border-amber-400/40', bar: 'bg-amber-400', hex: '#fbbf24', rank: 3 },
  low: { label: 'Low', text: 'text-teal-300', bg: 'bg-teal-400/15', border: 'border-teal-400/40', bar: 'bg-teal-400', hex: '#2dd4bf', rank: 2 },
  informational: { label: 'Informational', text: 'text-slate-300', bg: 'bg-slate-400/15', border: 'border-slate-400/40', bar: 'bg-slate-400', hex: '#94a3b8', rank: 1 },
};

export function severityRank(severity: Severity): number {
  return SEVERITY_META[severity].rank;
}

export function highestSeverity(severities: Severity[]): Severity | null {
  if (severities.length === 0) return null;
  return severities.reduce((top, current) =>
    severityRank(current) > severityRank(top) ? current : top
  );
}

export function countBySeverity(severities: Severity[]): Record<Severity, number> {
  const counts: Record<Severity, number> = { critical: 0, high: 0, medium: 0, low: 0, informational: 0 };
  for (const severity of severities) counts[severity] += 1;
  return counts;
}

export function severityFromCvss(score: number): Severity {
  if (score >= 9) return 'critical';
  if (score >= 7) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}
