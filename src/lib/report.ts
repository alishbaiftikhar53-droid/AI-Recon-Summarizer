import { SEVERITY_META, SEVERITY_ORDER, countBySeverity, severityRank } from '@/lib/severity';
import { getServiceReference } from '@/lib/serviceCatalog';
import type { FindingRecord, ScanBundle } from '@/types/scan';

const REMEDIATION: Record<string, string[]> = {
  exposure: [
    'Confirm the service is required on this host. Close or firewall any port that is not needed.',
    'Restrict access to trusted networks or VPN addresses for remote administration and database services.',
    'Check that the service requires authentication and uses encrypted connections.',
  ],
  vulnerability: [
    'Check the vendor advisory for the identified CVE and confirm whether the installed version is affected.',
    'Apply the vendor patch or documented mitigation, or disable the affected service.',
    'Re-scan the host after remediation to confirm the finding no longer appears.',
  ],
  configuration: [
    'Review the service configuration against the vendor hardening guide.',
    'Remove defaults and unused features, and document the change.',
  ],
};

function escapeHtml(value: string | number | null | undefined): string {
  return String(value ?? '—')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

function sortFindings(findings: FindingRecord[]): FindingRecord[] {
  return [...findings].sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
}

function executiveSummary(bundle: ScanBundle): string {
  const { scan, findings } = bundle;
  const counts = countBySeverity(findings.map((finding) => finding.severity));
  const actionable = counts.critical + counts.high + counts.medium + counts.low;
  const cveCount = findings.filter((finding) => finding.cve_id).length;

  const paragraphs = [
    `This report summarises the scan "${scan.name}". The scan recorded ${scan.host_count} host(s) and ${scan.open_port_count} open port(s), and the analysis produced ${findings.length} finding(s).`,
    `Of these, ${counts.critical} are critical, ${counts.high} high, ${counts.medium} medium, ${counts.low} low and ${counts.informational} informational. Informational items record where services can be reached and do not on their own indicate a vulnerability.`,
  ];

  paragraphs.push(
    cveCount > 0
      ? `${cveCount} finding(s) reference a CVE identifier reported by the scanner. These are scanner-reported and must be verified against vendor advisories before being treated as confirmed.`
      : 'The scanner did not report any CVE-linked vulnerabilities for this scan. No vulnerability is claimed in this report beyond what the scan data shows.'
  );

  if (actionable === 0) {
    paragraphs.push('No findings above informational level were recorded.');
  }
  return paragraphs.map((text) => `<p>${escapeHtml(text)}</p>`).join('');
}

function hostLabel(bundle: ScanBundle, hostId: string | null): string {
  const host = bundle.hosts.find((item) => item.id === hostId);
  if (!host) return '—';
  return host.hostname ? `${host.address} (${host.hostname})` : host.address;
}

function findingLocation(bundle: ScanBundle, finding: FindingRecord): string {
  const host = hostLabel(bundle, finding.host_id);
  return finding.port_number ? `${host}:${finding.port_number}` : host;
}

function remediationSection(findings: FindingRecord[]): string {
  const categories = Array.from(new Set(findings.map((finding) => finding.category)));
  if (categories.length === 0) {
    return '<p>No findings were recorded, so no remediation steps are required for this scan. Repeat the scan periodically to detect changes.</p>';
  }
  return categories
    .map((category) => {
      const steps = (REMEDIATION[category] ?? []).map((step) => `<li>${escapeHtml(step)}</li>`).join('');
      return `<h3>${escapeHtml(category.charAt(0).toUpperCase() + category.slice(1))} findings</h3><ol>${steps}</ol>`;
    })
    .join('');
}

export function buildReportHtml(bundle: ScanBundle): string {
  const { scan, findings } = bundle;
  const ordered = sortFindings(findings);
  const counts = countBySeverity(findings.map((finding) => finding.severity));
  const serviceByPort = new Map(bundle.ports.map((port) => [`${port.host_id}:${port.port_number}`, port]));

  const demoBanner = scan.is_demo
    ? '<div class="demo">DEMONSTRATION DATA. This scan is a labelled sample and does not describe a real network.</div>'
    : '';

  const riskRows = SEVERITY_ORDER.map(
    (severity) =>
      `<tr><td>${escapeHtml(SEVERITY_META[severity].label)}</td><td class="num">${counts[severity]}</td></tr>`
  ).join('');

  const findingRows = ordered.length
    ? ordered
        .map(
          (finding) => `<tr>
  <td><span class="sev sev-${finding.severity}">${escapeHtml(SEVERITY_META[finding.severity].label)}</span></td>
  <td>${escapeHtml(finding.title)}</td>
  <td>${escapeHtml(finding.category)}</td>
  <td>${escapeHtml(finding.confidence)}</td>
  <td>${escapeHtml(finding.verification_status.replace('_', ' '))}</td>
  <td>${escapeHtml(findingLocation(bundle, finding))}</td>
</tr>`
        )
        .join('')
    : '<tr><td colspan="6">No findings recorded.</td></tr>';

  const evidenceBlocks = ordered.length
    ? ordered
        .map((finding) => {
          const port = finding.host_id && finding.port_number
            ? serviceByPort.get(`${finding.host_id}:${finding.port_number}`)
            : undefined;
          const reference = getServiceReference(port?.service_name ?? null);
          return `<div class="evidence">
  <h4>${escapeHtml(finding.title)}</h4>
  <p>${escapeHtml(finding.description)}</p>
  <p><strong>Location:</strong> ${escapeHtml(findingLocation(bundle, finding))}${
    finding.cve_id ? ` &middot; <strong>CVE:</strong> ${escapeHtml(finding.cve_id)} &middot; <strong>CVSS:</strong> ${escapeHtml(finding.cvss_score)}` : ''
  }</p>
  <pre>${escapeHtml(finding.evidence)}</pre>
  ${reference ? `<p class="ref"><strong>Service reference:</strong> ${escapeHtml(reference.summary)}</p>` : ''}
</div>`;
        })
        .join('')
    : '<p>No technical evidence to show.</p>';

  const hostRows = bundle.hosts
    .map((host) => {
      const ports = bundle.ports.filter((port) => port.host_id === host.id);
      const portText = ports.length
        ? ports.map((port) => `${port.port_number}/${port.protocol} ${port.state} ${port.service_name ?? ''}`.trim()).join(', ')
        : 'No port results';
      return `<tr><td>${escapeHtml(host.address)}</td><td>${escapeHtml(host.hostname)}</td><td>${escapeHtml(host.host_state)}</td><td>${escapeHtml(portText)}</td></tr>`;
    })
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Reconnaissance Report - ${escapeHtml(scan.name)}</title>
<style>
  body { font-family: "Segoe UI", Helvetica, Arial, sans-serif; color: #111827; margin: 0; padding: 40px; background: #ffffff; line-height: 1.5; }
  h1 { font-size: 26px; margin: 0 0 4px; color: #0b1a33; }
  h2 { font-size: 18px; color: #0b1a33; border-bottom: 2px solid #2f7bff; padding-bottom: 6px; margin-top: 32px; }
  h3 { font-size: 15px; margin: 18px 0 6px; }
  h4 { font-size: 14px; margin: 0 0 6px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 8px; }
  th, td { text-align: left; padding: 8px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
  th { background: #f1f5f9; font-weight: 600; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; }
  .meta { color: #64748b; font-size: 13px; }
  .demo { background: #fef3c7; border: 1px solid #f59e0b; color: #78350f; padding: 10px 12px; border-radius: 6px; font-weight: 600; margin-top: 16px; }
  .sev { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 12px; font-weight: 600; }
  .sev-critical { background: #fee2e2; color: #991b1b; }
  .sev-high { background: #ffedd5; color: #9a3412; }
  .sev-medium { background: #fef9c3; color: #854d0e; }
  .sev-low { background: #ccfbf1; color: #115e59; }
  .sev-informational { background: #e2e8f0; color: #334155; }
  .evidence { border: 1px solid #e5e7eb; border-radius: 6px; padding: 14px; margin-bottom: 12px; }
  pre { background: #0f172a; color: #e2e8f0; padding: 10px; border-radius: 4px; font-size: 12px; white-space: pre-wrap; word-break: break-all; }
  .ref { color: #475569; font-size: 13px; }
  .footer { margin-top: 40px; color: #64748b; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 12px; }
  @media print { body { padding: 20px; } h2 { break-after: avoid; } .evidence { break-inside: avoid; } }
</style>
</head>
<body>
<h1>Reconnaissance Report</h1>
<div class="meta">${escapeHtml(scan.name)} &middot; Generated ${escapeHtml(formatDate(new Date().toISOString()))}</div>
${demoBanner}

<h2>1. Executive summary</h2>
${executiveSummary(bundle)}

<h2>2. Scan overview</h2>
<table>
  <tr><th>Source file</th><td>${escapeHtml(scan.source_filename)}</td><th>Format</th><td>${escapeHtml(scan.source_format === 'nmap_xml' ? 'Nmap XML' : 'JSON')}</td></tr>
  <tr><th>Target</th><td>${escapeHtml(scan.target_label)}</td><th>Scan command</th><td>${escapeHtml(scan.nmap_args)}</td></tr>
  <tr><th>Started</th><td>${escapeHtml(formatDate(scan.scan_started_at))}</td><th>Finished</th><td>${escapeHtml(formatDate(scan.scan_finished_at))}</td></tr>
  <tr><th>Hosts recorded</th><td>${scan.host_count}</td><th>Open ports</th><td>${scan.open_port_count}</td></tr>
</table>

<h2>3. Risk classification</h2>
<table><tr><th>Severity</th><th class="num">Findings</th></tr>${riskRows}</table>

<h2>4. Identified findings</h2>
<table>
  <tr><th>Severity</th><th>Finding</th><th>Category</th><th>Confidence</th><th>Verification</th><th>Location</th></tr>
  ${findingRows}
</table>

<h2>5. Technical evidence</h2>
${evidenceBlocks}

<h2>6. Recommended remediation</h2>
${remediationSection(findings)}

<h2>7. Host inventory</h2>
<table><tr><th>Address</th><th>Hostname</th><th>State</th><th>Ports</th></tr>${hostRows}</table>

<div class="footer">Scanner output reflects the target at the time of the scan. Scanning must only be performed on systems you are explicitly authorised to test. Findings marked scanner-reported have not been independently verified.</div>
</body>
</html>`;
}
