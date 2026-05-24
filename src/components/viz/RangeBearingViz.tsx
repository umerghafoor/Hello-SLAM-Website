'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { VizFrame, VizSlider, VizButton } from './VizFrame';

function randn(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

type Landmark = { x: number; y: number; name: string };

const LANDMARKS: Landmark[] = [
  { x: 5, y: 7, name: 'L1' },
  { x: 1, y: 8, name: 'L2' },
  { x: 7, y: 2, name: 'L3' },
];

export function RangeBearingViz() {
  const [theta, setTheta] = useState(Math.PI / 4);
  const [rx, setRx] = useState(2);
  const [ry, setRy] = useState(3);
  const [sigmaR, setSigmaR] = useState(0.15);
  const [sigmaPhi, setSigmaPhi] = useState(0.07);
  const [tick, setTick] = useState(0);
  const [animate, setAnimate] = useState(true);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  useEffect(() => {
    if (!animate) return;
    const loop = (now: number) => {
      if (lastRef.current === null) lastRef.current = now;
      if (now - lastRef.current > 350) {
        setTick((t) => t + 1);
        lastRef.current = now;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastRef.current = null;
    };
  }, [animate]);

  const measurements = useMemo(() => {
    void tick; // re-roll on each tick
    return LANDMARKS.map((lm) => {
      const dx = lm.x - rx;
      const dy = lm.y - ry;
      const r = Math.hypot(dx, dy);
      const phi = Math.atan2(dy, dx) - theta;
      const rn = r + sigmaR * randn();
      const phin = phi + sigmaPhi * randn();
      const mx = rx + rn * Math.cos(theta + phin);
      const my = ry + rn * Math.sin(theta + phin);
      return { r, phi, rn, phin, mx, my, true: lm };
    });
  }, [tick, rx, ry, theta, sigmaR, sigmaPhi]);

  const W = 380;
  const H = 320;
  const xMin = -1;
  const xMax = 9;
  const yMin = -1;
  const yMax = 9;
  const sx = (W - 30) / (xMax - xMin);
  const sy = (H - 30) / (yMax - yMin);
  const s = Math.min(sx, sy);
  const X = (x: number) => 20 + (x - xMin) * s;
  const Y = (y: number) => H - 15 - (y - yMin) * s;

  return (
    <VizFrame
      title="Range-bearing observation model"
      caption={
        <>
          Robot heading shown by arrow. Dashed line = true bearing; coloured rays = noisy
          measurements re-sampled each tick. σ<sub>r</sub> =
          {' '}<span className="font-mono">{sigmaR.toFixed(2)}</span>, σ<sub>φ</sub> =
          {' '}<span className="font-mono">{sigmaPhi.toFixed(2)}</span> rad.
        </>
      }
      controls={
        <div className="flex flex-wrap items-center gap-3">
          <VizButton onClick={() => setAnimate((v) => !v)} active={animate}>
            {animate ? '⏸ Pause' : '▶ Sample'}
          </VizButton>
          <VizButton onClick={() => setTick((t) => t + 1)}>↻ One sample</VizButton>
          <div className="flex flex-1 flex-wrap gap-3">
            <div className="min-w-[180px] flex-1">
              <VizSlider
                label="Robot θ (rad)"
                value={theta}
                min={-Math.PI}
                max={Math.PI}
                step={0.05}
                onChange={setTheta}
              />
            </div>
            <div className="min-w-[180px] flex-1">
              <VizSlider
                label="σ range"
                value={sigmaR}
                min={0}
                max={0.6}
                step={0.02}
                onChange={setSigmaR}
              />
            </div>
            <div className="min-w-[180px] flex-1">
              <VizSlider
                label="σ bearing (rad)"
                value={sigmaPhi}
                min={0}
                max={0.3}
                step={0.01}
                onChange={setSigmaPhi}
              />
            </div>
          </div>
        </div>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full"
        role="img"
        aria-label="Robot observing landmarks with range and bearing"
      >
        {/* grid */}
        {Array.from({ length: 11 }).map((_, i) => {
          const x = xMin + i;
          return (
            <line
              key={`gx${i}`}
              x1={X(x)}
              x2={X(x)}
              y1={Y(yMin)}
              y2={Y(yMax)}
              stroke="var(--md-outline-variant)"
              strokeOpacity={0.4}
            />
          );
        })}
        {Array.from({ length: 11 }).map((_, i) => {
          const y = yMin + i;
          return (
            <line
              key={`gy${i}`}
              x1={X(xMin)}
              x2={X(xMax)}
              y1={Y(y)}
              y2={Y(y)}
              stroke="var(--md-outline-variant)"
              strokeOpacity={0.4}
            />
          );
        })}

        {/* true rays + noisy rays */}
        {measurements.map((m, i) => (
          <g key={i}>
            <line
              x1={X(rx)}
              y1={Y(ry)}
              x2={X(m.true.x)}
              y2={Y(m.true.y)}
              stroke="var(--md-outline)"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
            <line
              x1={X(rx)}
              y1={Y(ry)}
              x2={X(m.mx)}
              y2={Y(m.my)}
              stroke="var(--md-tertiary)"
              strokeWidth={2}
              strokeOpacity={0.85}
            />
            <circle cx={X(m.mx)} cy={Y(m.my)} r={3} fill="var(--md-tertiary)" />
          </g>
        ))}

        {/* landmarks */}
        {LANDMARKS.map((lm) => (
          <g key={lm.name}>
            <polygon
              points={`${X(lm.x)},${Y(lm.y) - 6} ${X(lm.x) - 5},${Y(lm.y) + 4} ${X(lm.x) + 5},${Y(lm.y) + 4}`}
              fill="var(--md-error)"
            />
            <text
              x={X(lm.x) + 8}
              y={Y(lm.y) + 4}
              fontSize={10}
              fill="var(--md-on-surface-variant)"
              fontFamily="monospace"
            >
              {lm.name}
            </text>
          </g>
        ))}

        {/* robot */}
        <g>
          <circle cx={X(rx)} cy={Y(ry)} r={7} fill="var(--md-primary)" />
          <line
            x1={X(rx)}
            y1={Y(ry)}
            x2={X(rx) + 18 * Math.cos(-theta)}
            y2={Y(ry) + 18 * Math.sin(-theta)}
            stroke="var(--md-on-primary)"
            strokeWidth={2.5}
          />
        </g>
      </svg>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <VizSlider label="Robot x" value={rx} min={0} max={8} step={0.1} onChange={setRx} />
        <VizSlider label="Robot y" value={ry} min={0} max={8} step={0.1} onChange={setRy} />
      </div>
    </VizFrame>
  );
}
