import { SEVERITY_META, SEVERITY_ORDER } from '@/lib/severity';
import type { Severity } from '@/types/scan';

interface SeverityDistributionProps {
  counts: Record<Severity, number>;
}

export default function SeverityDistribution({ counts }: SeverityDistributionProps) {
  const total = SEVERITY_ORDER.reduce((sum, severity) => sum + counts[severity], 0);
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
      <div className="relative mx-auto h-44 w-44">
        <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90" role="img" aria-label="Severity distribution">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#1E2A45" strokeWidth="18" />
          {total > 0 &&
            SEVERITY_ORDER.map((severity) => {
              const share = counts[severity] / total;
              if (share === 0) return null;
              const length = share * circumference;
              const segment = (
                <circle
                  key={severity}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke={SEVERITY_META[severity].hex}
                  strokeWidth="18"
                  strokeDasharray={`${length} ${circumference - length}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += length;
              return segment;
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold tabular-nums text-night-100">{total}</span>
          <span className="text-xs uppercase tracking-wider text-night-300">Findings</span>
        </div>
      </div>

      <ul className="space-y-3">
        {SEVERITY_ORDER.map((severity) => {
          const meta = SEVERITY_META[severity];
          const share = total > 0 ? (counts[severity] / total) * 100 : 0;
          return (
            <li key={severity}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-night-200">
                  <span className={`h-2.5 w-2.5 rounded-full ${meta.bar}`} aria-hidden />
                  {meta.label}
                </span>
                <span className="tabular-nums text-night-100">{counts[severity]}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-night-800">
                <div
                  className={`h-full rounded-full ${meta.bar} transition-all duration-700 ease-out`}
                  style={{ width: `${share}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
