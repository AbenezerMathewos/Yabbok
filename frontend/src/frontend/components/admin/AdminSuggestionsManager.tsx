"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function AdminSuggestionsManager() {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSuggestions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/suggestions");
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleResolveSuggestion = async (suggestionId: string, status: "approved" | "archived") => {
    try {
      const res = await fetch("/api/suggestions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suggestionId, status }),
      });

      if (res.ok) {
        fetchSuggestions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/60">
        <Loader2 className="animate-spin text-gold-500" size={24} />
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
      <h3 className="font-extrabold text-base mb-4">
        Review Submitted Member Suggestions
      </h3>
      
      <div className="space-y-4">
        {suggestions.map((sug: any) => (
          <div key={sug._id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/60 shadow-sm flex justify-between items-start gap-4">
            <div>
              <div className="flex gap-2 items-center text-xs">
                <span className="font-bold text-slate-900 dark:text-white">
                  {sug.user?.name}
                </span>
                <span className="text-slate-400">({sug.user?.churchBranch || "General"})</span>
                <span className="px-2 py-0.5 rounded bg-gold-500/10 text-gold-600 text-[10px] font-bold">
                  {sug.category}
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-950 dark:text-white mt-2">
                {sug.title}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                {sug.content}
              </p>
            </div>

            {/* Actions */}
            {sug.status === "review" && (
              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  onClick={() => handleResolveSuggestion(sug._id, "approved")}
                  className="px-3 py-1.5 rounded bg-emerald-500 text-white font-bold text-[10px] tracking-wide uppercase hover:bg-emerald-600"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleResolveSuggestion(sug._id, "archived")}
                  className="px-3 py-1.5 rounded bg-slate-350 text-slate-700 font-bold text-[10px] tracking-wide uppercase hover:bg-slate-400"
                >
                  Archive
                </button>
              </div>
            )}
          </div>
        ))}
        {suggestions.length === 0 && (
          <p className="text-xs text-slate-400 italic text-center py-10">
            No active suggestions awaiting review.
          </p>
        )}
      </div>
    </div>
  );
}
