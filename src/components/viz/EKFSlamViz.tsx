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

type Pose = { x: number; y: number; th: number };
type Pt = { x: number; y: number };

const DT = 0.1;
const STEPS = 120;
const V = 0.5;
const W_OMEGA = 0.15;

// Process / measurement noise.
const SIGMA_V = 0.02;
const SIGMA_W = 2.0 * Math.PI / 180;
const SIGMA_R = 0.02;
const SIGMA_PHI = 2.0 * Math.PI / 180;

function step(p: Pose, v: number, w: number, dt: number): Pose {
  if (Math.abs(w) < 1e-9) {
    return { x: p.x + v * dt * Math.cos(p.th), y: p.y + v * dt * Math.sin(p.th), th: p.th };
  }
  const th2 = p.th + w * dt;
  return {
    x: p.x - (v / w) * Math.sin(p.th) + (v / w) * Math.sin(th2),
    y: p.y + (v / w) * Math.cos(p.th) - (v / w) * Math.cos(th2),
    th: th2,
  };
}

const LANDMARKS: Pt[] = [
  { x: 1.2, y: 1.5 },
  { x: 3.5, y: 0.8 },
  { x: 4.2, y: 3.6 },
  { x: 0.6, y: 3.2 },
];

type SimState = {
  gtTraj: Pose[];
  predTraj: Pose[];
  predSigma: number[];
  ekfTraj: Pose[];
  ekfSigma: number[];
  landmarkObs: { x: number; y: number; weight: number }[][]; // per-step observed landmark estimates
};

function simulate(): SimState {
  // Ground-truth executes biased + noisy controls.
  const gt: Pose[] = [{ x: 0, y: 0, th: 0 }];
  // Prediction-only EKF: same nominal controls, but no correction. Uncertainty grows.
  const pred: Pose[] = [{ x: 0, y: 0, th: 0 }];
  const predSig: number[] = [0.01];
  // EKF with correction: scalar shrinkage model.
  const ekf: Pose[] = [{ x: 0, y: 0, th: 0 }];
  const ekfSig: number[] = [0.01];
  const landmarkObs: { x: number; y: number; weight: number }[][] = [[]];

  let gtPose = gt[0];
  let predPose = pred[0];
  let ekfPose = ekf[0];
  let predSigma = predSig[0];
  let ekfSigma = ekfSig[0];

  // simple per-landmark estimate (running average that tightens over time)
  const lmEst: { sumX: number; sumY: number; count: number }[] = LANDMARKS.map(
    () => ({ sumX: 0, sumY: 0, count: 0 })
  );

  for (let k = 0; k < STEPS; k++) {
    // GT with bias + noise
    const noiseV = SIGMA_V * randn();
    const noiseW = SIGMA_W * randn();
    gtPose = step(gtPose, 1.07 * V + noiseV, 0.96 * W_OMEGA + noiseW, DT);

    // Prediction-only: nominal controls, covariance grows
    predPose = step(predPose, V, W_OMEGA, DT);
    predSigma += 0.0015; // grows linearly per step

    // EKF with correction:
    // 1. predict
    ekfPose = step(ekfPose, V, W_OMEGA, DT);
    ekfSigma += 0.0015;
    // 2. correct using all landmark observations
    let xCorrSum = 0;
    let yCorrSum = 0;
    let thCorrSum = 0;
    let nObs = 0;
    const stepLmEst: { x: number; y: number; weight: number }[] = [];
    for (let j = 0; j < LANDMARKS.length; j++) {
      const lm = LANDMARKS[j];
      const dx = lm.x - gtPose.x;
      const dy = lm.y - gtPose.y;
      const r = Math.hypot(dx, dy);
      if (r > 4.0) continue; // limited sensor range
      const phi = Math.atan2(dy, dx) - gtPose.th;
      const rN = r + SIGMA_R * randn();
      const phiN = phi + SIGMA_PHI * randn();
      // World-frame landmark estimate from current EKF pose
      const mx = ekfPose.x + rN * Math.cos(ekfPose.th + phiN);
      const my = ekfPose.y + rN * Math.sin(ekfPose.th + phiN);
      lmEst[j].sumX += mx;
      lmEst[j].sumY += my;
      lmEst[j].count += 1;
      const eMx = lmEst[j].sumX / lmEst[j].count;
      const eMy = lmEst[j].sumY / lmEst[j].count;
      // Innovation: refine pose by half of (GT-from-landmark - predicted)
      const expBack = {
        x: eMx - rN * Math.cos(ekfPose.th + phiN),
        y: eMy - rN * Math.sin(ekfPose.th + phiN),
      };
      xCorrSum += expBack.x - ekfPose.x;
      yCorrSum += expBack.y - ekfPose.y;
      const expBackTh = Math.atan2(eMy - ekfPose.y, eMx - ekfPose.x) - phiN;
      thCorrSum += expBackTh - ekfPose.th;
      nObs++;
      stepLmEst.push({ x: eMx, y: eMy, weight: lmEst[j].count });
    }
    if (nObs > 0) {
      const gain = Math.min(0.5, 1 / (1 + nObs));
      ekfPose = {
        x: ekfPose.x + gain * xCorrSum / nObs,
        y: ekfPose.y + gain * yCorrSum / nObs,
        th: ekfPose.th,
      };
      // covariance shrinks with measurements
      ekfSigma = ekfSigma * (1 - 0.35 * Math.min(1, nObs / 2));
    }

    gt.push(gtPose);
    pred.push(predPose);
    predSig.push(predSigma);
    ekf.push(ekfPose);
    ekfSig.push(ekfSigma);
    landmarkObs.push(stepLmEst);
  }

  return {
    gtTraj: gt,
    predTraj: pred,
    predSigma: predSig,
    ekfTraj: ekf,
    ekfSigma: ekfSig,
    landmarkObs,
  };
}

export function EKFSlamViz() {
  // Run a fixed-seed-ish simulation once (recomputed when "Reseed" is pressed).
  const [seed, setSeed] = useState(0);
  const sim = useMemo(() => {
    void seed;
    return simulate();
  }, [seed]);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    const loop = (now: number) => {
      if (lastRef.current === null) lastRef.current = now;
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;
      setT((prev) => {
        const next = prev + dt * 25;
        if (next >= STEPS) return 0;
        return next;
      });
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      lastRef.current = null;
    };
  }, [playing]);

  const k = Math.min(STEPS, Math.floor(t));

  const W = 540;
  const H = 280;
  const panelW = (W - 30) / 2;
  const panelPadX = 20;
  const panelPadY = 16;

  const xMin = -1.5;
  const xMax = 5.5;
  const yMin = -1.5;
  const yMax = 5.0;

  const sx = (panelW - 2 * panelPadX) / (xMax - xMin);
  const sy = (H - 2 * panelPadY) / (yMax - yMin);
  const s = Math.min(sx, sy);

  const X = (panel: number) => (x: number) =>
    10 + panel * (panelW + 10) + panelPadX + (x - xMin) * s;
  const Y = (y: number) => H - panelPadY - (y - yMin) * s;

  const pathOf = (traj: Pose[], panel: number) =>
    traj
      .slice(0, k + 1)
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${X(panel)(p.x)} ${Y(p.y)}`)
      .join(' ');

  const gtPath = pathOf(sim.gtTraj, 0);
  const gtPath2 = pathOf(sim.gtTraj, 1);

  return (
    <VizFrame
      title="EKF-SLAM: prediction-only vs prediction + correction"
      caption={
        <>
          Left: prediction only — uncertainty (red circle radius) grows without bound.
          Right: with landmark observations, the EKF correction shrinks uncertainty and
          locks the estimated landmarks (×) onto the true positions (★).
        </>
      }
      controls={
        <div className="flex flex-wrap items-center gap-3">
          <VizButton onClick={() => setPlaying((v) => !v)} active={playing}>
            {playing ? '⏸ Pause' : '▶ Play'}
          </VizButton>
          <VizButton onClick={() => setT(0)}>↺ Reset</VizButton>
          <VizButton onClick={() => setSeed((s) => s + 1)}>🎲 Reseed</VizButton>
          <div className="flex-1 min-w-[180px]">
            <VizSlider
              label="Step"
              value={t}
              min={0}
              max={STEPS - 1}
              step={1}
              onChange={(v) => {
                setPlaying(false);
                setT(v);
              }}
              format={(v) => `${Math.round(v)} / ${STEPS - 1}`}
            />
          </div>
        </div>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full"
        role="img"
        aria-label="EKF-SLAM animation comparing prediction-only and full EKF"
      >
        {[0, 1].map((p) => (
          <g key={p}>
            <rect
              x={10 + p * (panelW + 10)}
              y={6}
              width={panelW}
              height={H - 12}
              fill="var(--md-surface-container-low)"
              stroke="var(--md-outline-variant)"
              rx={6}
            />
            <text
              x={10 + p * (panelW + 10) + panelW / 2}
              y={20}
              textAnchor="middle"
              fontSize={10}
              fill="var(--md-on-surface-variant)"
              fontFamily="monospace"
            >
              {p === 0 ? 'Prediction only' : 'Prediction + correction'}
            </text>
          </g>
        ))}

        {/* True landmarks on both panels */}
        {[0, 1].map((panel) =>
          LANDMARKS.map((lm, j) => (
            <g key={`lm-${panel}-${j}`}>
              <polygon
                points={`${X(panel)(lm.x)},${Y(lm.y) - 6} ${X(panel)(lm.x) - 5},${Y(lm.y) + 4} ${X(panel)(lm.x) + 5},${Y(lm.y) + 4}`}
                fill="var(--md-tertiary)"
                opacity={0.85}
              />
            </g>
          ))
        )}

        {/* Estimated landmarks on right panel */}
        {sim.landmarkObs[k]?.map((lm, j) => (
          <g key={`elm-${j}`}>
            <line
              x1={X(1)(lm.x) - 5}
              y1={Y(lm.y) - 5}
              x2={X(1)(lm.x) + 5}
              y2={Y(lm.y) + 5}
              stroke="var(--md-on-surface)"
              strokeWidth={1.5}
            />
            <line
              x1={X(1)(lm.x) + 5}
              y1={Y(lm.y) - 5}
              x2={X(1)(lm.x) - 5}
              y2={Y(lm.y) + 5}
              stroke="var(--md-on-surface)"
              strokeWidth={1.5}
            />
          </g>
        ))}

        {/* Ground truth path on both panels */}
        <path d={gtPath} stroke="var(--md-on-surface-variant)" strokeWidth={1.5} fill="none" strokeDasharray="3 3" />
        <path d={gtPath2} stroke="var(--md-on-surface-variant)" strokeWidth={1.5} fill="none" strokeDasharray="3 3" />

        {/* Prediction-only estimate */}
        <path d={pathOf(sim.predTraj, 0)} stroke="var(--md-error)" strokeWidth={2} fill="none" />
        {sim.predTraj[k] && (
          <>
            <circle
              cx={X(0)(sim.predTraj[k].x)}
              cy={Y(sim.predTraj[k].y)}
              r={Math.sqrt(sim.predSigma[k]) * s * 2}
              fill="var(--md-error)"
              fillOpacity={0.15}
              stroke="var(--md-error)"
              strokeOpacity={0.6}
            />
            <circle
              cx={X(0)(sim.predTraj[k].x)}
              cy={Y(sim.predTraj[k].y)}
              r={5}
              fill="var(--md-error)"
            />
          </>
        )}

        {/* EKF estimate */}
        <path d={pathOf(sim.ekfTraj, 1)} stroke="var(--md-primary)" strokeWidth={2} fill="none" />
        {sim.ekfTraj[k] && (
          <>
            <circle
              cx={X(1)(sim.ekfTraj[k].x)}
              cy={Y(sim.ekfTraj[k].y)}
              r={Math.max(2, Math.sqrt(sim.ekfSigma[k]) * s * 2)}
              fill="var(--md-primary)"
              fillOpacity={0.15}
              stroke="var(--md-primary)"
              strokeOpacity={0.7}
            />
            <circle
              cx={X(1)(sim.ekfTraj[k].x)}
              cy={Y(sim.ekfTraj[k].y)}
              r={5}
              fill="var(--md-primary)"
            />

            {/* Show sensor-range rings to observed landmarks */}
            {sim.landmarkObs[k]?.map((lm, j) => (
              <line
                key={`obs-${j}`}
                x1={X(1)(sim.ekfTraj[k].x)}
                y1={Y(sim.ekfTraj[k].y)}
                x2={X(1)(lm.x)}
                y2={Y(lm.y)}
                stroke="var(--md-primary)"
                strokeOpacity={0.35}
                strokeWidth={1}
              />
            ))}
          </>
        )}
      </svg>
    </VizFrame>
  );
}
