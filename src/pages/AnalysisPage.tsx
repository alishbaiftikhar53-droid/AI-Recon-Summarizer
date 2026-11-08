import ScanScopedView from '@/components/scans/ScanScopedView';
import AnalysisPanel from '@/components/analysis/AnalysisPanel';

export default function AnalysisPage({ scanId }: { scanId?: string }) {
  return (
    <ScanScopedView
      basePath="analysis"
      scanId={scanId}
      title="AI Analysis"
      description="A rule-based breakdown of the selected scan, plus an optional AI narrative from your connected backend."
    >
      {(bundle) => <AnalysisPanel key={bundle.scan.id} bundle={bundle} />}
    </ScanScopedView>
  );
}
