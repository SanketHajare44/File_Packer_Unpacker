import { useRef, useState } from 'react';

export default function DropZone({
  onAddFiles,
  disabled,
  multiple = true,
  showFolder = true,
  label = 'Drag a folder or files here',
  accept,
}) {
  const [dragging, setDragging] = useState(false);
  const folderInputRef = useRef(null);
  const filesInputRef = useRef(null);

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    let dropped = Array.from(e.dataTransfer.files || []);
    if (!multiple) dropped = dropped.slice(0, 1);
    if (dropped.length) onAddFiles(dropped);
  }

  function handleInputChange(e) {
    let picked = Array.from(e.target.files || []);
    if (!multiple) picked = picked.slice(0, 1);
    if (picked.length) onAddFiles(picked);
    e.target.value = '';
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`relative rounded-sm border transition-all duration-150
        ${dragging
          ? 'border-solid border-amber-400 bg-ink-800 scale-[1.01] shadow-[0_0_0_1px_rgba(245,166,35,0.3)]'
          : 'border-dashed border-ink-700 bg-ink-900'}
        ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <div className="px-6 py-10 flex flex-col items-center text-center gap-3">
        <svg
          width="28" height="28" viewBox="0 0 24 24" fill="none"
          className={`transition-colors ${dragging ? 'text-amber-400' : 'text-slate-500'}`}
        >
          <path d="M4 15v3a2 2 0 002 2h12a2 2 0 002-2v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M12 3v12M12 3l-4 4M12 3l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="font-mono text-xs text-slate-500 tracking-widest uppercase">
          drop_target<span className="text-amber-400 animate-pulse">_</span>
        </div>
        <p className="font-sans text-paper text-base">
          {dragging ? 'release to queue' : label}
        </p>
        <p className="font-mono text-xs text-slate-500">
          or
        </p>
        <div className="flex gap-3">
          {showFolder && (
            <button
              type="button"
              onClick={() => folderInputRef.current?.click()}
              className="font-mono text-xs px-4 py-2 border border-slate-500 text-paper hover:border-amber-400 hover:text-amber-400 transition-colors rounded-sm"
            >
              choose folder
            </button>
          )}
          <button
            type="button"
            onClick={() => filesInputRef.current?.click()}
            className="font-mono text-xs px-4 py-2 border border-slate-500 text-paper hover:border-amber-400 hover:text-amber-400 transition-colors rounded-sm"
          >
            {multiple ? 'choose files' : 'choose file'}
          </button>
        </div>
      </div>

      {/* Folder picker: webkitdirectory lets the browser select an entire folder,
          matching the original CLI's <FolderName> argument. */}
      {showFolder && (
        <input
          ref={folderInputRef}
          type="file"
          webkitdirectory=""
          directory=""
          multiple
          className="hidden"
          onChange={handleInputChange}
        />
      )}
      <input
        ref={filesInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}
