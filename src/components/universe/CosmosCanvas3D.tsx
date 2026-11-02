import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { Subject, Task } from '../../types';
import { Play, Sparkles, CheckCircle2, Clock, ArrowRight, X } from 'lucide-react';

interface CosmosCanvas3DProps {
  subjects: Subject[];
  tasks: Task[];
  totalCompletedHours: number;
  selectedSubject: Subject | null;
  onSelectSubject: (subject: Subject | null) => void;
  onLaunchSession: (subject: Subject) => void;
  isRotating: boolean;
  rotationSpeedMultiplier: number;
}

export const CosmosCanvas3D: React.FC<CosmosCanvas3DProps> = ({
  subjects,
  tasks,
  totalCompletedHours,
  selectedSubject,
  onSelectSubject,
  onLaunchSession,
  isRotating,
  rotationSpeedMultiplier,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<{
    subject: Subject;
    screenX: number;
    screenY: number;
    progressPct: number;
    pendingTasks: number;
  } | null>(null);

  // Scene references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Mesh registries for raycasting and animation
  const planetMeshesRef = useRef<
    {
      mesh: THREE.Mesh;
      ringMesh?: THREE.Line;
      atmosphereMesh?: THREE.Mesh;
      subject: Subject;
      orbitRadius: number;
      baseAngle: number;
      speed: number;
      baseScale: number;
      orbitProgress: number;
    }[]
  >([]);

  const coreGroupRef = useRef<THREE.Group | null>(null);
  const starsRef = useRef<THREE.Points | null>(null);

  // Camera Orbit State (mouse drag rotation)
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraSphericalRef = useRef({
    radius: 720,
    theta: Math.PI / 4, // azimuth
    phi: Math.PI / 3.2, // polar angle
  });
  const targetLookAtRef = useRef(new THREE.Vector3(0, 0, 0));

  // Mouse vector for raycasting
  const mouseRef = useRef(new THREE.Vector2(-1000, -1000));
  const raycasterRef = useRef(new THREE.Raycaster());

  // Setup Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050807);
    scene.fog = new THREE.FogExp2(0x050807, 0.00065);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 4000);
    cameraRef.current = camera;
    updateCameraPosition();

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0x0a1a14, 2.0);
    scene.add(ambientLight);

    // Glowing core point light in emerald
    const corePointLight = new THREE.PointLight(0x00d68f, 5.0, 1800, 1.2);
    corePointLight.position.set(0, 0, 0);
    scene.add(corePointLight);

    // Secondary mint rim light
    const rimPointLight = new THREE.PointLight(0x64ffca, 2.5, 1200, 1.4);
    rimPointLight.position.set(200, 300, 200);
    scene.add(rimPointLight);

    const dirLight = new THREE.DirectionalLight(0xdce7e2, 0.8);
    dirLight.position.set(-300, 500, 400);
    scene.add(dirLight);

    // 5. Starfield Particles (Cyber Emerald stardust)
    const starCount = 2000;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starColorPalette = [
      new THREE.Color(0x00d68f),
      new THREE.Color(0x64ffca),
      new THREE.Color(0xdce7e2),
      new THREE.Color(0x008f62),
      new THREE.Color(0xffffff),
    ];

    for (let i = 0; i < starCount; i++) {
      const radius = 600 + Math.random() * 1200;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = radius * Math.cos(phi);

      const color = starColorPalette[Math.floor(Math.random() * starColorPalette.length)];
      starColors[i * 3] = color.r;
      starColors[i * 3 + 1] = color.g;
      starColors[i * 3 + 2] = color.b;
    }

    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);
    starsRef.current = starPoints;

    // 6. Focus Core Group (Central Luminous Star & Orbital Gyros)
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);
    coreGroupRef.current = coreGroup;

    // Core Star Sphere
    const coreGeo = new THREE.SphereGeometry(38, 36, 36);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x00d68f,
      emissive: 0x00d68f,
      emissiveIntensity: 1.8,
      roughness: 0.2,
      metalness: 0.8,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(coreMesh);

    // Inner pulsating mint aura
    const auraGeo = new THREE.SphereGeometry(44, 32, 32);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x64ffca,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    coreGroup.add(auraMesh);

    // Gyroscope rings around core
    const createGyroRing = (radius: number, color: number, tiltX: number, tiltY: number) => {
      const ringGeo = new THREE.BufferGeometry();
      const points: THREE.Vector3[] = [];
      const segments = 64;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
      }
      ringGeo.setFromPoints(points);
      const ringMat = new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 0.6,
      });
      const ring = new THREE.Line(ringGeo, ringMat);
      ring.rotation.x = tiltX;
      ring.rotation.y = tiltY;
      return ring;
    };

    const gyro1 = createGyroRing(54, 0x64ffca, Math.PI / 4, 0);
    const gyro2 = createGyroRing(62, 0x00d68f, -Math.PI / 3.5, Math.PI / 5);
    coreGroup.add(gyro1);
    coreGroup.add(gyro2);

    // Handle Window / Container Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      if (newW > 0 && newH > 0) {
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Mouse Interaction Handlers
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        isDraggingRef.current = true;
        previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      mouseRef.current.set(normX, normY);

      if (isDraggingRef.current) {
        const deltaX = e.clientX - previousMousePositionRef.current.x;
        const deltaY = e.clientY - previousMousePositionRef.current.y;

        cameraSphericalRef.current.theta -= deltaX * 0.006;
        cameraSphericalRef.current.phi = Math.max(
          0.15,
          Math.min(Math.PI / 2.1, cameraSphericalRef.current.phi - deltaY * 0.006)
        );

        previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
        updateCameraPosition();
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraSphericalRef.current.radius = Math.max(
        350,
        Math.min(1300, cameraSphericalRef.current.radius + e.deltaY * 0.6)
      );
      updateCameraPosition();
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    domElement.addEventListener('wheel', handleWheel, { passive: false });

    // Click handler for planet selection
    const handleClick = (e: MouseEvent) => {
      // Ignore if user was dragging camera
      const rect = container.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const clickY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(new THREE.Vector2(clickX, clickY), camera);
      const meshesToTest = planetMeshesRef.current.map((p) => p.mesh);
      const intersects = raycasterRef.current.intersectObjects(meshesToTest, true);

      if (intersects.length > 0) {
        const hitMesh = intersects[0].object;
        const found = planetMeshesRef.current.find(
          (p) => p.mesh === hitMesh || p.mesh.children.includes(hitMesh)
        );
        if (found) {
          onSelectSubject(found.subject);
        }
      }
    };

    domElement.addEventListener('click', handleClick);

    // Animation Loop
    let lastTime = performance.now();
    const animate = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      // 1. Starfield gentle rotation
      if (starsRef.current) {
        starsRef.current.rotation.y += delta * 0.015;
      }

      // 2. Core gyro spinning
      if (coreGroupRef.current) {
        coreGroupRef.current.children[0].rotation.y += delta * 0.4;
        if (gyro1) gyro1.rotation.z += delta * 0.6;
        if (gyro2) gyro2.rotation.x += delta * 0.5;
      }

      // 3. Planetary Orbital Revolution & Axial Spin
      const speedMult = isRotating ? rotationSpeedMultiplier : 0;
      planetMeshesRef.current.forEach((item) => {
        item.orbitProgress += delta * item.speed * speedMult;
        const angle = item.baseAngle + item.orbitProgress;

        // Position on orbital plane
        const x = Math.cos(angle) * item.orbitRadius;
        const z = Math.sin(angle) * item.orbitRadius;
        // Subtle vertical wobble
        const y = Math.sin(angle * 2) * (item.orbitRadius * 0.04);

        item.mesh.position.set(x, y, z);
        item.mesh.rotation.y += delta * 0.8; // Self-rotation
      });

      // 4. Raycasting Hover Detection
      if (cameraRef.current && container) {
        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
        const meshesToTest = planetMeshesRef.current.map((p) => p.mesh);
        const intersects = raycasterRef.current.intersectObjects(meshesToTest, true);

        if (intersects.length > 0) {
          const hitMesh = intersects[0].object;
          const found = planetMeshesRef.current.find(
            (p) => p.mesh === hitMesh || p.mesh.children.includes(hitMesh)
          );

          if (found) {
            // Smoothly scale up hovered planet
            found.mesh.scale.lerp(
              new THREE.Vector3(found.baseScale * 1.3, found.baseScale * 1.3, found.baseScale * 1.3),
              0.15
            );

            // Compute 2D Screen Coordinates for HUD Tooltip
            const tempVec = new THREE.Vector3();
            found.mesh.getWorldPosition(tempVec);
            tempVec.project(cameraRef.current);

            const screenX = ((tempVec.x + 1) * container.clientWidth) / 2;
            const screenY = ((-tempVec.y + 1) * container.clientHeight) / 2;

            const sub = found.subject;
            const subTasks = tasks.filter((t) => t.subjectId === sub.id && t.status !== 'completed');
            const progressPct =
              sub.weeklyTarget > 0
                ? Math.min(100, Math.round(((sub.completedHours || 0) / sub.weeklyTarget) * 100))
                : 0;

            setHoveredPlanet({
              subject: sub,
              screenX,
              screenY,
              progressPct,
              pendingTasks: subTasks.length,
            });

            // Highlight its orbital ring
            if (found.ringMesh) {
              (found.ringMesh.material as THREE.LineBasicMaterial).color.setHex(0x64ffca);
              (found.ringMesh.material as THREE.LineBasicMaterial).opacity = 0.85;
            }
          }
        } else {
          setHoveredPlanet(null);
          // Return non-hovered planets to base scale and ring color
          planetMeshesRef.current.forEach((item) => {
            const isSel = selectedSubject?.id === item.subject.id;
            const targetScale = isSel ? item.baseScale * 1.25 : item.baseScale;
            item.mesh.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

            if (item.ringMesh) {
              const ringMat = item.ringMesh.material as THREE.LineBasicMaterial;
              ringMat.color.setHex(isSel ? 0x00d68f : 0x224838);
              ringMat.opacity = isSel ? 0.75 : 0.35;
            }
          });
        }
      }

      // Render Scene
      renderer.render(scene, camera);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    // Cleanup on unmount
    return () => {
      resizeObserver.disconnect();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

      domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domElement.removeEventListener('wheel', handleWheel);
      domElement.removeEventListener('click', handleClick);

      // Dispose Three.js resources
      renderer.dispose();
      starGeo.dispose();
      starMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      auraGeo.dispose();
      auraMat.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Camera Position from Spherical Coordinates
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = cameraSphericalRef.current;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);

    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(targetLookAtRef.current);
  };

  // Synchronize Planets with App Subjects
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove old planet meshes and rings
    planetMeshesRef.current.forEach((item) => {
      scene.remove(item.mesh);
      if (item.ringMesh) scene.remove(item.ringMesh);
      item.mesh.geometry.dispose();
      (item.mesh.material as THREE.Material).dispose();
      if (item.atmosphereMesh) {
        item.atmosphereMesh.geometry.dispose();
        (item.atmosphereMesh.material as THREE.Material).dispose();
      }
    });
    planetMeshesRef.current = [];

    const numSubjects = Math.max(1, subjects.length);
    const baseOrbitRadii = [150, 215, 280, 345, 410, 475, 540];

    subjects.forEach((sub, idx) => {
      const orbitR =
        idx < baseOrbitRadii.length ? baseOrbitRadii[idx] : 150 + idx * 65;

      // 1. Concentric Orbital Ring
      const ringPoints: THREE.Vector3[] = [];
      const ringSegments = 90;
      for (let i = 0; i <= ringSegments; i++) {
        const theta = (i / ringSegments) * Math.PI * 2;
        ringPoints.push(new THREE.Vector3(Math.cos(theta) * orbitR, 0, Math.sin(theta) * orbitR));
      }
      const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPoints);
      const isSelected = selectedSubject?.id === sub.id;
      const ringMat = new THREE.LineBasicMaterial({
        color: isSelected ? 0x00d68f : 0x224838,
        transparent: true,
        opacity: isSelected ? 0.75 : 0.35,
      });
      const ringLine = new THREE.Line(ringGeo, ringMat);
      scene.add(ringLine);

      // 2. Planet Mesh Geometry (scaled with verified study hours)
      const baseRadius = 14 + Math.min(14, (sub.completedHours || 0) * 1.5);
      const planetGeo = new THREE.SphereGeometry(baseRadius, 32, 32);

      // Hex color parsing
      const subHex = sub.color ? parseInt(sub.color.replace('#', '0x'), 16) : 0x00d68f;

      const planetMat = new THREE.MeshStandardMaterial({
        color: subHex,
        emissive: subHex,
        emissiveIntensity: 0.38,
        roughness: 0.32,
        metalness: 0.65,
      });
      const planetMesh = new THREE.Mesh(planetGeo, planetMat);

      // 3. Atmosphere Outer Glow
      const atmosGeo = new THREE.SphereGeometry(baseRadius * 1.15, 24, 24);
      const atmosMat = new THREE.MeshBasicMaterial({
        color: subHex,
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
      });
      const atmosphereMesh = new THREE.Mesh(atmosGeo, atmosMat);
      planetMesh.add(atmosphereMesh);

      // 4. Planetary Saturn Ring for subjects with >= 5 study hours or high target
      if ((sub.completedHours || 0) >= 4 || sub.weeklyTarget >= 8) {
        const ringGeo = new THREE.RingGeometry(baseRadius * 1.4, baseRadius * 1.85, 32);
        const ringMeshMat = new THREE.MeshBasicMaterial({
          color: subHex,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.45,
        });
        const pRing = new THREE.Mesh(ringGeo, ringMeshMat);
        pRing.rotation.x = Math.PI / 2.5;
        pRing.rotation.y = Math.PI / 6;
        planetMesh.add(pRing);
      }

      // Initial Placement
      const baseAngle = (idx * 2 * Math.PI) / numSubjects + Math.PI / 5;
      planetMesh.position.set(
        Math.cos(baseAngle) * orbitR,
        0,
        Math.sin(baseAngle) * orbitR
      );
      scene.add(planetMesh);

      // Speed (Keplerian: closer orbits revolve slightly faster)
      const speed = 0.28 / Math.sqrt(orbitR / 150);

      planetMeshesRef.current.push({
        mesh: planetMesh,
        ringMesh: ringLine,
        atmosphereMesh,
        subject: sub,
        orbitRadius: orbitR,
        baseAngle,
        speed,
        baseScale: 1.0,
        orbitProgress: 0,
      });
    });
  }, [subjects, selectedSubject]);

  return (
    <div className="relative w-full h-[520px] sm:h-[660px] rounded-3xl bg-[#050807] border border-[rgba(100,255,202,0.18)] overflow-hidden shadow-2xl select-none">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Orbit Navigation Controls Overlay in top right */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          onClick={() => {
            cameraSphericalRef.current = {
              radius: 720,
              theta: Math.PI / 4,
              phi: Math.PI / 3.2,
            };
            updateCameraPosition();
          }}
          className="px-3 py-1.5 rounded-xl bg-[#0A100E]/85 backdrop-blur-md border border-[rgba(100,255,202,0.2)] text-[11px] font-mono text-[#64FFCA] hover:text-[#F3FFF9] hover:border-[#00D68F] transition-colors shadow-lg cursor-pointer"
          title="Reset Camera Perspective"
        >
          Reset Camera
        </button>
      </div>

      {/* Center Focus Core 2D Text Overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex flex-col items-center justify-center text-center">
        <span className="text-xl sm:text-2xl font-black text-[#F3FFF9] font-mono tracking-tight drop-shadow-[0_0_15px_#00D68F]">
          {totalCompletedHours.toFixed(1)}h
        </span>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#64FFCA] font-bold">
          Focus Core
        </span>
      </div>

      {/* Interactive 3D Holographic Tooltip HUD for Hovered Planet */}
      {hoveredPlanet && (
        <div
          className="absolute z-30 pointer-events-none transition-transform duration-75"
          style={{
            left: hoveredPlanet.screenX,
            top: hoveredPlanet.screenY,
            transform: 'translate(-50%, -125%)',
          }}
        >
          <div className="px-3.5 py-2.5 rounded-xl bg-[#0D1713]/95 backdrop-blur-xl border border-[rgba(100,255,202,0.35)] shadow-[0_10px_30px_rgba(0,0,0,0.85)] flex flex-col gap-1.5 min-w-[190px]">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                style={{
                  backgroundColor: hoveredPlanet.subject.color,
                  boxShadow: `0 0 8px ${hoveredPlanet.subject.color}`,
                }}
              />
              <span className="text-xs font-bold text-[#F3FFF9] tracking-tight truncate max-w-[150px]">
                {hoveredPlanet.subject.name}
              </span>
              <span className="ml-auto text-[10px] font-mono text-[#64FFCA] font-bold">
                {hoveredPlanet.progressPct}%
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#91A69B] font-mono border-t border-[rgba(100,255,202,0.1)] pt-1">
              <span>Verified: <strong className="text-[#F3FFF9]">{hoveredPlanet.subject.completedHours}h</strong></span>
              <span>Pending: <strong className="text-[#64FFCA]">{hoveredPlanet.pendingTasks}</strong></span>
            </div>

            <span className="text-[9px] text-[#64FFCA]/80 font-mono tracking-wide text-center pt-0.5">
              Click planet to view details & launch sprint
            </span>
          </div>
        </div>
      )}

      {/* Bottom Hint */}
      <div className="absolute bottom-3 left-4 z-20 pointer-events-none text-[11px] font-mono text-[#91A69B]/80 flex items-center gap-3">
        <span>Drag to orbit 3D camera · Scroll to zoom</span>
        <span>·</span>
        <span className="text-[#64FFCA]">Click planet to inspect</span>
      </div>
    </div>
  );
};
