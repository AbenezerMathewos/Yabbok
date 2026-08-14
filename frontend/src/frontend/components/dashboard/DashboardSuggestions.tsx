"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/frontend/context/LanguageContext";

export function DashboardSuggestions() {
  const { t } = useLanguage();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [newSuggestion, setNewSuggestion] = useState({ title: "", content: "", category: "Fellowship Idea" });

  const fetchSuggestions = () => {
    fetch("/api/suggestions")
      .then((res) => res.json())
      .then((data) => setSuggestions(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleCreateSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuggestion.title || !newSuggestion.content) return;

    const res = await fetch("/api/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSuggestion),
    });

    if (res.ok) {
      setNewSuggestion({ title: "", content: "", category: "Fellowship Idea" });
      fetchSuggestions();
    }
  };

  return (
    <div className="space-y-6">
      {/* Create suggestion */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
        <form onSubmit={handleCreateSuggestion} className="space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            💡 Submit a Suggestion or Idea
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <input
                type="text"
                required
                placeholder="Enter Suggestion Title..."
                value={newSuggestion.title}
                onChange={(e) => setNewSuggestion({ ...newSuggestion, title: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-xs"
              />
            </div>
            <div>
              <select
                value={newSuggestion.category}
                onChange={(e) => setNewSuggestion({ ...newSuggestion, category: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-xs"
              >
                {["Fellowship Idea", "Ministry Suggestion", "Improvement", "Other"].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <textarea
            required
            rows={3}
            placeholder={t("suggestionPlaceholder")}
            value={newSuggestion.content}
            onChange={(e) => setNewSuggestion({ ...newSuggestion, content: e.target.value })}
            className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-xs resize-none"
          />

          <button type="submit" className="px-6 py-2 bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold rounded-xl text-xs">
            Submit Idea
          </button>
        </form>
      </div>

      {/* Suggestion list */}
      <div className="space-y-4">
        {suggestions.map((sug: any) => (
          <div key={sug._id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                  {sug.category}
                </span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                  sug.status === "approved" 
                    ? "bg-emerald-500/10 text-emerald-500" 
                    : sug.status === "archived" 
                    ? "bg-slate-100 text-slate-400" 
                    : "bg-gold-500/10 text-gold-600 dark:text-gold-400 animate-pulse"
                }`}>
                  Status: {sug.status}
                </span>
              </div>

              <h4 className="font-extrabold text-sm text-slate-950 dark:text-white mt-3">
                {sug.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                {sug.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
