"use client";

import React, { useEffect, useState } from "react";
import { fetchAuditLogs } from "@/frontend/lib/api/adminApi";
import { Shield, Loader2 } from "lucide-react";
import { useLanguage } from "@/frontend/context/LanguageContext";

export function AdminAuditLogs() {
  const { language } = useLanguage();
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchAuditLogs()
      .then((data) => setAuditLogs(data as any[]))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/60">
        <Loader2 className="animate-spin text-gold-500" size={24} />
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
      <h3 className="font-extrabold text-base mb-4 flex items-center gap-2">
        <Shield className="text-gold-500 animate-pulse" size={18} />
        <span>System Administration Audit Logs</span>
      </h3>

      <div className="space-y-3">
        {auditLogs.map((log: any) => (
          <div key={log._id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 text-xs">
            <div className="flex justify-between items-start gap-4 text-slate-400">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Action: {log.action}
              </span>
              <span>
                {new Date(log.createdAt).toLocaleString(language)}
              </span>
            </div>
            <p className="text-xs mt-2 text-slate-500 dark:text-slate-400">
              {log.details}
            </p>
            <div className="text-[10px] text-slate-400 mt-2 font-medium">
              Actor: {log.actor?.name} ({log.actor?.email}) — IP: {log.ipAddress || "127.0.0.1"}
            </div>
          </div>
        ))}
        {auditLogs.length === 0 && (
          <p className="text-xs text-slate-400 italic text-center py-10">
            No administrative audit events recorded yet.
          </p>
        )}
      </div>
    </div>
  );
}
