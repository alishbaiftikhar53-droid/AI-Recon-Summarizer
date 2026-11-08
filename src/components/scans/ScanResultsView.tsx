import { navigate } from '@/hooks/useRoute';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { DemoBadge } from '@/components/ui/Badges';
import { DemoBanner, StatCard } from '@/components/ui/Stats';
import FindingList from '@/components/scans/FindingList';
import PortTable from '@/components/scans/PortTable';
import { formatDateTime } from '@/lib/format';
import type { ScanBundle } from '@/types/scan';
import { Bot, Brain, FileText, Network, ShieldAlert, Server, ScanSearch, Bug } from 'lucide-react';

interface ScanResultsViewProps {
  bundle: ScanBundle;
  onChanged: () => void;
}

export default function ScanResultsView({ bundle, onChanged }: ScanResultsViewProps) {
  const { scan, hosts, ports, findings } = bundle;
  const openPorts = ports.filter((port) => port.state === 'open');
  const services = new Set(openPorts.map((port) => port.service_name).filter((name): name is string => Boolean(name)));

  const metadata = [
    { label: 'Source file', value: scan.source_filename ?? 'Manual import' },
    { label: 'Format', value: scan.source_format === 'nmap_xml' ? 'Nmap XML' : 'JSON' },
    { label: 'Target', value: scan.target_label ?? '—' },
    { label: 'Scan command', value: scan.nmap_args ?? '—' },
    { label: 'Started', value: formatDateTime(scan.scan_started_at) },
    { label: 'Finished', value: formatDateTime(scan.scan_finished_at) },
  ];

  return (
    <div className="space-y-8">
      {scan.is_demo && (
        <DemoBanner message="This scan is demonstration data from a fictional lab network. It does not describe a real system." />
      )}

      <div className="flex flex-wrap items-center gap-2">
        {scan.is_demo && <DemoBadge />}
        <Button variant="secondary" icon={<Brain className="h-4 w-4" aria-hidden />} onClick={() => navigate(`/analysis/${scan.id}`)}>
          AI analysis
        </Button>
        <Button variant="secondary" icon={<ShieldAlert className="h-4 w-4" aria-hidden />} onClick={() => navigate(`/risk/${scan.id}`)}>
          Risk assessment
        </Button>
        <Button variant="secondary" icon={<Bot className="h-4 w-4" aria-hidden />} onClick={() => navigate(`/assistant/${scan.id}`)}>
          Ask the assistant
        </Button>
        <Button variant="secondary" icon={<FileText className="h-4 w-4" aria-hidden />} onClick={() => navigate(`/reports/${scan.id}`)}>
          Security report
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Hosts" value={hosts.length} icon={Server} accent="bg-electric-500" hint={`${hosts.filter((host) => host.host_state === 'up').length} reported up`} />
        <StatCard label="Open ports" value={openPorts.length} icon={Network} accent="bg-teal-400" />
        <StatCard label="Services" value={services.size} icon={ScanSearch} accent="bg-violet-500" hint="Distinct open services" />
        <StatCard label="Findings" value={findings.length} icon={Bug} accent="bg-amber-400" />
      </div>

      <Card title="Scan details">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metadata.map((item) => (
            <div key={item.label} className="min-w-0">
              <dt className="text-xs uppercase tracking-wider text-night-400">{item.label}</dt>
              <dd className="mt-1 truncate text-sm text-night-100" title={item.value}>
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-night-100">Hosts and services</h2>
        {hosts.length === 0 && <p className="text-sm text-night-300">This scan does not contain any hosts.</p>}
        {hosts.map((host) => (
          <Card
            key={host.id}
            title={host.hostname ? `${host.address} (${host.hostname})` : host.address}
            description={[
              `State: ${host.host_state ?? 'unknown'}`,
              host.os_guess ? `OS guess: ${host.os_guess}` : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          >
            <PortTable ports={ports.filter((port) => port.host_id === host.id)} />
          </Card>
        ))}
      </section>

      <Card
        title="Findings"
        description="Exposure items show where services can be reached. Vulnerability items are scanner-reported matches that still need verification."
      >
        <FindingList findings={findings} hosts={hosts} onChanged={onChanged} />
      </Card>
    </div>
  );
}
