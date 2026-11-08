import { highestSeverity } from '@/lib/severity';
import type { FindingRecord, ScanBundle, Severity } from '@/types/scan';

const SEVERITY_WEIGHT: Record<Severity, number> = {
  critical: 25,
  high: 12,
  medium: 5,
  low: 2,
  informational: 1,
};

export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Minimal';

export const RISK_LEVEL_STYLE: Record<RiskLevel, { text: string; bar: string }> = {
  Critical: { text: 'text-red-300', bar: 'bg-red-500' },
  High: { text: 'text-orange-300', bar: 'bg-orange-500' },
  Medium: { text: 'text-amber-300', bar: 'bg-amber-400' },
  Low: { text: 'text-teal-300', bar: 'bg-teal-400' },
  Minimal: { text: 'text-slate-300', bar: 'bg-slate-400' },
};

export function riskScore(findings: Pick<FindingRecord, 'severity'>[]): number {
  const total = findings.reduce((sum, finding) => sum + SEVERITY_WEIGHT[finding.severity], 0);
  return Math.min(100, total);
}

export function riskLevel(score: number): RiskLevel {
  if (score >= 75) return 'Critical';
  if (score >= 50) return 'High';
  if (score >= 25) return 'Medium';
  if (score >= 5) return 'Low';
  return 'Minimal';
}

export interface HostRiskSummary {
  hostId: string;
  address: string;
  hostname: string | null;
  openPorts: number;
  findingCount: number;
  highest: Severity | null;
  score: number;
  level: RiskLevel;
}

export function hostRiskSummaries(bundle: ScanBundle): HostRiskSummary[] {
  return bundle.hosts
    .map((host) => {
      const findings = bundle.findings.filter((finding) => finding.host_id === host.id);
      const score = riskScore(findings);
      return {
        hostId: host.id,
        address: host.address,
        hostname: host.hostname,
        openPorts: bundle.ports.filter((port) => port.host_id === host.id && port.state === 'open').length,
        findingCount: findings.length,
        highest: highestSeverity(findings.map((finding) => finding.severity)),
        score,
        level: riskLevel(score),
      };
    })
    .sort((a, b) => b.score - a.score);
}
