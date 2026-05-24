'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { VizFrame, VizButton, VizSlider } from './VizFrame';

const W = 240; // pixels
const H = 180;
const CELL = 4;
const GW = W / CELL;
const GH = H / CELL;
const MAX_RANGE = 80;
const P_FREE = 0.3;
const P_OCC = 0.8;
const P0 = 0.5;
const LO_MAX = 4.0;

const logit = (p: number) => Math.log(p / (1 - p));
const sigmoid = (l: number) => 1 / (1 + Math.exp(-l));
const L0 = logit(P0);
const dLFree = logit(P_FREE) - L0;
const dLOcc = logit(P_OCC) - L0;

// Simple room layout as walls (0 = free, 1 = wall).
function buildWallMask() {
  const m = new Uint8Array(W * H);
  // Border
  for (let x = 0; x < W; x++) {
    m[x + 0 * W] = 1;
    m[x + (H - 1) * W] = 1;
  }
  for (let y = 0; y < H; y++) {
    m[0 + y * W] = 1;
    m[W - 1 + y * W] = 1;
  }
  // Inner walls
  for (let y = 40; y < 110; y++) m[80 + y * W] = 1;
  for (let x = 80; x < 160; x++) m[x + 80 * W] = 1;
  for (let x = 150; x < W - 20; x++) m[x + 40 * W] = 1;
  for (let y = 100; y < H - 20; y++) m[170 + y * W] = 1;
  return m;
}

export function GridMapViz() {
  const wallMask = useMemo(() => buildWallMask(), []);
  const [robot, setRobot] = useState({ x: 40, y: 40 });
  const [auto, setAuto] = useState(true);
  const [sigma, setSigma] = useState(1.0);
  const logoddsRef = useRef<Float32Array>(new Float32Array(GW * GH).fill(L0));
  const [, forceRender] = useState(0);
  const beamRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const tRef = useRef(0);

  const reset = useCallback(() => {
    logoddsRef.current = new Float32Array(GW * GH).fill(L0);
    forceRender((n) => n + 1);
  }, []);

  // Cast beam from (rx, ry) at angle, returns hit distance + flag.
  const castBeam = useCallback(
    (rx: number, ry: number, angle: number): { dist: number; hit: boolean } => {
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      for (let d = 1; d < MAX_RANGE; d++) {
        const x = Math.round(rx + d * c);
        const y = Math.round(ry + d * s);
        if (x < 0 || x >= W || y < 0 || y >= H) return { dist: d, hit: false };
        if (wallMask[x + y * W]) {
          // add small noise
          const noisy = d + (Math.random() - 0.5) * 2 * sigma;
          return { dist: noisy, hit: true };
        }
      }
      return { dist: MAX_RANGE, hit: false };
    },
    [wallMask, sigma]
  );

  // Apply one beam to the log-odds map.
  const applyBeam = useCallback(
    (rx: number, ry: number, angle: number, z: number, hit: boolean) => {
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      const rEnd = Math.min(z + (hit ? CELL : 0), MAX_RANGE);
      const seen = new Set<number>();
      for (let r = 0; r < rEnd; r += 1) {
        const x = Math.floor(rx + r * c);
        const y = Math.floor(ry + r * s);
        if (x < 0 || x >= W || y < 0 || y >= H) break;
        const gx = Math.floor(x / CELL);
        const gy = Math.floor(y / CELL);
        const idx = gx + gy * GW;
        if (seen.has(idx)) continue;
        seen.add(idx);
        let dL = 0;
        if (r < z - CELL / 2) dL = dLFree;
        else if (hit && r <= z + CELL / 2) dL = dLOcc;
        else continue;
        const next = Math.max(-LO_MAX, Math.min(LO_MAX, logoddsRef.current[idx] + dL));
        logoddsRef.current[idx] = next;
      }
    },
    []
  );

  // Animate: rotating beam from current robot pose; auto-walk too.
  useEffect(() => {
    const loop = (now: number) => {
      const dt = tRef.current ? (now - tRef.current) / 1000 : 0;
      tRef.current = now;
      beamRef.current = (beamRef.current + 8 * dt) % (2 * Math.PI); // 8 rad/s
      // Apply a small batch of beams (rotating sweep) each frame
      const beams = 6;
      for (let i = 0; i < beams; i++) {
        const a = beamRef.current + (i / beams) * 2 * Math.PI;
        const { dist, hit } = castBeam(robot.x, robot.y, a);
        applyBeam(robot.x, robot.y, a, dist, hit);
      }
      // Auto-walk robot in a slow circle through the free space
      if (auto) {
        const cx = 80;
        const cy = 110;
        const R = 50;
        setRobot((prev) => {
          const t = (now / 5000) % (2 * Math.PI);
          const nx = cx + R * Math.cos(t);
          const ny = cy + R * Math.sin(t);
          return { x: nx, y: ny };
        });
      }
      forceRender((n) => (n + 1) % 1000);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      tRef.current = 0;
    };
  }, [robot.x, robot.y, auto, castBeam, applyBeam]);

  // Render canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const img = ctx.createImageData(GW, GH);
    for (let i = 0; i < GW * GH; i++) {
      const p = sigmoid(logoddsRef.current[i]);
      const v = Math.round(255 * (1 - p));
      img.data[i * 4 + 0] = v;
      img.data[i * 4 + 1] = v;
      img.data[i * 4 + 2] = v;
      img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  });

  const handlePointer = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const y = ((e.clientY - rect.top) / rect.height) * H;
    setAuto(false);
    setRobot({ x, y });
  };

  return (
    <VizFrame
      title="Occupancy grid mapping with known poses"
      caption={
        <>
          Left: ground-truth floor plan with the rotating LiDAR beam. Right: the
          occupancy grid that the inverse-sensor-model log-odds update is building up.
          Move the robot by clicking, or let it auto-walk.
        </>
      }
      controls={
        <div className="flex flex-wrap items-center gap-3">
          <VizButton onClick={() => setAuto((v) => !v)} active={auto}>
            {auto ? '⏸ Pause walk' : '▶ Auto-walk'}
          </VizButton>
          <VizButton onClick={reset}>↺ Clear map</VizButton>
          <div className="flex-1 min-w-[180px]">
            <VizSlider label="Sensor σ (px)" value={sigma} min={0} max={4} step={0.1} onChange={setSigma} />
          </div>
        </div>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="block w-full cursor-crosshair rounded-md-md border border-md-outline-variant"
          onClick={handlePointer}
          role="img"
          aria-label="Ground truth floor plan"
        >
          <rect width={W} height={H} fill="var(--md-surface-container-low)" />
          {/* draw walls */}
          {Array.from({ length: H }).map((_, y) => (
            <g key={y}>
              {Array.from({ length: W }).map((_, x) =>
                wallMask[x + y * W] ? (
                  <rect key={x} x={x} y={y} width={1} height={1} fill="var(--md-on-surface)" />
                ) : null
              )}
            </g>
          ))}
          {/* robot */}
          <circle cx={robot.x} cy={robot.y} r={4} fill="var(--md-primary)" />
          {/* rotating beam endpoint */}
          {(() => {
            const a = beamRef.current;
            const { dist } = castBeam(robot.x, robot.y, a);
            return (
              <line
                x1={robot.x}
                y1={robot.y}
                x2={robot.x + dist * Math.cos(a)}
                y2={robot.y + dist * Math.sin(a)}
                stroke="var(--md-error)"
                strokeWidth={1}
              />
            );
          })()}
        </svg>
        <div className="rounded-md-md border border-md-outline-variant overflow-hidden">
          <canvas
            ref={canvasRef}
            width={GW}
            height={GH}
            className="block w-full"
            style={{ imageRendering: 'pixelated', height: 'auto', aspectRatio: `${W}/${H}` }}
            aria-label="Built occupancy grid map"
          />
        </div>
      </div>
    </VizFrame>
  );
}
