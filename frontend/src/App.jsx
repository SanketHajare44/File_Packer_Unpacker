import { useState } from 'react';
import PackPanel from './components/PackPanel';
import UnpackPanel from './components/UnpackPanel';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export default function App() {
  const [mode, setMode] = useState('pack'); // 'pack' | 'unpack'

  return (
    <div className="min-h-screen bg-ink-950 text-paper">
      <div className="max-w-5xl mx-auto px-6 py-12">

        <header className="mb-8 flex items-baseline justify-between">
          <div>
            <h1 className="font-mono text-2xl tracking-tight text-paper">
              File<span className="text-amber-400">_</span>Packer<span className="text-amber-400">_</span>Unpacker
            </h1>
            <p className="font-sans text-sm text-slate-400 mt-1">
              Pack a folder into a single archive, or unpack one back out —
              magic number, per-file header, XOR key 0x11.
            </p>
          </div>
          <span className="font-mono text-xs text-slate-500 hidden sm:block">
            v1.1 · {API_URL.replace('http://', '')}
          </span>
        </header>

        <div className="mb-8 inline-flex border border-ink-700 rounded-sm overflow-hidden font-mono text-xs">
          <button
            type="button"
            onClick={() => setMode('pack')}
            className={`px-5 py-2 transition-colors ${
              mode === 'pack' ? 'bg-amber-400 text-ink-950 font-semibold' : 'text-slate-400 hover:text-paper'
            }`}
          >
            pack
          </button>
          <button
            type="button"
            onClick={() => setMode('unpack')}
            className={`px-5 py-2 transition-colors border-l border-ink-700 ${
              mode === 'unpack' ? 'bg-amber-400 text-ink-950 font-semibold' : 'text-slate-400 hover:text-paper'
            }`}
          >
            unpack
          </button>
        </div>

        {mode === 'pack' ? <PackPanel /> : <UnpackPanel />}

        <footer className="mt-16 font-mono text-xs text-slate-500 border-t border-ink-800 pt-6">
          Author: Sanket Sadashiv Hajare
        </footer>
      </div>
    </div>
  );
}
