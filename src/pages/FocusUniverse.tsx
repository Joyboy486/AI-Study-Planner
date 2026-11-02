import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Subject } from '../types';
import { NavTab } from '../components/Sidebar';
import { NexusCard } from '../components/ui/NexusCard';
import { NexusButton } from '../components/ui/NexusButton';
import { CosmosCanvas3D } from '../components/universe/CosmosCanvas3D';
import {
  Orbit,
  Sparkles,
  Play,
  RotateCcw,
  Plus,
  ArrowRight,
  Flame,
  CheckCircle2,
  Calendar,
  X,
  Target,
  Compass,
  Layers,
  Eye,
  Radio,
  Zap,
  Clock,
  BookOpen,
  Box,
} from 'lucide-react';

interface FocusUniverseProps {
  onNavigate: (tab: NavTab) => void;
  onOpenSubjectModal: () => void;
}

type CosmosViewMode = 'webgl' | 'isometric' | 'topdown' | 'horizon';

export const FocusUniverse: React.FC<FocusUniverseProps> = ({
  onNavigate,
  onOpenSubjectModal,
}) => {
  const { subjects, tasks, setActiveSubjectId } = useApp();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [hoveredSubjectId, setHoveredSubjectId] = useState<string | null>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [viewMode, setViewMode] = useState<CosmosViewMode>('webgl');
  const [rotationSpeed, setRotationSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 640 });
  const [currentAngleOffset, setCurrentAngleOffset] = useState(0);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const totalCompletedHours = useMemo(() => {
    return subjects.reduce((acc, s) => acc + (s.completedHours || 0), 0);
  }, [subjects]);

  // Handle container resizing for responsive calculations
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (clientWidth > 0 && clientHeight > 0) {
          setDimensions({ width: clientWidth, height: clientHeight });
        }
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    window.addEventListener('resize', updateDimensions);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Smooth Keplerian orbital revolution animation loop
  useEffect(() => {
    // Respect user's prefers-reduced-motion setting
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || !isRotating) {
      lastTimeRef.current = null;
      return;
    }

    const speedFactor =
      rotationSpeed === 'slow' ? 0.00035 : rotationSpeed === 'fast' ? 0.0016 : 0.00075;

    const animate = (now: number) => {
      if (lastTimeRef.current !== null) {
        const delta = now - lastTimeRef.current;
        setCurrentAngleOffset((prev) => (prev + delta * speedFactor) % (Math.PI * 2));
      }
      lastTimeRef.current = now;
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isRotating, rotationSpeed]);

  const handleLaunchSession = (sub: Subject) => {
    setActiveSubjectId(sub.id);
    onNavigate('focus-room');
  };

  // View mode 3D projection parameters
  const viewParams = useMemo(() => {
    switch (viewMode) {
      case 'isometric':
        return {
          pitchRad: (50 * Math.PI) / 180, // 50 deg pitch
          yawRad: (-18 * Math.PI) / 180, // -18 deg yaw
          cosPitch: Math.cos((50 * Math.PI) / 180),
          sinPitch: Math.sin((50 * Math.PI) / 180),
          cosYaw: Math.cos((-18 * Math.PI) / 180),
          sinYaw: Math.sin((-18 * Math.PI) / 180),
          dist: 920,
          svgRotDeg: -18,
          svgScaleY: Math.cos((50 * Math.PI) / 180),
        };
      case 'horizon':
        return {
          pitchRad: (64 * Math.PI) / 180, // 64 deg pitch
          yawRad: 0,
          cosPitch: Math.cos((64 * Math.PI) / 180),
          sinPitch: Math.sin((64 * Math.PI) / 180),
          cosYaw: 1,
          sinYaw: 0,
          dist: 880,
          svgRotDeg: 0,
          svgScaleY: Math.cos((64 * Math.PI) / 180),
        };
      case 'topdown':
      default:
        return {
          pitchRad: 0,
          yawRad: 0,
          cosPitch: 1,
          sinPitch: 0,
          cosYaw: 1,
          sinYaw: 0,
          dist: 9999,
          svgRotDeg: 0,
          svgScaleY: 1,
        };
    }
  }, [viewMode]);

  // Center of the canvas
  const cx = dimensions.width / 2;
  const cy = dimensions.height / 2;
  const isMobile = dimensions.width < 640;

  // Responsive scale factor for orbital radii on smaller screens
  const orbitScale = useMemo(() => {
    if (dimensions.width < 420) return 0.52;
    if (dimensions.width < 500) return 0.62;
    if (dimensions.width < 640) return 0.72;
    if (dimensions.width < 768) return 0.82;
    if (dimensions.width < 1024) return 0.92;
    return 1.0;
  }, [dimensions.width]);

  // Base radii distribution: well-spaced concentric orbits that leave ample room for planets & cards
  const getOrbitRadius = useCallback(
    (index: number) => {
      if (isMobile) {
        // Explicit mobile radii: innermost orbit clears the Focus Core, outermost fits canvas
        const mobileRadii = [88, 118, 146, 172];
        return index < mobileRadii.length ? mobileRadii[index] : 88 + index * 28;
      }
      const baseRadii = [140, 195, 250, 305, 360];
      const baseRadius =
        index < baseRadii.length
          ? baseRadii[index]
          : 140 + index * 55;
      return baseRadius * orbitScale;
    },
    [orbitScale, isMobile]
  );

  // Calculate projected positions for all planets and their floating info cards
  const celestialBodies = useMemo(() => {
    const cardWidth = 210;
    const cardHeight = 72;
    const numSubjects = Math.max(1, subjects.length);

    // Step 1: Calculate planet coordinates and diameters
    const projectedPlanets = subjects.map((sub, idx) => {
      const orbitR = getOrbitRadius(idx);

      // Symmetrical quadrant distribution: planets maintain 360/N separation in celestial harmony
      const basePhase = (idx * 2 * Math.PI) / numSubjects + Math.PI / 4;
      const angle = (basePhase + currentAngleOffset) % (Math.PI * 2);

      // 1. Orbital disc plane coordinates (Z = 0)
      const x0 = orbitR * Math.cos(angle);
      const y0 = orbitR * Math.sin(angle);

      // 2. Camera yaw rotation around Z axis
      const x1 = x0 * viewParams.cosYaw - y0 * viewParams.sinYaw;
      const y1 = x0 * viewParams.sinYaw + y0 * viewParams.cosYaw;

      // 3. Camera pitch down around X axis (foreshortens vertical axis)
      const xProj = x1;
      const yProj = y1 * viewParams.cosPitch;
      const zDepth = y1 * viewParams.sinPitch; // Positive = closer to viewer (foreground)

      // 4. Perspective distance scale factor
      const perspectiveScale =
        viewMode === 'topdown'
          ? 1.0
          : Math.max(0.82, Math.min(1.18, viewParams.dist / (viewParams.dist - zDepth)));

      const screenX = cx + xProj * perspectiveScale;
      const screenY = cy + yProj * perspectiveScale;

      // Planet sphere diameter: proportional to verified study hours
      const baseDiameter = isMobile
        ? 42 + Math.min(14, (sub.completedHours || 0) * 2.2)
        : 52 + Math.min(22, (sub.completedHours || 0) * 3);
      const planetDiameter = Math.round(
        baseDiameter * (viewMode === 'topdown' ? 1 : perspectiveScale * 0.95)
      );
      const planetRadius = planetDiameter / 2;

      // Depth-based z-index (planets in foreground appear above background rings and planets)
      const zIndex = Math.round(30 + zDepth * 0.1);

      // Calculation of completed % vs weekly goal
      const progressPct =
        sub.weeklyTarget > 0
          ? Math.min(100, Math.round(((sub.completedHours || 0) / sub.weeklyTarget) * 100))
          : 0;

      const courseTasks = tasks.filter((t) => t.subjectId === sub.id && t.status !== 'completed');

      return {
        subject: sub,
        orbitR,
        screenX,
        screenY,
        planetDiameter,
        planetRadius,
        zIndex,
        perspectiveScale,
        progressPct,
        pendingTasksCount: courseTasks.length,
      };
    });

    // Step 2: Collision-Free Placement for Floating Information Cards (Desktop / Tablet)
    const minCanvasX = 14;
    const maxCanvasX = dimensions.width - cardWidth - 14;
    const minCanvasY = 14;
    const maxCanvasY = dimensions.height - cardHeight - 14;

    const placedCards: { x: number; y: number; w: number; h: number }[] = [];

    return projectedPlanets.map((planet) => {
      const { screenX, screenY, planetRadius } = planet;
      const dx = screenX - cx;
      const dy = screenY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const nx = dx / dist;
      const ny = dy / dist;

      const gapX = viewMode === 'horizon' ? 32 : 24;
      let cardX: number;
      let cardY: number;

      if (nx >= 0) {
        // Right flank: place card to the right of planet
        cardX = screenX + planetRadius + gapX;
      } else {
        // Left flank: place card to the left of planet
        cardX = screenX - planetRadius - gapX - cardWidth;
      }

      // Vertical offset based on hemisphere (upper vs lower)
      if (ny >= 0) {
        cardY = screenY + (ny > 0.35 ? planetRadius * 0.4 : -cardHeight * 0.2);
      } else {
        cardY = screenY - cardHeight + (ny < -0.35 ? -planetRadius * 0.4 : cardHeight * 0.2);
      }

      // In Horizon view mode, push cards more distinctly into upper or lower celestial halves
      if (viewMode === 'horizon') {
        if (ny >= 0) {
          cardY = Math.max(cardY, cy + 65);
        } else {
          cardY = Math.min(cardY, cy - 65 - cardHeight);
        }
      }

      // Focus Core Safe Zone: never let card overlap the central star [cx - 78, cx + 78] x [cy - 78, cy + 78]
      const coreSafeRadius = 78;
      const overlapsCoreX = Math.max(cardX, cx - coreSafeRadius) < Math.min(cardX + cardWidth, cx + coreSafeRadius);
      const overlapsCoreY = Math.max(cardY, cy - coreSafeRadius) < Math.min(cardY + cardHeight, cy + coreSafeRadius);
      if (overlapsCoreX && overlapsCoreY) {
        if (Math.abs(nx) >= Math.abs(ny)) {
          cardX = nx >= 0 ? cx + coreSafeRadius + 14 : cx - coreSafeRadius - cardWidth - 14;
        } else {
          cardY = ny >= 0 ? cy + coreSafeRadius + 14 : cy - coreSafeRadius - cardHeight - 14;
        }
      }

      // Clamp strictly within viewport margins
      cardX = Math.max(minCanvasX, Math.min(maxCanvasX, cardX));
      cardY = Math.max(minCanvasY, Math.min(maxCanvasY, cardY));

      // Overlap prevention with previously placed cards
      for (const placed of placedCards) {
        const overlapX = Math.max(0, Math.min(cardX + cardWidth, placed.x + placed.w) - Math.max(cardX, placed.x));
        const overlapY = Math.max(0, Math.min(cardY + cardHeight, placed.y + placed.h) - Math.max(cardY, placed.y));
        if (overlapX > 0 && overlapY > 0) {
          if (ny >= 0) {
            cardY = placed.y + placed.h + 14;
            if (cardY > maxCanvasY) {
              cardY = placed.y - cardHeight - 14;
            }
          } else {
            cardY = placed.y - cardHeight - 14;
            if (cardY < minCanvasY) {
              cardY = placed.y + placed.h + 14;
            }
          }
          cardY = Math.max(minCanvasY, Math.min(maxCanvasY, cardY));
        }
      }

      placedCards.push({ x: cardX, y: cardY, w: cardWidth, h: cardHeight });

      // Calculate nearest tether point on card boundary to planet
      const tetherCardX = Math.max(cardX, Math.min(cardX + cardWidth, screenX));
      const tetherCardY = Math.max(cardY, Math.min(cardY + cardHeight, screenY));

      return {
        ...planet,
        cardX,
        cardY,
        cardWidth,
        cardHeight,
        tetherCardX,
        tetherCardY,
      };
    });
  }, [subjects, getOrbitRadius, currentAngleOffset, viewParams, viewMode, cx, cy, dimensions, tasks, isMobile]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Controls Bar */}
      <NexusCard glowColor="rgba(0, 214, 143, 0.25)" className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#008F62] via-[#00D68F] to-[#64FFCA] p-[1.5px] shadow-[0_0_15px_rgba(0,214,143,0.3)] shrink-0">
              <div className="w-full h-full bg-[#050807] rounded-[10px] flex items-center justify-center">
                <Orbit className="w-5 h-5 text-[#64FFCA]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F3FFF9]">Focus Universe</h2>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#00D68F]/10 text-[#64FFCA] border border-[#00D68F]/25 font-bold">
                  3D Cosmos Nexus
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#91A69B] mt-0.5">
                Gravitational planetary cosmos — planetary sphere mass scales with verified study hours.
              </p>
            </div>
          </div>

          {/* Controls: View Modes + Rotation + Add Course */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-xl p-1 text-xs">
              <button
                onClick={() => setViewMode('webgl')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'webgl'
                    ? 'bg-[#00D68F]/25 text-[#64FFCA] font-bold shadow-sm border border-[#00D68F]/40'
                    : 'text-[#91A69B] hover:text-[#F3FFF9]'
                }`}
                title="Interactive Three.js 3D WebGL Cosmos"
              >
                <Box className="w-3.5 h-3.5 text-[#00D68F]" />
                <span className="font-bold">3D WebGL</span>
              </button>
              <button
                onClick={() => setViewMode('isometric')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'isometric'
                    ? 'bg-[#00D68F]/20 text-[#64FFCA] font-bold shadow-sm'
                    : 'text-[#91A69B] hover:text-[#F3FFF9]'
                }`}
                title="3D Isometric Orbit"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">3D Iso</span>
              </button>
              <button
                onClick={() => setViewMode('topdown')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'topdown'
                    ? 'bg-[#00D68F]/20 text-[#64FFCA] font-bold shadow-sm'
                    : 'text-[#91A69B] hover:text-[#F3FFF9]'
                }`}
                title="Top-down Radar"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Radar</span>
              </button>
              <button
                onClick={() => setViewMode('horizon')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'horizon'
                    ? 'bg-[#00D68F]/20 text-[#64FFCA] font-bold shadow-sm'
                    : 'text-[#91A69B] hover:text-[#F3FFF9]'
                }`}
                title="Deep Horizon"
              >
                <Compass className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Horizon</span>
              </button>
            </div>

            {/* Orbit Rotation state */}
            <div className="flex items-center bg-[#0A100E] border border-[rgba(100,255,202,0.16)] rounded-xl p-1 text-xs">
              <button
                onClick={() => setIsRotating(!isRotating)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  isRotating ? 'bg-[#00D68F]/20 text-[#64FFCA]' : 'text-slate-400 hover:text-white'
                }`}
              >
                {isRotating ? 'Orbiting' : 'Frozen'}
              </button>
              <button
                onClick={() => {
                  setRotationSpeed(rotationSpeed === 'slow' ? 'normal' : rotationSpeed === 'normal' ? 'fast' : 'slow');
                }}
                className="px-2 py-1 text-[#91A69B] hover:text-[#F3FFF9] transition-colors cursor-pointer font-mono uppercase text-[10px]"
                title="Toggle orbital revolution speed"
              >
                {rotationSpeed}
              </button>
            </div>

            <NexusButton
              size="sm"
              variant="primary"
              onClick={onOpenSubjectModal}
              icon={<Plus className="w-3.5 h-3.5 text-white" />}
            >
              Add Course
            </NexusButton>
          </div>
        </div>
      </NexusCard>

      {/* Main Cosmos Visualization Area */}
      {subjects.length === 0 ? (
        /* Empty State */
        <NexusCard className="h-[480px] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,214,143,0.08)_0%,transparent_60%)]" />
          <div className="w-16 h-16 rounded-full bg-[#00D68F]/10 border border-[#00D68F]/30 flex items-center justify-center mb-4 text-[#64FFCA]">
            <Orbit className="w-8 h-8 animate-spin" style={{ animationDuration: '20s' }} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Your Focus Universe is currently dormant</h3>
          <p className="text-sm text-[#91A69B] max-w-md mb-6 leading-relaxed">
            Create your first academic course to ignite your celestial study map. Each subject orbits your core with gravitational mass determined by your completed study hours.
          </p>
          <NexusButton
            variant="primary"
            onClick={onOpenSubjectModal}
            icon={<Plus className="w-4 h-4 text-white" />}
          >
            Ignite First Course
          </NexusButton>
        </NexusCard>
      ) : viewMode === 'webgl' ? (
        <CosmosCanvas3D
          subjects={subjects}
          tasks={tasks}
          totalCompletedHours={totalCompletedHours}
          selectedSubject={selectedSubject}
          onSelectSubject={setSelectedSubject}
          onLaunchSession={handleLaunchSession}
          isRotating={isRotating}
          rotationSpeedMultiplier={
            rotationSpeed === 'slow' ? 0.45 : rotationSpeed === 'fast' ? 2.0 : 1.0
          }
        />
      ) : (
        /* The Solar Orbit Canvas */
        <div
          ref={containerRef}
          className="relative h-[520px] sm:h-[660px] rounded-3xl bg-[#050807] border border-[rgba(100,255,202,0.18)] overflow-hidden shadow-2xl flex items-center justify-center select-none"
        >
          {/* Subtle starfield particles & nebula grid */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(10,24,18,0.7)_0%,#050807_100%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(100,255,202,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(100,255,202,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-40" />

          {/* Central Atmospheric Glow in Emerald & Neon Mint */}
          <div className="absolute w-[520px] h-[520px] bg-[#00D68F]/12 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute w-[300px] h-[300px] bg-[#64FFCA]/10 rounded-full blur-2xl pointer-events-none" />

          {/* Telemetry HUD overlay in top left */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-30 pointer-events-none flex flex-col gap-1 sm:gap-1.5 p-2.5 sm:p-3 rounded-xl bg-[#0A100E]/85 backdrop-blur-md border border-[rgba(100,255,202,0.16)] text-[11px] sm:text-xs font-mono text-[#91A69B] shadow-lg">
            <div className="flex items-center gap-1.5 text-[#64FFCA] font-bold tracking-wider">
              <Radio className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse" />
              <span>ORBITAL TELEMETRY</span>
            </div>
            <div>COSMIC BODIES: <span className="text-[#F3FFF9] font-bold">{subjects.length}</span></div>
            <div>GRAVITATIONAL HOURS: <span className="text-[#64FFCA] font-bold">{totalCompletedHours.toFixed(1)}h</span></div>
            <div>PERSPECTIVE: <span className="text-[#00D68F] font-bold uppercase">{viewMode}</span></div>
          </div>

          {/* 1. Vector SVG Layer for Crisp, Undistorted Orbital Rings & Holographic Tethers */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          >
            <defs>
              <filter id="orbitGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Concentric Elliptical Orbit Rings */}
            {subjects.map((sub, idx) => {
              const radius = getOrbitRadius(idx);
              const isHovered = hoveredSubjectId === sub.id;
              const isSelected = selectedSubject?.id === sub.id;

              // Ellipse dimensions matching the current view pitch & yaw
              const rx = radius;
              const ry = radius * viewParams.svgScaleY;

              return (
                <ellipse
                  key={`ring-${sub.id}`}
                  cx={cx}
                  cy={cy}
                  rx={rx}
                  ry={ry}
                  transform={
                    viewParams.svgRotDeg !== 0
                      ? `rotate(${viewParams.svgRotDeg} ${cx} ${cy})`
                      : undefined
                  }
                  fill="none"
                  stroke={isHovered || isSelected ? sub.color : 'rgba(100, 255, 202, 0.22)'}
                  strokeWidth={isHovered || isSelected ? 2.5 : 1.5}
                  strokeDasharray={isHovered || isSelected ? '8 4' : '5 5'}
                  filter={isHovered || isSelected ? 'url(#orbitGlow)' : undefined}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* Subtle Tether Lines connecting each planet to its Floating Info Card (Desktop & Tablet) */}
            {!isMobile &&
              celestialBodies.map((body) => {
                const isHovered = hoveredSubjectId === body.subject.id;
                const isSelected = selectedSubject?.id === body.subject.id;

                return (
                  <line
                    key={`tether-${body.subject.id}`}
                    x1={body.screenX}
                    y1={body.screenY}
                    x2={body.tetherCardX}
                    y2={body.tetherCardY}
                    stroke={isHovered || isSelected ? body.subject.color : 'rgba(100, 255, 202, 0.25)'}
                    strokeWidth={isHovered || isSelected ? 1.5 : 1}
                    strokeDasharray="3 3"
                    className="transition-colors duration-200"
                  />
                );
              })}
          </svg>

          {/* 2. Central Star: The "Focus Core" (Prominent Study Time, Razor-Sharp Horizontal Text) */}
          <div
            className="absolute z-20 flex flex-col items-center justify-center text-center cursor-default pointer-events-auto"
            style={{
              left: cx,
              top: cy,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-[#008F62] via-[#00D68F] to-[#64FFCA] p-1.5 shadow-[0_0_60px_rgba(0,214,143,0.55)] flex items-center justify-center animate-pulse">
              <div className="w-full h-full bg-[#0A100E] rounded-full flex flex-col items-center justify-center p-2 border border-[rgba(100,255,202,0.25)] shadow-inner">
                <Flame className="w-5 h-5 sm:w-7 sm:h-7 text-[#64FFCA] mb-1 filter drop-shadow(0 0 8px #00D68F)" />
                <span className="text-lg sm:text-2xl font-black text-[#F3FFF9] font-mono tracking-tight leading-none drop-shadow">
                  {totalCompletedHours.toFixed(1)}h
                </span>
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-[#91A69B] mt-0.5 sm:mt-1">
                  Focus Core
                </span>
              </div>
            </div>
          </div>

          {/* 3. Spherical 3D Planets (True circular screen-space projection, bold horizontal study hours) */}
          {celestialBodies.map((body) => {
            const { subject: sub, screenX, screenY, planetDiameter, zIndex } = body;
            const isHovered = hoveredSubjectId === sub.id;
            const isSelected = selectedSubject?.id === sub.id;

            return (
              <div
                key={`planet-${sub.id}`}
                className="absolute pointer-events-auto cursor-pointer group"
                style={{
                  left: screenX,
                  top: screenY,
                  width: planetDiameter,
                  height: planetDiameter,
                  transform: 'translate(-50%, -50%)',
                  zIndex: zIndex,
                }}
                onClick={() => setSelectedSubject(sub)}
                onMouseEnter={() => setHoveredSubjectId(sub.id)}
                onMouseLeave={() => setHoveredSubjectId(null)}
                role="button"
                tabIndex={0}
                aria-label={`${sub.name}: ${sub.completedHours} study hours`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedSubject(sub);
                  }
                }}
              >
                {/* Luminous Spherical Planet Body */}
                <div
                  className="relative w-full h-full rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-115"
                  style={{
                    background: `radial-gradient(circle at 32% 28%, ${sub.color}, #0A1A12 75%, #050807 100%)`,
                    boxShadow: isHovered || isSelected
                      ? `0 0 32px ${sub.color}, inset 0 0 14px rgba(255,255,255,0.7)`
                      : `0 0 20px ${sub.color}88, inset 0 0 10px rgba(255,255,255,0.4)`,
                    border: `2px solid ${sub.color}`,
                  }}
                >
                  {/* Outer atmospheric corona on hover */}
                  <div
                    className="absolute -inset-1.5 rounded-full pointer-events-none transition-opacity duration-300"
                    style={{
                      background: `radial-gradient(circle, ${sub.color}44 0%, transparent 70%)`,
                      opacity: isHovered || isSelected ? 1 : 0,
                    }}
                  />

                  {/* Study-hour value inside planet: 14-16px, bold, horizontal, razor-sharp */}
                  <span className="text-xs sm:text-base font-extrabold text-[#F3FFF9] font-mono tracking-tight drop-shadow-md select-none z-10">
                    {(sub.completedHours || 0).toFixed(1)}h
                  </span>
                </div>
              </div>
            );
          })}

          {/* 4. Subject Information Badges / Cards */}
          {isMobile ? (
            /* Mobile Compact Pill Badges (anchored radially outward from each planet, clearing Focus Core) */
            celestialBodies.map((body) => {
              const { subject: sub, screenX, screenY, planetRadius, zIndex } = body;
              const isHovered = hoveredSubjectId === sub.id;
              const isSelected = selectedSubject?.id === sub.id;

              const dx = screenX - cx;
              const dy = screenY - cy;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              const nx = dx / dist;
              const ny = dy / dist;

              // Push badge radially outward from planet away from the Focus Core
              const outwardGap = planetRadius + 16;
              const rawBadgeX = screenX + nx * outwardGap;
              const rawBadgeY = screenY + ny * outwardGap;

              const badgeX = Math.max(68, Math.min(dimensions.width - 68, rawBadgeX));
              const badgeY = Math.max(18, Math.min(dimensions.height - 24, rawBadgeY));

              return (
                <div
                  key={`mobile-badge-${sub.id}`}
                  className="absolute pointer-events-auto cursor-pointer flex flex-col items-center transition-transform active:scale-95"
                  style={{
                    left: badgeX,
                    top: badgeY,
                    transform: 'translate(-50%, -50%)',
                    zIndex: zIndex + 20,
                  }}
                  onClick={() => setSelectedSubject(sub)}
                  onMouseEnter={() => setHoveredSubjectId(sub.id)}
                  onMouseLeave={() => setHoveredSubjectId(null)}
                  role="button"
                  tabIndex={0}
                  aria-label={`${sub.name}: ${sub.completedHours} study hours`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedSubject(sub);
                    }
                  }}
                >
                  <div
                    className="px-2.5 py-1 rounded-full backdrop-blur-md shadow-lg border flex items-center gap-1.5 whitespace-nowrap transition-colors"
                    style={{
                      backgroundColor: isHovered || isSelected ? '#12221A' : 'rgba(10, 16, 14, 0.94)',
                      borderColor: isHovered || isSelected ? sub.color : 'rgba(100, 255, 202, 0.35)',
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: sub.color, boxShadow: `0 0 6px ${sub.color}` }}
                    />
                    <span className="text-[11px] font-semibold text-[#F3FFF9] tracking-tight max-w-[95px] truncate">
                      {sub.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#64FFCA]">
                      {sub.completedHours}h
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            /* Desktop / Tablet Premium Floating Information Cards (Undistorted, Screen-Space, 13-14px font, Clear Hierarchy) */
            celestialBodies.map((body) => {
              const { subject: sub, cardX, cardY, cardWidth, cardHeight, zIndex, progressPct } = body;
              const isHovered = hoveredSubjectId === sub.id;
              const isSelected = selectedSubject?.id === sub.id;

              return (
                <div
                  key={`card-${sub.id}`}
                  className="absolute pointer-events-auto cursor-pointer transition-all duration-200"
                  style={{
                    left: cardX,
                    top: cardY,
                    width: cardWidth,
                    minHeight: cardHeight,
                    zIndex: zIndex + 20, // Keep floating cards above planet spheres
                  }}
                  onClick={() => setSelectedSubject(sub)}
                  onMouseEnter={() => setHoveredSubjectId(sub.id)}
                  onMouseLeave={() => setHoveredSubjectId(null)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for ${sub.name}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedSubject(sub);
                    }
                  }}
                >
                  <div
                    className={`flex flex-col justify-between p-3 rounded-xl backdrop-blur-md transition-all duration-200 shadow-xl ${
                      isHovered || isSelected
                        ? 'bg-[#12221A]/95 border-2 shadow-[0_8px_30px_rgba(0,0,0,0.8)] scale-105'
                        : 'bg-[#0D1713]/92 border border-[rgba(100,255,202,0.22)] hover:border-[#64FFCA]'
                    }`}
                    style={{
                      borderColor: isHovered || isSelected ? sub.color : undefined,
                      boxShadow: isHovered || isSelected ? `0 0 25px ${sub.color}44, 0 10px 30px rgba(0,0,0,0.85)` : undefined,
                    }}
                  >
                    {/* Subject Name: Prominent 13-14px font, semibold/bold, clean horizontal readability */}
                    <div className="flex items-start gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm mt-0.5"
                        style={{
                          backgroundColor: sub.color,
                          boxShadow: `0 0 8px ${sub.color}`,
                        }}
                      />
                      <h4
                        className="text-xs sm:text-sm font-semibold text-[#F3FFF9] tracking-tight leading-snug line-clamp-2 uppercase break-words"
                        title={sub.name}
                      >
                        {sub.name}
                      </h4>
                    </div>

                    {/* Supporting Information: 12-14px study hours & goal badge */}
                    <div className="flex items-center justify-between gap-2 text-xs text-[#91A69B] font-medium pt-1.5 mt-1 border-t border-[rgba(100,255,202,0.08)]">
                      <span className="text-[#64FFCA] font-semibold font-mono">
                        {sub.completedHours} study hours
                      </span>
                      {sub.weeklyTarget > 0 && (
                        <span className="text-[11px] font-mono text-[#DCE7E2] bg-[rgba(100,255,202,0.08)] px-1.5 py-0.5 rounded font-semibold shrink-0">
                          {progressPct}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Accessible Responsive Fleet Strip: Quick-access subject cards for mobile & tablet ergonomics */}
      {subjects.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base sm:text-lg font-semibold text-[#F3FFF9] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#00D68F]" />
              <span>Cosmic Subject Fleet</span>
            </h3>
            <span className="text-xs text-[#91A69B]">
              {subjects.length} active planetary courses
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {subjects.map((sub) => {
              const progressPct =
                sub.weeklyTarget > 0
                  ? Math.min(100, Math.round(((sub.completedHours || 0) / sub.weeklyTarget) * 100))
                  : 0;

              return (
                <NexusCard
                  key={`fleet-${sub.id}`}
                  glowColor={sub.color}
                  className="p-3.5 flex flex-col justify-between gap-3 cursor-pointer hover:border-[#64FFCA]/50 transition-all bg-[#0D1713]/85"
                  onClick={() => setSelectedSubject(sub)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shadow-md shrink-0"
                        style={{
                          backgroundColor: sub.color,
                          boxShadow: `0 0 12px ${sub.color}66`,
                        }}
                      >
                        {sub.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#F3FFF9] tracking-tight line-clamp-1">
                          {sub.name}
                        </h4>
                        <span className="text-xs text-[#91A69B]">
                          {sub.completedHours}h verified
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] font-mono text-[#64FFCA] font-bold px-1.5 py-0.5 rounded bg-[#00D68F]/10 border border-[#00D68F]/25 shrink-0">
                      {progressPct}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-[#050807] rounded-full h-1.5 overflow-hidden border border-[rgba(100,255,202,0.1)]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progressPct}%`,
                        backgroundColor: sub.color,
                        boxShadow: `0 0 8px ${sub.color}`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[#91A69B]">
                      Target: <strong className="text-[#F3FFF9] font-mono">{sub.weeklyTarget}h</strong>
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLaunchSession(sub);
                      }}
                      className="text-[#64FFCA] hover:text-[#F3FFF9] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <span>Focus</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </NexusCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Subject Cosmos Detail Modal */}
      {selectedSubject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <NexusCard
            glowColor={`${selectedSubject.color}55`}
            className="relative w-full max-w-md p-6 shadow-2xl bg-[#0D1713] border border-[rgba(100,255,202,0.3)]"
          >
            <button
              onClick={() => setSelectedSubject(null)}
              className="absolute top-4 right-4 p-2 text-[#91A69B] hover:text-[#F3FFF9] rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Close subject modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg text-white shadow-xl shrink-0"
                style={{
                  backgroundColor: selectedSubject.color,
                  boxShadow: `0 0 25px ${selectedSubject.color}66`,
                }}
              >
                {selectedSubject.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#F3FFF9] tracking-tight">{selectedSubject.name}</h3>
                <span className="text-xs text-[#91A69B]">
                  Priority: <span className="capitalize font-semibold text-[#64FFCA]">{selectedSubject.priority}</span>
                </span>
              </div>
            </div>

            {selectedSubject.description && (
              <p className="text-xs sm:text-sm text-[#91A69B] mb-4 leading-relaxed">
                {selectedSubject.description}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3.5 rounded-xl bg-[#0A100E] border border-[rgba(100,255,202,0.12)]">
                <span className="text-xs text-[#91A69B] uppercase font-semibold">Completed / Target</span>
                <div className="text-lg font-bold text-[#F3FFF9] font-mono mt-0.5">
                  {selectedSubject.completedHours}h{' '}
                  <span className="text-xs text-[#91A69B] font-normal">/ {selectedSubject.weeklyTarget}h</span>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0A100E] border border-[rgba(100,255,202,0.12)]">
                <span className="text-xs text-[#91A69B] uppercase font-semibold">Exam Horizon</span>
                <div className="text-sm font-semibold text-[#DCE7E2] mt-1 font-mono">
                  {selectedSubject.examDate || 'No date set'}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <NexusButton
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    handleLaunchSession(selectedSubject);
                    setSelectedSubject(null);
                  }}
                  icon={<Play className="w-3.5 h-3.5 fill-current" />}
                >
                  Launch Focus Sprint
                </NexusButton>
              </div>
              <NexusButton
                variant="secondary"
                onClick={() => {
                  onNavigate('subjects');
                  setSelectedSubject(null);
                }}
              >
                Edit Course
              </NexusButton>
            </div>
          </NexusCard>
        </div>
      )}
    </div>
  );
};
