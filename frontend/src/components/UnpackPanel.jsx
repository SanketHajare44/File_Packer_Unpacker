import { useState } from 'react';
import DropZone from './DropZone';
import HexPreview from './HexPreview';
import { formatBytes } from '../utils/format';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function UnpackPanel() {
  const [archiveFile, setArchiveFile] = useState(null);
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | inspecting | invalid | ready | unpacking | done | error
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [zipName, setZipName] = useState('extracted.zip');

  const isBusy = status === 'inspecting' || status === 'unpacking';

  async function handleAddFile(files) {
    const file = files[0];
    if (!file) return;

    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }

    setArchiveFile(file);
    setEntries([]);
    setSelectedEntry(null);
    setStatus('inspecting');
    setError('');

    try {
      const formData = new FormData();
      formData.append('archive', file);
      const res = await fetch(`${API_URL}/api/inspect`, { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        setStatus('invalid');
        setError(data.error || 'Not a valid SRH3 archive.');
        return;
      }

      setEntries(data.entries);
      setSelectedEntry(data.entries[0] || null);
      setStatus('ready');
    } catch {
      setStatus('invalid');
      setError('Could not reach the backend. Is it running on ' + API_URL + '?');
    }
  }

  function unpack() {
    if (!archiveFile) return;

    setStatus('unpacking');
    setProgress(0);
    setError('');

    const formData = new FormData();
    formData.append('archive', archiveFile);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_URL}/api/unpack`);
    xhr.responseType = 'blob';

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const blob = xhr.response;
        const url = URL.createObjectURL(blob);
        const baseName = archiveFile.name.replace(/\.[^/.]+$/, '') || 'archive';
        const name = `${baseName}_extracted.zip`;
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setDownloadUrl(url);
        setZipName(name);
        setStatus('done');
      } else {
        setStatus('error');
        setError(`Unpack failed (${xhr.status})`);
      }
    };

    xhr.onerror = () => {
      setStatus('error');
      setError('Could not reach the backend. Is it running on ' + API_URL + '?');
    };

    xhr.send(formData);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 space-y-4">
        <DropZone
          onAddFiles={handleAddFile}
          disabled={isBusy}
          multiple={false}
          showFolder={false}
          label="Drop an .srh archive here"
        />

        {archiveFile && (
          <div className="font-mono text-xs text-slate-500">
            {archiveFile.name} · {formatBytes(archiveFile.size)}
          </div>
        )}

        {status === 'inspecting' && (
          <p className="font-mono text-xs text-slate-400">&gt; reading header…</p>
        )}

        {status === 'invalid' && (
          <p className="font-mono text-xs text-rose-500 border border-rose-500/40 rounded-sm px-4 py-3">
            &gt; {error}
          </p>
        )}

        {entries.length > 0 && (
          <div className="border border-ink-700 rounded-sm overflow-hidden">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="bg-ink-800 text-slate-500 uppercase tracking-wider">
                  <th className="px-3 py-2 font-medium w-12">#</th>
                  <th className="px-3 py-2 font-medium">name</th>
                  <th className="px-3 py-2 font-medium w-24">size</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, idx) => (
                  <tr
                    key={`${entry.name}-${idx}`}
                    onClick={() => setSelectedEntry(entry)}
                    className={`cursor-pointer border-t border-ink-700 transition-colors
                      ${selectedEntry === entry ? 'bg-ink-800 text-amber-400' : 'text-paper hover:bg-ink-800/60'}`}
                  >
                    <td className="px-3 py-2 text-slate-500">{idx.toString(16).padStart(2, '0')}</td>
                    <td className="px-3 py-2 truncate max-w-[220px]">{entry.name}</td>
                    <td className="px-3 py-2">{formatBytes(entry.size)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {entries.length > 0 && (
          <button
            type="button"
            onClick={unpack}
            disabled={isBusy}
            className="font-mono text-xs px-5 py-2 bg-amber-400 text-ink-950 font-semibold rounded-sm hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {status === 'unpacking' ? 'unpacking…' : 'unpack → download .zip'}
          </button>
        )}

        {status === 'unpacking' && (
          <div className="h-1 bg-ink-700 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 transition-all duration-150" style={{ width: `${progress}%` }} />
          </div>
        )}

        {status === 'done' && (
          <div className="flex items-center justify-between gap-3 flex-wrap font-mono text-xs">
            <p className="text-cyan-400">
              &gt; extracted {entries.length} file{entries.length === 1 ? '' : 's'}
            </p>
            {downloadUrl && (
              <a
                href={downloadUrl}
                download={zipName}
                className="px-3 py-1.5 border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-ink-950 rounded-sm transition-colors"
              >
                ↓ download again
              </a>
            )}
          </div>
        )}

        {status === 'error' && (
          <p className="font-mono text-xs text-rose-500">&gt; error: {error}</p>
        )}
      </div>

      <div className="lg:col-span-2">
        <HexPreview file={selectedEntry} />
      </div>
    </div>
  );
}
