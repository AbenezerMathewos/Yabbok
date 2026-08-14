import React from "react";
import { cn } from "@/lib/utils";

interface InfiniteMarqueeProps {
  items: string[];
  className?: string;
  speed?: "fast" | "normal" | "slow";
}

export function InfiniteMarquee({ items, className, speed = "normal" }: InfiniteMarqueeProps) {
  const speedClass = 
    speed === "fast" ? "animate-marquee-fast" :
    speed === "slow" ? "animate-marquee-slow" : 
    "animate-marquee";

  return (
    <div className={cn("relative flex overflow-hidden w-full border-y border-slate-800/50 bg-slate-950 py-4", className)}>
      <div className={cn("flex whitespace-nowrap will-change-transform", speedClass)}>
        {[...Array(2)].map((_, arrayIndex) => (
          <div key={arrayIndex} className="flex shrink-0 items-center justify-around px-4">
            {items.map((item, i) => (
              <React.Fragment key={i}>
                <span className="mx-8 text-sm md:text-base font-black tracking-widest uppercase text-gold-500/80">
                  {item}
                </span>
                <span className="mx-4 text-slate-800">✦</span>
              </React.Fragment>
            ))}
          </div>
        ))}
      </div>
      
      {/* CSS injected directly for portability, ideally add to tailwind config */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee { animation: marquee 30s linear infinite; }
        .animate-marquee-fast { animation: marquee 15s linear infinite; }
        .animate-marquee-slow { animation: marquee 50s linear infinite; }
      `}} />
    </div>
  );
}
