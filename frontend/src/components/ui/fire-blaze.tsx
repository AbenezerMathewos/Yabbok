"use client";

import React, { useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { AdditiveBlending } from "three";

// 1. Extreme Organic Licking Flames (GLSL Shader)
function LickingFlames() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    }
  });

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    varying vec2 vUv;

    vec2 hash( vec2 p ) {
      p = vec2( dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)) );
      return -1.0 + 2.0*fract(sin(p)*43758.5453123);
    }
    
    float noise( in vec2 p ) {
      const float K1 = 0.366025404; 
      const float K2 = 0.211324865;
      vec2 i = floor( p + (p.x+p.y)*K1 );
      vec2 a = p - i + (i.x+i.y)*K2;
      vec2 o = (a.x>a.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
      vec2 b = a - o + K2;
      vec2 c = a - 1.0 + 2.0*K2;
      vec3 h = max( 0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );
      vec3 n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));
      return dot( n, vec3(70.0) );
    }
    
    float fbm(vec2 uv) {
      float f = 0.0;
      mat2 m = mat2( 1.6,  1.2, -1.2,  1.6 );
      f  = 0.5000*noise( uv ); uv = m*uv;
      f += 0.2500*noise( uv ); uv = m*uv;
      f += 0.1250*noise( uv ); uv = m*uv;
      f += 0.0625*noise( uv ); uv = m*uv;
      return f;
    }
    
    void main() {
      vec2 uv = vUv;
      
      vec2 q = uv;
      // Thicker, more aggressive flames
      q.x *= 2.5; 
      q.y *= 1.2; 
      // Faster upward movement
      q.y -= uTime * 3.5; 
      
      float n = fbm(q);
      
      // Less aggressive falloff so flames reach much higher
      float flameShape = n - (uv.y * uv.y * 0.4);
      flameShape = clamp(flameShape, 0.0, 1.0);
      
      // Extreme color intensity (values > 1.0 for blooming)
      vec3 col = vec3(2.5, 0.1, 0.0) * flameShape * 2.0; // Deep crimson base
      col = mix(col, vec3(2.5, 0.8, 0.0), smoothstep(0.1, 0.5, flameShape)); // Scorching orange
      col = mix(col, vec3(3.0, 2.0, 0.5), smoothstep(0.6, 0.9, flameShape)); // Blinding white/yellow core
      
      // Sharper alpha edge for more solid looking fire
      float alpha = smoothstep(0.0, 0.1, flameShape);
      
      gl_FragColor = vec4(col, alpha);
    }
  `;

  return (
    <mesh position={[0, 0, 0]}>
      <planeGeometry args={[viewport.width, viewport.height * 1.5]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{ uTime: { value: 0 } }}
        transparent={true}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

// 2. High-Velocity Embers
function Embers() {
  const count = 400; // 4x more embers
  const mesh = useRef<THREE.InstancedMesh>(null);
  
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 20;
      const z = (Math.random() - 0.5) * 5;
      const factor = Math.random() * 0.8 + 0.2;
      // Faster embers
      const speed = Math.random() * 0.15 + 0.05;
      temp.push({ x, y, z, factor, speed });
    }
    return temp;
  }, [count]);

  useFrame(() => {
    particles.forEach((particle, i) => {
      let { x, y, z, factor, speed } = particle;
      
      y += speed;
      x += Math.sin(y * factor) * 0.04; // more aggressive wiggling
      
      if (y > 10) {
        y = -10;
        x = (Math.random() - 0.5) * 20;
      }
      
      particle.x = x;
      particle.y = y;
      
      dummy.position.set(x, y, z);
      const scale = Math.max(0.1, Math.sin(Date.now() * 0.005 * factor) * 0.8 + 0.5);
      dummy.scale.set(scale, scale, scale);
      
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current!.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.06, 8, 8]} />
      <meshBasicMaterial color="#ff4400" blending={AdditiveBlending} transparent opacity={0.9} />
    </instancedMesh>
  );
}

export function FireBlazeBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-black">
      {/* Intense animated gradient simulating heat glow */}
      <motion.div 
        animate={{
          background: [
            "radial-gradient(circle at 50% 120%, rgba(255, 20, 0, 0.6) 0%, rgba(0,0,0,0) 80%)",
            "radial-gradient(circle at 50% 120%, rgba(255, 90, 0, 0.7) 0%, rgba(0,0,0,0) 90%)",
            "radial-gradient(circle at 50% 120%, rgba(255, 20, 0, 0.6) 0%, rgba(0,0,0,0) 80%)"
          ]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 z-0 opacity-100 mix-blend-screen"
      />
      
      {/* 3D Render Layer */}
      <div className="absolute inset-0 z-10">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <LickingFlames />
          <Embers />
        </Canvas>
      </div>

      {/* Reduced Vignette so fire isn't hidden */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-black/20 to-black/80 z-20" />
    </div>
  );
}