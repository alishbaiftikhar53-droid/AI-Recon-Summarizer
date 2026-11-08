import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent: string;
  hint?: string;
}

export function StatCard({ label, value, icon: Icon, accent, hint }: StatCardProps) {
  return (
    <div className="card group relative overflow-hidden p-5 transition duration-300 hover:-translate-y-0.5 hover:border-night-600">
      <div className={`absolute inset-x-0 top-0 h-0.5 ${accent}`} aria-hidden />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-night-300">{label}</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-night-100">{value}</p>
          {hint && <p className="mt-1 text-xs text-night-400">{hint}</p>}
        </div>
        <div className="rounded-xl bg-night-800 p-2.5 text-night-200 transition group-hover:text-electric-300">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-night-100 sm:text-3xl">{title}</h1>
        <p className="mt-1.5 max-w-3xl text-sm text-night-300">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function DemoBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
      <span className="mt-0.5 rounded bg-amber-400/20 px-1.5 text-[11px] font-bold uppercase tracking-wide text-amber-300">Demo</span>
      <p>{message}</p>
    </div>
  );
}

export function NoticeBanner({ children, tone = 'info' }: { children: ReactNode; tone?: 'info' | 'warning' }) {
  const toneClass =
    tone === 'warning'
      ? 'border-amber-400/40 bg-amber-400/10 text-amber-100'
      : 'border-electric-500/30 bg-electric-500/10 text-night-100';
  return <div className={`rounded-xl border px-4 py-3 text-sm ${toneClass}`}>{children}</div>;
}
