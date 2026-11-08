import { useMemo, type ReactNode } from 'react';
import { ArrowRight, ScanSearch } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { DemoBadge } from '@/components/ui/Badges';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/StateViews';
import { PageHeader } from '@/components/ui/Stats';
import { useAsync } from '@/hooks/useAsync';
import { navigate } from '@/hooks/useRoute';
import { getScanBundle, listScans } from '@/lib/scanRepository';
import type { ScanBundle, ScanRecord } from '@/types/scan';

interface ScanScopedViewProps {
  basePath: string;
  scanId: string | undefined;
  title: string;
  description: string;
  children: (bundle: ScanBundle, scans: ScanRecord[], reloadBundle: () => void) => ReactNode;
}

export default function ScanScopedView({ basePath, scanId, title, description, children }: ScanScopedViewProps) {
  const scansState = useAsync(listScans, []);
  const bundleState = useAsync(
    () => (scanId ? getScanBundle(scanId) : Promise.resolve(null)),
    [scanId]
  );

  const scans = useMemo(() => scansState.data ?? [], [scansState.data]);

  if (scansState.loading) return <LoadingState label="Loading scans..." />;
  if (scansState.error) return <ErrorState message={scansState.error} onRetry={scansState.reload} />;

  if (scans.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title={title} description={description} />
        <EmptyState
          icon={ScanSearch}
          title="No scans yet"
          description="Import an Nmap XML or JSON scan first. Results appear here once a scan has been saved."
          action={<Button variant="primary" onClick={() => navigate('/scans')}>Go to Scan Management</Button>}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        description={description}
        actions={
          <label className="flex items-center gap-2 text-sm text-night-300">
            Scan
            <select
              className="field w-auto min-w-56"
              value={scanId ?? ''}
              onChange={(event) => navigate(`/${basePath}/${event.target.value}`)}
            >
              <option value="" disabled>Select a scan</option>
              {scans.map((scan) => (
                <option key={scan.id} value={scan.id}>{scan.name}</option>
              ))}
            </select>
          </label>
        }
      />

      {!scanId && (
        <Card title="Choose a scan" description="Select one of your saved scans to continue.">
          <ul className="grid gap-3 md:grid-cols-2">
            {scans.map((scan) => (
              <li key={scan.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/${basePath}/${scan.id}`)}
                  className="group flex w-full items-center justify-between gap-4 rounded-xl border border-night-700 bg-night-900/60 p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-electric-500/60"
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 truncate font-medium text-night-100">
                      {scan.name}
                      {scan.is_demo && <DemoBadge />}
                    </p>
                    <p className="mt-1 text-xs text-night-400">
                      {scan.host_count} hosts · {scan.open_port_count} open ports · {scan.finding_count} findings
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-night-400 transition group-hover:translate-x-0.5 group-hover:text-electric-300" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {scanId && bundleState.loading && <LoadingState label="Loading scan results..." />}
      {scanId && bundleState.error && <ErrorState message={bundleState.error} onRetry={bundleState.reload} />}
      {scanId && !bundleState.loading && !bundleState.error && !bundleState.data && (
        <EmptyState
          icon={ScanSearch}
          title="Scan not found"
          description="This scan could not be found. It may have been deleted."
        />
      )}
      {scanId && bundleState.data && children(bundleState.data, scans, bundleState.reload)}
    </div>
  );
}
