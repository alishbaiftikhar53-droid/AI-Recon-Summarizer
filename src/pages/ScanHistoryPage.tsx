import { useMemo, useState } from 'react';
import { ScanSearch, Search } from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ScanTable from '@/components/scans/ScanTable';
import { ErrorState, EmptyState, LoadingState } from '@/components/ui/StateViews';
import { PageHeader, NoticeBanner } from '@/components/ui/Stats';
import { useAsync } from '@/hooks/useAsync';
import { errorMessage } from '@/lib/format';
import { deleteScan, listScans } from '@/lib/scanRepository';
import type { ScanRecord } from '@/types/scan';

export default function ScanHistoryPage() {
  const { data, error, loading, reload } = useAsync(listScans, []);
  const [query, setQuery] = useState('');
  const [pendingDelete, setPendingDelete] = useState<ScanRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const scans = data ?? [];
    if (!needle) return scans;
    return scans.filter((scan) =>
      [scan.name, scan.target_label, scan.source_filename].some((value) => value?.toLowerCase().includes(needle))
    );
  }, [data, query]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    setActionError(null);
    try {
      await deleteScan(pendingDelete.id);
      setPendingDelete(null);
      reload();
    } catch (err) {
      setActionError(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Scan History" description="Every saved scan, newest first. Select a row to open its results." />

      {actionError && <ErrorState message={actionError} />}

      {loading && <LoadingState label="Loading scan history..." />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {data && data.length === 0 && (
        <EmptyState
          icon={ScanSearch}
          title="No scans saved yet"
          description="Imported scans appear here with their host, port and finding counts."
        />
      )}

      {data && data.length > 0 && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-night-400" aria-hidden />
            <input
              className="field pl-9"
              placeholder="Search by name, target or file"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search scans"
            />
          </div>

          <div className="card overflow-hidden">
            {filtered.length === 0 ? (
              <p className="p-6 text-sm text-night-300">No scans match your search.</p>
            ) : (
              <ScanTable scans={filtered} onDelete={setPendingDelete} />
            )}
          </div>
          <p className="text-xs text-night-400">
            {filtered.length} of {data.length} scans shown
          </p>
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this scan?"
        description={
          <div className="space-y-3">
            <p>
              “{pendingDelete?.name}” and its hosts, ports and findings will be removed from the database.
            </p>
            <NoticeBanner tone="warning">This cannot be undone.</NoticeBanner>
          </div>
        }
        confirmLabel="Delete scan"
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
