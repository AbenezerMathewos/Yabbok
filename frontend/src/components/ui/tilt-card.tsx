"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

export function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glareOpacity, setGlareOpacity] = useState(0);
  const [glareX, setGlareX] = useState(0);
  const [glareY, setGlareY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation (-10 to 10 degrees)
    const rotX = ((y / rect.height) - 0.5) * -20;
    const rotY = ((x / rect.width) - 0.5) * 20;
    
    setRotateX(rotX);
    setRotateY(rotY);
    
    // Calculate glare position
    setGlareX((x / rect.width) * 100);
    setGlareY((y / rect.height) * 100);
    setGlareOpacity(0.3);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlareOpacity(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative rounded-3xl [transform-style:preserve-3d] ${className}`}
      data-interactive
    >
      <div className="absolute inset-0 z-50 pointer-events-none rounded-3xl overflow-hidden">
        <motion.div
          animate={{ opacity: glareOpacity }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.2) 0%, transparent 60%)`,
          }}
        />
      </div>
      <div className="[transform:translateZ(30px)] h-full w-full">
        {children}
      </div>
    </motion.div>
  );
}
