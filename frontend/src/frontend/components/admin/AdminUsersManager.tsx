"use client";

import React, { useEffect, useState } from "react";
import { fetchAdminUsers, updateAdminUser } from "@/frontend/lib/api/adminApi";
import { UserCheck, UserX, Loader2 } from "lucide-react";
import { useLanguage } from "@/frontend/context/LanguageContext";

interface AdminUsersManagerProps {
  currentUserRole: string;
}

export function AdminUsersManager({ currentUserRole }: AdminUsersManagerProps) {
  const { t } = useLanguage();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminUsers();
      setUsers(data as any[]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserStatusUpdate = async (userId: string, status: string) => {
    try {
      await updateAdminUser(userId, { status });
      fetchUsers();
    } catch (error) {
      alert(error instanceof Error ? error.message : "User status update failed.");
    }
  };

  const handleUserRoleUpdate = async (userId: string, role: string) => {
    try {
      await updateAdminUser(userId, { role });
      fetchUsers();
    } catch (error) {
      alert(error instanceof Error ? error.message : "User role update failed.");
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
        Fellowship Member List & Approvals
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-slate-500 dark:text-slate-400">
          <thead className="bg-slate-50 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-700 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3">Member Name</th>
              <th className="px-4 py-3">Email / Phone</th>
              <th className="px-4 py-3">Church Branch</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map((member: any) => (
              <tr key={member._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                  {member.name}
                </td>
                <td className="px-4 py-3">
                  <div>{member.email}</div>
                  <div className="text-[10px] text-slate-400">{member.phone}</div>
                </td>
                <td className="px-4 py-3">
                  <div>{member.churchId?.name || "KHC General"}</div>
                  <div className="text-[10px] text-slate-400">{member.churchBranch}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                    member.status === "active" 
                      ? "bg-emerald-500/10 text-emerald-500" 
                      : member.status === "pending" 
                      ? "bg-amber-500/10 text-amber-500 animate-pulse"
                      : "bg-red-500/10 text-red-500"
                  }`}>
                    {member.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold text-[10px] tracking-wider uppercase">
                  {currentUserRole === "super_admin" ? (
                    <select
                      value={member.role}
                      onChange={(e) => handleUserRoleUpdate(member._id, e.target.value)}
                      className="border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-900 rounded p-1 text-[10px]"
                    >
                      {["visitor", "member", "youth_leader", "church_leader", "moderator", "admin", "super_admin"].map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  ) : (
                    member.role
                  )}
                </td>
                <td className="px-4 py-3 text-right flex gap-1 justify-end">
                  {member.status !== "active" && (
                    <button
                      onClick={() => handleUserStatusUpdate(member._id, "active")}
                      className="p-1 rounded bg-emerald-500 hover:bg-emerald-600 text-white"
                      title={t("btnApproveUser")}
                    >
                      <UserCheck size={14} />
                    </button>
                  )}
                  {member.status !== "suspended" && (
                    <button
                      onClick={() => handleUserStatusUpdate(member._id, "suspended")}
                      className="p-1 rounded bg-rose-500 hover:bg-rose-600 text-white"
                      title={t("btnSuspendUser")}
                    >
                      <UserX size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
