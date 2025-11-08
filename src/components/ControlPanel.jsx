import React from 'react';
import { Play, Pause, Square, RotateCcw, Settings } from 'lucide-react';

export default function ControlPanel({
  trainerEnabled,
  onToggleTrainer,
  runningState, // 'idle' | 'running' | 'paused'
  onStart,
  onPause,
  onResume,
  onStop,
  batchConfig,
  setBatchConfig,
}) {
  const { maxRuns, startIndex } = batchConfig;

  return (
    <div className="w-full bg-white/70 backdrop-blur rounded-xl border border-gray-200 shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-gray-800">
          <Settings size={18} />
          <h2 className="font-semibold">Optimizer Controls</h2>
        </div>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" className="h-4 w-4" checked={trainerEnabled} onChange={(e) => onToggleTrainer(e.target.checked)} />
          <span className="font-medium">Trainer / Capture Inputs</span>
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        <div className="col-span-1">
          <label className="block text-xs text-gray-600 mb-1">Max runs per batch</label>
          <input
            type="number"
            min={1}
            className="w-full border rounded px-2 py-1 text-sm"
            value={maxRuns}
            onChange={(e) => setBatchConfig((s) => ({ ...s, maxRuns: Math.max(1, Number(e.target.value || 0)) }))}
          />
        </div>
        <div className="col-span-1">
          <label className="block text-xs text-gray-600 mb-1">Start index</label>
          <input
            type="number"
            min={0}
            className="w-full border rounded px-2 py-1 text-sm"
            value={startIndex}
            onChange={(e) => setBatchConfig((s) => ({ ...s, startIndex: Math.max(0, Number(e.target.value || 0)) }))}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded disabled:opacity-50"
          onClick={onStart}
          disabled={runningState === 'running'}
        >
          <Play size={16} /> Start
        </button>
        <button
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded disabled:opacity-50"
          onClick={onPause}
          disabled={runningState !== 'running'}
        >
          <Pause size={16} /> Pause
        </button>
        <button
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded disabled:opacity-50"
          onClick={onResume}
          disabled={runningState !== 'paused'}
        >
          <RotateCcw size={16} /> Resume
        </button>
        <button
          className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded disabled:opacity-50"
          onClick={onStop}
          disabled={runningState === 'idle'}
        >
          <Square size={16} /> Stop
        </button>
      </div>
    </div>
  );
}
