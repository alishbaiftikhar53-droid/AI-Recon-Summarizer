import ScanScopedView from '@/components/scans/ScanScopedView';
import AssistantPanel from '@/components/assistant/AssistantPanel';

export default function AssistantPage({ scanId }: { scanId?: string }) {
  return (
    <ScanScopedView
      basePath="assistant"
      scanId={scanId}
      title="Security Assistant"
      description="Ask questions about a scan. Answers come from the AI backend you connect in Settings."
    >
      {(bundle) => (
        <AssistantPanel
          key={bundle.scan.id}
          scanId={bundle.scan.id}
          scanName={bundle.scan.name}
          isDemo={bundle.scan.is_demo}
        />
      )}
    </ScanScopedView>
  );
}
