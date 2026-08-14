"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/frontend/components/shared/Navbar";
import { Footer } from "@/frontend/components/shared/Footer";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { Loader2, HeartHandshake, FileWarning, Inbox, Send, Activity, Lock, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/frontend/components/ui/skeleton";

export default function CounselingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, language } = useLanguage();

  const user = session?.user as any;
  const isLeader = ['admin', 'super_admin', 'moderator', 'church_leader'].includes(user?.role);
  
  const [activeTab, setActiveTab] = useState<"get_help" | "my_requests" | "triage">("get_help");
  const [loading, setLoading] = useState(true);
  
  // Data
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [triageQueue, setTriageQueue] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    topic: "Spiritual",
    urgency: "Medium",
    description: "",
    isAnonymous: false,
  });

  const [messageInputs, setMessageInputs] = useState<{[key: string]: string}>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const resMy = await fetch("/api/counseling?view=my_requests");
      if (resMy.ok) setMyRequests(await resMy.json());

      if (isLeader) {
        const resTriage = await fetch("/api/counseling?view=triage");
        if (resTriage.ok) setTriageQueue(await resTriage.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      loadData();
    }
  }, [status, router]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description) return;

    try {
      const res = await fetch("/api/counseling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(language === 'en' ? "Your request has been securely submitted." : "ጥያቄዎ በደህንነት ቀርቧል።");
        setFormData({ topic: "Spiritual", urgency: "Medium", description: "", isAnonymous: false });
        loadData();
        setActiveTab("my_requests");
      } else {
        const data = await res.json();
        toast.error(data.error || (language === 'en' ? "Failed to submit request." : "ጥያቄ ማቅረብ አልተሳካም።"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/counseling", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status: newStatus }),
      });
      if (res.ok) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (requestId: string) => {
    const message = messageInputs[requestId];
    if (!message) return;

    try {
      const res = await fetch("/api/counseling", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, message }),
      });
      if (res.ok) {
        setMessageInputs({ ...messageInputs, [requestId]: "" });
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (status === "loading" || !session) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-gold-500" size={36} />
      </div>
    );
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "Critical": return "bg-rose-500 text-white animate-pulse";
      case "High": return "bg-amber-500 text-white";
      case "Medium": return "bg-blue-500 text-white";
      default: return "bg-emerald-500 text-white";
    }
  };

  const RequestThreadCard = ({ req, isTriageView = false }: { req: any, isTriageView?: boolean }) => {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 p-6 shadow-sm space-y-4">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-start gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                {req.topic}
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getUrgencyColor(req.urgency)}`}>
                {req.urgency} Priority
              </span>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                req.status === 'open' ? 'bg-indigo-500/10 text-indigo-500' :
                req.status === 'in_progress' ? 'bg-amber-500/10 text-amber-500' :
                'bg-emerald-500/10 text-emerald-500'
              }`}>
                Status: {req.status.replace("_", " ")}
              </span>
              {req.isAnonymous && (
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <EyeOff size={12} /> Anonymous
                </span>
              )}
            </div>

            {isTriageView && (
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                User: {req.user?.name} 
                <span className="text-[10px] font-normal text-slate-500">({req.user?.churchBranch})</span>
              </h4>
            )}
            
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60">
              <span className="font-bold text-slate-900 dark:text-white block mb-1">Original Request:</span>
              {req.description}
            </p>
          </div>
          
          {isTriageView && req.status === "open" && (
            <button onClick={() => handleUpdateStatus(req._id, "in_progress")} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs whitespace-nowrap">
              Accept Case
            </button>
          )}

          {isTriageView && req.status === "in_progress" && (
            <button onClick={() => handleUpdateStatus(req._id, "resolved")} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs whitespace-nowrap">
              Mark Resolved
            </button>
          )}
        </div>

        {/* Messaging Thread */}
        <div className="space-y-4 mt-4">
          <h5 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
            <Lock size={14} className="text-emerald-500" /> Secure Messages
          </h5>
          
          <div className="space-y-3 bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl max-h-60 overflow-y-auto">
            {req.messages?.map((msg: any, idx: number) => {
              const isMe = msg.senderId === user?.id;
              return (
                <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <span className="text-[9px] text-slate-400 font-bold mb-1 px-1">
                    {isMe ? "You" : (isTriageView ? (req.isAnonymous ? "Anonymous User" : req.user?.name) : "Counselor")}
                  </span>
                  <div className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                    isMe 
                      ? "bg-indigo-500 text-white rounded-tr-none" 
                      : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700 rounded-tl-none"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              );
            })}
            {(!req.messages || req.messages.length === 0) && (
              <p className="text-xs text-slate-400 italic text-center py-4">No messages yet. The counselor will reply here.</p>
            )}
          </div>

          {req.status !== "resolved" && req.status !== "referred" && (
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={messageInputs[req._id] || ""}
                onChange={(e) => setMessageInputs({ ...messageInputs, [req._id]: e.target.value })}
                placeholder="Type a secure reply..."
                className="flex-grow px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-xs focus:outline-none focus:border-indigo-500"
              />
              <button onClick={() => handleSendMessage(req._id)} className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs flex items-center gap-1 shadow">
                <Send size={14} /> Send
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white flex items-center justify-center gap-3">
              <HeartHandshake className="text-indigo-500" size={32} />
              {language === 'en' ? 'Pastoral Triage & Counseling' : 'የፓስተር ምክር አገልግሎት'}
            </h1>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {language === 'en'
                ? 'A secure, confidential space to request pastoral counseling, prayer support, or professional guidance for spiritual and life struggles.'
                : 'የፓስተር ምክር፣ የጸሎት ድጋፍ ወይም ለመንፈሳዊ እና ለሕይወት ትግሎች ሙያዊ መመሪያ ለመጠየቅ ደህንነቱ የተጠበቀ እና ሚስጥራዊ ቦታ።'}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveTab("get_help")}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "get_help"
                  ? "bg-indigo-500 text-white shadow-md"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <HeartHandshake size={16} />
              {language === 'en' ? 'Get Help' : 'እርዳታ ያግኙ'}
            </button>
            <button
              onClick={() => setActiveTab("my_requests")}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "my_requests"
                  ? "bg-indigo-500 text-white shadow-md"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Inbox size={16} />
              {language === 'en' ? 'My Requests Inbox' : 'የእኔ ጥያቄዎች መልእክት ሳጥን'}
            </button>
            
            {isLeader && (
              <button
                onClick={() => setActiveTab("triage")}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === "triage"
                    ? "bg-rose-500 text-white shadow-md"
                    : "bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                }`}
              >
                <Activity size={16} />
                {language === 'en' ? 'Pastoral Triage Queue' : 'የፓስተር ጥያቄዎች ሰልፍ'}
                {triageQueue.filter(q => q.status === 'open').length > 0 && (
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white text-rose-500 text-[10px]">
                    {triageQueue.filter(q => q.status === 'open').length}
                  </span>
                )}
              </button>
            )}
          </div>

          {loading ? (
            <div className="max-w-2xl mx-auto space-y-4 py-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/60 shadow-sm space-y-4">
                  <Skeleton className="h-6 w-1/4 rounded-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* TAB 1: GET HELP */}
              {activeTab === "get_help" && (
                <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 p-8 shadow-sm">
                  
                  <div className="mb-8 p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 flex gap-3">
                    <Lock size={24} className="shrink-0 text-indigo-500" />
                    <p className="text-xs leading-relaxed">
                      <strong>100% Confidential.</strong> Your request will be securely routed to the designated pastoral care team. You may choose to remain completely anonymous, and your identity will be hidden even from the responding counselor.
                    </p>
                  </div>

                  <form onSubmit={handleSubmitRequest} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">
                          Primary Topic
                        </label>
                        <select
                          value={formData.topic}
                          onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-indigo-500 text-xs"
                        >
                          {['Spiritual', 'Mental Health', 'Addiction', 'Family/Relationships', 'Other'].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">
                          Urgency Level
                        </label>
                        <select
                          value={formData.urgency}
                          onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-indigo-500 text-xs"
                        >
                          <option value="Low">Low - Can wait a few days</option>
                          <option value="Medium">Medium - Need to talk soon</option>
                          <option value="High">High - Need help ASAP</option>
                          <option value="Critical">Critical - In immediate danger</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">
                        Describe what you are going through
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Please share as much detail as you feel comfortable with. This is a safe space."
                        className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-indigo-500 text-xs resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950">
                      <input
                        type="checkbox"
                        id="anonCheck"
                        checked={formData.isAnonymous}
                        onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                        className="w-4 h-4 text-indigo-500 rounded focus:ring-indigo-500"
                      />
                      <label htmlFor="anonCheck" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                        Submit Anonymously (Hide my name & photo from counselors)
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs transition-colors shadow-md"
                    >
                      Submit Secure Request
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: MY REQUESTS */}
              {activeTab === "my_requests" && (
                <div className="max-w-3xl mx-auto space-y-6">
                  {myRequests.length > 0 ? (
                    myRequests.map((req) => (
                      <RequestThreadCard key={req._id} req={req} isTriageView={false} />
                    ))
                  ) : (
                    <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
                      <Inbox size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{language === 'en' ? 'No Open Requests' : 'ምንም ክፍት ጥያቄዎች የሉም'}</h3>
                      <p className="text-xs text-slate-500">{language === 'en' ? 'Your secure inbox is empty.' : 'የእርስዎ ደህንነቱ የተጠበቀ የመልእክት ሳጥን ባዶ ነው።'}</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: TRIAGE QUEUE (ADMINS ONLY) */}
              {activeTab === "triage" && isLeader && (
                <div className="max-w-3xl mx-auto space-y-6">
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 p-4 rounded-xl flex gap-3 text-xs font-bold">
                    <FileWarning size={20} className="shrink-0" />
                    <p>
                      CONFIDENTIAL QUEUE: This queue displays highly sensitive pastoral care requests. 
                      Please handle all cases with the utmost discretion and care.
                    </p>
                  </div>

                  {triageQueue.length > 0 ? (
                    triageQueue.map((req) => (
                      <RequestThreadCard key={req._id} req={req} isTriageView={true} />
                    ))
                  ) : (
                    <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
                      <Activity size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{language === 'en' ? 'Queue Empty' : 'ሰልፍ ባዶ ነው'}</h3>
                      <p className="text-xs text-slate-500">{language === 'en' ? 'There are no pending counseling requests.' : 'ምንም በመጠባበቅ ላይ ያሉ የምክር ጥያቄዎች የሉም።'}</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
