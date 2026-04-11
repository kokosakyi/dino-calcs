import { useRef, useEffect } from 'react';
import { useResultStore } from '../../stores/resultStore';
import { useUIStore } from '../../stores/uiStore';
import { useTheme } from '../../../context/ThemeContext';
import type { StationResult } from '../../types/model';

const CHART_COLORS = {
  N: '#ff9800',
  Vy: '#2196f3',
  Mz: '#e91e63',
  T: '#9c27b0',
};

interface ThemeColors {
  bg: string;
  gridLine: string;
  axisText: string;
  peakText: string;
}

const DARK_THEME: ThemeColors = {
  bg: '#1f2937',
  gridLine: '#4b5563',
  axisText: '#9ca3af',
  peakText: '#d1d5db',
};

const LIGHT_THEME: ThemeColors = {
  bg: '#ffffff',
  gridLine: '#e2e8f0',
  axisText: '#64748b',
  peakText: '#475569',
};

function drawChart(
  canvas: HTMLCanvasElement,
  stations: StationResult[],
  field: keyof StationResult,
  color: string,
  label: string,
  unit: string,
  divisor: number,
  themeColors: ThemeColors,
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  const padding = { top: 25, right: 15, bottom: 25, left: 50 };
  const plotW = w - padding.left - padding.right;
  const plotH = h - padding.top - padding.bottom;

  ctx.clearRect(0, 0, w, h);

  if (stations.length < 2) return;

  const rawValues = stations.map(s => s[field] as number);
  const values = rawValues.map(v => v / divisor);
  const xPositions = stations.map(s => s.x);
  const xMax = Math.max(...xPositions);
  const vMax = Math.max(...values.map(Math.abs), 1e-10);

  ctx.fillStyle = themeColors.bg;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = color;
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${label} (${unit})`, padding.left, 14);

  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);
  const peak = Math.abs(maxVal) >= Math.abs(minVal) ? maxVal : minVal;
  ctx.fillStyle = themeColors.peakText;
  ctx.font = '9px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`peak: ${peak.toFixed(2)} ${unit}`, w - 5, 14);

  const zeroY = padding.top + plotH / 2;
  ctx.strokeStyle = themeColors.gridLine;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padding.left, zeroY);
  ctx.lineTo(padding.left + plotW, zeroY);
  ctx.stroke();

  const toX = (i: number) => padding.left + (xPositions[i] / xMax) * plotW;
  const toY = (i: number) => zeroY - (values[i] / vMax) * (plotH / 2) * 0.9;

  // Filled area
  ctx.beginPath();
  ctx.moveTo(padding.left, zeroY);
  for (let i = 0; i < stations.length; i++) {
    ctx.lineTo(toX(i), toY(i));
  }
  ctx.lineTo(padding.left + plotW, zeroY);
  ctx.closePath();
  ctx.fillStyle = color + '30';
  ctx.fill();

  // Curve line
  ctx.beginPath();
  for (let i = 0; i < stations.length; i++) {
    if (i === 0) ctx.moveTo(toX(i), toY(i));
    else ctx.lineTo(toX(i), toY(i));
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Find max and min indices
  let maxIdx = 0;
  let minIdx = 0;
  for (let i = 1; i < values.length; i++) {
    if (values[i] > values[maxIdx]) maxIdx = i;
    if (values[i] < values[minIdx]) minIdx = i;
  }

  const drawAnnotation = (idx: number, val: number) => {
    if (Math.abs(val) < 1e-6) return;
    const ax = toX(idx);
    const ay = toY(idx);
    const txt = `${val.toFixed(2)}`;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(ax, ay, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 9px monospace';
    ctx.textAlign = ax > padding.left + plotW / 2 ? 'right' : 'left';
    const offsetX = ax > padding.left + plotW / 2 ? -6 : 6;
    const offsetY = val > 0 ? -7 : 12;
    ctx.fillStyle = color;
    ctx.fillText(txt, ax + offsetX, ay + offsetY);
  };

  drawAnnotation(maxIdx, values[maxIdx]);
  if (maxIdx !== minIdx) {
    drawAnnotation(minIdx, values[minIdx]);
  }

  ctx.fillStyle = themeColors.axisText;
  ctx.font = '9px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`Length (${xMax.toFixed(2)} m)`, padding.left + plotW / 2, h - 4);
}

export function SingleMemberChart() {
  const selectedElementIds = useUIStore(s => s.selectedElementIds);
  const results = useResultStore(s => s.results);
  const { theme } = useTheme();

  const canvasN = useRef<HTMLCanvasElement>(null);
  const canvasV = useRef<HTMLCanvasElement>(null);
  const canvasM = useRef<HTMLCanvasElement>(null);
  const canvasT = useRef<HTMLCanvasElement>(null);

  const elementId = selectedElementIds.length === 1 ? selectedElementIds[0] : null;
  const memberResult = elementId
    ? results?.memberForces.find(m => m.elementId === elementId)
    : null;

  useEffect(() => {
    if (!memberResult) return;
    const stations = memberResult.stations;
    const tc = theme === 'dark' ? DARK_THEME : LIGHT_THEME;
    if (canvasN.current) drawChart(canvasN.current, stations, 'N', CHART_COLORS.N, 'Axial Force', 'kN', 1000, tc);
    if (canvasV.current) drawChart(canvasV.current, stations, 'Vy', CHART_COLORS.Vy, 'Shear Force', 'kN', 1000, tc);
    if (canvasM.current) drawChart(canvasM.current, stations, 'Mz', CHART_COLORS.Mz, 'Bending Moment', 'kN·m', 1000, tc);
    if (canvasT.current) drawChart(canvasT.current, stations, 'T', CHART_COLORS.T, 'Torsion', 'kN·m', 1000, tc);
  }, [memberResult, theme]);

  if (!results || !memberResult) {
    return (
      <div className="px-3 py-2 text-sm text-[var(--color-text-muted)]">
        {results ? 'Select a single member to view detailed diagrams' : 'Solve the model first'}
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      <div className="text-sm font-medium text-[var(--color-accent)] px-1 mb-1">
        Member: {elementId}
      </div>
      <canvas ref={canvasN} width={260} height={80} className="w-full rounded" />
      <canvas ref={canvasV} width={260} height={80} className="w-full rounded" />
      <canvas ref={canvasM} width={260} height={80} className="w-full rounded" />
      <canvas ref={canvasT} width={260} height={80} className="w-full rounded" />
    </div>
  );
}
