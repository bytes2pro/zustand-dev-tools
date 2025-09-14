'use client';

import { GraphEdge, GraphNode } from '@/types';
import { RotateCcw } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';

function getFunctionSignature(fn: any): string {
  try {
    const name = fn?.name || 'anonymous';
    const src = Function.prototype.toString.call(fn);
    const normalized = src.replace(/\s+/g, ' ');
    const m1 = normalized.match(/^function\s*([\w$]*)\s*\(([^)]*)\)/);
    if (m1) {
      const nm = m1[1] || name;
      const params = m1[2].trim();
      return `ƒ ${nm}(${params})`;
    }
    const m2 = normalized.match(/\(([^)]*)\)\s*=>/);
    if (m2) {
      const params = m2[1].trim();
      return `ƒ ${name || 'fn'}(${params})`;
    }
    // Fallback to arity when parsing fails
    const arity = typeof fn.length === 'number' ? fn.length : 0;
    const params = Array.from({ length: arity })
      .map((_, i) => `arg${i + 1}`)
      .join(', ');
    return `ƒ ${name}(${params})`;
  } catch {
    return 'ƒ fn(…)';
  }
}

function buildGraph(
  input: any,
  shouldExpand: (id: string, depth: number) => boolean,
  maxNodes = 200,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const queue: Array<{ path: string; keyLabel: string; value: any; depth: number }> = [
    { path: 'state', keyLabel: 'state', value: input, depth: 0 },
  ];
  const seen = new Set<string>();

  while (queue.length && nodes.length < maxNodes) {
    const item = queue.shift()!;
    const id = item.path;
    if (seen.has(id)) continue;
    seen.add(id);
    const isObj = item.value && typeof item.value === 'object' && !Array.isArray(item.value);
    nodes.push({ id, label: item.keyLabel, depth: item.depth, kind: isObj ? 'object' : 'value' });

    if (!shouldExpand(id, item.depth)) continue;
    if (item.value && typeof item.value === 'object') {
      const entries = Array.isArray(item.value)
        ? item.value.map((v, i) => [String(i), v] as const)
        : Object.entries(item.value);
      for (const [k, v] of entries) {
        const childPath = `${id}.${k}`;
        edges.push({ source: id, target: childPath });
        queue.push({ path: childPath, keyLabel: k, value: v, depth: item.depth + 1 });
        if (nodes.length + queue.length >= maxNodes) break;
      }
    }
  }

  return { nodes, edges };
}

function layoutGraph(nodes: GraphNode[], colWidth = 180, rowGap = 70, padding = 40) {
  const byDepth = new Map<number, GraphNode[]>();
  for (const n of nodes) {
    if (!byDepth.has(n.depth)) byDepth.set(n.depth, []);
    byDepth.get(n.depth)!.push(n);
  }
  const maxDepth = Math.max(...Array.from(byDepth.keys()), 0);
  const maxColCount = Math.max(...Array.from(byDepth.values()).map((arr) => arr.length), 1);
  const width = padding * 2 + (maxDepth + 1) * colWidth;
  const height = padding * 2 + Math.max(280, maxColCount * rowGap);

  const positioned: Record<string, { x: number; y: number }> = {};
  for (const [depthStr, arr] of Array.from(byDepth.entries())) {
    const depth = Number(depthStr);
    const colX = padding + depth * colWidth;
    const count = arr.length;
    const totalHeight = (count - 1) * rowGap;
    const startY = padding + height / 2 - totalHeight / 2 - padding;
    arr.forEach((n, i) => {
      positioned[n.id] = { x: colX, y: startY + i * rowGap };
    });
  }
  return { positioned, width, height };
}

export function GraphView({
  data,
  initialMaxDepth = 3,
  initialFitWidth = true,
}: {
  data: any;
  initialMaxDepth?: number;
  initialFitWidth?: boolean;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(['state']));
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set());
  const [openLeafValues, setOpenLeafValues] = useState<Set<string>>(() => new Set());
  const maxDepth = initialMaxDepth;
  const fitWidth = initialFitWidth;

  const graph = useMemo(() => {
    const shouldExpand = (id: string, depth: number) => {
      if (collapsed.has(id)) return false;
      if (expanded.has(id)) return true;
      return depth < maxDepth;
    };
    return buildGraph(data, shouldExpand);
  }, [data, expanded, collapsed, maxDepth]);

  const { positioned, width, height } = useMemo(() => layoutGraph(graph.nodes), [graph.nodes]);

  // Zoom / Pan state and helpers
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [isPanning, setIsPanning] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const panStartRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const pinchStartRef = useRef<{
    dist: number;
    midX: number;
    midY: number;
    tx: number;
    ty: number;
    scale: number;
    contentMidX: number;
    contentMidY: number;
  } | null>(null);
  const isDraggingRef = useRef(false);

  const clampScale = (s: number) => Math.max(0.3, Math.min(3, s));

  function getSvgCoords(e: any): { x: number; y: number } {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function zoomAt(svgPoint: { x: number; y: number }, factor: number) {
    const nextScale = clampScale(scale * factor);
    if (nextScale === scale) return;
    const contentX = (svgPoint.x - tx) / scale;
    const contentY = (svgPoint.y - ty) / scale;
    const nextTx = svgPoint.x - nextScale * contentX;
    const nextTy = svgPoint.y - nextScale * contentY;
    setScale(nextScale);
    setTx(nextTx);
    setTy(nextTy);
  }

  const onWheel = (e: any) => {
    if (!(e.ctrlKey || e.metaKey)) return; // zoom only on ctrl/cmd
    e.preventDefault();
    const point = getSvgCoords(e.nativeEvent);
    const factor = Math.exp(-e.deltaY * 0.002);
    zoomAt(point, factor);
  };

  const onPointerDown = (e: any) => {
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    isDraggingRef.current = false;

    if (
      (e.target as HTMLElement)?.tagName?.toLowerCase() === 'svg' ||
      ((e.target as SVGElement)?.getAttribute &&
        (e.target as SVGElement).getAttribute('data-bg') === '1')
    ) {
      (e.currentTarget as SVGSVGElement).setPointerCapture?.(e.pointerId);
    }

    if (pointersRef.current.size === 2) {
      const pts = Array.from(pointersRef.current.values());
      const dx = pts[1].x - pts[0].x;
      const dy = pts[1].y - pts[0].y;
      const dist = Math.hypot(dx, dy);
      const midX = (pts[0].x + pts[1].x) / 2;
      const midY = (pts[0].y + pts[1].y) / 2;
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const svgMid = { x: midX - rect.left, y: midY - rect.top };
      const contentMidX = (svgMid.x - tx) / scale;
      const contentMidY = (svgMid.y - ty) / scale;
      pinchStartRef.current = {
        dist,
        midX: svgMid.x,
        midY: svgMid.y,
        tx,
        ty,
        scale,
        contentMidX,
        contentMidY,
      };
      setIsPanning(false);
      panStartRef.current = null;
      return;
    }

    const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
    const isBg =
      tag === 'svg' ||
      ((e.target as SVGElement)?.getAttribute &&
        (e.target as SVGElement).getAttribute('data-bg') === '1');
    if (pointersRef.current.size === 1 && isBg) {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY, tx, ty };
    }
  };

  const onPointerMove = (e: any) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointersRef.current.size >= 2 && pinchStartRef.current) {
      const pts = Array.from(pointersRef.current.values());
      const dx = pts[1].x - pts[0].x;
      const dy = pts[1].y - pts[0].y;
      const distNow = Math.hypot(dx, dy);
      const midX = (pts[0].x + pts[1].x) / 2;
      const midY = (pts[0].y + pts[1].y) / 2;
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const svgMid = { x: midX - rect.left, y: midY - rect.top };
      const start = pinchStartRef.current;
      const factor = distNow / start.dist;
      const nextScale = clampScale(start.scale * factor);
      const nextTx = svgMid.x - nextScale * start.contentMidX;
      const nextTy = svgMid.y - nextScale * start.contentMidY;
      setScale(nextScale);
      setTx(nextTx);
      setTy(nextTy);
      return;
    }

    if (isPanning && panStartRef.current) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      if (Math.hypot(dx, dy) > 3) isDraggingRef.current = true;
      setTx(panStartRef.current.tx + dx);
      setTy(panStartRef.current.ty + dy);
    }
  };

  const endPointer = (e: any) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchStartRef.current = null;
    if (pointersRef.current.size === 0) {
      setIsPanning(false);
      panStartRef.current = null;
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 0);
    }
  };

  const viewW = Math.max(width, 600);
  const viewH = Math.max(height, 300);

  const handleZoomIn = () => {
    const center = { x: viewW / 2, y: viewH / 2 };
    zoomAt(center, 1.2);
  };
  const handleZoomOut = () => {
    const center = { x: viewW / 2, y: viewH / 2 };
    zoomAt(center, 1 / 1.2);
  };
  const handleReset = () => {
    setScale(1);
    setTx(0);
    setTy(0);
  };

  return (
    <div className="h-full flex flex-col p-2 text-[12px] relative">
      <div className="flex-1 overflow-auto">
        <div className="w-max">
          <svg
            ref={svgRef}
            width={fitWidth ? '100%' : Math.max(width, 600)}
            height={Math.max(height, 300)}
            className="block"
            viewBox={`0 0 ${Math.max(width, 600)} ${Math.max(height, 300)}`}
            preserveAspectRatio={fitWidth ? 'xMinYMin meet' : 'none'}
            style={{ touchAction: 'none', cursor: isPanning ? 'grabbing' : 'default' }}
            onWheel={onWheel}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endPointer}
            onPointerCancel={endPointer}
            onPointerLeave={endPointer}
          >
            <rect
              x={0}
              y={0}
              width={Math.max(width, 600)}
              height={Math.max(height, 300)}
              fill="transparent"
              data-bg="1"
            />
            <g transform={`translate(${tx}, ${ty}) scale(${scale})`}>
              {graph.edges.map((e, i) => {
                const s = positioned[e.source];
                const t = positioned[e.target];
                if (!s || !t) return null;
                const midX = (s.x + t.x) / 2;
                const d = `M ${s.x},${s.y} C ${midX},${s.y} ${midX},${t.y} ${t.x},${t.y}`;
                return (
                  <path
                    key={i}
                    d={d}
                    stroke="#111827"
                    className="dark:stroke-white/40"
                    strokeWidth={1}
                    opacity={0.55}
                    fill="none"
                    pointerEvents="none"
                  />
                );
              })}
              {graph.nodes.map((n) => {
                const p = positioned[n.id];
                if (!p) return null;
                const isObject = n.kind === 'object';
                const labelWidth = Math.max(36, n.label.length * 7);
                return (
                  <g key={n.id} transform={`translate(${p.x}, ${p.y})`}>
                    <circle
                      r={9}
                      fill={isObject ? '#a78bfa' : '#fef08a'}
                      stroke="#111827"
                      className="dark:stroke-white/70 cursor-pointer"
                      onClick={() => {
                        if (isDraggingRef.current) return;
                        if (isObject) {
                          const isOpen =
                            !collapsed.has(n.id) && (expanded.has(n.id) || n.depth < maxDepth);
                          if (isOpen) {
                            const nextCollapsed = new Set(collapsed);
                            nextCollapsed.add(n.id);
                            const nextExpanded = new Set(expanded);
                            nextExpanded.delete(n.id);
                            setCollapsed(nextCollapsed);
                            setExpanded(nextExpanded);
                          } else {
                            const nextCollapsed = new Set(collapsed);
                            nextCollapsed.delete(n.id);
                            const nextExpanded = new Set(expanded);
                            nextExpanded.add(n.id);
                            setCollapsed(nextCollapsed);
                            setExpanded(nextExpanded);
                          }
                        } else {
                          const next = new Set(openLeafValues);
                          if (next.has(n.id)) next.delete(n.id);
                          else next.add(n.id);
                          setOpenLeafValues(next);
                        }
                      }}
                    />
                    <rect
                      x={12}
                      y={-10}
                      rx={4}
                      ry={4}
                      width={labelWidth + 6}
                      height={20}
                      fill="#ffffff"
                      opacity={0.95}
                    />
                    <rect
                      x={14}
                      y={-8}
                      rx={3}
                      ry={3}
                      width={labelWidth}
                      height={16}
                      fill="#0ea5a2"
                      opacity={0.25}
                    />
                    <text x={18} y={4} className="text-xs select-none" fill="#06b6d4">
                      {n.label}
                    </text>

                    {!isObject &&
                      openLeafValues.has(n.id) &&
                      (() => {
                        const path = n.id.replace(/^state\./, '');
                        const parts = path ? path.split('.') : [];
                        let value: any = data;
                        for (const part of parts) {
                          if (!part) continue;
                          value = value?.[part];
                        }
                        let valueString: string;
                        if (typeof value === 'function') {
                          valueString = getFunctionSignature(value);
                        } else if (typeof value === 'string') {
                          valueString = value;
                        } else if (value === undefined) {
                          valueString = 'undefined';
                        } else if (value === null) {
                          valueString = 'null';
                        } else {
                          try {
                            valueString = JSON.stringify(value);
                          } catch {
                            valueString = String(value);
                          }
                        }
                        const valueWidth = Math.min(Math.max(60, valueString.length * 6.5), 260);
                        const valueX = 14 + labelWidth + 8;
                        return (
                          <g>
                            <rect
                              x={valueX - 2}
                              y={-12}
                              rx={5}
                              ry={5}
                              width={valueWidth + 6}
                              height={24}
                              fill="#ffffff"
                              opacity={0.95}
                            />
                            <rect
                              x={valueX}
                              y={-10}
                              rx={4}
                              ry={4}
                              width={valueWidth}
                              height={20}
                              fill="#fef3c7"
                              stroke="#f59e0b"
                              className="dark:fill-amber-200/20 dark:stroke-amber-300"
                            />
                            <text
                              x={valueX + 6}
                              y={4}
                              className="text-[11px] select-text"
                              fill="#92400e"
                            >
                              {valueString.length > 42
                                ? valueString.slice(0, 40) + '…'
                                : valueString}
                            </text>
                          </g>
                        );
                      })()}
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>
      <div className="absolute top-2 right-2 z-20 flex flex-row gap-1 bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-md p-1 shadow-sm">
        <button
          className="w-7 h-7 inline-flex items-center justify-center text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={handleZoomIn}
          aria-label="Zoom in"
          title="Zoom in"
        >
          +
        </button>
        <button
          className="w-7 h-7 inline-flex items-center justify-center text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={handleZoomOut}
          aria-label="Zoom out"
          title="Zoom out"
        >
          −
        </button>
        <button
          className="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={handleReset}
          aria-label="Reset view"
          title="Reset view"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
