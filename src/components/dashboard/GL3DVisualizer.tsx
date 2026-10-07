import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Activity } from 'lucide-react';

interface Point3D {
  x: number;
  y: number;
  z: number;
}

export const GL3DVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Mouse tilt target and smoothed current angles
  const mouseRef = useRef<{ targetX: number; targetY: number; curX: number; curY: number }>({
    targetX: 0,
    targetY: 0,
    curX: 0,
    curY: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isVisible = true;

    // Check reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Intersection observer to stop rendering when scrolled out of view
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(canvas);

    // Setup high-DPI canvas
    const updateSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    // Generate abstract 3D nodes (Geometric financial core & orbiting telemetry rings)
    // Golden ratio icosahedron / octahedron wireframe nodes
    const phi = (1 + Math.sqrt(5)) / 2;
    const baseNodes: Point3D[] = [
      { x: -1, y: phi, z: 0 },
      { x: 1, y: phi, z: 0 },
      { x: -1, y: -phi, z: 0 },
      { x: 1, y: -phi, z: 0 },
      { x: 0, y: -1, z: phi },
      { x: 0, y: 1, z: phi },
      { x: 0, y: -1, z: -phi },
      { x: 0, y: 1, z: -phi },
      { x: phi, y: 0, z: -1 },
      { x: phi, y: 0, z: 1 },
      { x: -phi, y: 0, z: -1 },
      { x: -phi, y: 0, z: 1 },
    ];

    // Scale nodes
    const coreScale = 38;
    const nodes = baseNodes.map((n) => ({
      x: n.x * coreScale,
      y: n.y * coreScale,
      z: n.z * coreScale,
    }));

    // Orbiting ring points
    const ringPoints: Point3D[] = [];
    const ringRadius = 65;
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      ringPoints.push({
        x: Math.cos(angle) * ringRadius,
        y: Math.sin(angle) * (ringRadius * 0.35),
        z: Math.sin(angle) * ringRadius,
      });
    }

    let rotX = 0.3;
    let rotY = 0.4;

    const render = () => {
      if (!isVisible) {
        animId = requestAnimationFrame(render);
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = rect.width * dpr;
      const height = rect.height * dpr;

      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interaction lerp
      const m = mouseRef.current;
      m.curX += (m.targetX - m.curX) * 0.06;
      m.curY += (m.targetY - m.curY) * 0.06;

      if (!prefersReducedMotion) {
        rotY += 0.006;
        rotX += 0.003;
      }

      const currentRotX = rotX + m.curY * 0.4;
      const currentRotY = rotY + m.curX * 0.6;

      const cosX = Math.cos(currentRotX);
      const sinX = Math.sin(currentRotX);
      const cosY = Math.cos(currentRotY);
      const sinY = Math.sin(currentRotY);

      const centerX = width / 2;
      const centerY = height / 2;
      const fov = 260;

      // Project 3D to 2D function
      const project = (p: Point3D) => {
        // Rotate Y
        const x1 = p.x * cosY + p.z * sinY;
        const y1 = p.y;
        const z1 = -p.x * sinY + p.z * cosY;

        // Rotate X
        const x2 = x1;
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;

        const distance = fov + z2;
        const scale = fov / Math.max(distance, 10);
        return {
          x: centerX + x2 * scale,
          y: centerY + y2 * scale,
          z: z2,
          scale,
        };
      };

      // Project core nodes
      const projectedNodes = nodes.map((n) => project(n));

      // Draw lines between close nodes
      ctx.lineWidth = 1 * dpr;
      for (let i = 0; i < projectedNodes.length; i++) {
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dz = nodes[i].z - nodes[j].z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < 80) {
            const p1 = projectedNodes[i];
            const p2 = projectedNodes[j];
            const avgZ = (p1.z + p2.z) / 2;
            const alpha = Math.max(0.1, Math.min(0.5, (avgZ + 50) / 100));

            ctx.strokeStyle = `rgba(59, 130, 246, ${alpha * 0.75})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw core nodes
      projectedNodes.forEach((p) => {
        const radius = Math.max(1.5, p.scale * 2.2);
        const alpha = Math.max(0.2, Math.min(0.9, (p.z + 50) / 100));

        // Outer glow
        ctx.fillStyle = `rgba(96, 165, 250, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright nucleus
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, radius * 0.45, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw subtle orbital ring
      const projectedRing = ringPoints.map((p) => project(p));
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.lineWidth = 0.8 * dpr;
      ctx.beginPath();
      for (let i = 0; i < projectedRing.length; i++) {
        const p = projectedRing[i];
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', updateSize);
      observer.disconnect();
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseRef.current.targetX = x;
    mouseRef.current.targetY = y;
  };

  const handleMouseLeave = () => {
    mouseRef.current.targetX = 0;
    mouseRef.current.targetY = 0;
    setIsHovered(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900/90 to-blue-950/40 border border-slate-800/80 p-4 shadow-xl flex flex-col justify-between select-none group transition-all duration-300 hover:border-blue-500/40"
    >
      {/* Subtle background ambient blur */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-cyan-600/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Info */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
              GL 3D Matrix
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">
              Visualização Abstrata de Dados
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900/90 border border-slate-800 text-[10px] text-slate-300">
          <Activity className="w-3 h-3 text-blue-400" />
          <span className="font-mono">Realtime</span>
        </div>
      </div>

      {/* 3D Canvas Center */}
      <div className="relative h-36 sm:h-40 w-full my-2 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing transition-transform duration-200"
          style={{ touchAction: 'none' }}
        />
        <div className="absolute bottom-1 right-2 text-[9px] text-slate-500 font-mono pointer-events-none">
          {isHovered ? 'Orientação Reativa' : '3D GL Interativo'}
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="relative z-10 grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
        <div>
          <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Integridade</span>
          <span className="font-semibold text-slate-200 font-mono">100% Sincronizado</span>
        </div>
        <div className="text-right">
          <span className="text-[9px] text-slate-500 uppercase tracking-wider block">GL Studios</span>
          <span className="font-semibold text-blue-400 font-mono">Engine v2.5</span>
        </div>
      </div>
    </div>
  );
};
