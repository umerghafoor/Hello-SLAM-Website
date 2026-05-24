'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { VizFrame, VizSlider, VizButton } from './VizFrame';

// Fit y = a + b*x via Gauss-Newton with noisy data, animating iteration.
const N_POINTS = 12;
const TRUE_A = 1.0;
const TRUE_B = 0.5;

function randn() {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function GaussNewton1DViz() {
  const [seed, setSeed] = useState(0);
  const [aInit, setAInit] = useState(-2);
  const [bInit, setBInit] = useState(-1);
  const [noise, setNoise] = useState(0.3);
  const [iter, setIter] = useState(0);
  const [playing, setPlaying] = useState(true);

  const data = useMemo(() => {
    void seed;
    const xs: number[] = [];
    const ys: number[] = [];
    for (let i = 0; i < N_POINTS; i++) {
      const x = -3 + (i * 6) / (N_POINTS - 1);
      xs.push(x);
      ys.push(TRUE_A + TRUE_B * x + noise * randn());
    }
    return { xs, ys };
  }, [seed, noise]);

  // Run Gauss-Newton with all iterations stored for animation
  const trace = useMemo(() => {
    const { xs, ys } = data;
    const path: { a: number; b: number; cost: number }[] = [];
    let a = aInit;
    let b = bInit;
    const cost = (a: number, b: number) =>
      0.5 * xs.reduce((s, x, i) => s + (a + b * x - ys[i]) ** 2, 0);
    path.push({ a, b, cost: cost(a, b) });
    for (let it = 0; it < 30; it++) {
      // J = [1, x_i], e = (a + b x_i - y_i)
      // H = J^T J = [[N, sum_x], [sum_x, sum_x2]]; g = J^T e
      let H00 = 0,
        H01 = 0,
        H11 = 0,
        g0 = 0,
        g1 = 0;
      for (let i = 0; i < xs.length; i++) {
        const x = xs[i];
        const e = a + b * x - ys[i];
        H00 += 1;
        H01 += x;
        H11 += x * x;
        g0 += e;
        g1 += x * e;
      }
      const det = H00 * H11 - H01 * H01;
      if (Math.abs(det) < 1e-12) break;
      const da = (-g0 * H11 + g1 * H01) / det;
      const db = (g0 * H01 - g1 * H00) / det;
      a += da;
      b += db;
      path.push({ a, b, cost: cost(a, b) });
      if (Math.hypot(da, db) < 1e-6) break;
    }
    return path;
  }, [data, aInit, bInit]);

  // Animate iter index
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);
  useEffect(() => {
    if (!playing) return;
    const loop = (now: number) => {
      if (now - lastRef.current > 700) {
        setIter((i) => (i + 1) % trace.length);
        lastRef.current = now;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, trace.length]);

  // Reset iter when trace changes
  useEffect(() => {
    setIter(0);
  }, [trace]);

  const W = 540;
  const H = 240;
  const padX = 36;
  const padY = 14;
  const xMin = -4;
  const xMax = 4;
  const yMin = -4;
  const yMax = 4;
  const X = (x: number) => padX + ((x - xMin) / (xMax - xMin)) * (W - 2 * padX);
  const Y = (y: number) => H - padY - ((y - yMin) / (yMax - yMin)) * (H - 2 * padY);

  const cur = trace[Math.min(iter, trace.length - 1)];

  return (
    <VizFrame
      title="Gauss-Newton — fitting y = a + b·x"
      caption={
        <>
          Each iteration linearizes the residual and solves H·Δ = −b. After a few
          steps the line converges to the true generating model{' '}
          <span className="font-mono">y = {TRUE_A.toFixed(1)} + {TRUE_B.toFixed(2)} x</span>.
          Iter {iter} / {trace.length - 1} ·{' '}
          <span className="font-mono">a = {cur.a.toFixed(3)}, b = {cur.b.toFixed(3)}, cost = {cur.cost.toFixed(3)}</span>.
        </>
      }
      controls={
        <div className="flex flex-wrap items-center gap-3">
          <VizButton onClick={() => setPlaying((v) => !v)} active={playing}>
            {playing ? '⏸ Pause' : '▶ Play'}
          </VizButton>
          <VizButton onClick={() => setIter(0)}>↺ Reset</VizButton>
          <VizButton onClick={() => setSeed((s) => s + 1)}>🎲 Reseed data</VizButton>
          <div className="flex-1 min-w-[180px]">
            <VizSlider
              label="Iter"
              value={iter}
              min={0}
              max={trace.length - 1}
              step={1}
              onChange={(v) => {
                setPlaying(false);
                setIter(Math.round(v));
              }}
              format={(v) => String(Math.round(v))}
            />
          </div>
          <div className="flex-1 min-w-[160px]">
            <VizSlider label="Init a" value={aInit} min={-4} max={4} step={0.1} onChange={setAInit} />
          </div>
          <div className="flex-1 min-w-[160px]">
            <VizSlider label="Init b" value={bInit} min={-2} max={2} step={0.05} onChange={setBInit} />
          </div>
          <div className="flex-1 min-w-[160px]">
            <VizSlider label="Noise σ" value={noise} min={0} max={1.5} step={0.05} onChange={setNoise} />
          </div>
        </div>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="Gauss-Newton line fitting">
        {/* axes */}
        <line x1={padX} x2={W - padX} y1={Y(0)} y2={Y(0)} stroke="var(--md-outline-variant)" />
        <line x1={X(0)} x2={X(0)} y1={padY} y2={H - padY} stroke="var(--md-outline-variant)" />
        {/* true line */}
        <line
          x1={X(xMin)}
          y1={Y(TRUE_A + TRUE_B * xMin)}
          x2={X(xMax)}
          y2={Y(TRUE_A + TRUE_B * xMax)}
          stroke="var(--md-on-surface-variant)"
          strokeDasharray="4 4"
          strokeWidth={1.5}
        />
        {/* prior iter trail */}
        {trace.slice(0, iter + 1).map((s, i) => (
          <line
            key={i}
            x1={X(xMin)}
            y1={Y(s.a + s.b * xMin)}
            x2={X(xMax)}
            y2={Y(s.a + s.b * xMax)}
            stroke="var(--md-tertiary)"
            strokeOpacity={(i + 1) / (iter + 1) * 0.5}
            strokeWidth={1.5}
          />
        ))}
        {/* current line */}
        <line
          x1={X(xMin)}
          y1={Y(cur.a + cur.b * xMin)}
          x2={X(xMax)}
          y2={Y(cur.a + cur.b * xMax)}
          stroke="var(--md-primary)"
          strokeWidth={2.5}
        />
        {/* points + residual segments */}
        {data.xs.map((x, i) => {
          const yh = cur.a + cur.b * x;
          return (
            <g key={i}>
              <line
                x1={X(x)}
                y1={Y(data.ys[i])}
                x2={X(x)}
                y2={Y(yh)}
                stroke="var(--md-error)"
                strokeOpacity={0.4}
                strokeWidth={1}
              />
              <circle cx={X(x)} cy={Y(data.ys[i])} r={3} fill="var(--md-on-surface)" />
            </g>
          );
        })}
        {/* x ticks */}
        {[-3, -2, -1, 0, 1, 2, 3].map((tx) => (
          <text key={tx} x={X(tx)} y={H - 2} fontSize={9} fill="var(--md-on-surface-variant)" textAnchor="middle" fontFamily="monospace">
            {tx}
          </text>
        ))}
      </svg>
    </VizFrame>
  );
}
