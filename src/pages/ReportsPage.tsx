import ScanScopedView from '@/components/scans/ScanScopedView';
import ReportPanel from '@/components/reports/ReportPanel';

export default function ReportsPage({ scanId }: { scanId?: string }) {
  return (
    <ScanScopedView
      basePath="reports"
      scanId={scanId}
      title="Security Reports"
      description="Preview a printable report for a scan and export it as a PDF."
    >
      {(bundle) => <ReportPanel key={bundle.scan.id} bundle={bundle} />}
    </ScanScopedView>
  );
}
