import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { NoticeBanner } from '@/components/ui/Stats';
import { navigate } from '@/hooks/useRoute';
import { askAssistant, getApiBaseUrl } from '@/lib/backendApi';
import { errorMessage } from '@/lib/format';
import { countBySeverity } from '@/lib/severity';
import type { ScanBundle } from '@/types/scan';

function buildNarrativeQuestion(bundle: ScanBundle): string {
  const counts = countBySeverity(bundle.findings.map((finding) => finding.severity));
  const openPorts = bundle.ports.filter((port) => port.state === 'open').length;
  return [
    `Summarise the security posture of the scan "${bundle.scan.name}".`,
    `It records ${bundle.hosts.length} host(s), ${openPorts} open port(s) and ${bundle.findings.length} finding(s): ${counts.critical} critical, ${counts.high} high, ${counts.medium} medium, ${counts.low} low and ${counts.informational} informational.`,
    'Explain the items that most need attention and what must be verified first.',
    'Only discuss vulnerabilities that the scan data actually shows.',
  ].join(' ');
}

export default function AiNarrativeCard({ bundle }: { bundle: ScanBundle }) {
  const baseUrl = getApiBaseUrl();
  const [narrative, setNarrative] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const { answer } = await askAssistant(baseUrl, bundle.scan.id, buildNarrativeQuestion(bundle));
      setNarrative(answer);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card
      title="AI narrative"
      description="Written by your connected AI backend from this scan's data. It is separate from the rule-based analysis above and must be checked before use."
      action={
        <Button
          variant="primary"
          icon={<Sparkles className="h-4 w-4" aria-hidden />}
          onClick={generate}
          loading={loading}
          disabled={!baseUrl}
        >
          Generate narrative
        </Button>
      }
    >
      {!baseUrl && (
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
          <NoticeBanner tone="warning">No AI backend is connected. Add its address in Settings to generate a narrative.</NoticeBanner>
          <Button variant="secondary" onClick={() => navigate('/settings')}>
            Open settings
          </Button>
        </div>
      )}
      {error && <NoticeBanner tone="warning">{error}</NoticeBanner>}
      {narrative && (
        <div className="whitespace-pre-line rounded-xl border border-night-700/70 bg-night-900/60 p-5 text-sm leading-relaxed text-night-200 animate-fade-in">
          {narrative}
        </div>
      )}
    </Card>
  );
}
