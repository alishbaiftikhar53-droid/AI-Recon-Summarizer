import { Server, Plug, FileText } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { navigate } from '@/hooks/useRoute';

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/health',
    purpose: 'Connection check. Must return a JSON body with status set to "ok".',
  },
  {
    method: 'POST',
    path: '/assistant/query',
    purpose:
      'Answers a question about one scan. Receives scan_id and question as JSON, and must return a JSON body with an answer text field.',
  },
];

export default function BackendRequirements() {
  return (
    <Card
      title="Connect an AI backend to enable the assistant"
      description="This app does not include an AI model. Answers come only from a backend service that you run and connect here."
      action={
        <Button variant="primary" icon={<Plug className="h-4 w-4" aria-hidden />} onClick={() => navigate('/settings')}>
          Open connection settings
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-3 text-sm leading-relaxed text-night-300">
          <p className="flex items-center gap-2 font-medium text-night-100">
            <Server className="h-4 w-4 text-electric-300" aria-hidden />
            What your backend must provide
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Reachable over HTTPS from a browser, with cross-origin requests allowed from this app.</li>
            <li>The two endpoints listed here, with JSON request and response bodies.</li>
            <li>Access to the scan data by scan ID, so answers reflect the stored results.</li>
            <li>Its own access control. Anyone who can reach it can ask questions about stored scans.</li>
          </ul>
        </div>

        <div className="overflow-hidden rounded-xl border border-night-700">
          <table className="min-w-full divide-y divide-night-800">
            <thead className="bg-night-900/60">
              <tr>
                <th className="table-head">Method</th>
                <th className="table-head">Endpoint</th>
                <th className="table-head">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-night-800/80">
              {ENDPOINTS.map((endpoint) => (
                <tr key={endpoint.path}>
                  <td className="table-cell font-mono text-xs text-electric-300">{endpoint.method}</td>
                  <td className="table-cell font-mono text-xs text-night-100">{endpoint.path}</td>
                  <td className="table-cell text-xs leading-relaxed">{endpoint.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-6 flex items-center gap-2 text-xs text-night-400">
        <FileText className="h-3.5 w-3.5" aria-hidden />
        Until a backend is connected, no answers are generated and nothing is simulated.
      </p>
    </Card>
  );
}
