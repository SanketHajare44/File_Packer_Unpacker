// Mirrors PackerService.buildHeader on the backend: "<name> <size>" padded
// with spaces to exactly 100 bytes. Used purely for the client-side preview —
// the backend is the source of truth for what actually gets written.
export const HEADER_SIZE = 100;

export function buildHeaderBytes(name, size) {
  const raw = `${name} ${size}`;
  const bytes = new Uint8Array(HEADER_SIZE);
  const encoder = new TextEncoder();
  const encoded = encoder.encode(raw);
  const fits = encoded.length <= HEADER_SIZE;

  for (let i = 0; i < HEADER_SIZE; i++) {
    if (i < encoded.length && fits) {
      bytes[i] = encoded[i];
    } else if (fits) {
      bytes[i] = 0x20; // space padding
    } else {
      bytes[i] = i < encoded.length ? encoded[i] : 0x20;
    }
  }
  return { bytes, fits, raw };
}

export function hexDumpRows(bytes, bytesPerRow = 16) {
  const rows = [];
  for (let offset = 0; offset < bytes.length; offset += bytesPerRow) {
    const slice = bytes.slice(offset, offset + bytesPerRow);
    const hex = Array.from(slice).map((b) => b.toString(16).padStart(2, '0'));
    const ascii = Array.from(slice).map((b) => (b >= 0x20 && b <= 0x7e ? String.fromCharCode(b) : '.'));
    rows.push({
      offset: offset.toString(16).padStart(4, '0'),
      hex,
      ascii: ascii.join(''),
    });
  }
  return rows;
}

export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${i === 0 ? value : value.toFixed(1)} ${units[i]}`;
}
