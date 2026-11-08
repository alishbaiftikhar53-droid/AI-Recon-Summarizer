import { useMemo } from 'react';
import { Printer } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { buildReportHtml } from '@/lib/report';
import { printReportPdf } from '@/lib/pdfExport';
import type { ScanBundle } from '@/types/scan';

export default function ReportPanel({ bundle }: { bundle: ScanBundle }) {
  const html = useMemo(() => buildReportHtml(bundle), [bundle]);

  return (
    <Card
      title="Security report"
      description="Executive summary, risk classification, findings, technical evidence, remediation and host inventory."
      action={
        <Button variant="primary" icon={<Printer className="h-4 w-4" aria-hidden />} onClick={() => printReportPdf(html)}>
          Export PDF
        </Button>
      }
    >
      <div className="overflow-hidden rounded-xl border border-night-700 bg-white">
        <iframe title="Report preview" srcDoc={html} className="h-[720px] w-full" />
      </div>
      <p className="mt-3 text-xs text-night-400">
        Export PDF opens the print dialog. Choose “Save as PDF” as the destination to keep a copy.
      </p>
    </Card>
  );
}
