import Card from '@/components/ui/Card';
import { SeverityBadge } from '@/components/ui/Badges';
import { NoticeBanner, StatCard } from '@/components/ui/Stats';
import { hostRiskSummaries, riskLevel, riskScore, RISK_LEVEL_STYLE } from '@/lib/risk';
import { highestSeverity, SEVERITY_META } from '@/lib/severity';
import type { ScanBundle } from '@/types/scan';
import { Server, ShieldAlert } from 'lucide-react';

export default function RiskPanel({ bundle }: { bundle: ScanBundle }) {
  const score = riskScore(bundle.findings);
  const level = riskLevel(score);
  const hosts = hostRiskSummaries(bundle);
  const top = highestSeverity(bundle.findings.map((finding) => finding.severity));

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card relative overflow-hidden p-6 md:col-span-1">
          <p className="text-xs font-medium uppercase tracking-wider text-night-300">Overall risk score</p>
          <p className="mt-3 flex items-baseline gap-2">
            <span className="text-5xl font-semibold tabular-nums text-night-100">{score}</span>
            <span className="text-sm text-night-400">/ 100</span>
          </p>
          <p className={`mt-2 text-sm font-semibold ${RISK_LEVEL_STYLE[level].text}`}>{level} risk</p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-night-800">
            <div className={`h-full rounded-full ${RISK_LEVEL_STYLE[level].bar} transition-all duration-700`} style={{ width: `${score}%` }} />
          </div>
        </div>
        <StatCard label="Hosts assessed" value={hosts.length} icon={Server} accent="bg-electric-500" />
        <StatCard
          label="Highest severity"
          value={top ? SEVERITY_META[top].label : 'None'}
          icon={ShieldAlert}
          accent="bg-red-500"
        />
      </div>

      <NoticeBanner>
        Methodology: each finding adds a weight (critical 25, high 12, medium 5, low 2, informational 1) and the total is
        capped at 100. This is a simple prioritisation aid, not a validated risk model.
      </NoticeBanner>

      <Card title="Host risk ranking" description="Hosts ordered from highest to lowest risk score.">
        {hosts.length === 0 ? (
          <p className="text-sm text-night-300">This scan does not contain any hosts.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-night-700/70">
            <table className="min-w-full divide-y divide-night-800">
              <thead className="bg-night-900/60">
                <tr>
                  <th className="table-head">Host</th>
                  <th className="table-head text-right">Open ports</th>
                  <th className="table-head text-right">Findings</th>
                  <th className="table-head">Highest severity</th>
                  <th className="table-head min-w-40">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-night-800/80">
                {hosts.map((host) => (
                  <tr key={host.hostId}>
                    <td className="table-cell">
                      <p className="font-mono text-night-100">{host.address}</p>
                      {host.hostname && <p className="text-xs text-night-400">{host.hostname}</p>}
                    </td>
                    <td className="table-cell text-right tabular-nums">{host.openPorts}</td>
                    <td className="table-cell text-right tabular-nums">{host.findingCount}</td>
                    <td className="table-cell">
                      {host.highest ? <SeverityBadge severity={host.highest} /> : <span className="text-night-400">None</span>}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-night-800">
                          <div className={`h-full rounded-full ${RISK_LEVEL_STYLE[host.level].bar}`} style={{ width: `${host.score}%` }} />
                        </div>
                        <span className={`w-16 text-right text-xs font-medium ${RISK_LEVEL_STYLE[host.level].text}`}>
                          {host.score} · {host.level}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
