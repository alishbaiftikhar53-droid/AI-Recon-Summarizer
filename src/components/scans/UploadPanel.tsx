import { useState, type ChangeEvent, type DragEvent } from 'react';
import { CheckCircle2, Upload } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/StateViews';
import { navigate } from '@/hooks/useRoute';
import { errorMessage } from '@/lib/format';
import { deriveFindings } from '@/lib/findings';
import { parseScanFile } from '@/lib/scanImport';
import { importScan } from '@/lib/scanRepository';
import type { ParsedScan } from '@/types/scan';

interface Preview {
  file: File;
  parsed: ParsedScan;
  findingCount: number;
  openPorts: number;
}

function countOpenPorts(parsed: ParsedScan): number {
  return parsed.hosts.reduce((sum, host) => sum + host.ports.filter((port) => port.state === 'open').length, 0);
}

function suggestedName(parsed: ParsedScan, file: File): string {
  return parsed.name ?? parsed.targetLabel ?? file.name.replace(/\.(xml|json)$/i, '');
}

export default function UploadPanel() {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function handleFile(file: File) {
    setError(null);
    try {
      const parsed = await parseScanFile(file);
      setPreview({
        file,
        parsed,
        findingCount: deriveFindings(parsed).length,
        openPorts: countOpenPorts(parsed),
      });
      setName(suggestedName(parsed, file));
    } catch (err) {
      setPreview(null);
      setError(errorMessage(err));
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) void handleFile(file);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) void handleFile(file);
  }

  async function handleImport() {
    if (!preview || !name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const scanId = await importScan(preview.parsed, {
        name: name.trim(),
        sourceFilename: preview.file.name,
        isDemo: false,
      });
      navigate(`/scans/${scanId}`);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <Card
      title="Import a scan file"
      description="Upload an Nmap XML report or a JSON scan. The file is read in your browser, then saved to the database."
    >
      <label
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition duration-200 ${
          dragging
            ? 'border-electric-400 bg-electric-500/10'
            : 'border-night-600 bg-night-900/50 hover:border-electric-500/60 hover:bg-night-900'
        }`}
      >
        <input
          type="file"
          accept=".xml,.json,application/xml,application/json"
          className="sr-only"
          onChange={handleInputChange}
          disabled={busy}
        />
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-electric-500/15 text-electric-300">
          <Upload className="h-6 w-6" aria-hidden />
        </div>
        <div>
          <p className="font-medium text-night-100">Drop a file here, or click to choose one</p>
          <p className="mt-1 text-xs text-night-400">Nmap XML (.xml) or JSON (.json), up to 10 MB</p>
        </div>
      </label>

      {error && (
        <div className="mt-5">
          <ErrorState message={error} />
        </div>
      )}

      {preview && (
        <div className="mt-6 space-y-5 animate-fade-in">
          <div className="flex items-center gap-2 text-sm font-medium text-emerald-300">
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            File parsed. Review the summary before saving.
          </div>

          <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: 'Format', value: preview.parsed.format === 'nmap_xml' ? 'Nmap XML' : 'JSON' },
              { label: 'Hosts', value: preview.parsed.hosts.length },
              { label: 'Open ports', value: preview.openPorts },
              { label: 'Findings', value: preview.findingCount },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-night-700 bg-night-900/70 p-3">
                <dt className="text-xs uppercase tracking-wider text-night-400">{item.label}</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums text-night-100">{item.value}</dd>
              </div>
            ))}
          </dl>

          <div>
            <label htmlFor="scan-name" className="mb-1.5 block text-sm font-medium text-night-200">
              Scan name
            </label>
            <input
              id="scan-name"
              className="field"
              value={name}
              maxLength={120}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="flex flex-wrap justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setPreview(null);
                setName('');
              }}
              disabled={busy}
            >
              Discard
            </Button>
            <Button variant="primary" onClick={handleImport} loading={busy} disabled={!name.trim()}>
              Save scan
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
