'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { VizFrame, VizSlider, VizButton } from './VizFrame';

type Mode = 'linear' | 'nonlinear' | 'ekf';

function gauss(x: number, mu: number, sigma: number) {
  return Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (Math.sqrt(2 * Math.PI) * sigma);
}

const N = 200;
const X_MIN = -3;
const X_MAX = 3;

export function GaussianTransformViz() {
  const [mode, setMode] = useState<Mode>('linear');
  const [mu, setMu] = useState(0);
  const [sigma, setSigma] = useState(0.5);
  const [x0, setX0] = useState(0.4);
  const [animX, setAnimX] = useState(true);
  const rafRef = useRef<number | null>(null);
  const dirRef = useRef(1);

  // Animate linearization point in EKF mode for effect.
  useEffect(() => {
    if (!animX || mode !== 'ekf') return;
    const loop = () => {
      setX0((v) => {
        let next = v + dirRef.current * 0.01;
        if (next > 1.6) {
          dirRef.current = -1;
          next = 1.6;
        } else if (next < -1.6) {
          dirRef.current = 1;
          next = -1.6;
        }
        return next;
      });
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [animX, mode]);

  const xs = useMemo(
    () => Array.from({ length: N }, (_, i) => X_MIN + (i * (X_MAX - X_MIN)) / (N - 1)),
    []
  );

  // y = -0.5 x + 1
  const fLin = (x: number) => -0.5 * x + 1;
  // y = sin(x) + 0.1 sin(5x)
  const fNl = (x: number) => Math.sin(x) + 0.1 * Math.sin(5 * x);
  const fNlPrime = (x: number) => Math.cos(x) + 0.5 * Math.cos(5 * x);

  // Monte-Carlo histogram of nonlinear push-forward
  const mcHist = useMemo(() => {
    const samples = 30_000;
    const ys: number[] = [];
    for (let i = 0; i < samples; i++) {
      // standard normal sample via Box-Muller, then scale + shift
      let u1 = Math.random();
      let u2 = Math.random();
      if (u1 === 0) u1 = 1e-9;
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const x = mu + sigma * z;
      ys.push(fNl(x));
    }
    const bins = 80;
    const yMin = Math.min(...ys);
    const yMax = Math.max(...ys);
    const counts = new Array(bins).fill(0);
    for (const y of ys) {
      let b = Math.floor(((y - yMin) / (yMax - yMin)) * bins);
      if (b < 0) b = 0;
      if (b >= bins) b = bins - 1;
      counts[b]++;
    }
    const binW = (yMax - yMin) / bins;
    return counts.map((c, i) => ({
      y: yMin + (i + 0.5) * binW,
      p: c / (samples * binW),
    }));
  }, [mu, sigma]);

  const priorPdf = xs.map((x) => ({ x, p: gauss(x, mu, sigma) }));

  // y-range
  const yMinPlot = -1.8;
  const yMaxPlot = 1.8;

  // Output Gaussian for linear / ekf
  const linMu = fLin(mu);
  const linSig = Math.abs(-0.5) * sigma;

  const ekfSlope = fNlPrime(x0);
  const ekfMu = fNl(x0);
  const ekfSig = Math.abs(ekfSlope) * sigma;

  // Layout: 3 panels (prior | mapping | output)
  const W = 540;
  const H = 220;
  const panelW = (W - 30) / 3;
  const padX = 6;
  const padY = 10;

  const xToPx = (x: number, panelIdx: number) => {
    const px = (x - X_MIN) / (X_MAX - X_MIN);
    return 10 + panelIdx * panelW + padX + px * (panelW - 2 * padX);
  };
  const priorMax = Math.max(...priorPdf.map((p) => p.p));
  const pToPxPrior = (p: number) =>
    H - padY - (p / priorMax) * (H - 2 * padY);

  const mappingYMin = -1.8;
  const mappingYMax = 1.8;
  const mappingYToPx = (y: number) =>
    H - padY - ((y - mappingYMin) / (mappingYMax - mappingYMin)) * (H - 2 * padY);

  // Output PDF
  const outputPdf = useMemo(() => {
    if (mode === 'linear') {
      return xs.map((x) => ({ x, p: gauss(x, linMu, linSig) }));
    } else if (mode === 'ekf') {
      return xs.map((x) => ({ x, p: gauss(x, ekfMu, ekfSig) }));
    }
    return mcHist.map((b) => ({ x: b.y, p: b.p }));
  }, [mode, xs, linMu, linSig, ekfMu, ekfSig, mcHist]);

  const outputMax = Math.max(...outputPdf.map((p) => p.p), 0.01);
  const pToPxOut = (p: number) => H - padY - (p / outputMax) * (H - 2 * padY);

  const pathPdf = (
    arr: { x: number; p: number }[],
    panelIdx: number,
    pToPx: (p: number) => number
  ) =>
    arr
      .map(
        (q, i) =>
          `${i === 0 ? 'M' : 'L'} ${xToPx(q.x, panelIdx)} ${pToPx(q.p)}`
      )
      .join(' ');

  const mappingPath = (f: (x: number) => number) =>
    xs
      .map((x, i) => `${i === 0 ? 'M' : 'L'} ${xToPx(x, 1)} ${mappingYToPx(f(x))}`)
      .join(' ');

  return (
    <VizFrame
      title="Pushing a Gaussian through a function"
      caption={
        <>
          Linear maps preserve Gaussians; nonlinear maps don't. EKF locally linearizes around
          a point — the more nonlinear the function there, the worse the approximation.
        </>
      }
      controls={
        <div className="flex flex-wrap items-center gap-2">
          <VizButton onClick={() => setMode('linear')} active={mode === 'linear'}>
            Linear map
          </VizButton>
          <VizButton onClick={() => setMode('nonlinear')} active={mode === 'nonlinear'}>
            Nonlinear (Monte Carlo)
          </VizButton>
          <VizButton onClick={() => setMode('ekf')} active={mode === 'ekf'}>
            EKF linearization
          </VizButton>
          {mode === 'ekf' && (
            <VizButton onClick={() => setAnimX((v) => !v)} active={animX}>
              {animX ? '⏸ Sweep' : '▶ Sweep x₀'}
            </VizButton>
          )}
        </div>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full"
        role="img"
        aria-label="Visual transformation of a Gaussian through linear and nonlinear functions"
      >
        {[0, 1, 2].map((p) => (
          <g key={p}>
            <rect
              x={10 + p * panelW}
              y={6}
              width={panelW}
              height={H - 12}
              fill="var(--md-surface-container-low)"
              stroke="var(--md-outline-variant)"
              rx={6}
            />
            <text
              x={10 + p * panelW + panelW / 2}
              y={20}
              textAnchor="middle"
              fontSize={10}
              fill="var(--md-on-surface-variant)"
              fontFamily="monospace"
            >
              {p === 0 ? 'p(x)' : p === 1 ? 'y = f(x)' : 'p(y)'}
            </text>
          </g>
        ))}

        {/* prior */}
        <path
          d={pathPdf(priorPdf, 0, pToPxPrior)}
          stroke="var(--md-on-surface)"
          fill="var(--md-on-surface)"
          fillOpacity={0.12}
          strokeWidth={1.5}
        />

        {/* mapping */}
        <line
          x1={xToPx(X_MIN, 1)}
          x2={xToPx(X_MAX, 1)}
          y1={mappingYToPx(0)}
          y2={mappingYToPx(0)}
          stroke="var(--md-outline-variant)"
        />
        <path
          d={mappingPath(mode === 'linear' ? fLin : fNl)}
          stroke={mode === 'linear' ? 'var(--md-primary)' : 'var(--md-tertiary)'}
          strokeWidth={2}
          fill="none"
        />
        {mode === 'ekf' && (
          <>
            <line
              x1={xToPx(x0 - 0.7, 1)}
              y1={mappingYToPx(ekfMu + ekfSlope * -0.7)}
              x2={xToPx(x0 + 0.7, 1)}
              y2={mappingYToPx(ekfMu + ekfSlope * 0.7)}
              stroke="var(--md-secondary)"
              strokeWidth={2}
              strokeDasharray="4 3"
            />
            <circle
              cx={xToPx(x0, 1)}
              cy={mappingYToPx(ekfMu)}
              r={4}
              fill="var(--md-secondary)"
            />
          </>
        )}

        {/* output */}
        <path
          d={pathPdf(outputPdf, 2, pToPxOut)}
          stroke={
            mode === 'linear'
              ? 'var(--md-primary)'
              : mode === 'ekf'
                ? 'var(--md-secondary)'
                : 'var(--md-tertiary)'
          }
          fill={
            mode === 'linear'
              ? 'var(--md-primary)'
              : mode === 'ekf'
                ? 'var(--md-secondary)'
                : 'var(--md-tertiary)'
          }
          fillOpacity={0.18}
          strokeWidth={1.5}
        />
      </svg>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <VizSlider label="Prior μ" value={mu} min={-1.5} max={1.5} step={0.05} onChange={setMu} />
        <VizSlider
          label="Prior σ"
          value={sigma}
          min={0.1}
          max={1.0}
          step={0.05}
          onChange={setSigma}
        />
        {mode === 'ekf' && (
          <VizSlider
            label="Linearize at x₀"
            value={x0}
            min={-1.8}
            max={1.8}
            step={0.05}
            onChange={(v) => {
              setAnimX(false);
              setX0(v);
            }}
          />
        )}
      </div>
    </VizFrame>
  );
}
