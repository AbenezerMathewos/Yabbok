"use client";

import React, { useEffect, useState } from "react";
import { fetchModerationQueue, moderateContent, fetchReports, updateReport } from "@/frontend/lib/api/adminApi";
import { AlertTriangle, Flag, Loader2 } from "lucide-react";

interface AdminModerationQueueProps {
  currentUserRole: string;
}

export function AdminModerationQueue({ currentUserRole }: AdminModerationQueueProps) {
  const [moderationItems, setModerationItems] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [modData, reportData] = await Promise.all([
        fetchModerationQueue({ status: "pending" }),
        fetchReports(),
      ]);
      setModerationItems(modData as any[]);
      setReports(reportData as any[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleModerateContent = async (type: string, id: string, status: "approved" | "rejected" | "archived") => {
    if ((type === "gallery" || type === "sermons") && status === "approved" && currentUserRole !== "super_admin") {
      alert("Only Super Admin may approve gallery and sermon content.");
      return;
    }

    const note = status === "approved" ? "" : prompt("Optional moderation note") || "";
    try {
      await moderateContent({ type, id, status, note });
      loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Moderation update failed.");
    }
  };

  const handleUpdateReport = async (reportId: string, status: "reviewing" | "resolved" | "dismissed") => {
    const resolutionNote = status === "reviewing" ? "" : prompt("Resolution note") || "";
    try {
      await updateReport(reportId, status, resolutionNote);
      loadData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Report update failed.");
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
    <div className="space-y-8">
      {/* Pending Content Moderation */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
        <h3 className="font-extrabold text-base mb-4 flex items-center gap-2">
          <AlertTriangle className="text-amber-500" size={18} />
          <span>Pending Content Moderation</span>
        </h3>

        <div className="space-y-4">
          {moderationItems.map((entry: any) => (
            <div key={`${entry.type}-${entry.item._id}`} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/60 flex justify-between items-start gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2 items-center text-[10px] uppercase font-bold text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-gold-500/10 text-gold-600">{entry.type}</span>
                  <span>{entry.item.user?.name || entry.item.uploadedBy?.name || entry.item.organizer?.name || "Unknown submitter"}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-950 dark:text-white mt-2 line-clamp-1">
                  {entry.item.title || entry.item.category || "Prayer Request"}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-3">
                  {entry.item.content || entry.item.description || entry.item.location || "No preview available."}
                </p>
              </div>

              <div className="flex flex-col gap-1.5 shrink-0">
                {((entry.type === "gallery" || entry.type === "sermons") && currentUserRole !== "super_admin") ? (
                  <button
                    disabled
                    className="px-3 py-1.5 rounded bg-slate-300 text-slate-600 font-bold text-[10px] uppercase cursor-not-allowed"
                    title="Only Super Admin can approve gallery and sermon content"
                  >
                    Super Admin Only
                  </button>
                ) : (
                  <button
                    onClick={() => handleModerateContent(entry.type, entry.item._id, "approved")}
                    className="px-3 py-1.5 rounded bg-emerald-500 text-white font-bold text-[10px] uppercase hover:bg-emerald-600"
                  >
                    Approve
                  </button>
                )}
                <button
                  onClick={() => handleModerateContent(entry.type, entry.item._id, "rejected")}
                  className="px-3 py-1.5 rounded bg-rose-500 text-white font-bold text-[10px] uppercase hover:bg-rose-600"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
          {moderationItems.length === 0 && (
            <p className="text-xs text-slate-400 italic text-center py-10">
              No content is waiting for moderation.
            </p>
          )}
        </div>
      </div>

      {/* Reported Content Review */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
        <h3 className="font-extrabold text-base mb-4 flex items-center gap-2">
          <Flag className="text-rose-500" size={18} />
          <span>Reported Content Review</span>
        </h3>

        <div className="space-y-4">
          {reports.map((report: any) => (
            <div key={report._id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/60 flex justify-between items-start gap-4">
              <div>
                <div className="flex flex-wrap gap-2 text-[10px] uppercase font-bold text-slate-400">
                  <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-500">{report.status}</span>
                  <span>{report.targetType}</span>
                  <span>Reported by {report.reporter?.name || "Unknown"}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-950 dark:text-white mt-2">{report.reason}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{report.details || "No extra details."}</p>
              </div>

              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  onClick={() => handleUpdateReport(report._id, "reviewing")}
                  className="px-3 py-1.5 rounded bg-amber-500 text-white font-bold text-[10px] uppercase hover:bg-amber-600"
                >
                  Review
                </button>
                <button
                  onClick={() => handleUpdateReport(report._id, "resolved")}
                  className="px-3 py-1.5 rounded bg-emerald-500 text-white font-bold text-[10px] uppercase hover:bg-emerald-600"
                >
                  Resolve
                </button>
                <button
                  onClick={() => handleUpdateReport(report._id, "dismissed")}
                  className="px-3 py-1.5 rounded bg-slate-400 text-white font-bold text-[10px] uppercase hover:bg-slate-500"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
          {reports.length === 0 && (
            <p className="text-xs text-slate-400 italic text-center py-10">
              No reports are currently open.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
