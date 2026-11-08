import type { ParsedHost, ParsedPort, ParsedScan } from '@/types/scan';

function childElements(parent: Element, tagName: string): Element[] {
  return Array.from(parent.children).filter((child) => child.tagName === tagName);
}

function unixSecondsToIso(value: string | null): string | null {
  if (!value) return null;
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  return new Date(seconds * 1000).toISOString();
}

function parsePort(portElement: Element): ParsedPort | null {
  const portNumber = Number(portElement.getAttribute('portid'));
  if (!Number.isInteger(portNumber) || portNumber < 1 || portNumber > 65535) return null;

  const stateElement = childElements(portElement, 'state')[0];
  const serviceElement = childElements(portElement, 'service')[0];
  const scripts: Record<string, string> = {};
  for (const script of childElements(portElement, 'script')) {
    const scriptId = script.getAttribute('id');
    if (!scriptId) continue;
    scripts[scriptId] = script.getAttribute('output') ?? script.textContent ?? '';
  }

  return {
    portNumber,
    protocol: portElement.getAttribute('protocol') ?? 'tcp',
    state: stateElement?.getAttribute('state') ?? 'unknown',
    serviceName: serviceElement?.getAttribute('name') ?? null,
    product: serviceElement?.getAttribute('product') ?? null,
    version: serviceElement?.getAttribute('version') ?? null,
    extraInfo: serviceElement?.getAttribute('extrainfo') ?? null,
    scripts,
  };
}

function parseHost(hostElement: Element, index: number): ParsedHost | null {
  const address = childElements(hostElement, 'address').find(
    (element) => element.getAttribute('addrtype') !== 'mac'
  )?.getAttribute('addr');
  if (!address) return null;

  const hostnameElement = hostElement.querySelector('hostnames > hostname');
  const osElement = hostElement.querySelector('os > osmatch');
  const portElements = Array.from(hostElement.querySelectorAll('ports > port'));

  return {
    ref: `host-${index}`,
    address,
    hostname: hostnameElement?.getAttribute('name') ?? null,
    state: childElements(hostElement, 'status')[0]?.getAttribute('state') ?? 'unknown',
    osGuess: osElement?.getAttribute('name') ?? null,
    ports: portElements.map(parsePort).filter((port): port is ParsedPort => port !== null),
  };
}

function targetFromArgs(args: string | null): string | null {
  if (!args) return null;
  const tokens = args.trim().split(/\s+/);
  const last = tokens[tokens.length - 1];
  if (tokens.length < 2 || last.startsWith('-')) return null;
  return last;
}

export function parseNmapXml(xmlText: string): ParsedScan {
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml');
  if (doc.querySelector('parsererror')) {
    throw new Error('The file is not valid XML.');
  }

  const root = doc.documentElement;
  if (root.tagName !== 'nmaprun') {
    throw new Error('This XML file is not an Nmap scan report.');
  }

  const hosts = Array.from(root.getElementsByTagName('host'))
    .map((element, index) => parseHost(element, index))
    .filter((host): host is ParsedHost => host !== null);

  if (hosts.length === 0) {
    throw new Error('The Nmap report does not contain any hosts.');
  }

  const args = root.getAttribute('args');

  return {
    format: 'nmap_xml',
    name: null,
    targetLabel: targetFromArgs(args),
    nmapArgs: args,
    startedAt: unixSecondsToIso(root.getAttribute('start')),
    finishedAt: unixSecondsToIso(root.querySelector('runstats > finished')?.getAttribute('time') ?? null),
    hosts,
  };
}
