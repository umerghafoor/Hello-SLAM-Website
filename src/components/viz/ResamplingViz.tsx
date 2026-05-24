'use client';

import { useEffect, useMemo, useState } from 'react';
import { VizFrame, VizSlider, VizButton } from './VizFrame';

type Method = 'roulette' | 'sus';

function randn(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function ResamplingViz() {
  const [n, setN] = useState(20);
  const [method, setMethod] = useState<Method>('sus');
  const [seed, setSeed] = useState(0);

  // Weighted particles centered around two modes.
  const particles = useMemo(() => {
    void seed;
    const out: { x: number; w: number }[] = [];
    for (let i = 0; i < n; i++) {
      const u = Math.random();
      const x = u < 0.4 ? -1.5 + 0.4 * randn() : 1.2 + 0.6 * randn();
      const w = 0.4 * Math.exp(-0.5 * ((x + 1.5) / 0.4) ** 2) + 0.6 * Math.exp(-0.5 * ((x - 1.2) / 0.6) ** 2);
      out.push({ x, w });
    }
    const sumW = out.reduce((a, p) => a + p.w, 0);
    for (const p of out) p.w /= sumW;
    return out;
  }, [n, seed]);

  const cum = useMemo(() => {
    const c: number[] = [];
    let acc = 0;
    for (const p of particles) {
      acc += p.w;
      c.push(acc);
    }
    return c;
  }, [particles]);

  // Pointer positions
  const [u0, setU0] = useState(Math.random() / n);
  useEffect(() => {
    setU0(Math.random() / n);
  }, [n, method, seed]);

  const pointers = useMemo(() => {
    const out: number[] = [];
    if (method === 'sus') {
      for (let j = 0; j < n; j++) out.push(u0 + j / n);
    } else {
      for (let j = 0; j < n; j++) out.push(Math.random());
    }
    return out;
  }, [method, n, u0]);

  // For each pointer, find the first cum bin >= pointer
  const picks = useMemo(() => {
    return pointers.map((u) => {
      for (let i = 0; i < cum.length; i++) {
        if (u <= cum[i]) return i;
      }
      return cum.length - 1;
    });
  }, [pointers, cum]);

  const counts = useMemo(() => {
    const out = new Array(n).fill(0);
    for (const i of picks) out[i]++;
    return out;
  }, [picks, n]);

  const W = 540;
  const H = 240;
  const padX = 30;
  const padY = 20;
  const innerW = W - 2 * padX;
  const X = (frac: number) => padX + frac * innerW;

  // Render: top row = CDF strip with weighted bins; middle = pointers; bottom = resulting counts as a histogram
  const topY = padY + 10;
  const topH = 36;
  const midY = topY + topH + 16;
  const midH = 24;
  const botY = midY + midH + 16;
  const botH = 60;

  return (
    <VizFrame
      title="Resampling — roulette wheel vs. stochastic universal sampling"
      caption={
        <>
          Top: CDF strip of {n} weighted particles (wider bin = higher weight).
          Middle: where the {n} pointers land. Bottom: how many copies each
          particle gets.
        </>
      }
      controls={
        <div className="flex flex-wrap items-center gap-3">
          <VizButton onClick={() => setMethod('roulette')} active={method === 'roulette'}>
            Roulette wheel
          </VizButton>
          <VizButton onClick={() => setMethod('sus')} active={method === 'sus'}>
            Stochastic universal
          </VizButton>
          <VizButton onClick={() => setSeed((s) => s + 1)}>🎲 Reseed</VizButton>
          <div className="flex-1 min-w-[180px]">
            <VizSlider label="# particles" value={n} min={6} max={60} step={2} onChange={(v) => setN(Math.round(v))} format={(v) => String(Math.round(v))} />
          </div>
        </div>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="Resampling pointer visualization">
        {/* CDF strip */}
        <text x={padX} y={topY - 4} fontSize={9} fill="var(--md-on-surface-variant)" fontFamily="monospace">
          weighted CDF
        </text>
        {particles.map((p, i) => {
          const start = i === 0 ? 0 : cum[i - 1];
          const end = cum[i];
          const x1 = X(start);
          const x2 = X(end);
          return (
            <g key={i}>
              <rect
                x={x1}
                y={topY}
                width={Math.max(0.5, x2 - x1)}
                height={topH}
                fill={i % 2 === 0 ? 'var(--md-primary-container)' : 'var(--md-tertiary-container)'}
                stroke="var(--md-outline-variant)"
                strokeWidth={0.5}
              />
              {x2 - x1 > 8 && (
                <text x={(x1 + x2) / 2} y={topY + topH / 2 + 3} fontSize={8} fill="var(--md-on-surface)" textAnchor="middle" fontFamily="monospace">
                  {i}
                </text>
              )}
            </g>
          );
        })}
        {/* pointers */}
        <text x={padX} y={midY - 4} fontSize={9} fill="var(--md-on-surface-variant)" fontFamily="monospace">
          {method === 'sus' ? 'evenly-spaced pointers' : 'random pointers'}
        </text>
        <rect x={padX} y={midY} width={innerW} height={midH} fill="var(--md-surface-container)" stroke="var(--md-outline-variant)" />
        {pointers.map((u, i) => (
          <line key={i} x1={X(u)} y1={midY} x2={X(u)} y2={midY + midH} stroke="var(--md-error)" strokeWidth={1.5} />
        ))}
        {/* counts */}
        <text x={padX} y={botY - 4} fontSize={9} fill="var(--md-on-surface-variant)" fontFamily="monospace">
          resulting offspring count per particle
        </text>
        {counts.map((c, i) => {
          const x1 = X(i / n);
          const x2 = X((i + 1) / n);
          const maxC = Math.max(1, ...counts);
          const h = (c / maxC) * botH;
          return (
            <g key={i}>
              <rect
                x={x1}
                y={botY + botH - h}
                width={Math.max(0.5, x2 - x1 - 1)}
                height={h}
                fill={c === 0 ? 'var(--md-outline-variant)' : 'var(--md-primary)'}
              />
              {c > 0 && (
                <text x={(x1 + x2) / 2} y={botY + botH + 9} fontSize={8} fill="var(--md-on-surface-variant)" textAnchor="middle" fontFamily="monospace">
                  {c}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </VizFrame>
  );
}
