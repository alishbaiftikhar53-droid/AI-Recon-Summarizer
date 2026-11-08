import { severityFromCvss } from '@/lib/severity';
import type { DerivedFinding, ParsedScan } from '@/types/scan';

const CVE_LINE_PATTERN = /^\s*(CVE-\d{4}-\d{4,7})\s+(\d{1,2}(?:\.\d)?)\b/;

function serviceLabel(port: { serviceName: string | null; product: string | null; version: string | null }): string {
  return [port.product, port.version].filter(Boolean).join(' ') || port.serviceName || 'unknown service';
}

export function deriveFindings(scan: ParsedScan): DerivedFinding[] {
  const findings: DerivedFinding[] = [];

  for (const host of scan.hosts) {
    for (const port of host.ports) {
      if (port.state !== 'open') continue;
      const portLabel = `${port.portNumber}/${port.protocol}`;
      const service = port.serviceName ?? 'unknown';

      findings.push({
        hostRef: host.ref,
        portNumber: port.portNumber,
        title: `Open ${portLabel} service: ${service}`,
        severity: 'informational',
        category: 'exposure',
        confidence: 'confirmed',
        verificationStatus: 'scanner_reported',
        description:
          'The scan reports this port as open, so the service can be reached from the scanned network. An open port on its own is not a vulnerability; it shows where to look next.',
        evidence: `${portLabel} ${port.state} ${serviceLabel(port)}`.trim(),
        cveId: null,
        cvssScore: null,
        source: 'nmap:port-state',
      });

      const vulnersOutput = port.scripts.vulners;
      if (!vulnersOutput) continue;

      const seenCves = new Set<string>();
      for (const line of vulnersOutput.split('\n')) {
        const match = CVE_LINE_PATTERN.exec(line);
        if (!match) continue;
        const [, cveId, scoreText] = match;
        if (seenCves.has(cveId)) continue;
        seenCves.add(cveId);

        const cvssScore = Number(scoreText);
        findings.push({
          hostRef: host.ref,
          portNumber: port.portNumber,
          title: `${cveId} matched on ${portLabel} (${service})`,
          severity: severityFromCvss(cvssScore),
          category: 'vulnerability',
          confidence: 'medium',
          verificationStatus: 'scanner_reported',
          description: `The Nmap vulners script matched the detected service (${serviceLabel(port)}) to ${cveId}. Matches are based on version data and can be wrong, so confirm against the vendor advisory before acting.`,
          evidence: line.trim(),
          cveId,
          cvssScore,
          source: 'nmap:vulners',
        });
      }
    }
  }

  return findings;
}
