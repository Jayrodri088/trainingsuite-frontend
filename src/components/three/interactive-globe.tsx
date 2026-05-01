"use client";

import { useRef, useState, useMemo, useEffect, Suspense } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

const ROTATION_SENSITIVITY = 0.012;
const MIN_CAMERA_Z = 3.5;
const MAX_CAMERA_Z = 7;

// Orbiting text ring – sits on the globe's equatorial plane, rotates on its own
// world-Y axis so dragging the globe never disturbs it. The text reads from
// outside the sphere, and characters behind the globe are naturally occluded
// by the sphere's depth buffer, producing a true 3D "orbiting banner" effect.
const ORBIT_TEXT_PHRASE = "WE ARE COVERING THE EARTH WITH OUR MESSENGER ANGEL";
const ORBIT_RADIUS = 1.82;
const ORBIT_FONT_SIZE = 0.15;
const ORBIT_SPEED = 0.22;
const ORBIT_COLOR = "#0052CC";
const ORBIT_LOGO_SIZE = 0.46;
const ORBIT_CHAR_ARC = 0.122;
const ORBIT_TEXT_LOGO_GAP = 0.22;
const ORBIT_LOGO_URL = "/logo-3d.png";

export interface GlobeControlsRef {
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  isDragging: boolean;
  prevClientX: number;
  prevClientY: number;
  cameraZ: number;
  pinchStartZ: number;
  pinchStartDistance: number;
}

interface GlobeMeshProps {
  controlsRef: React.RefObject<GlobeControlsRef>;
}

function GlobeMesh({ controlsRef }: GlobeMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const texture = useLoader(
    THREE.TextureLoader,
    "https://unpkg.com/three-globe@2.31.1/example/img/earth-blue-marble.jpg"
  );

  useFrame((_state, delta) => {
    if (!meshRef.current || !controlsRef.current) return;
    const c = controlsRef.current;

    meshRef.current.rotation.x = c.rotationX;
    meshRef.current.rotation.y = c.rotationY;
    meshRef.current.rotation.z = c.rotationZ;

    if (!c.isDragging) {
      c.rotationY -= delta * ORBIT_SPEED;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.35, 64, 64]} />
      <meshStandardMaterial map={texture} transparent opacity={0.85} />
    </mesh>
  );
}

function GlobeGlow() {
  return (
    <mesh>
      <sphereGeometry args={[1.42, 64, 64]} />
      <meshBasicMaterial
        color="#0052CC"
        transparent
        opacity={0.08}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

function OrbitingTextRing() {
  const groupRef = useRef<THREE.Group>(null);
  const chars = useMemo(() => Array.from(ORBIT_TEXT_PHRASE), []);

  // Angular sizes on the ring (radians). Each piece is positioned along the
  // circle by its arc length divided by the radius.
  const charStep = ORBIT_CHAR_ARC / ORBIT_RADIUS;
  const logoHalfArc = ORBIT_LOGO_SIZE / 2 / ORBIT_RADIUS;
  const gapStep = ORBIT_TEXT_LOGO_GAP / ORBIT_RADIUS;

  // Start with the logo at the front (+Z) so it greets the viewer first; the
  // text trails to the right and around the back from there.
  const baseAngle = Math.PI / 2;

  const logoTexture = useLoader(THREE.TextureLoader, ORBIT_LOGO_URL);

  useEffect(() => {
    logoTexture.colorSpace = THREE.SRGBColorSpace;
    logoTexture.anisotropy = 8;
    logoTexture.needsUpdate = true;
  }, [logoTexture]);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y -= delta * ORBIT_SPEED;
  });

  const logoX = Math.cos(baseAngle) * ORBIT_RADIUS;
  const logoZ = Math.sin(baseAngle) * ORBIT_RADIUS;
  const logoRotY = Math.PI / 2 - baseAngle;

  return (
    <group ref={groupRef}>
      {/* Project logo – sits at the head of the orbiting banner */}
      <mesh position={[logoX, 0, logoZ]} rotation={[0, logoRotY, 0]}>
        <planeGeometry args={[ORBIT_LOGO_SIZE, ORBIT_LOGO_SIZE]} />
        <meshBasicMaterial
          map={logoTexture}
          transparent
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* Single line of orbiting text, one character per slot */}
      {chars.map((char, i) => {
        const angle = baseAngle - (logoHalfArc + gapStep + (i + 0.5) * charStep);
        const x = Math.cos(angle) * ORBIT_RADIUS;
        const z = Math.sin(angle) * ORBIT_RADIUS;
        const rotY = Math.PI / 2 - angle;
        return (
          <Text
            key={i}
            position={[x, 0, z]}
            rotation={[0, rotY, 0]}
            fontSize={ORBIT_FONT_SIZE}
            color={ORBIT_COLOR}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.006}
            outlineColor="#ffffff"
            outlineOpacity={0.9}
            material-toneMapped={false}
          >
            {char}
          </Text>
        );
      })}
    </group>
  );
}

function CameraZoomSync({
  controlsRef,
}: {
  controlsRef: React.RefObject<GlobeControlsRef>;
}) {
  const { camera } = useThree();
  useFrame(() => {
    if (!controlsRef.current) return;
    camera.position.setZ(controlsRef.current.cameraZ);
  });
  return null;
}

function Scene({
  controlsRef,
}: {
  controlsRef: React.RefObject<GlobeControlsRef>;
}) {
  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 3, 5]} intensity={0.8} />
      <GlobeMesh controlsRef={controlsRef} />
      <GlobeGlow />
      <OrbitingTextRing />
      <CameraZoomSync controlsRef={controlsRef} />
    </>
  );
}

interface InteractiveGlobeProps {
  className?: string;
}

export function InteractiveGlobe({ className }: InteractiveGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const controlsRef = useRef<GlobeControlsRef>({
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    isDragging: false,
    prevClientX: 0,
    prevClientY: 0,
    cameraZ: 5,
    pinchStartZ: 5,
    pinchStartDistance: 0,
  });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    controlsRef.current.isDragging = true;
    setIsDragging(true);
    controlsRef.current.prevClientX = e.clientX;
    controlsRef.current.prevClientY = e.clientY;
    containerRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!controlsRef.current.isDragging) return;
    const c = controlsRef.current;
    const deltaX = e.clientX - c.prevClientX;
    const deltaY = e.clientY - c.prevClientY;
    c.rotationY += deltaX * ROTATION_SENSITIVITY;
    c.rotationX += deltaY * ROTATION_SENSITIVITY;
    c.rotationX = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, c.rotationX)
    );
    c.prevClientX = e.clientX;
    c.prevClientY = e.clientY;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    controlsRef.current.isDragging = false;
    setIsDragging(false);
    if (containerRef.current)
      containerRef.current.releasePointerCapture(e.pointerId);
  };

  const handlePointerLeave = () => {
    controlsRef.current.isDragging = false;
    setIsDragging(false);
  };

  const getTouchDistance = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const a = touches[0];
    const b = touches[1];
    return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      controlsRef.current.pinchStartDistance = getTouchDistance(e.touches);
      controlsRef.current.pinchStartZ = controlsRef.current.cameraZ;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (
      e.touches.length === 2 &&
      controlsRef.current.pinchStartDistance > 0
    ) {
      e.preventDefault();
      const currentDist = getTouchDistance(e.touches);
      const scale =
        controlsRef.current.pinchStartDistance / currentDist;
      const newZ = controlsRef.current.pinchStartZ * scale;
      controlsRef.current.cameraZ = Math.max(
        MIN_CAMERA_Z,
        Math.min(MAX_CAMERA_Z, newZ)
      );
    }
  };

  const handleTouchEnd = () => {
    if (controlsRef.current) controlsRef.current.pinchStartDistance = 0;
  };

  return (
    <div
      ref={containerRef}
      role="application"
      aria-label="Interactive 3D globe"
      className={className}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{ touchAction: "none", cursor: isDragging ? "grabbing" : "grab" }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <Scene controlsRef={controlsRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default InteractiveGlobe;
