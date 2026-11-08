import {
  Activity,
  Bot,
  Bug,
  FileText,
  History,
  LayoutDashboard,
  ScanSearch,
  Settings,
  Shield,
  ShieldAlert,
  Brain,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useRoute } from '@/hooks/useRoute';

interface NavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  group: 'Overview' | 'Analysis' | 'Operations';
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Overview' },
  { key: 'scans', label: 'Scan Management', icon: ScanSearch, group: 'Operations' },
  { key: 'analysis', label: 'AI Analysis', icon: Brain, group: 'Analysis' },
  { key: 'risk', label: 'Risk Assessment', icon: ShieldAlert, group: 'Analysis' },
  { key: 'vulnerabilities', label: 'Vulnerability Intel', icon: Bug, group: 'Analysis' },
  { key: 'assistant', label: 'Security Assistant', icon: Bot, group: 'Analysis' },
  { key: 'history', label: 'Scan History', icon: History, group: 'Operations' },
  { key: 'reports', label: 'Reports', icon: FileText, group: 'Operations' },
  { key: 'settings', label: 'Settings', icon: Settings, group: 'Overview' },
];

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const [current] = useRoute();
  const activeKey = current ?? 'dashboard';
  const groups = ['Overview', 'Operations', 'Analysis'] as const;

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-r border-night-800 bg-night-900/95 backdrop-blur sticky top-0">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-electric-500 to-violet-500 shadow-lg shadow-electric-600/30">
          <Shield className="h-5 w-5 text-white" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight text-night-100">AI Recon</p>
          <p className="text-xs text-night-300">Summarizer</p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6" aria-label="Main navigation">
        {groups.map((group) => (
          <div key={group}>
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-widest text-night-400">{group}</p>
            <ul className="space-y-1">
              {NAV_ITEMS.filter((item) => item.group === group).map((item) => {
                const active = item.key === activeKey;
                const Icon = item.icon;
                return (
                  <li key={item.key}>
                    <a
                      href={`#/${item.key}`}
                      onClick={onNavigate}
                      aria-current={active ? 'page' : undefined}
                      className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition duration-200 ${
                        active
                          ? 'bg-electric-500/15 text-night-100'
                          : 'text-night-300 hover:bg-night-800 hover:text-night-100'
                      }`}
                    >
                      {active && <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-electric-400" aria-hidden />}
                      <Icon className={`h-4 w-4 ${active ? 'text-electric-300' : 'text-night-400 group-hover:text-electric-300'}`} aria-hidden />
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="m-3 rounded-xl border border-night-700 bg-night-850/80 p-4">
        <div className="flex items-center gap-2 text-xs font-medium text-night-200">
          <Activity className="h-3.5 w-3.5 text-electric-300" aria-hidden />
          Authorised use only
        </div>
        <p className="mt-2 text-xs leading-relaxed text-night-400">
          Scan only systems you own or have written permission to test.
        </p>
      </div>
    </aside>
  );
}
