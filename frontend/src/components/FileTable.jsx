import { formatBytes } from '../utils/format';

export default function FileTable({ files, selectedId, onSelect, onRemove, onClearAll, disabled }) {
  if (files.length === 0) {
    return (
      <div className="font-mono text-xs text-slate-500 border border-dashed border-ink-700 rounded-sm px-4 py-6 text-center">
        no files queued — drop a folder above to get started
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="border border-ink-700 rounded-sm overflow-hidden">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="bg-ink-800 text-slate-500 uppercase tracking-wider">
              <th className="px-3 py-2 font-medium w-12">#</th>
              <th className="px-3 py-2 font-medium">name</th>
              <th className="px-3 py-2 font-medium w-24">size</th>
              <th className="px-3 py-2 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody>
            {files.map((f, idx) => (
              <tr
                key={f.id}
                onClick={() => onSelect(f.id)}
                className={`cursor-pointer border-t border-ink-700 transition-colors
                  ${selectedId === f.id ? 'bg-ink-800 text-amber-400' : 'text-paper hover:bg-ink-800/60'}`}
              >
                <td className="px-3 py-2 text-slate-500">{idx.toString(16).padStart(2, '0')}</td>
                <td className="px-3 py-2 truncate max-w-[220px]">{f.file.name}</td>
                <td className="px-3 py-2">{formatBytes(f.file.size)}</td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={(e) => { e.stopPropagation(); onRemove(f.id); }}
                    className="text-slate-500 hover:text-rose-500 disabled:opacity-40"
                    aria-label={`Remove ${f.file.name}`}
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {onClearAll && (
        <div className="flex justify-end">
          <button
            type="button"
            disabled={disabled}
            onClick={onClearAll}
            className="font-mono text-xs text-slate-500 hover:text-rose-500 disabled:opacity-40 transition-colors"
          >
            clear all
          </button>
        </div>
      )}
    </div>
  );
}
