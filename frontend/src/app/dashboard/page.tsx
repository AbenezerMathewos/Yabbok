"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { Navbar } from "@/frontend/components/shared/Navbar";
import { Footer } from "@/frontend/components/shared/Footer";
import { 
  User, 
  MapPin, 
  BookOpen, 
  Heart, 
  MessageSquare, 
  FileText, 
  Users, 
  Settings, 
  Plus, 
  MessageCircle, 
  Volume2, 
  Send, 
  Check, 
  ChevronRight, 
  Bell, 
  Trash,
  Bookmark,
  ThumbsUp,
  Loader2,
  Camera
} from "lucide-react";

export default function DashboardPage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const { t, language } = useLanguage();

  const user = session?.user as any;
  const isActive = user?.status === "active";

  const [activeTab, setActiveTab] = useState("summary");

  // FEEDS DATA
  const [prayers, setPrayers] = useState([]);
  const [testimonies, setTestimonies] = useState([]);
  const [insights, setInsights] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // FORMS STATE
  const [newPrayer, setNewPrayer] = useState({ content: "", isAnonymous: false });
  const [newTestimony, setNewTestimony] = useState({ title: "", content: "", mediaUrl: "" });
  const [newInsight, setNewInsight] = useState({ content: "", bibleReferences: "" });
  const [newSuggestion, setNewSuggestion] = useState({ title: "", content: "", category: "Fellowship Idea" });
  const [newTopic, setNewTopic] = useState({ title: "", content: "", category: "Faith" });

  // CHAT STATE
  const [chatType, setChatType] = useState<"global" | "church">("global");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // COMMENTS & REPLIES INPUT
  const [commentInput, setCommentInput] = useState<{[key: string]: string}>({});
  const [replyInput, setReplyInput] = useState<{[key: string]: string}>({});

  // PROFILE EDIT STATE
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    bio: "",
    profilePhoto: "",
    educationalStatus: "",
  });
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>("");
  const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);

  // AUTH PROTECT & FETCH PROFILE
  useEffect(() => {
    if (!session) {
      router.push("/login");
    } else {
      fetch("/api/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data && !data.error) {
            setProfileForm({
              name: data.name || "",
              phone: data.phone || "",
              bio: data.bio || "",
              profilePhoto: data.profilePhoto || "",
              educationalStatus: data.educationalStatus || "University Student",
            });
            setProfilePhotoPreview(data.profilePhoto || "");
          }
        })
        .catch((err) => console.error("Error loading profile:", err));
    }
  }, [session, router]);

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setProfileError("Photo must be under 5MB.");
      return;
    }
    setProfilePhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setProfilePhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
    setProfileError("");
  };

  const uploadProfilePhoto = async (): Promise<string> => {
    if (!profilePhotoFile) return profileForm.profilePhoto;
    setUploadingProfilePhoto(true);
    const fd = new FormData();
    fd.append("file", profilePhotoFile);
    fd.append("folder", "profiles");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    setUploadingProfilePhoto(false);
    if (res.ok) {
      const { url } = await res.json();
      return url;
    }
    throw new Error("Photo upload failed");
  };

  // FETCH HELPER FUNCTIONS
  const fetchPrayers = () => {
    fetch("/api/prayers")
      .then((res) => res.json())
      .then((data) => setPrayers(data))
      .catch((err) => console.error(err));
  };

  const fetchTestimonies = () => {
    fetch("/api/testimonies")
      .then((res) => res.json())
      .then((data) => setTestimonies(data))
      .catch((err) => console.error(err));
  };

  const fetchInsights = () => {
    fetch("/api/insights")
      .then((res) => res.json())
      .then((data) => setInsights(data))
      .catch((err) => console.error(err));
  };

  const fetchSuggestions = () => {
    fetch("/api/suggestions")
      .then((res) => res.json())
      .then((data) => setSuggestions(data))
      .catch((err) => console.error(err));
  };

  const fetchDiscussions = () => {
    fetch("/api/discussions")
      .then((res) => res.json())
      .then((data) => setDiscussions(data))
      .catch((err) => console.error(err));
  };

  const fetchNotifications = () => {
    // Return empty list by default or fetch
    setNotifications([
      { _id: "1", title: "Welcome to YABBOK!", message: "Your account has been fully verified and activated by the Super Admin. God bless you!", read: false, createdAt: new Date() },
      { _id: "2", title: "Bible Verse Daily", message: "Genesis 32:24 is your daily bread. Jacob was left alone...", read: true, createdAt: new Date() },
    ]);
  };

  const fetchChatMessages = () => {
    const url = chatType === "global" 
      ? "/api/chat?chatType=global" 
      : `/api/chat?chatType=church&chatGroupId=${user?.churchId}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => setChatMessages(data))
      .catch((err) => console.error(err));
  };

  // LOAD FEEDS ON TAB CHANGE
  useEffect(() => {
    if (!isActive) return;

    if (activeTab === "summary") {
      fetchNotifications();
    } else if (activeTab === "feeds") {
      fetchPrayers();
      fetchTestimonies();
      fetchInsights();
    } else if (activeTab === "discussions") {
      fetchDiscussions();
    } else if (activeTab === "suggestions") {
      fetchSuggestions();
    }
  }, [activeTab, isActive]);

  // CHAT LONG POLLING
  useEffect(() => {
    if (!isActive || activeTab !== "chat") return;

    fetchChatMessages();
    const interval = setInterval(fetchChatMessages, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [activeTab, chatType, isActive]);

  // Scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // POST SUBMISSION ACTIONS
  const handleCreatePrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrayer.content) return;

    const res = await fetch("/api/prayers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPrayer),
    });

    if (res.ok) {
      setNewPrayer({ content: "", isAnonymous: false });
      fetchPrayers();
    }
  };

  const handleCreateTestimony = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestimony.title || !newTestimony.content) return;

    const res = await fetch("/api/testimonies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTestimony.title,
        content: newTestimony.content,
        media: newTestimony.mediaUrl ? [newTestimony.mediaUrl] : [],
      }),
    });

    if (res.ok) {
      setNewTestimony({ title: "", content: "", mediaUrl: "" });
      fetchTestimonies();
    }
  };

  const handleCreateInsight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInsight.content) return;

    const refs = newInsight.bibleReferences
      ? newInsight.bibleReferences.split(",").map((s) => s.trim())
      : [];

    const res = await fetch("/api/insights", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: newInsight.content,
        bibleReferences: refs,
      }),
    });

    if (res.ok) {
      setNewInsight({ content: "", bibleReferences: "" });
      fetchInsights();
    }
  };

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

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.title || !newTopic.content) return;

    const res = await fetch("/api/discussions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTopic),
    });

    if (res.ok) {
      setNewTopic({ title: "", content: "", category: "Faith" });
      fetchDiscussions();
    }
  };

  // SEND CHAT MESSAGE
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput) return;

    const payload = {
      chatType,
      chatGroupId: chatType === "church" ? user?.churchId : undefined,
      content: chatInput,
    };

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setChatInput("");
      fetchChatMessages();
    }
  };

  // SOCIAL REACTIONS & COMMENTS
  const handlePrayerAction = async (prayerId: string, action: "pray" | "react", type?: string) => {
    await fetch(`/api/prayers?action=${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prayerId, type }),
    });
    fetchPrayers();
  };

  const handleAddPrayerComment = async (prayerId: string) => {
    const text = commentInput[prayerId];
    if (!text) return;

    await fetch(`/api/prayers?action=comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prayerId, content: text }),
    });

    setCommentInput({ ...commentInput, [prayerId]: "" });
    fetchPrayers();
  };

  const handleTestimonyAction = async (testimonyId: string, action: "react", type: string) => {
    await fetch(`/api/testimonies?action=${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testimonyId, type }),
    });
    fetchTestimonies();
  };

  const handleAddTestimonyComment = async (testimonyId: string) => {
    const text = commentInput[testimonyId];
    if (!text) return;

    await fetch(`/api/testimonies?action=comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testimonyId, content: text }),
    });

    setCommentInput({ ...commentInput, [testimonyId]: "" });
    fetchTestimonies();
  };

  const handleInsightAction = async (insightId: string, action: "react", type: string) => {
    await fetch(`/api/insights?action=${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ insightId, type }),
    });
    fetchInsights();
  };

  const handleAddInsightComment = async (insightId: string) => {
    const text = commentInput[insightId];
    if (!text) return;

    await fetch(`/api/insights?action=comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ insightId, content: text }),
    });

    setCommentInput({ ...commentInput, [insightId]: "" });
    fetchInsights();
  };

  const handleDiscussionAction = async (topicId: string, action: "like" | "bookmark") => {
    await fetch(`/api/discussions?action=${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId }),
    });
    fetchDiscussions();
  };

  const handleAddTopicReply = async (topicId: string) => {
    const text = replyInput[topicId];
    if (!text) return;

    await fetch(`/api/discussions?action=reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId, content: text }),
    });

    setReplyInput({ ...replyInput, [topicId]: "" });
    fetchDiscussions();
  };

  // UPDATE PROFILE SETTINGS
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(false);
    setProfileError("");

    try {
      // 1. Upload photo first if a new one is selected
      let photoUrl = profileForm.profilePhoto;
      if (profilePhotoFile) {
        try {
          photoUrl = await uploadProfilePhoto();
        } catch (err) {
          setProfileError("Profile photo upload failed. Please try again.");
          return;
        }
      }

      // 2. Put profile details to API
      const updatedForm = { ...profileForm, profilePhoto: photoUrl };
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedForm),
      });

      const data = await res.json();
      if (!res.ok) {
        setProfileError(data.error || "Failed to update profile.");
      } else {
        setProfileSuccess(true);
        setProfileForm(updatedForm);
        setProfilePhotoFile(null); // Reset file selection since it's uploaded
        // 3. Update session in NextAuth
        await updateSession({
          name: updatedForm.name,
          profilePhoto: photoUrl,
        });
      }
    } catch (err) {
      setProfileError("An error occurred during submission. Check connection.");
    }
  };

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-gold-500" size={36} />
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <main className="flex-grow bg-slate-50 dark:bg-slate-950 transition-colors duration-300 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar Controls (1/4) */}
            <div className="lg:col-span-1 space-y-6">
              {/* User Avatar panel */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm text-center">
                <div className="relative inline-block mb-3">
                  {user?.profilePhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.profilePhoto}
                      alt={user.name}
                      className="w-20 h-20 rounded-full border-2 border-gold-500 mx-auto object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gold-500 text-white flex items-center justify-center text-3xl font-extrabold mx-auto shadow-inner">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 p-1 bg-emerald-500 border-2 border-white rounded-full" title="Online" />
                </div>
                <h2 className="font-extrabold text-lg text-slate-950 dark:text-white leading-tight">
                  {user?.name}
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider text-gold-600 dark:text-gold-500 block mt-1">
                  🛡️ {user?.role?.replace("_", " ")}
                </span>
                
                {/* Status Bar */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1">
                    {t("dashStatus")}
                  </span>
                  {isActive ? (
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      ✅ {t("dashStatusActive")}
                    </span>
                  ) : (
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 animate-pulse">
                      ⏳ {t("dashStatusPending")}
                    </span>
                  )}
                </div>
              </div>

              {/* Navigation Menu Links */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm space-y-1">
                {[
                  { id: "summary", label: t("navDashboard"), icon: <User size={16} /> },
                  { id: "feeds", label: language === 'en' ? 'Fellowship Wall' : 'የህብረት ግንብ', icon: <Heart size={16} />, activeOnly: true },
                  { id: "discussions", label: language === 'en' ? 'Bible Forum' : 'የውይይት መድረክ', icon: <MessageSquare size={16} />, activeOnly: true },
                  { id: "chat", label: language === 'en' ? 'Chat Rooms' : 'የመወያያ ክፍሎች', icon: <MessageCircle size={16} />, activeOnly: true },
                  { id: "suggestions", label: t("tabSuggestions"), icon: <FileText size={16} />, activeOnly: true },
                  { id: "profile", label: t("dashEditProfile"), icon: <Settings size={16} /> },
                ].map((tab) => {
                  if (tab.activeOnly && !isActive) return null;
                  const isCurrent = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setProfileSuccess(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isCurrent
                          ? "bg-gold-500/10 text-gold-600 dark:text-gold-400 font-semibold"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {tab.icon}
                        <span>{tab.label}</span>
                      </div>
                      <ChevronRight size={12} className={isCurrent ? "text-gold-500" : "text-slate-400"} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dashboard Workspace Contents (3/4) */}
            <div className="lg:col-span-3 space-y-6">

              {/* -------------------- TAB 1: SUMMARY -------------------- */}
              {activeTab === "summary" && (
                <div className="space-y-6">
                  {/* Greeting banner */}
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-gold-500 to-amber-500 text-slate-950 shadow">
                    <h2 className="text-2xl font-extrabold">
                      {t("dashWelcome")}, {user?.name}!
                    </h2>
                    <p className="text-xs font-light text-slate-900 mt-1 max-w-xl">
                      {!isActive 
                        ? "Welcome to YABBOK. Your profile is currently pending approval. Please contact your local church leader to verify your registration, so you can participate in chats and discussions."
                        : "Connect with the youth members across Kale Hiywet Churches. Participate in daily bible discussions, prayer lines, and read audio/video sermons."}
                    </p>
                  </div>

                  {/* Daily Bread Card */}
                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gold-600 dark:text-gold-500">
                      💡 {t("dashVerse")}
                    </span>
                    <blockquote className="mt-2 text-base text-slate-800 dark:text-slate-200 italic leading-relaxed">
                      &ldquo;{t("verseText")}&rdquo;
                    </blockquote>
                    <cite className="block mt-1.5 text-[10px] font-bold text-gold-700">
                      — {t("verseRef")}
                    </cite>
                  </div>

                  {/* Notifications Center */}
                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
                    <h3 className="font-extrabold text-base text-slate-950 dark:text-white flex items-center gap-2 mb-4">
                      <Bell size={18} className="text-gold-500" />
                      <span>Notifications Center</span>
                    </h3>

                    <div className="space-y-3">
                      {notifications.length > 0 ? (
                        notifications.map((notif: any) => (
                          <div key={notif._id} className={`p-4 rounded-xl border flex justify-between items-start gap-4 transition-colors ${
                            notif.read 
                              ? "bg-slate-50/50 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800/55 text-slate-500" 
                              : "bg-gold-500/5 dark:bg-gold-500/10 border-gold-500/20 text-slate-800 dark:text-slate-100"
                          }`}>
                            <div>
                              <h4 className="font-bold text-xs">{notif.title}</h4>
                              <p className="text-xs mt-1 leading-relaxed text-slate-500 dark:text-slate-400">
                                {notif.message}
                              </p>
                            </div>
                            <span className="text-[9px] text-slate-400 font-medium shrink-0">
                              Just now
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No new notifications.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* -------------------- TAB 2: FEEDS WALL -------------------- */}
              {activeTab === "feeds" && isActive && (
                <div className="space-y-8">
                  {/* Share DEVOTION/PRAYER/TESTIMONY Inputs forms */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Share Prayer Request form */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm flex flex-col justify-between">
                      <form onSubmit={handleCreatePrayer} className="space-y-3">
                        <span className="text-[10px] font-bold text-gold-500 uppercase tracking-wider block">
                          🙏 Request Prayer
                        </span>
                        <textarea
                          rows={3}
                          value={newPrayer.content}
                          onChange={(e) => setNewPrayer({ ...newPrayer, content: e.target.value })}
                          placeholder={t("prayerPlaceholder")}
                          className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-xs resize-none"
                        />
                        <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newPrayer.isAnonymous}
                            onChange={(e) => setNewPrayer({ ...newPrayer, isAnonymous: e.target.checked })}
                            className="rounded text-gold-500 focus:ring-gold-500"
                          />
                          <span>{t("anonymousLabel")}</span>
                        </label>
                        <button
                          type="submit"
                          className="w-full py-2 bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold rounded-lg text-xs"
                        >
                          {t("btnPost")}
                        </button>
                      </form>
                    </div>

                    {/* Share Testimony form */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm flex flex-col justify-between">
                      <form onSubmit={handleCreateTestimony} className="space-y-3">
                        <span className="text-[10px] font-bold text-gold-500 uppercase tracking-wider block">
                          🎉 Share Testimony
                        </span>
                        <input
                          type="text"
                          value={newTestimony.title}
                          onChange={(e) => setNewTestimony({ ...newTestimony, title: e.target.value })}
                          placeholder="Testimony Title"
                          className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-xs"
                        />
                        <textarea
                          rows={2}
                          value={newTestimony.content}
                          onChange={(e) => setNewTestimony({ ...newTestimony, content: e.target.value })}
                          placeholder={t("testimonyPlaceholder")}
                          className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-xs resize-none"
                        />
                        <button
                          type="submit"
                          className="w-full py-2 bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold rounded-lg text-xs"
                        >
                          {t("btnPost")}
                        </button>
                      </form>
                    </div>

                    {/* What God Taught Me form */}
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm flex flex-col justify-between">
                      <form onSubmit={handleCreateInsight} className="space-y-3">
                        <span className="text-[10px] font-bold text-gold-500 uppercase tracking-wider block">
                          ✍️ What God Taught Me
                        </span>
                        <textarea
                          rows={3}
                          value={newInsight.content}
                          onChange={(e) => setNewInsight({ ...newInsight, content: e.target.value })}
                          placeholder={t("insightPlaceholder")}
                          className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-xs resize-none"
                        />
                        <input
                          type="text"
                          value={newInsight.bibleReferences}
                          onChange={(e) => setNewInsight({ ...newInsight, bibleReferences: e.target.value })}
                          placeholder={t("insightRefPlaceholder")}
                          className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-xs"
                        />
                        <button
                          type="submit"
                          className="w-full py-2 bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold rounded-lg text-xs"
                        >
                          {t("btnPost")}
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* WALL STREAMS */}
                  <div className="space-y-6">
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white border-b pb-2">
                      🌿 Community Fellowship Stream
                    </h3>

                    {/* Devotions Stream */}
                    {insights.map((insight: any) => (
                      <div key={insight._id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gold-500 text-white flex items-center justify-center font-bold text-xs">
                            {insight.user?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs">{insight.user?.name}</h4>
                            <span className="text-[9px] text-slate-400">What God Taught Me Today</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {insight.content}
                        </p>
                        {insight.bibleReferences?.length > 0 && (
                          <div className="flex gap-1.5 flex-wrap">
                            {insight.bibleReferences.map((ref: string, idx: number) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-gold-500/10 text-gold-600 dark:text-gold-400 text-[10px] font-bold border border-gold-500/25">
                                📖 {ref}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="pt-2 flex gap-3 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => handleInsightAction(insight._id, "react", "praise_god")}
                            className="hover:text-gold-500 flex items-center gap-1 font-semibold"
                          >
                            🙌 Praise God ({insight.reactions?.length || 0})
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Prayer Wall Requests */}
                    {prayers.map((prayer: any) => (
                      <div key={prayer._id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
                            {prayer.isAnonymous ? "🕊️" : prayer.user?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs">
                              {prayer.isAnonymous ? (language === 'en' ? 'Anonymous Member' : 'ስሙ ያልተጠቀሰ አባል') : prayer.user?.name}
                            </h4>
                            <span className="text-[9px] text-slate-400">Prayer Wall Request</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {prayer.content}
                        </p>
                        
                        <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => handlePrayerAction(prayer._id, "pray")}
                            className={`flex items-center gap-1 font-semibold hover:text-gold-500 ${
                              prayer.prayedForBy?.includes(user?.id) ? "text-gold-500 font-bold" : ""
                            }`}
                          >
                            🙏 {t("btnIPrayed")} ({prayer.prayedForBy?.length || 0})
                          </button>

                          <button
                            onClick={() => handlePrayerAction(prayer._id, "react", "amen")}
                            className="flex items-center gap-1 font-semibold hover:text-gold-500"
                          >
                            ✨ Amen ({prayer.reactions?.filter((r: any) => r.type === "amen").length || 0})
                          </button>
                        </div>

                        {/* Comments Block */}
                        <div className="pt-3 space-y-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl">
                          <h5 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                            {t("commentsLabel")}
                          </h5>
                          {prayer.comments?.map((c: any, idx: number) => (
                            <div key={idx} className="text-xs leading-relaxed border-b border-slate-100 dark:border-slate-900 pb-1.5 last:border-b-0">
                              <span className="font-bold text-slate-900 dark:text-white mr-1.5">{c.user?.name}:</span>
                              <span className="text-slate-500 dark:text-slate-400">{c.content}</span>
                            </div>
                          ))}
                          
                          {/* Write Comment Form */}
                          <div className="flex gap-2 mt-2 pt-2 border-t border-slate-200/50">
                            <input
                              type="text"
                              value={commentInput[prayer._id] || ""}
                              onChange={(e) => setCommentInput({ ...commentInput, [prayer._id]: e.target.value })}
                              placeholder={t("addCommentPlaceholder")}
                              className="flex-grow px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-xs focus:outline-none"
                            />
                            <button
                              onClick={() => handleAddPrayerComment(prayer._id)}
                              className="px-3.5 py-1.5 bg-gold-500 text-slate-950 font-bold rounded-lg text-xs"
                            >
                              {t("btnComment")}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Testimonies Stream */}
                    {testimonies.map((test: any) => (
                      <div key={test._id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                            {test.user?.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs">{test.user?.name}</h4>
                            <span className="text-[9px] text-slate-400">Praise Testimony</span>
                          </div>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {test.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {test.content}
                        </p>
                        
                        <div className="pt-2 flex gap-3 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => handleTestimonyAction(test._id, "react", "praise_god")}
                            className="hover:text-gold-500 flex items-center gap-1 font-semibold"
                          >
                            🙌 Praise God ({test.reactions?.length || 0})
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* -------------------- TAB 3: DISCUSSIONS -------------------- */}
              {activeTab === "discussions" && isActive && (
                <div className="space-y-6">
                  {/* Create discussion topic */}
                  <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
                    <form onSubmit={handleCreateTopic} className="space-y-4">
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                        💬 Start a New Discussion Topic
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            required
                            placeholder="Enter Topic Title..."
                            value={newTopic.title}
                            onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-xs"
                          />
                        </div>
                        <div>
                          <select
                            value={newTopic.category}
                            onChange={(e) => setNewTopic({ ...newTopic, category: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-xs"
                          >
                            {["Faith", "Bible Study", "Prayer", "Evangelism", "Christian Living", "Education", "Career", "Relationships", "Ministry"].map((cat) => (
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
                        placeholder="Write topic details, questions, or verses..."
                        value={newTopic.content}
                        onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                        className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-xs resize-none"
                      />

                      <button
                        type="submit"
                        className="px-6 py-2 bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold rounded-xl text-xs"
                      >
                        Create Forum Topic
                      </button>
                    </form>
                  </div>

                  {/* Discussion lists */}
                  <div className="space-y-4">
                    {discussions.map((topic: any) => (
                      <div key={topic._id} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20">
                              {topic.category}
                            </span>
                            <h4 className="font-extrabold text-base text-slate-950 dark:text-white mt-2">
                              {topic.title}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                              {topic.content}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs text-slate-400">
                          <span className="font-bold text-[10px] text-slate-500 mr-2">
                            By {topic.user?.name}
                          </span>
                          
                          <button
                            onClick={() => handleDiscussionAction(topic._id, "like")}
                            className="hover:text-gold-500 flex items-center gap-1 font-semibold"
                          >
                            👍 Like ({topic.likes?.length || 0})
                          </button>

                          <button
                            onClick={() => handleDiscussionAction(topic._id, "bookmark")}
                            className="hover:text-gold-500 flex items-center gap-1 font-semibold"
                          >
                            🔖 Bookmark ({topic.bookmarks?.length || 0})
                          </button>
                        </div>

                        {/* Replies Center */}
                        <div className="space-y-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl">
                          <h5 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                            Forum Replies ({topic.replies?.length || 0})
                          </h5>
                          {topic.replies?.map((rep: any, idx: number) => (
                            <div key={idx} className="text-xs leading-relaxed border-b border-slate-100 dark:border-slate-900 pb-2 mb-2 last:border-b-0 last:mb-0">
                              <span className="font-bold text-slate-900 dark:text-white mr-1.5">{rep.user?.name}:</span>
                              <span className="text-slate-500 dark:text-slate-400">{rep.content}</span>
                            </div>
                          ))}

                          {/* Write Reply form */}
                          <div className="flex gap-2 pt-2 mt-2 border-t border-slate-200/50">
                            <input
                              type="text"
                              value={replyInput[topic._id] || ""}
                              onChange={(e) => setReplyInput({ ...replyInput, [topic._id]: e.target.value })}
                              placeholder="Write a forum reply..."
                              className="flex-grow px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-xs focus:outline-none"
                            />
                            <button
                              onClick={() => handleAddTopicReply(topic._id)}
                              className="px-4 py-1.5 bg-gold-500 text-slate-950 font-bold rounded-lg text-xs"
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* -------------------- TAB 4: REAL-TIME CHAT -------------------- */}
              {activeTab === "chat" && isActive && (
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm flex flex-col h-[550px]">
                  
                  {/* Chat Header selector */}
                  <div className="flex border-b border-slate-100 dark:border-slate-800 pb-3 gap-2 shrink-0">
                    <button
                      onClick={() => setChatType("global")}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        chatType === "global"
                          ? "bg-gold-500 text-slate-950"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      🕊️ {t("chatGlobal")}
                    </button>
                    <button
                      onClick={() => setChatType("church")}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        chatType === "church"
                          ? "bg-gold-500 text-slate-950"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      ⛪ {t("chatChurch")}
                    </button>
                  </div>

                  {/* Messages list */}
                  <div className="flex-grow overflow-y-auto my-4 space-y-3 pr-2">
                    {chatMessages.length > 0 ? (
                      chatMessages.map((msg: any, idx: number) => {
                        const isOwn = msg.sender?._id === user?.id;
                        return (
                          <div key={idx} className={`flex gap-2.5 max-w-[80%] ${
                            isOwn ? "ml-auto flex-row-reverse" : ""
                          }`}>
                            {/* Avatar */}
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                              {msg.sender?.name?.charAt(0).toUpperCase()}
                            </div>
                            
                            {/* Bubble */}
                            <div>
                              <span className="text-[10px] text-slate-400 font-semibold block mb-0.5 px-1">
                                {isOwn ? "You" : msg.sender?.name}
                              </span>
                              <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                                isOwn 
                                  ? "bg-gold-500 text-slate-950 rounded-tr-none" 
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none"
                              }`}>
                                {msg.content}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-400 italic text-center py-20">
                        {t("chatNoMessages")}
                      </p>
                    )}
                    <div ref={chatScrollRef} />
                  </div>

                  {/* Chat Input form */}
                  <form onSubmit={handleSendChatMessage} className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={t("chatTypeMessage")}
                      className="flex-grow px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:border-gold-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 shadow"
                    >
                      <Send size={12} />
                    </button>
                  </form>
                </div>
              )}

              {/* -------------------- TAB 5: SUGGESTIONS -------------------- */}
              {activeTab === "suggestions" && isActive && (
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
                            onChange={(e) => setNewSuggestion({ ...newSuggestion, category: e.target.value as any })}
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

                      <button
                        type="submit"
                        className="px-6 py-2 bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold rounded-xl text-xs"
                      >
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
              )}

              {/* -------------------- TAB 6: PROFILE EDIT -------------------- */}
              {activeTab === "profile" && (
                <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
                  {profileSuccess && (
                    <div className="p-4 mb-5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs text-center font-bold">
                      ✓ Profile details updated successfully!
                    </div>
                  )}
                  {profileError && (
                    <div className="p-4 mb-5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs text-center font-semibold">
                      ⚠️ {profileError}
                    </div>
                  )}

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                      ✍️ Manage Your Profile Details
                    </h3>

                    {/* Profile Photo Upload */}
                    <div className="flex flex-col items-center gap-3 py-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                      <div
                        onClick={() => profilePhotoInputRef.current?.click()}
                        className="relative w-24 h-24 rounded-full border-4 border-dashed border-slate-300 dark:border-slate-700 hover:border-gold-500 cursor-pointer overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800 transition-all group"
                      >
                        {profilePhotoPreview ? (
                          <img src={profilePhotoPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <User size={36} className="text-slate-400 group-hover:text-gold-500 transition-colors" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                          <Camera size={20} className="text-white" />
                        </div>
                      </div>
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => profilePhotoInputRef.current?.click()}
                          className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline"
                        >
                          {profilePhotoPreview ? "Change Profile Photo" : "Upload Profile Photo"}
                        </button>
                        <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WEBP · Max 5MB</p>
                      </div>
                      <input
                        ref={profilePhotoInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleProfilePhotoChange}
                        className="hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        {t("formName")}
                      </label>
                      <input
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          {t("regPhone")}
                        </label>
                        <input
                          type="tel"
                          required
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          Educational Status
                        </label>
                        <select
                          value={profileForm.educationalStatus}
                          onChange={(e) => setProfileForm({ ...profileForm, educationalStatus: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-xs"
                        >
                          {["Elementary School", "High School", "University Student", "Graduate", "Employee / Worker", "Business Owner"].map((edu) => (
                            <option key={edu} value={edu}>
                              {edu}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        {t("regBio")}
                      </label>
                      <textarea
                        rows={3}
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-xs resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={uploadingProfilePhoto}
                      className="px-6 py-2.5 bg-gold-500 hover:bg-gold-600 disabled:bg-slate-300 text-slate-950 font-bold rounded-xl text-xs shadow transition-all flex items-center justify-center gap-1.5"
                    >
                      {uploadingProfilePhoto ? (
                        <>
                          <Loader2 className="animate-spin" size={14} />
                          <span>Uploading Photo...</span>
                        </>
                      ) : (
                        <span>Update My Profile</span>
                      )}
                    </button>
                  </form>
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
