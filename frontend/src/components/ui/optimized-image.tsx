"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends Omit<ImageProps, "onLoad"> {
  fallbackBlur?: boolean;
}

export function OptimizedImage({ className, fallbackBlur = true, ...props }: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={cn("overflow-hidden relative bg-slate-900/50", className)}>
      <Image
        {...props}
        className={cn(
          "object-cover duration-700 ease-in-out w-full h-full",
          isLoading ? "scale-110 blur-xl opacity-50" : "scale-100 blur-0 opacity-100"
        )}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}
