import type { ParsedHost, ParsedPort, ParsedScan } from '@/types/scan';

const MAX_HOSTS = 5000;
const PROTOCOLS = ['tcp', 'udp'];

type JsonObject = Record<string, unknown>;

function fail(path: string, message: string): never {
  throw new Error(`Invalid JSON scan at ${path}: ${message}.`);
}

function asObject(value: unknown, path: string): JsonObject {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    fail(path, 'expected an object');
  }
  return value as JsonObject;
}

function optionalString(value: unknown, path: string): string | null {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') fail(path, 'expected text');
  return value.trim();
}

function requiredString(value: unknown, path: string): string {
  const text = optionalString(value, path);
  if (!text) fail(path, 'is required');
  return text;
}

function parsePort(value: unknown, path: string): ParsedPort {
  const port = asObject(value, path);
  const portNumber = port.port;
  if (typeof portNumber !== 'number' || !Number.isInteger(portNumber) || portNumber < 1 || portNumber > 65535) {
    fail(`${path}.port`, 'must be a whole number between 1 and 65535');
  }

  const protocol = (optionalString(port.protocol, `${path}.protocol`) ?? 'tcp').toLowerCase();
  if (!PROTOCOLS.includes(protocol)) fail(`${path}.protocol`, 'must be tcp or udp');

  const scripts: Record<string, string> = {};
  if (port.scripts !== undefined) {
    const scriptObject = asObject(port.scripts, `${path}.scripts`);
    for (const [scriptId, output] of Object.entries(scriptObject)) {
      scripts[scriptId] = requiredString(output, `${path}.scripts.${scriptId}`);
    }
  }

  return {
    portNumber,
    protocol,
    state: requiredString(port.state, `${path}.state`).toLowerCase(),
    serviceName: optionalString(port.service, `${path}.service`),
    product: optionalString(port.product, `${path}.product`),
    version: optionalString(port.version, `${path}.version`),
    extraInfo: optionalString(port.extra_info, `${path}.extra_info`),
    scripts,
  };
}

function parseHost(value: unknown, index: number): ParsedHost {
  const path = `hosts[${index}]`;
  const host = asObject(value, path);
  const ports = host.ports === undefined ? [] : host.ports;
  if (!Array.isArray(ports)) fail(`${path}.ports`, 'expected a list');

  return {
    ref: `host-${index}`,
    address: requiredString(host.address, `${path}.address`),
    hostname: optionalString(host.hostname, `${path}.hostname`),
    state: optionalString(host.state, `${path}.state`)?.toLowerCase() ?? 'unknown',
    osGuess: optionalString(host.os, `${path}.os`),
    ports: ports.map((port, portIndex) => parsePort(port, `${path}.ports[${portIndex}]`)),
  };
}

export function parseJsonScan(text: string): ParsedScan {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error('The file is not valid JSON.');
  }

  const root = asObject(raw, 'root');
  if (!Array.isArray(root.hosts)) fail('hosts', 'expected a list of hosts');
  if (root.hosts.length === 0) fail('hosts', 'the list is empty');
  if (root.hosts.length > MAX_HOSTS) fail('hosts', `a scan can contain at most ${MAX_HOSTS} hosts`);

  return {
    format: 'json',
    name: optionalString(root.name, 'name'),
    targetLabel: optionalString(root.target, 'target'),
    nmapArgs: null,
    startedAt: optionalString(root.started_at, 'started_at'),
    finishedAt: optionalString(root.finished_at, 'finished_at'),
    hosts: root.hosts.map((host, index) => parseHost(host, index)),
  };
}
