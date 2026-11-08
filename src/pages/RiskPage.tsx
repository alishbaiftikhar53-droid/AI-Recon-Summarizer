import ScanScopedView from '@/components/scans/ScanScopedView';
import RiskPanel from '@/components/risk/RiskPanel';

export default function RiskPage({ scanId }: { scanId?: string }) {
  return (
    <ScanScopedView
      basePath="risk"
      scanId={scanId}
      title="Risk Assessment"
      description="Overall and per-host risk for the selected scan, with the method used to calculate it."
    >
      {(bundle) => <RiskPanel key={bundle.scan.id} bundle={bundle} />}
    </ScanScopedView>
  );
}
