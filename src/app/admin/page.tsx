"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { Navbar } from "@/frontend/components/shared/Navbar";
import { Footer } from "@/frontend/components/shared/Footer";
import { EmptyState } from "@/frontend/components/shared/EmptyState";
import { StatusBadge } from "@/frontend/components/shared/StatusBadge";
import {
  fetchAdminStats,
  fetchAdminUsers,
  fetchAnnouncements,
  fetchAuditLogs,
  fetchModerationQueue,
  fetchReports,
  moderateContent,
  sendAnnouncement,
  updateAdminUser,
  updateReport,
} from "@/frontend/lib/api/adminApi";
import {
  approveChurchChange,
  createChurch,
  deleteChurch,
  fetchChurches,
  rejectChurchChange,
  updateChurch,
} from "@/frontend/lib/api/churchesApi";
import { createGalleryItem, deleteGalleryItem, fetchGalleryItems } from "@/frontend/lib/api/galleryApi";
import { firstInvalid, requiredText, validFileSize } from "@/frontend/lib/validation/forms";
import { 
  Shield, 
  Users, 
  MapPin, 
  Calendar, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  PlusCircle, 
  Loader2, 
  Activity,
  UserCheck,
  UserX,
  Trash,
  Image as ImageIcon,
  Megaphone,
  Flag
} from "lucide-react";

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t, language } = useLanguage();

  const user = session?.user as any;
  const isAdmin = ["super_admin", "admin", "moderator", "church_leader"].includes(user?.role);
  const canManageChurches = ["admin", "super_admin"].includes(user?.role);
  const canApproveChurches = user?.role === "super_admin";

  const [activeSubTab, setActiveSubTab] = useState("analytics");

  // GALLERY MANAGEMENT STATE
  const [galleryItems, setGalleryItems] = useState([]);
  const [newGalleryItem, setNewGalleryItem] = useState({
    title: "",
    description: "",
    category: "worship",
    imageUrl: "",
  });
  const [galleryPhotoFile, setGalleryPhotoFile] = useState<File | null>(null);
  const [galleryPhotoPreview, setGalleryPhotoPreview] = useState<string>("");
  const [uploadingGalleryPhoto, setUploadingGalleryPhoto] = useState(false);
  const [gallerySuccess, setGallerySuccess] = useState(false);
  const [galleryError, setGalleryError] = useState("");
  const galleryPhotoInputRef = React.useRef<HTMLInputElement>(null);

  // DATA STATE
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    totalChurches: 0,
    totalEvents: 0,
    totalPrayers: 0,
    totalTestimonies: 0,
    totalSuggestions: 0,
    pendingContent: 0,
    openReports: 0,
    totalAnnouncements: 0,
  });

  const [users, setUsers] = useState([]);
  const [churches, setChurches] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [moderationItems, setModerationItems] = useState([]);
  const [reports, setReports] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    message: "",
    audience: "all",
    role: "member",
    churchId: "",
    userId: "",
  });

  // CHURCH FORM STATE
  const [newChurch, setNewChurch] = useState({ name: "", city: "", region: "", description: "", memberCount: 0 });
  const [editingChurchId, setEditingChurchId] = useState<string | null>(null);
  const [churchSearch, setChurchSearch] = useState("");
  const [churchStatusFilter, setChurchStatusFilter] = useState("all");
  const [churchSuccess, setChurchSuccess] = useState(false);
  const [churchError, setChurchError] = useState("");

  // AUTH PROTECTION
  useEffect(() => {
    if (!session) {
      router.push("/login");
    } else if (!isAdmin) {
      router.push("/dashboard");
    }
  }, [session, isAdmin, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeSubTab === "analytics") {
        setStats(await fetchAdminStats());
      } else if (activeSubTab === "users") {
        setUsers(await fetchAdminUsers() as any);
      } else if (activeSubTab === "churches") {
        setChurches(await fetchChurches({ includeAll: true }) as any);
      } else if (activeSubTab === "suggestions") {
        const suggestionsRes = await fetch("/api/suggestions");
        if (suggestionsRes.ok) setSuggestions(await suggestionsRes.json());
      } else if (activeSubTab === "moderation") {
        setModerationItems(await fetchModerationQueue({ status: "pending" }) as any);
      } else if (activeSubTab === "reports") {
        setReports(await fetchReports() as any);
      } else if (activeSubTab === "announcements") {
        setAnnouncements(await fetchAnnouncements() as any);
        setChurches(await fetchChurches() as any);
      } else if (activeSubTab === "gallery") {
        setGalleryItems(await fetchGalleryItems({ category: "all" }) as any);
      } else if (activeSubTab === "logs") {
        setAuditLogs(await fetchAuditLogs() as any);
      }
    } catch (err) {
      console.error("Admin fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // FETCH ADMIN DATA
  useEffect(() => {
    if (!isAdmin) return;

    fetchData();
  }, [activeSubTab, isAdmin]);

  // USER ACTION HANDLER
  const handleUserStatusUpdate = async (userId: string, status: string) => {
    try {
      await updateAdminUser(userId, { status });
      fetchData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "User status update failed.");
    }
  };

  const handleUserRoleUpdate = async (userId: string, role: string) => {
    try {
      await updateAdminUser(userId, { role });
      fetchData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "User role update failed.");
    }
  };

  // CREATE CHURCH BRANCH
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
      fetchData();
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
      fetchData();
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
      fetchData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Church delete failed.");
    }
  };

  // SUGGESTION RESOLVE
  const handleResolveSuggestion = async (suggestionId: string, status: "approved" | "archived") => {
    const res = await fetch("/api/suggestions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suggestionId, status }),
    });

    if (res.ok) {
      fetchData();
    }
  };

  const handleModerateContent = async (type: string, id: string, status: "approved" | "rejected" | "archived") => {
    if ((type === "gallery" || type === "sermons") && status === "approved" && user.role !== "super_admin") {
      alert("Only Super Admin may approve gallery and sermon content.");
      return;
    }

    const note = status === "approved" ? "" : prompt("Optional moderation note") || "";
    try {
      await moderateContent({ type, id, status, note });
      fetchData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Moderation update failed.");
    }
  };

  const handleUpdateReport = async (reportId: string, status: "reviewing" | "resolved" | "dismissed") => {
    const resolutionNote = status === "reviewing" ? "" : prompt("Resolution note") || "";
    try {
      await updateReport(reportId, status, resolutionNote);
      fetchData();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Report update failed.");
    }
  };

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAnnouncement.title.trim() || !newAnnouncement.message.trim()) {
      alert("Please enter both title and message for the announcement.");
      return;
    }

    try {
      const data = await sendAnnouncement({
        ...newAnnouncement,
        title: newAnnouncement.title.trim(),
        message: newAnnouncement.message.trim(),
        role: newAnnouncement.audience === "role" ? newAnnouncement.role : undefined,
        churchId: newAnnouncement.audience === "church" ? newAnnouncement.churchId : undefined,
        userId: newAnnouncement.audience === "user" ? newAnnouncement.userId : undefined,
      });

      setNewAnnouncement({ title: "", message: "", audience: "all", role: "member", churchId: "", userId: "" });
      await fetchData();
      alert(`Announcement sent successfully to ${data.recipientCount ?? 0} recipient(s).`);
    } catch (err) {
      console.error(err);
      alert("Announcement send failed. Please try again.");
    }
  };

  // GALLERY MANAGEMENT ACTIONS
  const handleGalleryPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setGalleryError("Image must be under 5MB.");
      return;
    }
    setGalleryPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setGalleryPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
    setGalleryError("");
  };

  const uploadGalleryPhoto = async (): Promise<string> => {
    if (!galleryPhotoFile) return "";
    setUploadingGalleryPhoto(true);
    const fd = new FormData();
    fd.append("file", galleryPhotoFile);
    fd.append("folder", "gallery");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    setUploadingGalleryPhoto(false);
    if (res.ok) {
      const { url } = await res.json();
      return url;
    }
    throw new Error("Image upload failed");
  };

  const handleCreateGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setGallerySuccess(false);
    setGalleryError("");

    if (!newGalleryItem.title || !newGalleryItem.category) {
      setGalleryError("Title and category are required.");
      return;
    }
    const fileValidation = validFileSize(galleryPhotoFile, 5);
    if (!fileValidation.valid) {
      setGalleryError(fileValidation.message);
      return;
    }

    try {
      // 1. Upload photo first
      const imageUrl = await uploadGalleryPhoto();
      if (!imageUrl) {
        setGalleryError("Failed to upload image. Please try again.");
        return;
      }

      // 2. Post gallery item details
      await createGalleryItem({ ...newGalleryItem, category: newGalleryItem.category as any, imageUrl });
      setNewGalleryItem({ title: "", description: "", category: "worship", imageUrl: "" });
      setGalleryPhotoFile(null);
      setGalleryPhotoPreview("");
      setGallerySuccess(true);
      fetchData();
    } catch (err) {
      setGalleryError("An error occurred during upload. Check connection.");
    }
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gallery item?")) return;
    try {
      await deleteGalleryItem(id);
      fetchData();
    } catch (err) {
      console.error(err);
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

  if (!session || !isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-gold-500" size={36} />
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="flex-grow bg-slate-50 dark:bg-slate-950 py-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1 space-y-4">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm text-center">
                <Shield size={36} className="text-gold-500 mx-auto mb-3" />
                <h2 className="font-extrabold text-base text-slate-950 dark:text-white">
                  {t("adminTitle")}
                </h2>
                <span className="text-[10px] text-slate-400 font-semibold block mt-1">
                  Active User: {user.name} ({user.role?.replace("_", " ")})
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm space-y-1">
                {[
                  { id: "analytics", label: "Stats & Analytics", icon: <Activity size={16} /> },
                  { id: "users", label: t("adminMembers"), icon: <Users size={16} /> },
                  { id: "churches", label: t("adminChurchMgt"), icon: <MapPin size={16} />, adminOnly: true },
                  { id: "gallery", label: "Gallery Management", icon: <ImageIcon size={16} /> },
                  { id: "moderation", label: "Moderation Queue", icon: <AlertTriangle size={16} /> },
                  { id: "reports", label: "Reports", icon: <Flag size={16} /> },
                  { id: "announcements", label: "Announcements", icon: <Megaphone size={16} /> },
                  { id: "suggestions", label: "Suggestions Moderate", icon: <FileText size={16} /> },
                  { id: "logs", label: t("adminAuditLogs"), icon: <Shield size={16} />, superAdminOnly: true },
                ].map((tab) => {
                  if (tab.adminOnly && !canManageChurches) return null;
                  if (tab.superAdminOnly && user.role !== "super_admin") return null;
                  const isCurrent = activeSubTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSubTab(tab.id)}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isCurrent
                          ? "bg-gold-500/10 text-gold-600 dark:text-gold-400 font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Admin Workspaces */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="flex justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/60">
                  <Loader2 className="animate-spin text-gold-500" size={32} />
                </div>
              ) : (
                <div className="space-y-6">

                  {/* -------------------- ADMIN TAB 1: ANALYTICS -------------------- */}
                  {activeSubTab === "analytics" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          { title: t("adminTotalUsers"), val: stats.totalUsers, icon: <Users size={20} className="text-gold-500" /> },
                          { title: "Pending approvals", val: stats.pendingUsers, icon: <AlertTriangle size={20} className="text-amber-500" /> },
                          { title: t("adminTotalChurches"), val: stats.totalChurches, icon: <MapPin size={20} className="text-gold-500" /> },
                          { title: t("adminTotalEvents"), val: stats.totalEvents, icon: <Calendar size={20} className="text-gold-500" /> },
                        ].map((card, i) => (
                          <div key={i} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm flex items-center justify-between">
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">{card.title}</span>
                              <span className="text-2xl font-extrabold text-slate-950 dark:text-white mt-1 block">{card.val}</span>
                            </div>
                            {card.icon}
                          </div>
                        ))}
                      </div>

                      {/* Summary Table or Graphs */}
                      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
                        <h3 className="font-extrabold text-sm mb-4 uppercase tracking-wider">
                          Engagement Metrics Summary
                        </h3>
                        <div className="grid grid-cols-3 gap-6 text-center">
                          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40">
                            <span className="text-2xl font-extrabold text-gold-500">{stats.totalPrayers}</span>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase">Prayer Requests</p>
                          </div>
                          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40">
                            <span className="text-2xl font-extrabold text-gold-500">{stats.totalTestimonies}</span>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase">Testimonies Post</p>
                          </div>
                          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40">
                            <span className="text-2xl font-extrabold text-gold-500">{stats.totalSuggestions}</span>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase">Suggestions Sub</p>
                          </div>
                          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40">
                            <span className="text-2xl font-extrabold text-gold-500">{stats.pendingContent}</span>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase">Pending Content</p>
                          </div>
                          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40">
                            <span className="text-2xl font-extrabold text-gold-500">{stats.openReports}</span>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase">Open Reports</p>
                          </div>
                          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40">
                            <span className="text-2xl font-extrabold text-gold-500">{stats.totalAnnouncements}</span>
                            <p className="text-[10px] text-slate-400 mt-1 uppercase">Announcements</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* -------------------- ADMIN TAB 2: MEMBERS LIST & APPROVAL -------------------- */}
                  {activeSubTab === "users" && (
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
                                  {user.role === "super_admin" ? (
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
                  )}

                  {/* -------------------- ADMIN TAB 3: CHURCH DIRECTORY -------------------- */}
                  {activeSubTab === "churches" && (
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
                  )}

                  {/* -------------------- ADMIN TAB: CONTENT MODERATION -------------------- */}
                  {activeSubTab === "moderation" && (
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
                              {((entry.type === "gallery" || entry.type === "sermons") && user.role !== "super_admin") ? (
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
                  )}

                  {/* -------------------- ADMIN TAB: REPORTS -------------------- */}
                  {activeSubTab === "reports" && (
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
                  )}

                  {/* -------------------- ADMIN TAB: ANNOUNCEMENTS -------------------- */}
                  {activeSubTab === "announcements" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-1 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm h-fit">
                        <h3 className="font-extrabold text-sm mb-4 uppercase tracking-wider flex items-center gap-1.5 text-gold-500">
                          <Megaphone size={18} />
                          <span>Send Announcement</span>
                        </h3>
                        <form onSubmit={handleSendAnnouncement} className="space-y-4 text-xs">
                          <input
                            type="text"
                            required
                            value={newAnnouncement.title}
                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                            placeholder="Announcement title"
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500"
                          />
                          <textarea
                            rows={4}
                            required
                            value={newAnnouncement.message}
                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                            placeholder="Message..."
                            className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500 resize-none"
                          />
                          <select
                            value={newAnnouncement.audience}
                            onChange={(e) => setNewAnnouncement({ ...newAnnouncement, audience: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500"
                          >
                            <option value="all">All active users</option>
                            <option value="role">Specific role</option>
                            <option value="church">Specific church</option>
                            <option value="user">Specific user</option>
                          </select>
                          {newAnnouncement.audience === "role" && (
                            <select
                              value={newAnnouncement.role}
                              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, role: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500"
                            >
                              {["member", "youth_leader", "church_leader", "moderator", "admin"].map((role) => (
                                <option key={role} value={role}>{role}</option>
                              ))}
                            </select>
                          )}
                          {newAnnouncement.audience === "church" && (
                            <select
                              value={newAnnouncement.churchId}
                              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, churchId: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500"
                            >
                              <option value="">Select church</option>
                              {churches.map((church: any) => (
                                <option key={church._id} value={church._id}>{church.name}</option>
                              ))}
                            </select>
                          )}
                          {newAnnouncement.audience === "user" && (
                            <input
                              type="text"
                              value={newAnnouncement.userId}
                              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, userId: e.target.value })}
                              placeholder="User ID"
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500"
                            />
                          )}
                          <button type="submit" className="w-full py-2.5 bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold rounded-xl">
                            Send Announcement
                          </button>
                        </form>
                      </div>

                      <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
                        <h3 className="font-extrabold text-sm mb-4 uppercase tracking-wider">Announcement History</h3>
                        <div className="space-y-3">
                          {announcements.map((announcement: any) => (
                            <div key={announcement._id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60 text-xs">
                              <div className="flex justify-between gap-4">
                                <h4 className="font-bold text-slate-900 dark:text-white">{announcement.title}</h4>
                                <span className="text-[10px] uppercase font-bold text-slate-400">{announcement.audience}</span>
                              </div>
                              <p className="text-slate-500 dark:text-slate-400 mt-2">{announcement.message}</p>
                              <p className="text-[10px] text-slate-400 mt-2">
                                By {announcement.createdBy?.name || "Admin"} · {new Date(announcement.createdAt).toLocaleString(language)}
                              </p>
                            </div>
                          ))}
                          {announcements.length === 0 && (
                            <p className="text-xs text-slate-400 italic text-center py-10">
                              No announcements have been sent yet.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* -------------------- ADMIN TAB 4: SUGGESTIONS MODERATION -------------------- */}
                  {activeSubTab === "suggestions" && (
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
                  )}

                  {/* -------------------- ADMIN TAB 5: AUDIT LOGS -------------------- */}
                  {activeSubTab === "logs" && user.role === "super_admin" && (
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
                  )}

                  {/* -------------------- ADMIN TAB: GALLERY MANAGEMENT -------------------- */}
                  {activeSubTab === "gallery" && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Left: Add new item form */}
                      <div className="lg:col-span-1 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm h-fit">
                        <h3 className="font-extrabold text-sm mb-4 uppercase tracking-wider flex items-center gap-1.5 text-gold-500">
                          <PlusCircle size={18} />
                          <span>Add New Gallery Photo</span>
                        </h3>
                        {gallerySuccess && (
                          <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold text-center">
                            ✓ Photo added to gallery successfully!
                          </div>
                        )}
                        {galleryError && (
                          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs text-center font-semibold">
                            ⚠️ {galleryError}
                          </div>
                        )}

                        <form onSubmit={handleCreateGalleryItem} className="space-y-4 text-xs">
                          {/* Image Selector / Preview */}
                          <div className="flex flex-col items-center gap-2.5 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
                            {galleryPhotoPreview ? (
                              <img src={galleryPhotoPreview} alt="Preview" className="w-full max-h-36 object-contain rounded-lg shadow-sm" />
                            ) : (
                              <ImageIcon size={32} className="text-slate-400" />
                            )}
                            <button
                              type="button"
                              onClick={() => galleryPhotoInputRef.current?.click()}
                              className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-[10px] uppercase hover:bg-gold-500 hover:text-slate-950 transition-colors"
                            >
                              Select Photo
                            </button>
                            <input
                              ref={galleryPhotoInputRef}
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp"
                              onChange={handleGalleryPhotoChange}
                              className="hidden"
                            />
                            <span className="text-[9px] text-slate-400">JPG, PNG, WEBP · Max 5MB</span>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Title</label>
                            <input
                              type="text"
                              required
                              value={newGalleryItem.title}
                              onChange={(e) => setNewGalleryItem({ ...newGalleryItem, title: e.target.value })}
                              placeholder="e.g. Youth Choir Worship Night"
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category</label>
                            <select
                              value={newGalleryItem.category}
                              onChange={(e) => setNewGalleryItem({ ...newGalleryItem, category: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500"
                            >
                              <option value="worship">Worship</option>
                              <option value="conference">Conference</option>
                              <option value="education">Education</option>
                              <option value="outreach">Outreach</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description</label>
                            <textarea
                              rows={2}
                              value={newGalleryItem.description}
                              onChange={(e) => setNewGalleryItem({ ...newGalleryItem, description: e.target.value })}
                              placeholder="Optional description..."
                              className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500 resize-none"
                            />
                          </div>

                          <button
                            type="submit"
                            disabled={uploadingGalleryPhoto}
                            className="w-full py-2.5 bg-gold-500 hover:bg-gold-600 disabled:bg-slate-350 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-1.5"
                          >
                            {uploadingGalleryPhoto ? (
                              <>
                                <Loader2 className="animate-spin" size={14} />
                                <span>Uploading Image...</span>
                              </>
                            ) : (
                              <span>Add to Gallery</span>
                            )}
                          </button>
                        </form>
                      </div>

                      {/* Right: Existing gallery list */}
                      <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
                        <h3 className="font-extrabold text-sm mb-4 uppercase tracking-wider">
                          Current Gallery Images ({galleryItems.length})
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[550px] overflow-y-auto pr-2">
                          {galleryItems.map((item: any) => (
                            <div key={item._id} className="p-3 rounded-xl border border-slate-200/50 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex flex-col justify-between gap-3 relative group">
                              <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-900">
                                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-gold-500 text-slate-950 font-bold text-[8px] uppercase tracking-wide">
                                  {item.category}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">{item.title}</h4>
                                <p className="text-[10px] text-slate-450 text-slate-400 line-clamp-2 mt-1">{item.description || "No description"}</p>
                              </div>
                              <div className="flex justify-between items-center text-[9px] text-slate-400 pt-2 border-t">
                                <span>Uploaded by: {item.uploadedBy?.name || "Admin"}</span>
                                <button
                                  onClick={() => handleDeleteGalleryItem(item._id)}
                                  className="text-rose-500 hover:text-rose-600 hover:underline flex items-center gap-0.5 font-bold"
                                >
                                  <Trash size={10} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          ))}
                          {galleryItems.length === 0 && (
                            <p className="text-xs text-slate-400 italic text-center py-20 col-span-2">
                              No gallery items found. Use the form to upload the first photo!
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
