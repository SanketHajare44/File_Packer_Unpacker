import { useMemo } from 'react';
import { buildHeaderBytes, hexDumpRows } from '../utils/format';

export default function HexPreview({ file }) {
  const dump = useMemo(() => {
    if (!file) return null;
    const { bytes, fits } = buildHeaderBytes(file.name, file.size);
    return { rows: hexDumpRows(bytes), fits };
  }, [file]);

  return (
    <div className="border border-ink-700 rounded-sm bg-ink-900 h-full flex flex-col">
      <div className="px-4 py-3 border-b border-ink-700 flex items-center justify-between">
        <span className="font-mono text-xs text-slate-500 uppercase tracking-widest">
          header_preview
        </span>
        <span className="font-mono text-xs text-slate-500">100 bytes</span>
      </div>

      {!file && (
        <div className="flex-1 flex items-center justify-center px-4 py-10">
          <p className="font-mono text-xs text-slate-500 text-center leading-relaxed">
            select a file to see the exact<br />100-byte header written<br />ahead of its bytes in the archive
          </p>
        </div>
      )}

      {file && dump && (
        <div className="p-4 overflow-x-auto">
          {!dump.fits && (
            <p className="font-mono text-xs text-rose-500 mb-3">
              name + size won't fit in 100 bytes — this file will be rejected on pack
            </p>
          )}
          <div className="font-mono text-[11px] leading-6 space-y-0.5">
            {dump.rows.map((row) => (
              <div key={row.offset} className="flex gap-3 text-slate-400">
                <span className="text-slate-500 w-10 shrink-0">{row.offset}</span>
                <span className="flex-1 tracking-wider">
                  {row.hex.map((byte, i) => (
                    <span
                      key={i}
                      className={byte === '20' ? 'text-ink-700' : 'text-paper'}
                    >
                      {byte}{' '}
                    </span>
                  ))}
                </span>
                <span className="text-cyan-400 w-40 shrink-0">{row.ascii}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
