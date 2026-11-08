import { ChevronRight, Trash2 } from 'lucide-react';
import { DemoBadge, StatusBadge } from '@/components/ui/Badges';
import { navigate } from '@/hooks/useRoute';
import { formatDateTime } from '@/lib/format';
import type { ScanRecord } from '@/types/scan';

interface ScanTableProps {
  scans: ScanRecord[];
  onDelete?: (scan: ScanRecord) => void;
}

export default function ScanTable({ scans, onDelete }: ScanTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-night-700/70">
        <thead className="bg-night-900/60">
          <tr>
            <th className="table-head">Scan</th>
            <th className="table-head hidden md:table-cell">Source</th>
            <th className="table-head">Status</th>
            <th className="table-head text-right">Hosts</th>
            <th className="table-head text-right hidden sm:table-cell">Open ports</th>
            <th className="table-head text-right">Findings</th>
            <th className="table-head hidden lg:table-cell">Imported</th>
            <th className="table-head"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-night-800">
          {scans.map((scan) => (
            <tr
              key={scan.id}
              onClick={() => navigate(`/scans/${scan.id}`)}
              className="cursor-pointer transition duration-150 hover:bg-night-800/60"
            >
              <td className="table-cell">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-night-100">{scan.name}</span>
                  {scan.is_demo && <DemoBadge />}
                </div>
                <p className="mt-0.5 text-xs text-night-400">{scan.source_filename ?? 'Manual import'}</p>
              </td>
              <td className="table-cell hidden md:table-cell">
                {scan.source_format === 'nmap_xml' ? 'Nmap XML' : 'JSON'}
              </td>
              <td className="table-cell"><StatusBadge status={scan.status} /></td>
              <td className="table-cell text-right tabular-nums">{scan.host_count}</td>
              <td className="table-cell hidden text-right tabular-nums sm:table-cell">{scan.open_port_count}</td>
              <td className="table-cell text-right tabular-nums">{scan.finding_count}</td>
              <td className="table-cell hidden text-night-300 lg:table-cell">{formatDateTime(scan.created_at)}</td>
              <td className="table-cell">
                <div className="flex items-center justify-end gap-1">
                  {onDelete && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(scan);
                      }}
                      className="btn-ghost p-2 text-night-400 hover:text-red-300"
                      aria-label={`Delete ${scan.name}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  )}
                  <ChevronRight className="h-4 w-4 text-night-400" aria-hidden />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
