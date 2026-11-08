import Card from '@/components/ui/Card';
import { SeverityBadge } from '@/components/ui/Badges';
import SeverityDistribution from '@/components/charts/SeverityDistribution';
import AiNarrativeCard from '@/components/analysis/AiNarrativeCard';
import { NoticeBanner } from '@/components/ui/Stats';
import { countBySeverity, severityRank } from '@/lib/severity';
import type { ScanBundle } from '@/types/scan';

export default function AnalysisPanel({ bundle }: { bundle: ScanBundle }) {
  const counts = countBySeverity(bundle.findings.map((finding) => finding.severity));
  const priority = bundle.findings
    .filter((finding) => finding.severity !== 'informational')
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity))
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <NoticeBanner>
        Rule-based analysis: the figures and priorities below are calculated directly from the scan data. No AI model is
        involved.
      </NoticeBanner>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Severity breakdown" description="How findings are distributed across severity levels.">
          <SeverityDistribution counts={counts} />
        </Card>

        <Card title="Priority items" description="Highest-severity findings above informational level.">
          {priority.length === 0 ? (
            <p className="text-sm text-night-300">No findings above informational level were recorded for this scan.</p>
          ) : (
            <ul className="space-y-3">
              {priority.map((finding) => (
                <li key={finding.id} className="rounded-xl border border-night-700/70 bg-night-900/60 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <SeverityBadge severity={finding.severity} />
                    <span className="text-sm font-medium text-night-100">{finding.title}</span>
                  </div>
                  {finding.description && (
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-night-400">{finding.description}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <AiNarrativeCard bundle={bundle} />
    </div>
  );
}
