export default function PackConsole({ status, progress, error, archiveName, packedSize, downloadUrl }) {
  if (status === 'idle') return null;

  return (
    <div className="border border-ink-700 rounded-sm bg-ink-900 px-4 py-3 font-mono text-xs space-y-2">
      {status === 'packing' && (
        <>
          <div className="flex justify-between text-slate-400">
            <span>&gt; uploading to backend…</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1 bg-ink-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </>
      )}

      {status === 'done' && (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-cyan-400">
            &gt; wrote {archiveName} ({packedSize})
          </p>
          {downloadUrl && (
            <a
              href={downloadUrl}
              download={archiveName}
              className="px-3 py-1.5 border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-ink-950 rounded-sm transition-colors"
            >
              ↓ download again
            </a>
          )}
        </div>
      )}

      {status === 'error' && (
        <p className="text-rose-500">&gt; error: {error}</p>
      )}
    </div>
  );
}
