'use client';

import { useMemo, useState } from 'react';
import { VizFrame, VizSlider, VizButton } from './VizFrame';

function normPdf(x: number, mu: number, sigma: number) {
  return Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (Math.sqrt(2 * Math.PI) * sigma);
}
function randn(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const target = (x: number) => 0.35 * normPdf(x, -2, 0.6) + 0.65 * normPdf(x, 1.8, 0.8);

export function ImportanceSamplingViz() {
  const [proposalSigma, setProposalSigma] = useState(2.2);
  const [n, setN] = useState(2000);
  const [seed, setSeed] = useState(0);

  const data = useMemo(() => {
    void seed;
    const xs: number[] = [];
    const ws: number[] = [];
    for (let i = 0; i < n; i++) {
      const x = proposalSigma * randn();
      xs.push(x);
      const f = target(x);
      const g = normPdf(x, 0, proposalSigma);
      ws.push(g > 0 ? f / g : 0);
    }
    const sumW = ws.reduce((a, b) => a + b, 0) || 1;
    const wn = ws.map((w) => w / sumW);
    // Effective sample size = 1 / sum w^2
    const ess = 1 / wn.reduce((a, b) => a + b * b, 0);
    return { xs, wn, ess };
  }, [proposalSigma, n, seed]);

  // Build a weighted histogram for the IS estimate of f(x)
  const hist = useMemo(() => {
    const bins = 60;
    const xMin = -5;
    const xMax = 5;
    const counts = new Float32Array(bins);
    const binW = (xMax - xMin) / bins;
    for (let i = 0; i < data.xs.length; i++) {
      const x = data.xs[i];
      if (x < xMin || x > xMax) continue;
      const b = Math.min(bins - 1, Math.floor((x - xMin) / binW));
      counts[b] += data.wn[i];
    }
    return { counts: Array.from(counts), binW, xMin };
  }, [data]);

  const W = 540;
  const H = 220;
  const padX = 30;
  const padY = 16;
  const xMin = -5;
  const xMax = 5;
  const X = (x: number) => padX + ((x - xMin) / (xMax - xMin)) * (W - 2 * padX);

  const targetCurve: { x: number; p: number }[] = [];
  for (let i = 0; i < 200; i++) {
    const x = xMin + (i * (xMax - xMin)) / 199;
    targetCurve.push({ x, p: target(x) });
  }
  const proposalCurve: { x: number; p: number }[] = [];
  for (let i = 0; i < 200; i++) {
    const x = xMin + (i * (xMax - xMin)) / 199;
    proposalCurve.push({ x, p: normPdf(x, 0, proposalSigma) });
  }

  // Common y-scale: peak of any curve / histogram density
  const histDensity = hist.counts.map((c) => c / hist.binW);
  const maxP = Math.max(
    ...targetCurve.map((d) => d.p),
    ...proposalCurve.map((d) => d.p),
    ...histDensity
  ) * 1.1;
  const Y = (p: number) => H - padY - (p / maxP) * (H - 2 * padY);

  const pathOf = (arr: { x: number; p: number }[]) =>
    arr.map((d, i) => `${i === 0 ? 'M' : 'L'} ${X(d.x)} ${Y(d.p)}`).join(' ');

  return (
    <VizFrame
      title="Importance sampling — how proposal width matters"
      caption={
        <>
          Target <span className="font-mono">f(x)</span> is the bimodal density (red).
          Proposal <span className="font-mono">g(x) = N(0, σ²)</span> (grey).
          The bars are the IS-weighted estimate of <span className="font-mono">f(x)</span>.
          Effective sample size: <span className="font-mono">{data.ess.toFixed(0)}</span> / {n}.
        </>
      }
      controls={
        <div className="flex flex-wrap items-center gap-3">
          <VizButton onClick={() => setProposalSigma(2.2)} active={Math.abs(proposalSigma - 2.2) < 0.05}>
            Good (σ = 2.2)
          </VizButton>
          <VizButton onClick={() => setProposalSigma(0.8)} active={Math.abs(proposalSigma - 0.8) < 0.05}>
            Bad (σ = 0.8)
          </VizButton>
          <VizButton onClick={() => setSeed((s) => s + 1)}>🎲 Reseed</VizButton>
          <div className="flex-1 min-w-[180px]">
            <VizSlider
              label="Proposal σ"
              value={proposalSigma}
              min={0.3}
              max={4}
              step={0.05}
              onChange={setProposalSigma}
            />
          </div>
          <div className="flex-1 min-w-[180px]">
            <VizSlider
              label="# samples"
              value={n}
              min={100}
              max={5000}
              step={100}
              onChange={(v) => setN(Math.round(v))}
              format={(v) => String(Math.round(v))}
            />
          </div>
        </div>
      }
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="Importance sampling weighted histogram">
        <line x1={padX} x2={W - padX} y1={H - padY} y2={H - padY} stroke="var(--md-outline-variant)" />
        {/* weighted histogram */}
        {hist.counts.map((c, i) => {
          const x = hist.xMin + i * hist.binW;
          const density = c / hist.binW;
          return (
            <rect
              key={i}
              x={X(x)}
              y={Y(density)}
              width={X(x + hist.binW) - X(x) - 0.5}
              height={Y(0) - Y(density)}
              fill="var(--md-primary)"
              fillOpacity={0.25}
            />
          );
        })}
        {/* target */}
        <path d={pathOf(targetCurve)} stroke="var(--md-error)" strokeWidth={2.5} fill="none" />
        {/* proposal */}
        <path d={pathOf(proposalCurve)} stroke="var(--md-on-surface-variant)" strokeWidth={1.5} fill="none" />
        {/* x ticks */}
        {[-4, -2, 0, 2, 4].map((tx) => (
          <text key={tx} x={X(tx)} y={H - 3} fontSize={9} fill="var(--md-on-surface-variant)" textAnchor="middle" fontFamily="monospace">{tx}</text>
        ))}
        {/* legend */}
        <g>
          <line x1={padX + 8} x2={padX + 24} y1={padY + 6} y2={padY + 6} stroke="var(--md-error)" strokeWidth={2.5} />
          <text x={padX + 28} y={padY + 9} fontSize={9} fill="var(--md-on-surface)" fontFamily="monospace">target f(x)</text>
          <line x1={padX + 100} x2={padX + 116} y1={padY + 6} y2={padY + 6} stroke="var(--md-on-surface-variant)" strokeWidth={1.5} />
          <text x={padX + 120} y={padY + 9} fontSize={9} fill="var(--md-on-surface)" fontFamily="monospace">proposal g(x)</text>
          <rect x={padX + 200} y={padY + 1} width={12} height={8} fill="var(--md-primary)" fillOpacity={0.25} />
          <text x={padX + 216} y={padY + 9} fontSize={9} fill="var(--md-on-surface)" fontFamily="monospace">IS weighted</text>
        </g>
      </svg>
    </VizFrame>
  );
}
