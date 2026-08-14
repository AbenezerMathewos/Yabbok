"use client";

import React, { useEffect, useState } from "react";
import {
  approveChurchChange,
  createChurch,
  deleteChurch,
  fetchChurches,
  rejectChurchChange,
  updateChurch,
} from "@/frontend/lib/api/churchesApi";
import { PlusCircle, Trash, CheckCircle, Loader2 } from "lucide-react";
import { StatusBadge } from "@/frontend/components/shared/StatusBadge";
import { EmptyState } from "@/frontend/components/shared/EmptyState";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { firstInvalid, requiredText } from "@/frontend/lib/validation/forms";

interface AdminChurchesManagerProps {
  canApproveChurches: boolean;
  canManageChurches: boolean;
}

export function AdminChurchesManager({ canApproveChurches, canManageChurches }: AdminChurchesManagerProps) {
  const { language } = useLanguage();
  const [churches, setChurches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [newChurch, setNewChurch] = useState({ name: "", city: "", region: "", description: "", memberCount: 0 });
  const [editingChurchId, setEditingChurchId] = useState<string | null>(null);
  const [churchSearch, setChurchSearch] = useState("");
  const [churchStatusFilter, setChurchStatusFilter] = useState("all");
  const [churchSuccess, setChurchSuccess] = useState(false);
  const [churchError, setChurchError] = useState("");

  const loadChurches = async () => {
    setLoading(true);
    try {
      const data = await fetchChurches({ includeAll: true });
      setChurches(data as any[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChurches();
  }, []);

  const handleCreateChurch = async (e: React.FormEvent) => {
    e.preventDefault();
    setChurchSuccess(false);
    setChurchError("");

    if (!canManageChurches) {
      setChurchError("Only Admin and Super Admin can manage church branches.");
      return;
    }

    const validationMessage = firstInvalid(
      requiredText(newChurch.name, "Church name"),
      requiredText(newChurch.city, "City"),
      requiredText(newChurch.region, "Region"),
      requiredText(newChurch.description, "Description")
    );

    if (validationMessage) {
      setChurchError(validationMessage);
      return;
    }

    try {
      if (editingChurchId) {
        await updateChurch(editingChurchId, newChurch);
      } else {
        await createChurch(newChurch);
      }
      setNewChurch({ name: "", city: "", region: "", description: "", memberCount: 0 });
      setEditingChurchId(null);
      setChurchSuccess(true);
      loadChurches();
    } catch (error) {
      setChurchError(error instanceof Error ? error.message : "Church save failed.");
    }
  };

  const handleEditChurch = (church: any) => {
    const draft = church.pendingAction === "update" && church.pendingChanges ? church.pendingChanges : church;
    setEditingChurchId(church._id);
    setNewChurch({
      name: draft.name || "",
      city: draft.city || "",
      region: draft.region || "",
      description: draft.description || "",
      memberCount: draft.memberCount ?? church.memberCount ?? 0,
    });
    setChurchSuccess(false);
    setChurchError("");
  };

  const handleCancelChurchEdit = () => {
    setEditingChurchId(null);
    setNewChurch({ name: "", city: "", region: "", description: "", memberCount: 0 });
    setChurchError("");
  };

  const handleApproveChurchChange = async (churchId: string, action: "approve" | "reject") => {
    try {
      if (action === "approve") {
        await approveChurchChange(churchId);
      } else {
        await rejectChurchChange(churchId);
      }
      loadChurches();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Church approval update failed.");
    }
  };

  const handleDeleteChurch = async (churchId: string) => {
    const message = canApproveChurches
      ? "Archive this church branch now?"
      : "Request deletion for this church branch? Super Admin approval will be required.";
    if (!confirm(message)) return;

    try {
      await deleteChurch(churchId);
      loadChurches();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Church delete failed.");
    }
  };

  const filteredChurches = churches.filter((church: any) => {
    const draft = church.pendingAction === "update" && church.pendingChanges ? church.pendingChanges : church;
    const query = churchSearch.trim().toLowerCase();
    const matchesSearch =
      !query ||
      draft.name?.toLowerCase().includes(query) ||
      draft.city?.toLowerCase().includes(query) ||
      draft.region?.toLowerCase().includes(query);
    const matchesStatus =
      churchStatusFilter === "all" ||
      church.status === churchStatusFilter ||
      church.pendingAction === churchStatusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/60">
        <Loader2 className="animate-spin text-gold-500" size={24} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Add church form */}
      <div className="lg:col-span-1 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm h-fit">
        <h3 className="font-extrabold text-sm mb-4 uppercase tracking-wider flex items-center gap-1.5 text-gold-500">
          <PlusCircle size={18} />
          <span>{editingChurchId ? "Edit Church Branch" : "Add New Church Branch"}</span>
        </h3>
        {churchSuccess && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold text-center">
            {canApproveChurches ? "Church saved and verified." : "Church change submitted for Super Admin approval."}
          </div>
        )}
        {churchError && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs font-semibold text-center">
            {churchError}
          </div>
        )}
        <form onSubmit={handleCreateChurch} className="space-y-4 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Church Name</label>
            <input
              type="text"
              required
              value={newChurch.name}
              onChange={(e) => setNewChurch({ ...newChurch, name: e.target.value })}
              placeholder="e.g. Adama KHC"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">City</label>
            <input
              type="text"
              required
              value={newChurch.city}
              onChange={(e) => setNewChurch({ ...newChurch, city: e.target.value })}
              placeholder="e.g. Adama"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Region</label>
            <input
              type="text"
              required
              value={newChurch.region}
              onChange={(e) => setNewChurch({ ...newChurch, region: e.target.value })}
              placeholder="e.g. Oromia"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description</label>
            <textarea
              rows={3}
              required
              value={newChurch.description}
              onChange={(e) => setNewChurch({ ...newChurch, description: e.target.value })}
              className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Member Count</label>
            <input
              type="number"
              min="0"
              value={newChurch.memberCount}
              onChange={(e) => setNewChurch({ ...newChurch, memberCount: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold rounded-xl"
          >
            {editingChurchId ? "Save Church Changes" : "Save Church Profile"}
          </button>
          {editingChurchId && (
            <button
              type="button"
              onClick={handleCancelChurchEdit}
              className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl"
            >
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      {/* Right: Church lists */}
      <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="font-extrabold text-sm uppercase tracking-wider">
            Church Directory Approval Queue
          </h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="search"
              value={churchSearch}
              onChange={(e) => setChurchSearch(e.target.value)}
              placeholder="Search churches..."
              className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-xs"
            />
            <select
              value={churchStatusFilter}
              onChange={(e) => setChurchStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-xs"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="create">Pending create</option>
              <option value="update">Pending update</option>
              <option value="delete">Pending delete</option>
            </select>
          </div>
        </div>
        <div className="space-y-3">
          {filteredChurches.map((church: any) => {
            const pending = church.pendingAction;
            const draft = pending === "update" && church.pendingChanges ? church.pendingChanges : church;

            return (
              <div key={church._id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/60 text-xs">
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-white">{draft.name}</h4>
                      <StatusBadge label={church.status} tone={church.status === "verified" ? "success" : "warning"} />
                      {pending && <StatusBadge label={`Pending ${pending}`} tone="info" />}
                    </div>
                    <span className="text-[10px] text-slate-400">Location: {draft.city}, {draft.region}</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                      {draft.description}
                    </p>
                    {pending && (
                      <p className="text-[10px] text-slate-400 mt-2">
                        Submitted by {church.submittedBy?.name || "Admin"} for Super Admin approval.
                      </p>
                    )}
                    {church.verifiedBy?.name && (
                      <p className="text-[10px] text-slate-400 mt-1">
                        Last approved by {church.verifiedBy.name}
                        {church.verifiedAt ? ` on ${new Date(church.verifiedAt).toLocaleDateString(language)}` : ""}.
                      </p>
                    )}
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0">
                    {draft.memberCount ?? church.memberCount} Members
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-800/70 flex flex-wrap gap-2 justify-end">
                  <button
                    onClick={() => handleEditChurch(church)}
                    className="px-3 py-1.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-[10px] uppercase hover:bg-gold-500 hover:text-slate-950"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteChurch(church._id)}
                    className="px-3 py-1.5 rounded bg-rose-500 text-white font-bold text-[10px] uppercase hover:bg-rose-600 inline-flex items-center gap-1"
                  >
                    <Trash size={11} />
                    <span>{canApproveChurches ? "Archive" : "Request Delete"}</span>
                  </button>
                  {canApproveChurches && pending && (
                    <>
                      <button
                        onClick={() => handleApproveChurchChange(church._id, "approve")}
                        className="px-3 py-1.5 rounded bg-emerald-500 text-white font-bold text-[10px] uppercase hover:bg-emerald-600 inline-flex items-center gap-1"
                      >
                        <CheckCircle size={11} />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleApproveChurchChange(church._id, "reject")}
                        className="px-3 py-1.5 rounded bg-slate-300 text-slate-700 font-bold text-[10px] uppercase hover:bg-slate-400"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
          {churches.length === 0 && (
            <EmptyState title="No church branches have been submitted yet." />
          )}
          {churches.length > 0 && filteredChurches.length === 0 && (
            <EmptyState title="No churches match those filters." description="Try another search or status." />
          )}
        </div>
      </div>
    </div>
  );
}
