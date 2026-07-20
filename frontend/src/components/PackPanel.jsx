import { useState } from 'react';
import DropZone from './DropZone';
import FileTable from './FileTable';
import HexPreview from './HexPreview';
import PackConsole from './PackConsole';
import { formatBytes, buildHeaderBytes } from '../utils/format';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

let nextId = 1;

export default function PackPanel() {
  const [files, setFiles] = useState([]); // [{ id, file }]
  const [selectedId, setSelectedId] = useState(null);
  const [archiveName, setArchiveName] = useState('archive.srh');
  const [status, setStatus] = useState('idle'); // idle | packing | done | error
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [packedSize, setPackedSize] = useState('');
  const [downloadUrl, setDownloadUrl] = useState(null);

  const totalSize = files.reduce((sum, f) => sum + f.file.size, 0);
  const isBusy = status === 'packing';

  function addFiles(newFiles) {
    const wrapped = newFiles.map((file) => ({ id: nextId++, file }));
    setFiles((prev) => [...prev, ...wrapped]);
    if (selectedId === null && wrapped.length) {
      setSelectedId(wrapped[0].id);
    }
  }

  function removeFile(id) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function clearAll() {
    setFiles([]);
    setSelectedId(null);
  }

  const oversizedNames = files
    .filter((f) => !buildHeaderBytes(f.file.name, f.file.size).fits)
    .map((f) => f.file.name);

  function pack() {
    if (files.length === 0) return;
    if (files.some((f) => !buildHeaderBytes(f.file.name, f.file.size).fits)) return;

    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }

    setStatus('packing');
    setProgress(0);
    setError('');

    const formData = new FormData();
    files.forEach((f) => formData.append('files', f.file));
    formData.append('archiveName', archiveName || 'archive.srh');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_URL}/api/pack`);
    xhr.responseType = 'blob';

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const blob = xhr.response;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = archiveName || 'archive.srh';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setPackedSize(formatBytes(blob.size));
        setDownloadUrl(url);
        setStatus('done');
      } else {
        handleErrorResponse(xhr);
      }
    };

    xhr.onerror = () => {
      setStatus('error');
      setError('Could not reach the backend. Is it running on ' + API_URL + '?');
    };

    xhr.send(formData);
  }

  function handleErrorResponse(xhr) {
    setStatus('error');
    try {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result);
          setError(parsed.error || `Request failed (${xhr.status})`);
        } catch {
          setError(`Request failed (${xhr.status})`);
        }
      };
      reader.readAsText(xhr.response);
    } catch {
      setError(`Request failed (${xhr.status})`);
    }
  }

  const selectedFile = files.find((f) => f.id === selectedId)?.file || null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 space-y-4">
        <DropZone onAddFiles={addFiles} disabled={isBusy} />

        <FileTable
          files={files}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onRemove={removeFile}archiveName
          onClearAll={clearAll}
          disabled={isBusy}
        />

        {oversizedNames.length > 0 && (
          <p className="font-mono text-xs text-rose-500 border border-rose-500/40 rounded-sm px-4 py-3">
            &gt; name + size too long for the 100-byte header: {oversizedNames.join(', ')}
          </p>
        )}

        <div className="flex items-center justify-between font-mono text-xs text-slate-500">
          <span>{files.length} file{files.length === 1 ? '' : 's'} · {formatBytes(totalSize)} total</span>
        </div>

        <div className="flex gap-3 items-center">
          <label className="font-mono text-xs text-slate-500 whitespace-nowrap">
            archive name
          </label>
          <input
            type="text"
            value={archiveName}
            onChange={(e) => setArchiveName(e.target.value)}
            disabled={isBusy}
            className="flex-1 bg-ink-900 border border-ink-700 rounded-sm px-3 py-2 font-mono text-xs text-paper focus:outline-none focus:border-amber-400 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={pack}
            disabled={isBusy || files.length === 0 || oversizedNames.length > 0}
            className="font-mono text-xs px-5 py-2 bg-amber-400 text-ink-950 font-semibold rounded-sm hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isBusy ? 'packing…' : 'pack →'}
          </button>
        </div>

        <PackConsole
          status={status}
          progress={progress}
          error={error}
          archiveName={archiveName}
          packedSize={packedSize}
          downloadUrl={downloadUrl}
        />
      </div>

      <div className="lg:col-span-2">
        <HexPreview file={selectedFile} />
      </div>
    </div>
  );
}
