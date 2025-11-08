import React from 'react';
import { Download } from 'lucide-react';

function toCsv(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v) => {
    const s = String(v ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(','));
  }
  return lines.join('\n');
}

export default function ResultsTable({ results, onExport }) {
  const handleExport = () => {
    const csv = toCsv(results);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tv-optimizer-results-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onExport && onExport();
  };

  return (
    <div className="w-full bg-white/70 backdrop-blur rounded-xl border border-gray-200 shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-800">Results</h2>
        <button onClick={handleExport} className="inline-flex items-center gap-2 bg-gray-900 text-white px-3 py-1.5 rounded disabled:opacity-50" disabled={!results.length}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="max-h-64 overflow-auto border rounded">
        <table className="min-w-full text-xs">
          <thead className="sticky top-0 bg-gray-50 text-gray-700">
            <tr>
              {results.length === 0 ? (
                <th className="p-2 text-left">No results yet</th>
              ) : (
                Object.keys(results[0]).map((h) => (
                  <th className="p-2 text-left" key={h}>{h}</th>
                ))
              )}
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} className="odd:bg-white even:bg-gray-50 border-t">
                {Object.keys(results[0]).map((h) => (
                  <td className="p-2" key={h + i}>{String(r[h])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
