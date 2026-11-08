import { useState } from 'react';
import { Database, Plug, Save, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { ErrorState, LoadingState } from '@/components/ui/StateViews';
import { NoticeBanner, PageHeader } from '@/components/ui/Stats';
import { useAsync } from '@/hooks/useAsync';
import { checkBackendHealth, getApiBaseUrl, setApiBaseUrl } from '@/lib/backendApi';
import { errorMessage } from '@/lib/format';
import { deleteDemoScans, listScans } from '@/lib/scanRepository';

interface StatusMessage {
  tone: 'ok' | 'error';
  text: string;
}

function BackendSettingsCard() {
  const [url, setUrl] = useState(getApiBaseUrl);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<StatusMessage | null>(null);

  async function handleSave() {
    const trimmed = url.trim();
    setApiBaseUrl(trimmed);
    setUrl(trimmed);
    if (!trimmed) {
      setStatus({ tone: 'ok', text: 'Backend disconnected. The assistant will show setup instructions until one is connected.' });
      return;
    }
    setTesting(true);
    setStatus(null);
    try {
      const result = await checkBackendHealth(trimmed);
      setStatus({ tone: 'ok', text: `Connected. ${result.detail}` });
    } catch (err) {
      setStatus({ tone: 'error', text: `Saved, but the connection test failed. ${errorMessage(err)}` });
    } finally {
      setTesting(false);
    }
  }

  return (
    <Card
      title="AI backend connection"
      description="The address of the backend service that answers assistant questions. The app stores this address in this browser only."
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="backend-url" className="mb-1.5 block text-sm font-medium text-night-200">
            Backend address
          </label>
          <input
            id="backend-url"
            type="url"
            className="field"
            placeholder="https://your-backend.example.com"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" icon={<Save className="h-4 w-4" aria-hidden />} onClick={handleSave} loading={testing}>
            Save and test
          </Button>
          {url && (
            <Button variant="ghost" icon={<Plug className="h-4 w-4" aria-hidden />} onClick={() => { setUrl(''); setApiBaseUrl(''); setStatus({ tone: 'ok', text: 'Backend disconnected.' }); }}>
              Disconnect
            </Button>
          )}
        </div>
        {status && <NoticeBanner tone={status.tone === 'error' ? 'warning' : 'info'}>{status.text}</NoticeBanner>}
        {!getApiBaseUrl() && !status && (
          <p className="text-xs text-night-400">No backend is connected. AI features stay disabled until one is added.</p>
        )}
      </div>
    </Card>
  );
}

function DatabaseCard() {
  const { data, error, loading, reload } = useAsync(listScans, []);

  return (
    <Card title="Database" description="Scans and findings are saved to the connected database.">
      {loading && <LoadingState label="Checking database..." />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && (
        <NoticeBanner>
          Connected. {data.length} saved {data.length === 1 ? 'scan' : 'scans'} available.
        </NoticeBanner>
      )}
    </Card>
  );
}

function DemoDataCard() {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function removeDemo() {
    setBusy(true);
    setError(null);
    try {
      await deleteDemoScans();
      setDone(true);
      setConfirming(false);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title="Demonstration data" description="Remove sample scans created with the demo loader. Your own imported scans are not affected.">
      <div className="space-y-4">
        {error && <NoticeBanner tone="warning">{error}</NoticeBanner>}
        {done && <NoticeBanner>Demonstration scans were removed.</NoticeBanner>}
        <Button variant="danger" icon={<Trash2 className="h-4 w-4" aria-hidden />} onClick={() => setConfirming(true)}>
          Remove demonstration scans
        </Button>
      </div>
      <ConfirmDialog
        open={confirming}
        title="Remove demonstration scans?"
        description="All scans marked as demonstration data, with their hosts, ports and findings, will be deleted. This cannot be undone."
        confirmLabel="Remove demo scans"
        busy={busy}
        onConfirm={() => void removeDemo()}
        onCancel={() => setConfirming(false)}
      />
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Settings" description="Connect the AI backend, check the database and manage demonstration data." />
      <div className="grid max-w-4xl gap-6">
        <BackendSettingsCard />
        <DatabaseCard />
        <DemoDataCard />
      </div>
      <p className="flex items-center gap-2 text-xs text-night-400">
        <Database className="h-3.5 w-3.5" aria-hidden />
        Scan imports are only stored when the database accepts them.
      </p>
    </div>
  );
}
