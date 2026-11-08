import { parseJsonScan } from '@/lib/parsers/jsonScan';
import { parseNmapXml } from '@/lib/parsers/nmapXml';
import type { ParsedScan } from '@/types/scan';

const MAX_FILE_BYTES = 10 * 1024 * 1024;

export async function parseScanFile(file: File): Promise<ParsedScan> {
  if (file.size === 0) throw new Error('The selected file is empty.');
  if (file.size > MAX_FILE_BYTES) throw new Error('Files larger than 10 MB are not supported.');

  const text = await file.text();
  const lowerName = file.name.toLowerCase();
  const looksLikeXml = lowerName.endsWith('.xml') || text.trimStart().startsWith('<');

  if (looksLikeXml) return parseNmapXml(text);
  if (lowerName.endsWith('.json')) return parseJsonScan(text);
  throw new Error('Unsupported file type. Upload an Nmap XML (.xml) or JSON (.json) file.');
}
