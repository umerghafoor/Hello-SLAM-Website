'use client';

import { useMemo, useState } from 'react';
import { VizFrame, VizSlider } from './VizFrame';

export function InverseSensorViz() {
  const [z, setZ] = useState(60);
  const [r, setR] = useState(4);
  const [pFree, setPFree] = useState(0.3);
  const [pOcc, setPOcc] = useState(0.7);
  const maxRange = 100;
  const samples = useMemo(() => {
    const out: { s: number; p: number }[] = [];
    for (let s = 0; s < maxRange; s++) {
      const left = z - r / 2;
      const right = z + r / 2;
      let p = 0.5;
      if (s < left) p = pFree;
      else if (s <= right) p = pOcc;
      else p = 0.5;
      out.push({ s, p });
    }
    return out;
  }, [z, r, pFree, pOcc]);

  const W = 480;
  const H = 200;
  const padX = 36;
  const padY = 16;
  const X = (s: number) => padX + (s / maxRange) * (W - 2 * padX);
  const Y = (p: number) => H - padY - p * (H - 2 * padY);

  const path = samples
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${X(d.s)} ${Y(d.p)}`)
    .join(' ');

  return (
    <VizFrame
      title="Inverse sensor model (step window)"
      caption={
        <>
          A single LiDAR beam hit at range <span className="font-mono">z = {z}</span>{' '}
          with window width <span className="font-mono">r = {r}</span>. Cells before
          the window are pushed toward <em>free</em>, cells inside toward{' '}
          <em>occupied</em>, cells beyond stay at the prior.
        </>
      }
      controls={
        <div className="grid gap-2 sm:grid-cols-2">
          <VizSlider label="Measured z (px)" value={z} min={10} max={90} step={1} onChange={(v) => setZ(Math.round(v))} format={(v) => String(Math.round(v))} />
          <VizSlider label="Beam width r" value={r} min={1} max={16} step={1} onChange={(v) => setR(Math.round(v))} format={(v) => String(Math.round(v))} />
          <VizSlider label="p_free" value={pFree} min={0.05} max={0.5} step={0.01} onChange={setPFree} />
          <VizSlider label="p_occ" value={pOcc} min={0.5} max={0.95} step={0.01} onChange={setPOcc} />
        </div>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="Inverse sensor model probability profile">
        {/* axes */}
        <line x1={padX} x2={W - padX} y1={H - padY} y2={H - padY} stroke="var(--md-outline-variant)" />
        <line x1={padX} x2={padX} y1={padY} y2={H - padY} stroke="var(--md-outline-variant)" />
        {/* prior reference line */}
        <line x1={padX} x2={W - padX} y1={Y(0.5)} y2={Y(0.5)} stroke="var(--md-outline-variant)" strokeDasharray="3 3" />
        <text x={W - padX - 4} y={Y(0.5) - 4} fontSize={9} fill="var(--md-on-surface-variant)" textAnchor="end" fontFamily="monospace">prior 0.5</text>
        {/* hit window shading */}
        <rect x={X(z - r / 2)} y={padY} width={X(z + r / 2) - X(z - r / 2)} height={H - 2 * padY} fill="var(--md-tertiary-container)" fillOpacity={0.5} />
        <line x1={X(z)} x2={X(z)} y1={padY} y2={H - padY} stroke="var(--md-error)" strokeWidth={1} strokeDasharray="2 2" />
        <text x={X(z)} y={padY - 4} fontSize={9} fill="var(--md-error)" textAnchor="middle" fontFamily="monospace">z</text>
        {/* curve */}
        <path d={path} stroke="var(--md-primary)" strokeWidth={2} fill="none" />
        {/* y ticks */}
        {[0, 0.25, 0.5, 0.75, 1].map((tv) => (
          <g key={tv}>
            <text x={padX - 4} y={Y(tv) + 3} fontSize={9} fill="var(--md-on-surface-variant)" textAnchor="end" fontFamily="monospace">{tv.toFixed(2)}</text>
          </g>
        ))}
        {/* x ticks */}
        {[0, 25, 50, 75, 100].map((tx) => (
          <text key={tx} x={X(tx)} y={H - 3} fontSize={9} fill="var(--md-on-surface-variant)" textAnchor="middle" fontFamily="monospace">{tx}</text>
        ))}
      </svg>
    </VizFrame>
  );
}
