'use client';

import { useMemo, useState } from 'react';
import { VizFrame, VizSlider, VizButton } from './VizFrame';

type Mode = 'sequential' | 'loop' | 'landmarks';

// Build a small example graph and derive the sparse H-matrix block structure.
function buildGraph(mode: Mode, nPoses: number, nLandmarks: number) {
  type Edge = { i: number; j: number; landmark?: boolean };
  const edges: Edge[] = [];
  for (let i = 0; i < nPoses - 1; i++) {
    edges.push({ i, j: i + 1 });
  }
  if (mode === 'loop') {
    edges.push({ i: nPoses - 1, j: 0 });
    // a few mid-range
    edges.push({ i: 1, j: Math.min(nPoses - 1, 5) });
    if (nPoses >= 8) edges.push({ i: 2, j: Math.min(nPoses - 1, 7) });
  }
  // landmark observations: each pose sees 2 landmarks (sliding window).
  let landmarks: number = 0;
  if (mode === 'landmarks') {
    landmarks = nLandmarks;
    for (let i = 0; i < nPoses; i++) {
      edges.push({ i, j: nPoses + (i % nLandmarks), landmark: true });
      edges.push({ i, j: nPoses + ((i + 1) % nLandmarks), landmark: true });
    }
  }
  return { edges, nPoses, nLandmarks: landmarks };
}

export function HMatrixSparsityViz() {
  const [mode, setMode] = useState<Mode>('sequential');
  const [nPoses, setNPoses] = useState(10);
  const [nLandmarks, setNLandmarks] = useState(4);

  const { edges, nLandmarks: ml } = useMemo(() => buildGraph(mode, nPoses, nLandmarks), [mode, nPoses, nLandmarks]);

  const N = nPoses + ml;
  const cell = useMemo(() => {
    // Compute the H matrix block sparsity: H[i,j] nonzero if there's an edge between blocks i and j (or i==j with any incident edge).
    const adj: boolean[][] = Array.from({ length: N }, () => new Array(N).fill(false));
    for (let i = 0; i < N; i++) adj[i][i] = false;
    for (const e of edges) {
      adj[e.i][e.i] = true;
      adj[e.j][e.j] = true;
      adj[e.i][e.j] = true;
      adj[e.j][e.i] = true;
    }
    return adj;
  }, [edges, N]);

  // Render H matrix
  const W = 380;
  const H = 380;
  const cellSize = (Math.min(W, H) - 20) / N;

  // Build graph layout for the right panel
  const layout = useMemo(() => {
    const pts: { x: number; y: number; type: 'pose' | 'landmark' }[] = [];
    for (let i = 0; i < nPoses; i++) {
      const t = (i / Math.max(nPoses, 2)) * 2 * Math.PI;
      pts.push({ x: 80 * Math.cos(t), y: 80 * Math.sin(t), type: 'pose' });
    }
    for (let k = 0; k < ml; k++) {
      const t = (k / Math.max(ml, 1)) * 2 * Math.PI + Math.PI / 4;
      pts.push({ x: 40 * Math.cos(t), y: 40 * Math.sin(t), type: 'landmark' });
    }
    return pts;
  }, [nPoses, ml]);

  const gW = 200;
  const gH = 200;
  const gCx = gW / 2;
  const gCy = gH / 2;

  // count nonzeros
  let nz = 0;
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (cell[i][j]) nz++;

  return (
    <VizFrame
      title="Sparsity of the H matrix"
      caption={
        <>
          Each block of <span className="font-mono">H</span> is non-zero iff the
          two variables share at least one constraint. The matrix mirrors the
          adjacency of the graph — and in SLAM that's almost always sparse.
          Filled cells: <span className="font-mono">{nz}</span> / <span className="font-mono">{N * N}</span> = <span className="font-mono">{((nz / (N * N)) * 100).toFixed(1)}%</span>.
        </>
      }
      controls={
        <div className="flex flex-wrap items-center gap-3">
          <VizButton onClick={() => setMode('sequential')} active={mode === 'sequential'}>
            Sequential
          </VizButton>
          <VizButton onClick={() => setMode('loop')} active={mode === 'loop'}>
            With loop closures
          </VizButton>
          <VizButton onClick={() => setMode('landmarks')} active={mode === 'landmarks'}>
            Pose + landmarks
          </VizButton>
          <div className="flex-1 min-w-[180px]">
            <VizSlider label="# poses" value={nPoses} min={4} max={20} step={1} onChange={(v) => setNPoses(Math.round(v))} format={(v) => String(Math.round(v))} />
          </div>
          {mode === 'landmarks' && (
            <div className="flex-1 min-w-[180px]">
              <VizSlider label="# landmarks" value={nLandmarks} min={2} max={8} step={1} onChange={(v) => setNLandmarks(Math.round(v))} format={(v) => String(Math.round(v))} />
            </div>
          )}
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="H matrix block structure">
          <rect width={W} height={H} fill="var(--md-surface-container)" />
          {Array.from({ length: N }).map((_, i) => (
            <g key={i}>
              {Array.from({ length: N }).map((_, j) => {
                const isLm = i >= nPoses || j >= nPoses;
                return (
                  <rect
                    key={j}
                    x={10 + j * cellSize}
                    y={10 + i * cellSize}
                    width={cellSize - 0.5}
                    height={cellSize - 0.5}
                    fill={
                      cell[i][j]
                        ? isLm
                          ? 'var(--md-tertiary)'
                          : 'var(--md-primary)'
                        : 'var(--md-surface-container-low)'
                    }
                    stroke="var(--md-outline-variant)"
                    strokeWidth={0.3}
                  />
                );
              })}
            </g>
          ))}
          {/* divider between poses and landmarks */}
          {ml > 0 && (
            <>
              <line
                x1={10 + nPoses * cellSize}
                y1={10}
                x2={10 + nPoses * cellSize}
                y2={10 + N * cellSize}
                stroke="var(--md-on-surface)"
                strokeWidth={1.5}
              />
              <line
                x1={10}
                y1={10 + nPoses * cellSize}
                x2={10 + N * cellSize}
                y2={10 + nPoses * cellSize}
                stroke="var(--md-on-surface)"
                strokeWidth={1.5}
              />
            </>
          )}
        </svg>
        <svg viewBox={`0 0 ${gW} ${gH}`} className="block w-full" role="img" aria-label="Underlying graph">
          <rect width={gW} height={gH} fill="var(--md-surface-container)" />
          {/* edges */}
          {edges.map((e, k) => {
            const a = layout[e.i];
            const b = layout[e.j];
            return (
              <line
                key={k}
                x1={gCx + a.x}
                y1={gCy + a.y}
                x2={gCx + b.x}
                y2={gCy + b.y}
                stroke={e.landmark ? 'var(--md-tertiary)' : 'var(--md-primary)'}
                strokeWidth={1}
                strokeOpacity={0.6}
              />
            );
          })}
          {/* nodes */}
          {layout.map((p, i) => (
            <circle
              key={i}
              cx={gCx + p.x}
              cy={gCy + p.y}
              r={p.type === 'pose' ? 4 : 3}
              fill={p.type === 'pose' ? 'var(--md-primary)' : 'var(--md-tertiary)'}
            />
          ))}
        </svg>
      </div>
    </VizFrame>
  );
}
