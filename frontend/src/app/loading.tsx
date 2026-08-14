import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-24 min-h-screen">
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-12 w-2/3 bg-slate-800/50 rounded-2xl" />
        <Skeleton className="h-4 w-1/3 bg-slate-800/50 rounded-xl" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="p-6 rounded-3xl border border-slate-800/50 bg-slate-900/20 space-y-4">
              <Skeleton className="h-40 w-full bg-slate-800/50 rounded-2xl" />
              <Skeleton className="h-6 w-3/4 bg-slate-800/50 rounded-lg" />
              <Skeleton className="h-4 w-full bg-slate-800/50 rounded-lg" />
              <Skeleton className="h-4 w-5/6 bg-slate-800/50 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
