'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { VizFrame, VizSlider, VizButton } from './VizFrame';

// Small corridor world with three rooms — fixed walls.
const WORLD_W = 240;
const WORLD_H = 160;

type Wall = { x1: number; y1: number; x2: number; y2: number };

const WALLS: Wall[] = [
  // outer
  { x1: 10, y1: 10, x2: 230, y2: 10 },
  { x1: 230, y1: 10, x2: 230, y2: 150 },
  { x1: 230, y1: 150, x2: 10, y2: 150 },
  { x1: 10, y1: 150, x2: 10, y2: 10 },
  // inner partitions
  { x1: 80, y1: 10, x2: 80, y2: 80 },
  { x1: 150, y1: 80, x2: 150, y2: 150 },
  { x1: 80, y1: 80, x2: 200, y2: 80 },
];

function randn(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function castRay(x: number, y: number, angle: number, maxRange = 200): number {
  let bestT = maxRange;
  const cx = Math.cos(angle);
  const cy = Math.sin(angle);
  for (const w of WALLS) {
    // Ray-segment intersection
    const dx = w.x2 - w.x1;
    const dy = w.y2 - w.y1;
    const denom = cx * dy - cy * dx;
    if (Math.abs(denom) < 1e-9) continue;
    const t = ((w.x1 - x) * dy - (w.y1 - y) * dx) / denom;
    const s = ((w.x1 - x) * cy - (w.y1 - y) * cx) / denom;
    if (t >= 0 && s >= 0 && s <= 1 && t < bestT) bestT = t;
  }
  return bestT;
}

const NUM_BEAMS = 8;
const BEAM_ANGLES = Array.from({ length: NUM_BEAMS }, (_, i) => (i / NUM_BEAMS) * 2 * Math.PI);

function scan(x: number, y: number, theta: number, sigma: number): number[] {
  return BEAM_ANGLES.map((a) => castRay(x, y, theta + a) + sigma * randn());
}

type Particle = { x: number; y: number; th: number; w: number };

function isFree(x: number, y: number): boolean {
  if (x < 12 || x > 228 || y < 12 || y > 148) return false;
  // Simple inside check via the world layout
  return true;
}

function systematicResample(particles: Particle[]): Particle[] {
  const N = particles.length;
  const totalW = particles.reduce((a, p) => a + p.w, 0);
  if (totalW <= 0) return particles.map((p) => ({ ...p, w: 1 / N }));
  const cum: number[] = [];
  let acc = 0;
  for (const p of particles) {
    acc += p.w / totalW;
    cum.push(acc);
  }
  const u0 = Math.random() / N;
  const out: Particle[] = [];
  let i = 0;
  for (let j = 0; j < N; j++) {
    const u = u0 + j / N;
    while (i < N - 1 && u > cum[i]) i++;
    const src = particles[i];
    out.push({ x: src.x, y: src.y, th: src.th, w: 1 / N });
  }
  return out;
}

export function MCLViz() {
  const [robot, setRobot] = useState({ x: 50, y: 50, th: 0.3 });
  const [nParticles, setNParticles] = useState(300);
  const [sigmaHit, setSigmaHit] = useState(8);
  const [running, setRunning] = useState(true);
  const [step, setStep] = useState(0);
  const particlesRef = useRef<Particle[]>([]);

  const seedParticles = useCallback(() => {
    const N = nParticles;
    const out: Particle[] = [];
    for (let i = 0; i < N; i++) {
      let x = 12 + Math.random() * 216;
      let y = 12 + Math.random() * 136;
      while (!isFree(x, y)) {
        x = 12 + Math.random() * 216;
        y = 12 + Math.random() * 136;
      }
      const th = (Math.random() - 0.5) * 2 * Math.PI;
      out.push({ x, y, th, w: 1 / N });
    }
    particlesRef.current = out;
    setStep(0);
  }, [nParticles]);

  // Init on mount and when N changes.
  useEffect(() => {
    seedParticles();
  }, [seedParticles]);

  const tick = useCallback(() => {
    const ps = particlesRef.current;
    if (!ps.length) return;
    // 1) Motion: small forward step + turn slightly.
    const TRANS = 4;
    const ROT = 0.05;
    const newRobot = {
      x: robot.x + TRANS * Math.cos(robot.th + ROT),
      y: robot.y + TRANS * Math.sin(robot.th + ROT),
      th: robot.th + ROT,
    };
    if (!isFree(newRobot.x, newRobot.y)) {
      // turn around
      setRobot((r) => ({ ...r, th: r.th + Math.PI / 2 }));
      return;
    }
    setRobot(newRobot);

    // Predict particles
    for (const p of ps) {
      const noiseR = 0.05 * randn();
      const noiseT = 1.5 * randn();
      const noiseT2 = 1.5 * randn();
      p.th = p.th + ROT + noiseR;
      p.x = p.x + TRANS * Math.cos(p.th) + noiseT;
      p.y = p.y + TRANS * Math.sin(p.th) + noiseT2;
    }

    // Measurement
    const z = scan(newRobot.x, newRobot.y, newRobot.th, 1.0);

    // Update weights via Gaussian endpoint-distance score (simplified beam likelihood)
    let logwMax = -Infinity;
    const logws: number[] = [];
    for (const p of ps) {
      let logw = 0;
      for (let i = 0; i < NUM_BEAMS; i++) {
        const expected = castRay(p.x, p.y, p.th + BEAM_ANGLES[i]);
        const d = expected - z[i];
        logw += -(d * d) / (2 * sigmaHit * sigmaHit);
      }
      logws.push(logw);
      if (logw > logwMax) logwMax = logw;
    }
    let sumW = 0;
    for (let i = 0; i < ps.length; i++) {
      ps[i].w = Math.exp(logws[i] - logwMax);
      sumW += ps[i].w;
    }
    if (sumW > 0) for (const p of ps) p.w /= sumW;

    // Resample if ESS too low
    const ess = 1 / ps.reduce((a, p) => a + p.w * p.w, 0);
    if (ess < ps.length * 0.5) {
      particlesRef.current = systematicResample(ps);
    }

    setStep((s) => s + 1);
  }, [robot, sigmaHit]);

  // Animation loop
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);
  useEffect(() => {
    if (!running) return;
    const loop = (now: number) => {
      if (now - lastRef.current > 250) {
        tick();
        lastRef.current = now;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [running, tick]);

  // Weighted estimate
  const est = useMemo(() => {
    const ps = particlesRef.current;
    if (!ps.length) return null;
    let sx = 0;
    let sy = 0;
    let stx = 0;
    let sty = 0;
    let sumW = 0;
    for (const p of ps) {
      sx += p.x * p.w;
      sy += p.y * p.w;
      stx += Math.cos(p.th) * p.w;
      sty += Math.sin(p.th) * p.w;
      sumW += p.w;
    }
    if (sumW <= 0) return null;
    return {
      x: sx / sumW,
      y: sy / sumW,
      th: Math.atan2(sty, stx),
    };
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <VizFrame
      title="Monte Carlo Localization (MCL)"
      caption={
        <>
          Particles (red dots) start scattered randomly across the free space. As the
          robot drives, each particle predicts via the motion model and is reweighted
          by how well its simulated LiDAR scan matches the real one. Resampling
          concentrates particles on the true pose.
        </>
      }
      controls={
        <div className="flex flex-wrap items-center gap-3">
          <VizButton onClick={() => setRunning((v) => !v)} active={running}>
            {running ? '⏸ Pause' : '▶ Play'}
          </VizButton>
          <VizButton onClick={() => seedParticles()}>↺ Reseed particles</VizButton>
          <div className="flex-1 min-w-[180px]">
            <VizSlider
              label="# particles"
              value={nParticles}
              min={50}
              max={1000}
              step={50}
              onChange={(v) => setNParticles(Math.round(v))}
              format={(v) => String(Math.round(v))}
            />
          </div>
          <div className="flex-1 min-w-[180px]">
            <VizSlider label="σ_hit (px)" value={sigmaHit} min={2} max={20} step={1} onChange={setSigmaHit} />
          </div>
        </div>
      }
    >
      <svg
        viewBox={`0 0 ${WORLD_W} ${WORLD_H}`}
        className="block w-full"
        role="img"
        aria-label="MCL animation showing particle concentration"
      >
        <rect width={WORLD_W} height={WORLD_H} fill="var(--md-surface-container-low)" />
        {/* walls */}
        {WALLS.map((w, i) => (
          <line
            key={i}
            x1={w.x1}
            y1={w.y1}
            x2={w.x2}
            y2={w.y2}
            stroke="var(--md-on-surface)"
            strokeWidth={2}
          />
        ))}
        {/* particles */}
        {particlesRef.current.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={1.2}
            fill="var(--md-error)"
            fillOpacity={0.7}
          />
        ))}
        {/* estimate */}
        {est && (
          <>
            <circle cx={est.x} cy={est.y} r={4} fill="none" stroke="var(--md-secondary)" strokeWidth={1.5} />
            <line
              x1={est.x}
              y1={est.y}
              x2={est.x + 10 * Math.cos(est.th)}
              y2={est.y + 10 * Math.sin(est.th)}
              stroke="var(--md-secondary)"
              strokeWidth={1.5}
            />
          </>
        )}
        {/* ground truth */}
        <circle cx={robot.x} cy={robot.y} r={4} fill="var(--md-primary)" />
        <line
          x1={robot.x}
          y1={robot.y}
          x2={robot.x + 12 * Math.cos(robot.th)}
          y2={robot.y + 12 * Math.sin(robot.th)}
          stroke="var(--md-primary)"
          strokeWidth={2}
        />
        <text x={10} y={14} fontSize={8} fill="var(--md-on-surface-variant)" fontFamily="monospace">
          step {step} · GT (green) · estimate (yellow) · particles (red)
        </text>
      </svg>
    </VizFrame>
  );
}
