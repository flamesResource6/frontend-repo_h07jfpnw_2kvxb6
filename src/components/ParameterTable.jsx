import React from 'react';
import { Trash2 } from 'lucide-react';

export default function ParameterTable({ params, setParams, onClear }) {
  const update = (idx, patch) => {
    setParams((list) => list.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  };
  const remove = (idx) => setParams((list) => list.filter((_, i) => i !== idx));

  return (
    <div className="w-full bg-white/70 backdrop-blur rounded-xl border border-gray-200 shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-800">Parameters</h2>
        <button onClick={onClear} className="text-xs text-gray-600 hover:text-gray-900 underline">Clear all</button>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full text-sm">
          <thead className="text-xs text-gray-600">
            <tr>
              <th className="text-left p-2">Label</th>
              <th className="text-left p-2">Type</th>
              <th className="text-left p-2">Baseline</th>
              <th className="text-left p-2">Min</th>
              <th className="text-left p-2">Max</th>
              <th className="text-left p-2">Step</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {params.length === 0 && (
              <tr>
                <td className="p-2 text-gray-500" colSpan={7}>Use Trainer to capture inputs from TradingView and configure ranges here.</td>
              </tr>
            )}
            {params.map((p, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2">
                  <input className="w-40 border rounded px-2 py-1" value={p.label}
                    onChange={(e) => update(idx, { label: e.target.value })} />
                </td>
                <td className="p-2">
                  <select className="border rounded px-2 py-1" value={p.type}
                    onChange={(e) => update(idx, { type: e.target.value })}>
                    <option value="integer">integer</option>
                    <option value="float">float</option>
                    <option value="checkbox">checkbox</option>
                  </select>
                </td>
                <td className="p-2">
                  {p.type === 'checkbox' ? (
                    <input type="checkbox" checked={!!p.baseline} onChange={(e) => update(idx, { baseline: e.target.checked })} />
                  ) : (
                    <input type="number" className="w-28 border rounded px-2 py-1" value={p.baseline}
                      onChange={(e) => update(idx, { baseline: Number(e.target.value) })} />
                  )}
                </td>
                <td className="p-2">
                  {p.type === 'checkbox' ? (
                    <span className="text-gray-400">—</span>
                  ) : (
                    <input type="number" className="w-24 border rounded px-2 py-1" value={p.min}
                      onChange={(e) => update(idx, { min: Number(e.target.value) })} />
                  )}
                </td>
                <td className="p-2">
                  {p.type === 'checkbox' ? (
                    <span className="text-gray-400">—</span>
                  ) : (
                    <input type="number" className="w-24 border rounded px-2 py-1" value={p.max}
                      onChange={(e) => update(idx, { max: Number(e.target.value) })} />
                  )}
                </td>
                <td className="p-2">
                  {p.type === 'checkbox' ? (
                    <span className="text-gray-400">—</span>
                  ) : (
                    <input type="number" step={p.type === 'integer' ? 1 : 0.01} className="w-24 border rounded px-2 py-1" value={p.step}
                      onChange={(e) => update(idx, { step: Number(e.target.value) })} />
                  )}
                </td>
                <td className="p-2 text-center">
                  <button className="text-rose-600 hover:text-rose-700" onClick={() => remove(idx)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
