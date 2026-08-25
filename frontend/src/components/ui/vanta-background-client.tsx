"use client";

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
// @ts-ignore
import DOTS from 'vanta/dist/vanta.dots.min';
import { motion } from 'framer-motion';

export function VantaBackgroundClient() {
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const vantaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!vantaEffect && vantaRef.current) {
      try {
        setVantaEffect(
          DOTS({
            el: vantaRef.current,
            THREE: THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: true,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0xff8820,
            color2: 0xff8820,
            backgroundColor: 0x020617,
            size: 3,
            spacing: 35,
            showLines: true
          })
        );
      } catch (e) {
        console.error("Vanta effect initialization failed", e);
      }
    }
    
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-slate-950 opacity-70">
      <div ref={vantaRef} className="absolute inset-0" />
      
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[700px] md:h-[700px] pointer-events-none mix-blend-screen"
        animate={{ rotateZ: 360, rotateX: [65, 80, 65], rotateY: [5, 25, 5] }}
        transition={{ 
          rotateZ: { duration: 40, repeat: Infinity, ease: "linear" },
          rotateX: { duration: 15, repeat: Infinity, ease: "easeInOut" },
          rotateY: { duration: 25, repeat: Infinity, ease: "easeInOut" }
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full opacity-90 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">
          <path id="textCircleInner" d="M 100, 100 m -60, 0 a 60,60 0 1,1 120,0 a 60,60 0 1,1 -120,0" fill="none" />
          <text className="text-[10px] md:text-[12px] font-black tracking-[0.25em] fill-gold-400">
            <textPath href="#textCircleInner" startOffset="0%">
              ያቦቅ • YABBOK • ያቦቅ • YABBOK • ያቦቅ • YABBOK • 
            </textPath>
          </text>
        </svg>
      </motion.div>

      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] md:w-[950px] md:h-[950px] pointer-events-none mix-blend-screen"
        animate={{ rotateZ: -360, rotateX: [75, 55, 75], rotateY: [-15, 10, -15] }}
        transition={{ 
          rotateZ: { duration: 60, repeat: Infinity, ease: "linear" },
          rotateX: { duration: 20, repeat: Infinity, ease: "easeInOut" },
          rotateY: { duration: 30, repeat: Infinity, ease: "easeInOut" }
        }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full opacity-50 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
          <path id="textCircleOuter" d="M 100, 100 m -70, 0 a 70,70 0 1,1 140,0 a 70,70 0 1,1 -140,0" fill="none" />
          <text className="text-[6px] md:text-[8px] font-bold uppercase tracking-[0.3em] fill-white/80">
            <textPath href="#textCircleOuter" startOffset="0%">
              KALE HIYWET YOUTH FELLOWSHIP • KALE HIYWET YOUTH FELLOWSHIP • 
            </textPath>
          </text>
        </svg>
      </motion.div>
    </div>
  );
}