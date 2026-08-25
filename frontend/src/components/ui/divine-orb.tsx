"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Sphere, Float, Environment } from "@react-three/drei";
import { useTheme } from "next-themes";
import * as THREE from "three";

function AnimatedOrb() {
  const sphereRef = useRef<THREE.Mesh>(null);
  const { resolvedTheme } = useTheme();
  
  const isDark = resolvedTheme === "dark";

  useFrame((state) => {
    if (sphereRef.current) {
      // Gentle floating rotation
      sphereRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      sphereRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
      <Sphere ref={sphereRef} args={[1, 100, 100]} scale={1.8}>
        <MeshDistortMaterial
          color={isDark ? "#fbbf24" : "#d97706"}
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.1}
          metalness={0.8}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={2}
        />
      </Sphere>
    </Float>
  );
}

export function DivineOrb() {
  return (
    <div className="absolute right-0 top-0 w-64 h-64 md:w-96 md:h-96 pointer-events-none opacity-80 md:opacity-100 z-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <directionalLight position={[-10, -10, -5]} color="#f59e0b" intensity={0.5} />
        <Environment preset="sunset" />
        <AnimatedOrb />
      </Canvas>
    </div>
  );
}