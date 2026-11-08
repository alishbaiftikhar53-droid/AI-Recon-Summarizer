import ScanScopedView from '@/components/scans/ScanScopedView';
import ScanResultsView from '@/components/scans/ScanResultsView';

export default function ScanResultsPage({ scanId }: { scanId: string }) {
  return (
    <ScanScopedView
      basePath="scans"
      scanId={scanId}
      title="Scan Results"
      description="Open ports, detected services and findings for the selected scan."
    >
      {(bundle, _scans, reload) => <ScanResultsView key={bundle.scan.id} bundle={bundle} onChanged={reload} />}
    </ScanScopedView>
  );
}
