import React, { useEffect, useRef } from 'react';
import { Crosshair, MousePointerClick } from 'lucide-react';

function getCssSelector(el) {
  if (!el || el.nodeType !== 1) return '';
  const parts = [];
  while (el && el.nodeType === 1 && parts.length < 5) {
    let selector = el.tagName.toLowerCase();
    if (el.id) {
      selector += `#${CSS.escape(el.id)}`;
      parts.unshift(selector);
      break;
    }
    if (el.classList.length) {
      selector += '.' + Array.from(el.classList).slice(0, 2).map(c => CSS.escape(c)).join('.');
    }
    const parent = el.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter((child) => child.tagName === el.tagName);
      if (siblings.length > 1) {
        const index = siblings.indexOf(el) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }
    parts.unshift(selector);
    el = el.parentElement;
  }
  return parts.join(' > ');
}

function inferTypeAndBaseline(target) {
  const tag = target.tagName?.toLowerCase();
  const typeAttr = (target.getAttribute && target.getAttribute('type')) || '';
  // Checkbox
  if (typeAttr === 'checkbox' || (tag === 'input' && target.type === 'checkbox')) {
    return { type: 'checkbox', baseline: !!target.checked };
  }
  // Numeric
  const val = (target.value ?? target.textContent ?? '').toString().trim();
  const num = Number(val.replace(/[,\s%$]/g, ''));
  if (!Number.isNaN(num) && val !== '') {
    const step = Math.pow(10, -Math.min(2, (val.split('.')[1]?.length || 0)));
    const min = num > 0 ? Math.max(0, num * 0.5) : num - Math.abs(num) * 0.5 - 1;
    const max = num > 0 ? num * 1.5 : num + Math.abs(num) * 0.5 + 1;
    const isInt = Number.isInteger(num);
    return {
      type: isInt ? 'integer' : 'float',
      baseline: isInt ? Math.round(num) : num,
      min: isInt ? Math.round(min) : Number(min.toFixed(4)),
      max: isInt ? Math.round(max) : Number(max.toFixed(4)),
      step: isInt ? 1 : Number(step.toFixed(4)),
    };
  }
  // Default text -> treat as float range 0..1
  return { type: 'float', baseline: 0, min: 0, max: 1, step: 0.1 };
}

export default function TrainerCapture({ enabled, onCapture, overlayRootSelector }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    function handleClick(e) {
      // Ignore clicks inside overlay
      if (overlayRef.current && overlayRef.current.contains(e.target)) return;
      e.preventDefault();
      e.stopPropagation();
      const target = e.target;
      const selector = getCssSelector(target);
      const inferred = inferTypeAndBaseline(target);
      const label = (target.getAttribute('aria-label') || target.placeholder || target.name || target.id || target.textContent || 'param').toString().trim().slice(0, 40) || 'param';
      onCapture({ selector, label, ...inferred });
    }

    document.addEventListener('click', handleClick, true);
    document.addEventListener('mousedown', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('mousedown', handleClick, true);
    };
  }, [enabled, onCapture]);

  // Expose the overlay ref for exclusion region
  useEffect(() => {
    if (overlayRootSelector) {
      const node = document.querySelector(overlayRootSelector);
      if (node) overlayRef.current = node;
    }
  }, [overlayRootSelector]);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-[1px]" />
      <div className="absolute top-3 right-3 flex items-center gap-2 text-white bg-blue-600 px-3 py-2 rounded shadow pointer-events-auto">
        <Crosshair size={16} />
        <span className="text-sm font-medium">Trainer mode: Click a strategy input to capture</span>
      </div>
      <div className="absolute bottom-3 right-3 text-xs text-white bg-black/60 px-2 py-1 rounded pointer-events-auto flex items-center gap-1">
        <MousePointerClick size={14} /> Press on any input in the settings dialog
      </div>
    </div>
  );
}
