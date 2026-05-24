'use client';

import { useMemo, useState } from 'react';
import { VizFrame, VizSlider, VizButton } from './VizFrame';

type Mode = 'unimodal' | 'bimodal';

function normPdf(x: number, mu: number, sigma: number) {
  return Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (Math.sqrt(2 * Math.PI) * sigma);
}

function randn(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function ParticlesViz() {
  const [mode, setMode] = useState<Mode>('bimodal');
  const [n, setN] = useState(200);
  const [seed, setSeed] = useState(0);

  const samples = useMemo(() => {
    void seed; // re-roll on seed change
    const out: number[] = [];
    for (let i = 0; i < n; i++) {
      if (mode === 'unimodal') {
        out.push(randn());
      } else {
        // 0.45 N(-2, 0.7) + 0.55 N(1.5, 0.4)
        const u = Math.random();
        if (u < 0.45) out.push(-2 + 0.7 * randn());
        else out.push(1.5 + 0.4 * randn());
      }
    }
    return out;
  }, [mode, n, seed]);

  const xs = useMemo(() => {
    const out: number[] = [];
    const xMin = mode === 'unimodal' ? -4 : -5;
    const xMax = 4;
    for (let i = 0; i < 200; i++) {
      out.push(xMin + (i * (xMax - xMin)) / 199);
    }
    return out;
  }, [mode]);

  const pdf = useMemo(() => {
    return xs.map((x) => {
      if (mode === 'unimodal') return { x, p: normPdf(x, 0, 1) };
      return {
        x,
        p: 0.45 * normPdf(x, -2, 0.7) + 0.55 * normPdf(x, 1.5, 0.4),
      };
    });
  }, [mode, xs]);

  const W = 540;
  const H = 220;
  const padX = 24;
  const padY = 16;
  const xMin = mode === 'unimodal' ? -4 : -5;
  const xMax = 4;
  const X = (x: number) => padX + ((x - xMin) / (xMax - xMin)) * (W - 2 * padX);
  const maxP = Math.max(...pdf.map((d) => d.p)) * 1.1;
  const Y = (p: number) => H - padY - (p / maxP) * (H - 2 * padY);

  const path = pdf.map((d, i) => `${i === 0 ? 'M' : 'L'} ${X(d.x)} ${Y(d.p)}`).join(' ');

  return (
    <VizFrame
      title="Sample-based representation"
      caption={
        <>
          {n} particles drawn from the {mode === 'unimodal' ? 'unimodal Gaussian' : 'bimodal mixture'}.
          The denser the particle cloud in a region, the higher the implied probability mass.
        </>
      }
      controls={
        <div className="flex flex-wrap items-center gap-3">
          <VizButton onClick={() => setMode('unimodal')} active={mode === 'unimodal'}>
            Unimodal
          </VizButton>
          <VizButton onClick={() => setMode('bimodal')} active={mode === 'bimodal'}>
            Bimodal mixture
          </VizButton>
          <VizButton onClick={() => setSeed((s) => s + 1)}>🎲 Reseed</VizButton>
          <div className="flex-1 min-w-[180px]">
            <VizSlider
              label="# particles"
              value={n}
              min={10}
              max={2000}
              step={10}
              onChange={(v) => setN(Math.round(v))}
              format={(v) => String(Math.round(v))}
            />
          </div>
        </div>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="Particle samples versus true PDF">
        <line x1={padX} x2={W - padX} y1={H - padY} y2={H - padY} stroke="var(--md-outline-variant)" />
        <path d={path} stroke={mode === 'unimodal' ? 'var(--md-primary)' : 'var(--md-tertiary)'} strokeWidth={2} fill={mode === 'unimodal' ? 'var(--md-primary)' : 'var(--md-tertiary)'} fillOpacity={0.15} />
        {/* rug marks */}
        {samples.map((x, i) => (
          <line
            key={i}
            x1={X(x)}
            x2={X(x)}
            y1={H - padY}
            y2={H - padY + 8}
            stroke="var(--md-on-surface)"
            strokeOpacity={0.4}
            strokeWidth={1}
          />
        ))}
        {/* x ticks */}
        {[-4, -2, 0, 2, 4].map((tx) => (
          <text key={tx} x={X(tx)} y={H - padY + 20} fontSize={9} fill="var(--md-on-surface-variant)" textAnchor="middle" fontFamily="monospace">{tx}</text>
        ))}
      </svg>
    </VizFrame>
  );
}
