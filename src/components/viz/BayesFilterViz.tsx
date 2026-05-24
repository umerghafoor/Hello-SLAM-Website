'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { VizFrame, VizSlider, VizButton } from './VizFrame';

const X_MIN = -5;
const X_MAX = 15;
const N_POINTS = 200;

function gaussian(x: number, mu: number, sigma2: number) {
  return (
    Math.exp(-0.5 * (x - mu) ** 2 / sigma2) / Math.sqrt(2 * Math.PI * sigma2)
  );
}

type Phase = 'prior' | 'prediction' | 'measurement' | 'correction';

export function BayesFilterViz() {
  const [phase, setPhase] = useState<Phase>('prior');
  const [auto, setAuto] = useState(true);
  const [muPrior, setMuPrior] = useState(0);
  const [sigmaPrior, setSigmaPrior] = useState(1);
  const [u, setU] = useState(5);
  const [R, setR] = useState(2);
  const [z, setZ] = useState(8);
  const [Q, setQ] = useState(4);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    if (!auto) return;
    const order: Phase[] = ['prior', 'prediction', 'measurement', 'correction'];
    let i = order.indexOf(phase);
    tickRef.current = window.setTimeout(() => {
      i = (i + 1) % order.length;
      setPhase(order[i]);
    }, 1600);
    return () => {
      if (tickRef.current !== null) window.clearTimeout(tickRef.current);
    };
  }, [phase, auto]);

  const muPred = muPrior + u;
  const sigmaPred = sigmaPrior + R;
  const K = sigmaPred / (sigmaPred + Q);
  const muCorr = muPred + K * (z - muPred);
  const sigmaCorr = (1 - K) * sigmaPred;

  const xs = useMemo(
    () =>
      Array.from(
        { length: N_POINTS },
        (_, i) => X_MIN + (i * (X_MAX - X_MIN)) / (N_POINTS - 1)
      ),
    []
  );

  const path = (mu: number, sigma2: number) => {
    const pts = xs.map((x) => {
      const y = gaussian(x, mu, sigma2);
      return [x, y] as const;
    });
    return pts;
  };

  const width = 480;
  const height = 200;
  const padX = 28;
  const padY = 14;
  const xToPx = (x: number) =>
    padX + ((x - X_MIN) / (X_MAX - X_MIN)) * (width - 2 * padX);
  const maxY = Math.max(
    ...xs.map((x) => gaussian(x, muPrior, sigmaPrior)),
    ...xs.map((x) => gaussian(x, muPred, sigmaPred)),
    ...xs.map((x) => gaussian(x, z, Q)),
    ...xs.map((x) => gaussian(x, muCorr, sigmaCorr))
  );
  const yToPx = (y: number) => height - padY - (y / maxY) * (height - 2 * padY);

  const toPath = (pts: ReadonlyArray<readonly [number, number]>) =>
    pts
      .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${xToPx(x)} ${yToPx(y)}`)
      .join(' ');

  const showPrior = phase === 'prior' || phase === 'prediction';
  const showPred =
    phase === 'prediction' || phase === 'measurement' || phase === 'correction';
  const showMeas = phase === 'measurement' || phase === 'correction';
  const showCorr = phase === 'correction';

  const label: Record<Phase, string> = {
    prior: 'Prior — bel(x_{t-1})',
    prediction: 'Prediction — bel(x̄_t) after motion',
    measurement: 'Measurement — observation likelihood',
    correction: 'Correction — fused posterior',
  };

  return (
    <VizFrame
      title="1-D Bayes / Kalman cycle"
      caption={
        <>
          Prior → prediction (motion) → measurement → correction.
          {' '}K = σ̄² / (σ̄² + Q) = <span className="font-mono">{K.toFixed(2)}</span>,
          {' '}μ_t = <span className="font-mono">{muCorr.toFixed(2)}</span>,
          {' '}σ_t² = <span className="font-mono">{sigmaCorr.toFixed(2)}</span>
        </>
      }
      controls={
        <div className="flex flex-wrap items-center gap-2">
          <VizButton onClick={() => setAuto((v) => !v)} active={auto}>
            {auto ? '⏸ Pause' : '▶ Auto-cycle'}
          </VizButton>
          {(['prior', 'prediction', 'measurement', 'correction'] as Phase[]).map(
            (p) => (
              <VizButton
                key={p}
                onClick={() => {
                  setAuto(false);
                  setPhase(p);
                }}
                active={phase === p}
              >
                {p}
              </VizButton>
            )
          )}
        </div>
      }
    >
      <div className="space-y-3">
        <div className="text-center text-xs font-medium uppercase tracking-[0.14em] text-md-primary">
          {label[phase]}
        </div>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="block w-full"
          role="img"
          aria-label="Gaussian densities for the Bayes filter cycle"
        >
          <line
            x1={padX}
            x2={width - padX}
            y1={height - padY}
            y2={height - padY}
            stroke="var(--md-outline-variant)"
            strokeWidth={1}
          />
          {[-4, 0, 4, 8, 12].map((tx) => (
            <g key={tx}>
              <line
                x1={xToPx(tx)}
                x2={xToPx(tx)}
                y1={height - padY}
                y2={height - padY + 3}
                stroke="var(--md-outline-variant)"
              />
              <text
                x={xToPx(tx)}
                y={height - 2}
                textAnchor="middle"
                fontSize={9}
                fill="var(--md-on-surface-variant)"
                fontFamily="monospace"
              >
                {tx}
              </text>
            </g>
          ))}

          {showPrior && (
            <Curve
              d={toPath(path(muPrior, sigmaPrior))}
              stroke="var(--md-outline)"
              fade
            />
          )}
          {showPred && (
            <Curve
              d={toPath(path(muPred, sigmaPred))}
              stroke="var(--md-tertiary)"
            />
          )}
          {showMeas && (
            <Curve d={toPath(path(z, Q))} stroke="var(--md-secondary)" />
          )}
          {showCorr && (
            <Curve
              d={toPath(path(muCorr, sigmaCorr))}
              stroke="var(--md-primary)"
              fillOpacity={0.18}
            />
          )}
        </svg>
        <div className="grid gap-2 sm:grid-cols-2">
          <VizSlider
            label="Prior μ"
            value={muPrior}
            min={-4}
            max={4}
            step={0.1}
            onChange={setMuPrior}
          />
          <VizSlider
            label="Prior σ²"
            value={sigmaPrior}
            min={0.1}
            max={4}
            step={0.1}
            onChange={setSigmaPrior}
          />
          <VizSlider
            label="Control u"
            value={u}
            min={-4}
            max={10}
            step={0.5}
            onChange={setU}
          />
          <VizSlider
            label="Motion noise R"
            value={R}
            min={0.1}
            max={5}
            step={0.1}
            onChange={setR}
          />
          <VizSlider
            label="Measurement z"
            value={z}
            min={-4}
            max={14}
            step={0.5}
            onChange={setZ}
          />
          <VizSlider
            label="Meas. noise Q"
            value={Q}
            min={0.1}
            max={10}
            step={0.1}
            onChange={setQ}
          />
        </div>
      </div>
    </VizFrame>
  );
}

function Curve({
  d,
  stroke,
  fade,
  fillOpacity = 0.08,
}: {
  d: string;
  stroke: string;
  fade?: boolean;
  fillOpacity?: number;
}) {
  return (
    <g style={{ opacity: fade ? 0.4 : 1, transition: 'opacity 400ms ease' }}>
      <path d={d} stroke={stroke} strokeWidth={2} fill="none" />
      <path
        d={`${d} L ${d.split(' ').slice(-2)[0]} 999 L 0 999 Z`}
        fill={stroke}
        fillOpacity={fillOpacity}
        style={{ pointerEvents: 'none' }}
      />
    </g>
  );
}
