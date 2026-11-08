import { useMemo } from 'react';
import { Upload } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { DemoBadge } from '@/components/ui/Badges';
import { DemoBanner, PageHeader, StatCard } from '@/components/ui/Stats';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/StateViews';
import SeverityDistribution from '@/components/charts/SeverityDistribution';
import { useAsync } from '@/hooks/useAsync';
import { navigate } from '@/hooks/useRoute';
import { formatDateTime } from '@/lib/format';
import { listFindings, listScans } from '@/lib/scanRepository';
import { countBySeverity } from '@/lib/severity';
import { ScanSearch, Network, Server, Bug, ShieldCheck } from 'lucide-react';
import type { ScanRecord } from '@/types/scan';

async function loadDashboard() {
  const [scans, findings] = await Promise.all([listScans(), listFindings()]);
  return { scans, findings };
}

function sumBy(scans: ScanRecord[], pick: (scan: ScanRecord) => number): number {
  return scans.reduce((total, scan) => total + pick(scan), 0);
}

export default function DashboardPage() {
  const { data, error, loading, reload } = useAsync(loadDashboard, []);
  const counts = useMemo(
    () => countBySeverity(data?.findings.map((finding) => finding.severity) ?? []),
    [data]
  );

  if (loading) return <LoadingState label="Loading dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const { scans, findings } = data;
  const cveCount = findings.filter((finding) => finding.cve_id).length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="An overview of every imported scan, its open services and the findings derived from them."
        actions={
          <Button variant="primary" icon={<Upload className="h-4 w-4" aria-hidden />} onClick={() => navigate('/scans')}>
            Import a scan
          </Button>
        }
      />

      {scans.some((scan) => scan.is_demo) && (
        <DemoBanner message="Some scans below are demonstration data from a fictional lab network. They are labelled and are not real results." />
      )}

      {scans.length === 0 ? (
        <EmptyState
          icon={ScanSearch}
          title="No scans imported yet"
          description="Import an Nmap XML or JSON scan to see hosts, open ports, services and findings here."
          action={
            <Button variant="primary" onClick={() => navigate('/scans')}>
              Go to Scan Management
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Saved scans" value={scans.length} icon={ScanSearch} accent="bg-electric-500" />
            <StatCard
              label="Hosts recorded"
              value={sumBy(scans, (scan) => scan.host_count)}
              icon={Server}
              accent="bg-violet-500"
            />
            <StatCard
              label="Open ports"
              value={sumBy(scans, (scan) => scan.open_port_count)}
              icon={Network}
              accent="bg-teal-400"
            />
            <StatCard
              label="CVE-linked findings"
              value={cveCount}
              icon={Bug}
              accent="bg-amber-400"
              hint={`${findings.length} findings in total`}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
            <Card title="Severity distribution" description="Across all saved findings.">
              {findings.length === 0 ? (
                <p className="text-sm text-night-300">No findings have been recorded yet.</p>
              ) : (
                <SeverityDistribution counts={counts} />
              )}
            </Card>

            <Card
              title="Recent scans"
              description="The five most recently imported scans."
              action={
                <Button variant="ghost" onClick={() => navigate('/history')}>
                  View all
                </Button>
              }
            >
              <ul className="space-y-2">
                {scans.slice(0, 5).map((scan) => (
                  <li key={scan.id}>
                    <button
                      type="button"
                      onClick={() => navigate(`/scans/${scan.id}`)}
                      className="group flex w-full items-center justify-between gap-4 rounded-xl border border-night-700/70 bg-night-900/60 px-4 py-3 text-left transition duration-200 hover:border-electric-500/60"
                    >
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 truncate text-sm font-medium text-night-100">
                          {scan.name}
                          {scan.is_demo && <DemoBadge />}
                        </p>
                        <p className="mt-0.5 text-xs text-night-400">
                          {formatDateTime(scan.created_at)} · {scan.host_count} hosts · {scan.open_port_count} open ports
                        </p>
                      </div>
                      <ShieldCheck className="h-4 w-4 shrink-0 text-night-500 transition group-hover:text-electric-300" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
