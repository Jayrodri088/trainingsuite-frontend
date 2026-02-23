"use client";

import { useRef, useState, Suspense } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";

const ROTATION_SENSITIVITY = 0.012;
const AUTO_ROTATE_SPEED = 0.06;
const MIN_CAMERA_Z = 3.5;
const MAX_CAMERA_Z = 7;

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
      c.rotationY += delta * AUTO_ROTATE_SPEED;
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

function CameraZoomSync({
  controlsRef,
}: {
  controlsRef: React.RefObject<GlobeControlsRef>;
}) {
  const { camera } = useThree();
  useFrame(() => {
    if (!controlsRef.current) return;
    camera.position.z = controlsRef.current.cameraZ;
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
