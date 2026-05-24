'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { VizFrame, VizSlider, VizButton } from './VizFrame';

type Pose = { x: number; y: number; th: number };
type Cmd = [number, number, number]; // rot1, trans, rot2

const COMMANDS: Cmd[] = [
  [Math.PI / 4, 1.0, Math.PI / 4],
  [0, 1.5, 0],
  [-Math.PI / 2, 2.0, -Math.PI / 4],
  [Math.PI / 2, 1.0, 0],
  [0, 1.0, Math.PI / 6],
  [-Math.PI / 3, 1.2, 0],
];

function randn(): number {
  // Box–Muller
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function step(p: Pose, cmd: Cmd, noiseStd: [number, number, number]): Pose {
  const [r1, tr, r2] = cmd;
  const r1n = r1 + noiseStd[0] * randn();
  const trn = tr + noiseStd[1] * randn();
  const r2n = r2 + noiseStd[2] * randn();
  return {
    x: p.x + trn * Math.cos(p.th + r1n),
    y: p.y + trn * Math.sin(p.th + r1n),
    th: p.th + r1n + r2n,
  };
}

export function OdometryDriftViz() {
  const [t, setT] = useState(0); // 0..COMMANDS.length, animated
  const [playing, setPlaying] = useState(true);
  const [noise, setNoise] = useState(0.08);
  const [nSamples, setNSamples] = useState(40);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  // Pre-sample noisy trajectories.
  const samples = useMemo(() => {
    const stds: [number, number, number] = [noise, noise * 1.3, noise];
    const all: Pose[][] = [];
    for (let s = 0; s < nSamples; s++) {
      const traj: Pose[] = [{ x: 0, y: 0, th: 0 }];
      let p = traj[0];
      for (const c of COMMANDS) {
        p = step(p, c, stds);
        traj.push(p);
      }
      all.push(traj);
    }
    return all;
  }, [noise, nSamples]);

  // Ground-truth trajectory (noise-free)
  const gt = useMemo(() => {
    const traj: Pose[] = [{ x: 0, y: 0, th: 0 }];
    let p = traj[0];
    for (const c of COMMANDS) {
      p = step(p, c, [0, 0, 0]);
      traj.push(p);
    }
    return traj;
  }, []);

  useEffect(() => {
    if (!playing) return;
    const tick = (now: number) => {
      if (lastRef.current === null) lastRef.current = now;
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;
      setT((prev) => {
        const next = prev + dt * 0.5; // 0.5 cmds/sec
        if (next > COMMANDS.length) {
          return 0;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastRef.current = null;
    };
  }, [playing]);

  const W = 480;
  const H = 320;
  const bounds = useMemo(() => {
    let minX = -1;
    let maxX = 1;
    let minY = -1;
    let maxY = 1;
    for (const traj of samples) {
      for (const p of traj) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      }
    }
    const pad = 0.5;
    return { minX: minX - pad, maxX: maxX + pad, minY: minY - pad, maxY: maxY + pad };
  }, [samples]);

  const sx = (W - 30) / (bounds.maxX - bounds.minX);
  const sy = (H - 30) / (bounds.maxY - bounds.minY);
  const s = Math.min(sx, sy);
  const X = (x: number) => 15 + (x - bounds.minX) * s;
  const Y = (y: number) => H - 15 - (y - bounds.minY) * s;

  const partial = (traj: Pose[]) => {
    const k = Math.floor(t);
    const frac = t - k;
    const pts: { x: number; y: number }[] = traj.slice(0, k + 1);
    if (k + 1 < traj.length && frac > 0) {
      const a = traj[k];
      const b = traj[k + 1];
      pts.push({ x: a.x + (b.x - a.x) * frac, y: a.y + (b.y - a.y) * frac });
    }
    return pts;
  };

  const toPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${X(p.x)} ${Y(p.y)}`).join(' ');

  const gtPts = partial(gt);
  const gtHead = gtPts[gtPts.length - 1];

  return (
    <VizFrame
      title="Odometry motion model — sampled drift"
      caption={
        <>
          Ground truth (green) vs {nSamples} noisy executions of the same command sequence.
          Per-step noise = <span className="font-mono">{noise.toFixed(2)}</span>.
        </>
      }
      controls={
        <div className="flex flex-wrap items-center gap-3">
          <VizButton onClick={() => setPlaying((v) => !v)} active={playing}>
            {playing ? '⏸ Pause' : '▶ Play'}
          </VizButton>
          <VizButton onClick={() => setT(0)}>↺ Reset</VizButton>
          <div className="flex flex-1 flex-wrap gap-3">
            <div className="min-w-[200px] flex-1">
              <VizSlider
                label="Noise σ"
                value={noise}
                min={0}
                max={0.2}
                step={0.01}
                onChange={setNoise}
              />
            </div>
            <div className="min-w-[200px] flex-1">
              <VizSlider
                label="# samples"
                value={nSamples}
                min={5}
                max={80}
                step={5}
                onChange={(v) => setNSamples(Math.round(v))}
                format={(v) => String(Math.round(v))}
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
        aria-label="Noisy odometry trajectory animation"
      >
        <rect
          x={0}
          y={0}
          width={W}
          height={H}
          fill="var(--md-surface-container-low)"
        />
        {samples.map((traj, i) => (
          <path
            key={i}
            d={toPath(partial(traj))}
            stroke="var(--md-tertiary)"
            strokeOpacity={0.32}
            strokeWidth={1}
            fill="none"
          />
        ))}
        <path
          d={toPath(gtPts)}
          stroke="var(--md-primary)"
          strokeWidth={2.4}
          fill="none"
        />
        {gtHead && (
          <circle
            cx={X(gtHead.x)}
            cy={Y(gtHead.y)}
            r={5}
            fill="var(--md-primary)"
          />
        )}
      </svg>
    </VizFrame>
  );
}
