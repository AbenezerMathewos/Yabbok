"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Hide default cursor globally
    document.body.style.cursor = 'none';
    
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);
    
    const handleElementsHover = () => {
      const interactables = document.querySelectorAll('a, button, input, [data-interactive]');
      
      interactables.forEach((el) => {
        el.addEventListener("mouseenter", () => setIsHovered(true));
        el.addEventListener("mouseleave", () => setIsHovered(false));
      });
      
      // Clean up inline cursor styles from third party components if needed
      const allElements = document.querySelectorAll('*');
      allElements.forEach((el) => {
        if (window.getComputedStyle(el).cursor === 'pointer') {
          (el as HTMLElement).style.cursor = 'none';
        }
      });
    };

    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    
    // Initial binding
    handleElementsHover();
    
    // Observer to bind new elements (useful in React apps)
    const observer = new MutationObserver(handleElementsHover);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      observer.disconnect();
      document.body.style.cursor = 'auto';
    };
  }, [cursorX, cursorY]);

  if (typeof window === "undefined") return null;

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none hidden md:flex items-center justify-center mix-blend-difference"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        opacity: isVisible ? 1 : 0,
      }}
    >
      <motion.div
        animate={{
          width: isHovered ? 48 : 16,
          height: isHovered ? 48 : 16,
          x: "-50%",
          y: "-50%",
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="rounded-full bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.4)]"
      >
        <motion.div 
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0 }}
          className="text-[10px] font-black text-black tracking-widest uppercase"
        >
          Wait
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
