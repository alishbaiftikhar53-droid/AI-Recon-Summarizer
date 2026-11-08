import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/StateViews';
import { NoticeBanner } from '@/components/ui/Stats';
import { navigate } from '@/hooks/useRoute';
import { DEMO_NMAP_XML, DEMO_SCAN_NAME } from '@/lib/demoScan';
import { errorMessage } from '@/lib/format';
import { parseNmapXml } from '@/lib/parsers/nmapXml';
import { importScan } from '@/lib/scanRepository';

export default function DemoScanCard() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadDemo() {
    setBusy(true);
    setError(null);
    try {
      const scanId = await importScan(parseNmapXml(DEMO_NMAP_XML), {
        name: DEMO_SCAN_NAME,
        sourceFilename: 'demo-lab-scan.xml',
        isDemo: true,
      });
      navigate(`/scans/${scanId}`);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <Card title="Load demonstration data" description="Explore the app with a sample scan before importing your own.">
      <NoticeBanner tone="warning">
        Demonstration data: a fictional lab network (198.51.100.0/29). It is labelled wherever it appears and is not a
        real scan.
      </NoticeBanner>
      {error && (
        <div className="mt-4">
          <ErrorState message={error} />
        </div>
      )}
      <div className="mt-5">
        <Button variant="secondary" icon={<FlaskConical className="h-4 w-4" aria-hidden />} onClick={loadDemo} loading={busy}>
          Load demo scan
        </Button>
      </div>
    </Card>
  );
}
