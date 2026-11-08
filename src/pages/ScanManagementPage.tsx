import Card from '@/components/ui/Card';
import DemoScanCard from '@/components/scans/DemoScanCard';
import UploadPanel from '@/components/scans/UploadPanel';
import { PageHeader } from '@/components/ui/Stats';

export default function ScanManagementPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Scan Management"
        description="Import Nmap XML or JSON scan results. Files are read in your browser and saved to the database. This app does not run scans itself."
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <UploadPanel />
        <div className="space-y-6">
          <DemoScanCard />
          <Card title="Supported formats" description="What the importer accepts.">
            <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-night-300">
              <li>Nmap XML reports created with the output option for XML (-oX).</li>
              <li>JSON files with a top-level hosts list. Each host needs an address and may list ports with a number, state and service.</li>
              <li>Files up to 10 MB. Scans with more than 5,000 hosts in JSON are rejected.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
