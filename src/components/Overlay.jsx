import React, { useEffect, useRef, useState } from 'react';
import { GripVertical } from 'lucide-react';

export default function Overlay({ children, onRootReady }) {
  const panelRef = useRef(null);
  const [pos, setPos] = useState({ x: 20, y: 20 });
  const dragging = useRef(null);

  useEffect(() => {
    if (panelRef.current && onRootReady) onRootReady(panelRef.current);
  }, [panelRef.current]);

  useEffect(() => {
    function onMove(e) {
      if (!dragging.current) return;
      const dx = e.clientX - dragging.current.startX;
      const dy = e.clientY - dragging.current.startY;
      setPos({ x: dragging.current.baseX + dx, y: dragging.current.baseY + dy });
    }
    function onUp() { dragging.current = null; }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const startDrag = (e) => {
    dragging.current = { startX: e.clientX, startY: e.clientY, baseX: pos.x, baseY: pos.y };
  };

  return (
    <div
      ref={panelRef}
      className="fixed z-50"
      style={{ left: pos.x, bottom: pos.y, maxWidth: 900 }}
    >
      <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 shadow-lg p-3">
        <div className="flex items-center gap-2 text-gray-500 cursor-move select-none" onMouseDown={startDrag}>
          <GripVertical size={16} />
          <span className="text-xs">Drag to move</span>
        </div>
        <div className="mt-2">
          {children}
        </div>
      </div>
    </div>
  );
}
