import { getServiceReference } from '@/lib/serviceCatalog';
import type { ScanPortRecord } from '@/types/scan';

const STATE_STYLE: Record<string, string> = {
  open: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  filtered: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
  closed: 'border-night-600 bg-night-800 text-night-300',
};

export default function PortTable({ ports }: { ports: ScanPortRecord[] }) {
  if (ports.length === 0) {
    return <p className="text-sm text-night-300">No port results were recorded for this host.</p>;
  }

  const withScriptOutput = ports.filter((port) => port.script_output);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-night-700/70">
        <table className="min-w-full divide-y divide-night-800">
          <thead className="bg-night-900/60">
            <tr>
              <th className="table-head">Port</th>
              <th className="table-head">State</th>
              <th className="table-head">Service</th>
              <th className="table-head hidden md:table-cell">Product and version</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-night-800/80">
            {ports.map((port) => {
              const reference = getServiceReference(port.service_name);
              return (
                <tr key={port.id}>
                  <td className="table-cell font-mono text-night-100">
                    {port.port_number}/{port.protocol}
                  </td>
                  <td className="table-cell">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
                        STATE_STYLE[port.state] ?? STATE_STYLE.closed
                      }`}
                    >
                      {port.state}
                    </span>
                  </td>
                  <td className="table-cell">
                    <p className="text-night-100">{reference?.label ?? port.service_name ?? 'Unknown service'}</p>
                    {reference && <p className="mt-0.5 text-xs text-night-400">{reference.group}</p>}
                  </td>
                  <td className="table-cell hidden md:table-cell">
                    {[port.product, port.version].filter(Boolean).join(' ') || '—'}
                    {port.extra_info && <p className="mt-0.5 text-xs text-night-400">{port.extra_info}</p>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {withScriptOutput.map((port) => (
        <details key={port.id} className="group rounded-xl border border-night-700/70 bg-night-900/60 p-4">
          <summary className="cursor-pointer text-sm font-medium text-night-200 transition hover:text-electric-300">
            Script output for {port.port_number}/{port.protocol}
          </summary>
          <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-night-950 p-3 font-mono text-xs text-night-200">
            {port.script_output}
          </pre>
        </details>
      ))}
    </div>
  );
}
