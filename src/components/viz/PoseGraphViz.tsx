'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { VizFrame, VizSlider, VizButton } from './VizFrame';

// 2D pose graph: circular trajectory with noisy odometry + loop closure constraint.
// Animate Gauss-Newton iterations pulling the drifted path back onto the circle.
const N_POSES = 30;
const RADIUS = 40;

function wrap(a: number) {
  return ((a + Math.PI) % (2 * Math.PI)) - Math.PI;
}
function randn() {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

type Pose = { x: number; y: number; th: number };

// Build a noisy initial guess from raw odometry on a circular GT trajectory.
function buildScenario(seed: number, noiseScale: number) {
  void seed;
  const gt: Pose[] = [];
  for (let i = 0; i < N_POSES; i++) {
    const t = (i / N_POSES) * 2 * Math.PI;
    gt.push({ x: RADIUS * Math.cos(t), y: RADIUS * Math.sin(t), th: wrap(t + Math.PI / 2) });
  }
  // Anchor at origin
  const ax = gt[0].x;
  const ay = gt[0].y;
  const ath = gt[0].th;
  for (const p of gt) {
    p.x -= ax;
    p.y -= ay;
    p.th = wrap(p.th - ath);
  }
  // Sequential odometry edges with noise
  const edges: { i: number; j: number; dx: number; dy: number; dth: number; omega: number }[] = [];
  for (let i = 0; i < N_POSES - 1; i++) {
    const a = gt[i];
    const b = gt[i + 1];
    const c = Math.cos(a.th);
    const s = Math.sin(a.th);
    const dxw = b.x - a.x;
    const dyw = b.y - a.y;
    // local frame
    let dx = c * dxw + s * dyw;
    let dy = -s * dxw + c * dyw;
    let dth = wrap(b.th - a.th);
    dx += 0.6 * noiseScale * randn();
    dy += 0.6 * noiseScale * randn();
    dth += 0.05 * noiseScale * randn();
    edges.push({ i, j: i + 1, dx, dy, dth, omega: 1 });
  }
  // Loop closure edge from N-1 -> 0
  {
    const a = gt[N_POSES - 1];
    const b = gt[0];
    const c = Math.cos(a.th);
    const s = Math.sin(a.th);
    const dxw = b.x - a.x;
    const dyw = b.y - a.y;
    let dx = c * dxw + s * dyw;
    let dy = -s * dxw + c * dyw;
    let dth = wrap(b.th - a.th);
    dx += 0.3 * noiseScale * randn();
    dy += 0.3 * noiseScale * randn();
    dth += 0.02 * noiseScale * randn();
    edges.push({ i: N_POSES - 1, j: 0, dx, dy, dth, omega: 4 });
  }
  // A few mid-range loop closures
  for (let k = 0; k < 4; k++) {
    const i = Math.floor((k + 0.5) * (N_POSES / 5));
    const j = Math.min(N_POSES - 1, i + 8);
    const a = gt[i];
    const b = gt[j];
    const c = Math.cos(a.th);
    const s = Math.sin(a.th);
    const dxw = b.x - a.x;
    const dyw = b.y - a.y;
    let dx = c * dxw + s * dyw;
    let dy = -s * dxw + c * dyw;
    let dth = wrap(b.th - a.th);
    dx += 0.2 * noiseScale * randn();
    dy += 0.2 * noiseScale * randn();
    dth += 0.02 * noiseScale * randn();
    edges.push({ i, j, dx, dy, dth, omega: 2 });
  }

  // Initial guess: integrate noisy odometry from pose 0.
  const init: Pose[] = [{ x: 0, y: 0, th: 0 }];
  for (let i = 0; i < N_POSES - 1; i++) {
    const e = edges[i];
    const a = init[init.length - 1];
    const c = Math.cos(a.th);
    const s = Math.sin(a.th);
    init.push({
      x: a.x + c * e.dx - s * e.dy,
      y: a.y + s * e.dx + c * e.dy,
      th: wrap(a.th + e.dth),
    });
  }
  return { gt, init, edges };
}

// One Gauss-Newton step with anchor prior.
function gnStep(poses: Pose[], edges: { i: number; j: number; dx: number; dy: number; dth: number; omega: number }[]) {
  const N = poses.length;
  const D = 3 * N;
  // Build H, b with simple linearization (relative-pose error in local frame).
  const H: number[][] = Array.from({ length: D }, () => new Array(D).fill(0));
  const b: number[] = new Array(D).fill(0);
  const add = (i: number, j: number, val: number) => {
    H[i][j] += val;
  };

  for (const e of edges) {
    const xi = poses[e.i];
    const xj = poses[e.j];
    const c = Math.cos(xi.th);
    const s = Math.sin(xi.th);
    const dxw = xj.x - xi.x;
    const dyw = xj.y - xi.y;
    const dxL = c * dxw + s * dyw;
    const dyL = -s * dxw + c * dyw;
    const dthL = wrap(xj.th - xi.th);
    const err = [dxL - e.dx, dyL - e.dy, wrap(dthL - e.dth)];

    // Jacobians (Ji wrt i, Jj wrt j) — 3x3 each
    // Local frame d_local = R(-θi)·(pj-pi); ∂d_local/∂pi = -R(-θi), ∂d_local/∂pj = R(-θi)
    // ∂d_local/∂θi = R(-θi)·[[0,1],[-1,0]]·(pj-pi)
    const Rm: number[][] = [
      [c, s],
      [-s, c],
    ]; // R(-θi)
    const Ji = [
      [-Rm[0][0], -Rm[0][1], Rm[0][0] * -dyw + Rm[0][1] * dxw],
      [-Rm[1][0], -Rm[1][1], Rm[1][0] * -dyw + Rm[1][1] * dxw],
      [0, 0, -1],
    ];
    const Jj = [
      [Rm[0][0], Rm[0][1], 0],
      [Rm[1][0], Rm[1][1], 0],
      [0, 0, 1],
    ];
    const omega = e.omega;

    const ii = 3 * e.i;
    const jj = 3 * e.j;
    for (let r = 0; r < 3; r++) {
      for (let c2 = 0; c2 < 3; c2++) {
        for (let k = 0; k < 3; k++) {
          add(ii + r, ii + c2, Ji[k][r] * omega * Ji[k][c2]);
          add(ii + r, jj + c2, Ji[k][r] * omega * Jj[k][c2]);
          add(jj + r, ii + c2, Jj[k][r] * omega * Ji[k][c2]);
          add(jj + r, jj + c2, Jj[k][r] * omega * Jj[k][c2]);
        }
      }
      for (let k = 0; k < 3; k++) {
        b[ii + r] += Ji[k][r] * omega * err[k];
        b[jj + r] += Jj[k][r] * omega * err[k];
      }
    }
  }

  // Anchor prior on pose 0
  const wp = 1e6;
  for (let k = 0; k < 3; k++) {
    H[k][k] += wp;
    const cur = k === 0 ? poses[0].x : k === 1 ? poses[0].y : poses[0].th;
    b[k] += wp * cur;
  }

  // Damping
  const lam = 1e-3;
  for (let k = 0; k < D; k++) H[k][k] += lam * (H[k][k] + 1e-12);

  // Solve dx = -H^-1 b via simple Gaussian elimination (D ~ 90 — small).
  const M: number[][] = H.map((row, i) => row.concat([-b[i]]));
  for (let col = 0; col < D; col++) {
    let pivot = col;
    let pivVal = Math.abs(M[col][col]);
    for (let r = col + 1; r < D; r++) {
      if (Math.abs(M[r][col]) > pivVal) {
        pivVal = Math.abs(M[r][col]);
        pivot = r;
      }
    }
    if (pivVal < 1e-12) continue;
    if (pivot !== col) {
      const tmp = M[col];
      M[col] = M[pivot];
      M[pivot] = tmp;
    }
    const inv = 1 / M[col][col];
    for (let c2 = col; c2 <= D; c2++) M[col][c2] *= inv;
    for (let r = 0; r < D; r++) {
      if (r === col) continue;
      const f = M[r][col];
      if (f === 0) continue;
      for (let c2 = col; c2 <= D; c2++) M[r][c2] -= f * M[col][c2];
    }
  }
  const dx = M.map((row) => row[D]);

  // Apply step (alpha-scaled to keep it stable; also reset anchor)
  const alpha = 0.5;
  const next: Pose[] = poses.map((p, i) => ({
    x: p.x + alpha * dx[3 * i],
    y: p.y + alpha * dx[3 * i + 1],
    th: wrap(p.th + alpha * dx[3 * i + 2]),
  }));
  return next;
}

export function PoseGraphViz() {
  const [seed, setSeed] = useState(0);
  const [noiseScale, setNoiseScale] = useState(1.0);
  const [iter, setIter] = useState(0);
  const [playing, setPlaying] = useState(true);

  const { gt, init, edges } = useMemo(() => buildScenario(seed, noiseScale), [seed, noiseScale]);

  // Precompute the trajectory at each iteration so we can scrub.
  const trace = useMemo(() => {
    const out: Pose[][] = [init.map((p) => ({ ...p }))];
    let cur = init.map((p) => ({ ...p }));
    for (let it = 0; it < 25; it++) {
      cur = gnStep(cur, edges);
      out.push(cur.map((p) => ({ ...p })));
    }
    return out;
  }, [init, edges]);

  useEffect(() => {
    setIter(0);
  }, [trace]);

  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);
  useEffect(() => {
    if (!playing) return;
    const loop = (now: number) => {
      if (now - lastRef.current > 600) {
        setIter((i) => {
          if (i >= trace.length - 1) {
            // Hold at the end for a beat then loop
            if (i === trace.length - 1 + 3) return 0;
            return i + 1;
          }
          return i + 1;
        });
        lastRef.current = now;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, trace.length]);

  const W = 540;
  const H = 280;
  // Auto-fit bounds based on union of GT and the most-drifted init
  const allPts = [...gt, ...init];
  const xMin = Math.min(...allPts.map((p) => p.x)) - 10;
  const xMax = Math.max(...allPts.map((p) => p.x)) + 10;
  const yMin = Math.min(...allPts.map((p) => p.y)) - 10;
  const yMax = Math.max(...allPts.map((p) => p.y)) + 10;
  const sx = (W - 30) / (xMax - xMin);
  const sy = (H - 30) / (yMax - yMin);
  const s = Math.min(sx, sy);
  const X = (x: number) => 15 + (x - xMin) * s;
  const Y = (y: number) => H - 15 - (y - yMin) * s;

  const curPoses = trace[Math.min(iter, trace.length - 1)];

  return (
    <VizFrame
      title="Pose-graph optimization — closing the loop"
      caption={
        <>
          Initial trajectory comes from raw noisy odometry — it drifts off the true
          circle and the loop doesn't close. Each Gauss-Newton iteration pulls
          the graph back toward a configuration that satisfies all the relative-pose
          constraints (odometry + loop closures). Iter {iter} / {trace.length - 1}.
        </>
      }
      controls={
        <div className="flex flex-wrap items-center gap-3">
          <VizButton onClick={() => setPlaying((v) => !v)} active={playing}>
            {playing ? '⏸ Pause' : '▶ Play'}
          </VizButton>
          <VizButton onClick={() => setIter(0)}>↺ Reset</VizButton>
          <VizButton onClick={() => setSeed((s) => s + 1)}>🎲 Reseed</VizButton>
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
          <div className="flex-1 min-w-[180px]">
            <VizSlider label="Noise scale" value={noiseScale} min={0.2} max={2} step={0.1} onChange={setNoiseScale} />
          </div>
        </div>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="Pose-graph optimization animation">
        <rect width={W} height={H} fill="var(--md-surface-container-low)" />
        {/* GT */}
        <path
          d={gt.map((p, i) => `${i === 0 ? 'M' : 'L'} ${X(p.x)} ${Y(p.y)}`).join(' ') + ' Z'}
          stroke="var(--md-on-surface-variant)"
          strokeDasharray="3 3"
          strokeWidth={1.5}
          fill="none"
        />
        {/* Current estimate edges (odometry only for clarity) */}
        {curPoses.map((p, i) => {
          if (i === 0) return null;
          const prev = curPoses[i - 1];
          return (
            <line
              key={`e${i}`}
              x1={X(prev.x)}
              y1={Y(prev.y)}
              x2={X(p.x)}
              y2={Y(p.y)}
              stroke="var(--md-primary)"
              strokeWidth={1.5}
              strokeOpacity={0.6}
            />
          );
        })}
        {/* Loop closures highlighted */}
        {edges
          .filter((e) => Math.abs(e.j - e.i) > 1 || (e.j === 0 && e.i === N_POSES - 1))
          .map((e, k) => {
            const a = curPoses[e.i];
            const b = curPoses[e.j];
            return (
              <line
                key={`lc${k}`}
                x1={X(a.x)}
                y1={Y(a.y)}
                x2={X(b.x)}
                y2={Y(b.y)}
                stroke="var(--md-tertiary)"
                strokeWidth={1}
                strokeOpacity={0.4}
                strokeDasharray="2 3"
              />
            );
          })}
        {/* Nodes */}
        {curPoses.map((p, i) => (
          <circle key={`n${i}`} cx={X(p.x)} cy={Y(p.y)} r={2.5} fill="var(--md-primary)" />
        ))}
        {/* GT nodes faded */}
        {gt.map((p, i) => (
          <circle key={`gn${i}`} cx={X(p.x)} cy={Y(p.y)} r={1.5} fill="var(--md-on-surface-variant)" />
        ))}
        {/* Legend */}
        <g>
          <line x1={12} y1={14} x2={26} y2={14} stroke="var(--md-on-surface-variant)" strokeDasharray="3 3" strokeWidth={1.5} />
          <text x={30} y={17} fontSize={9} fill="var(--md-on-surface)" fontFamily="monospace">ground truth</text>
          <line x1={130} y1={14} x2={144} y2={14} stroke="var(--md-primary)" strokeWidth={1.5} />
          <text x={148} y={17} fontSize={9} fill="var(--md-on-surface)" fontFamily="monospace">estimate</text>
          <line x1={220} y1={14} x2={234} y2={14} stroke="var(--md-tertiary)" strokeDasharray="2 3" strokeWidth={1} />
          <text x={238} y={17} fontSize={9} fill="var(--md-on-surface)" fontFamily="monospace">loop closures</text>
        </g>
      </svg>
    </VizFrame>
  );
}
