import React, { useCallback, useMemo, useRef, useState } from 'react';
import ControlPanel from './components/ControlPanel';
import ParameterTable from './components/ParameterTable';
import ResultsTable from './components/ResultsTable';
import TrainerCapture from './components/TrainerCapture';

function cartesianProduct(arrays) {
  return arrays.reduce((acc, curr) => acc.flatMap(a => curr.map(b => [...a, b])), [[]]);
}

function generateValues(p) {
  if (p.type === 'checkbox') return [true, false];
  const start = Number(p.min);
  const end = Number(p.max);
  const step = Number(p.step) || 1;
  const vals = [];
  for (let v = start; v <= end + 1e-12; v += step) {
    vals.push(p.type === 'integer' ? Math.round(v) : Number(v.toFixed(8)));
  }
  return vals;
}

export default function App() {
  const [trainer, setTrainer] = useState(false);
  const [params, setParams] = useState([]);
  const [results, setResults] = useState([]);
  const [runningState, setRunningState] = useState('idle');
  const [batchConfig, setBatchConfig] = useState({ maxRuns: 200, startIndex: 0 });
  const overlayRootRef = useRef(null);

  const combos = useMemo(() => {
    if (!params.length) return [];
    const valueSets = params.map(generateValues);
    const tuples = cartesianProduct(valueSets);
    return tuples.map((tuple) => {
      const obj = {};
      params.forEach((p, i) => { obj[p.label] = tuple[i]; });
      return obj;
    });
  }, [params]);

  const onCapture = useCallback((p) => {
    setParams((list) => {
      // Avoid duplicates by selector
      if (list.some((x) => x.selector === p.selector)) return list;
      return [...list, p];
    });
    setTrainer(false);
  }, []);

  // Mock DOM apply/read to keep this UI functional in sandbox; replace with real logic while on TradingView tab.
  const applyCombinationAndReadMetrics = async (combo, runIndex) => {
    // In a live TradingView page, you would:
    // 1) Ensure settings dialog is open
    // 2) For each param: querySelector(param.selector) and apply value with proper events
    // 3) Wait until Strategy Tester metrics settle
    // 4) Read metrics via robust selectors
    // Here we simulate metrics.
    await new Promise((r) => setTimeout(r, 300));
    const hash = Object.values(combo).reduce((a, v) => a + (typeof v === 'boolean' ? (v ? 1 : 0) : Number(v)), 0);
    return {
      timestamp: new Date().toISOString(),
      index: runIndex,
      ...combo,
      netProfit: Number((hash * 3.14).toFixed(2)),
      maxDrawdown: Number((Math.abs(50 - hash) * 1.1).toFixed(2)),
      profitFactor: Number((1 + (hash % 10) / 5).toFixed(2)),
      winRate: Number((40 + (hash % 30)).toFixed(2)),
      trades: 10 + (hash % 50),
    };
  };

  const start = async () => {
    if (!combos.length) return;
    setRunningState('running');
    const { maxRuns, startIndex } = batchConfig;
    const endIndex = Math.min(combos.length, startIndex + maxRuns);

    for (let i = startIndex; i < endIndex; i++) {
      if (runningState === 'idle') break;
      if (runningState === 'paused') {
        // wait until resumed
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => {
          const id = setInterval(() => {
            if (runningState !== 'paused') { clearInterval(id); r(null); }
          }, 200);
        });
      }
      // eslint-disable-next-line no-await-in-loop
      const row = await applyCombinationAndReadMetrics(combos[i], i);
      setResults((rows) => {
        if (!rows.length) return [row];
        const headers = new Set([...Object.keys(rows[0]), ...Object.keys(row)]);
        // normalize existing rows to include any new keys
        const normalized = rows.map((r) => {
          const obj = {}; headers.forEach((h) => { obj[h] = r[h]; }); return obj;
        });
        const newRow = {}; headers.forEach((h) => { newRow[h] = row[h]; });
        return [...normalized, newRow];
      });
    }
    setRunningState('idle');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50">
      <div
        id="tv-opt-overlay"
        ref={overlayRootRef}
        className="fixed right-4 bottom-4 z-50 w-[min(92vw,900px)]"
      >
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 shadow-lg p-4 space-y-4">
          <ControlPanel
            trainerEnabled={trainer}
            onToggleTrainer={setTrainer}
            runningState={runningState}
            onStart={start}
            onPause={() => setRunningState('paused')}
            onResume={() => setRunningState('running')}
            onStop={() => setRunningState('idle')}
            batchConfig={batchConfig}
            setBatchConfig={setBatchConfig}
          />

          <ParameterTable
            params={params}
            setParams={setParams}
            onClear={() => setParams([])}
          />

          <div>
            <p className="text-xs text-gray-600 mb-2">Combinations queued: <span className="font-semibold">{combos.length}</span></p>
            <ResultsTable results={results} />
          </div>
        </div>
      </div>

      <TrainerCapture enabled={trainer} onCapture={onCapture} overlayRootSelector="#tv-opt-overlay" />
    </div>
  );
}
