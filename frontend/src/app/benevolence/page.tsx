"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/frontend/components/shared/Navbar";
import { Footer } from "@/frontend/components/shared/Footer";
import { Loader2, Heart, ShieldAlert, CreditCard, CheckCircle, HandCoins, Building, Droplet, Pill, ShieldCheck, XCircle } from "lucide-react";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { toast } from "sonner";
import { Skeleton } from "@/frontend/components/ui/skeleton";

export default function BenevolencePage() {
  const { language } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();

  const user = session?.user as any;
  const isLeader = ['admin', 'super_admin', 'moderator', 'church_leader'].includes(user?.role);
  
  const [activeTab, setActiveTab] = useState<"request" | "my_requests" | "board">("request");
  const [loading, setLoading] = useState(true);
  
  // Data
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [boardRequests, setBoardRequests] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    amountRequested: "",
    category: "Housing/Rent",
    description: "",
  });

  const [leaderUpdates, setLeaderUpdates] = useState<{[key: string]: { amountApproved: string, notes: string }}>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const resMy = await fetch("/api/benevolence?view=my_requests");
      if (resMy.ok) setMyRequests(await resMy.json());

      if (isLeader) {
        const resBoard = await fetch("/api/benevolence?view=admin");
        if (resBoard.ok) {
          const boardData = await resBoard.json();
          setBoardRequests(boardData);
          
          // Initialize leader inputs
          const updates: any = {};
          boardData.forEach((req: any) => {
            updates[req._id] = {
              amountApproved: req.amountApproved || req.amountRequested || "",
              notes: req.reviewerNotes || "",
            };
          });
          setLeaderUpdates(updates);
        }
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
    if (!formData.amountRequested || !formData.description) return;

    try {
      const res = await fetch("/api/benevolence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(language === 'en' ? "Your request for financial assistance has been securely submitted." : "የገንዘብ እርዳታ ጥያቄዎ በደህንነት ቀርቧል።");
        setFormData({ amountRequested: "", category: "Housing/Rent", description: "" });
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
      const updateData = leaderUpdates[requestId];
      const payload = {
        requestId,
        status: newStatus,
        amountApproved: updateData.amountApproved,
        reviewerNotes: updateData.notes,
      };

      const res = await fetch("/api/benevolence", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (status === "loading" || !session) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-purple-500" size={36} />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
      case "reviewing": return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "approved": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
      case "funded": return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400";
      case "rejected": return "bg-rose-500/10 text-rose-600 dark:text-rose-400";
      default: return "bg-slate-500/10 text-slate-600 dark:text-slate-400";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Housing/Rent": return <Building size={16} />;
      case "Medical": return <Pill size={16} />;
      case "Food/Groceries": return <Heart size={16} />;
      case "Utilities": return <Droplet size={16} />;
      default: return <HandCoins size={16} />;
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white flex items-center justify-center gap-3">
              <ShieldCheck className="text-purple-500" size={32} />
              {language === 'en' ? 'Crisis Benevolence Fund' : 'የችግር ጊዜ በጎ አድራጎት ፈንድ'}
            </h1>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {language === 'en'
                ? "We are called to bear one another's burdens. If you are facing severe financial hardship, the church is here to help support you through this crisis."
                : 'የእርስ በርሳችንን ሸክም እንድንሸከም ተጠርተናል። ከባድ የገንዘብ ችግር እያጋጠመዎት ከሆነ፣ ቤተክርስቲያን በዚህ ችግር ውስጥ እርስዎን ለመደገፍ እዚህ አለች።'}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveTab("request")}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "request"
                  ? "bg-purple-500 text-white shadow-md"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Heart size={16} /> {language === 'en' ? 'Request Assistance' : 'እርዳታ ይጠይቁ'}
            </button>
            <button
              onClick={() => setActiveTab("my_requests")}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "my_requests"
                  ? "bg-purple-500 text-white shadow-md"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <CreditCard size={16} /> {language === 'en' ? 'My Requests' : 'የእኔ ጥያቄዎች'}
            </button>
            
            {isLeader && (
              <button
                onClick={() => setActiveTab("board")}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === "board"
                    ? "bg-purple-700 text-white shadow-md"
                    : "bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/50 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                }`}
              >
                <ShieldAlert size={16} /> {language === 'en' ? 'Benevolence Board' : 'የበጎ አድራጎት ቦርድ'}
                {boardRequests.filter(r => r.status === 'pending' || r.status === 'reviewing').length > 0 && (
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white text-purple-700 text-[10px]">
                    {boardRequests.filter(r => r.status === 'pending' || r.status === 'reviewing').length}
                  </span>
                )}
              </button>
            )}
          </div>

          {loading ? (
            <div className="max-w-2xl mx-auto space-y-4 py-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/60 shadow-sm space-y-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-1/4 rounded-full" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="h-10 w-1/3" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* TAB 1: REQUEST ASSISTANCE */}
              {activeTab === "request" && (
                <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 p-8 shadow-sm">
                  
                  <div className="mb-8 p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400 flex gap-3">
                    <ShieldAlert size={24} className="shrink-0 text-amber-500" />
                    <p className="text-xs leading-relaxed">
                      <strong>Confidentiality Assured.</strong> Your request will only be seen by the pastoral Benevolence Board. We review requests promptly and will contact you securely. 
                    </p>
                  </div>

                  <form onSubmit={handleSubmitRequest} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">
                          Category of Need
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-purple-500 text-xs"
                        >
                          {['Housing/Rent', 'Medical', 'Food/Groceries', 'Utilities', 'Other'].map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">
                          Amount Needed (USD)
                        </label>
                        <input
                          required
                          type="number"
                          min="1"
                          placeholder="e.g. 500"
                          value={formData.amountRequested}
                          onChange={(e) => setFormData({ ...formData, amountRequested: e.target.value })}
                          className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-purple-500 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">
                        Describe the crisis and why you need assistance
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Please provide details about the financial hardship you are facing."
                        className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-purple-500 text-xs resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl text-xs transition-colors shadow-md"
                    >
                      Submit Confidential Request
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: MY REQUESTS */}
              {activeTab === "my_requests" && (
                <div className="max-w-2xl mx-auto space-y-4">
                  {myRequests.map((req) => (
                    <div key={req._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 p-6 shadow-sm flex flex-col gap-4">
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {getCategoryIcon(req.category)}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{req.category}</span>
                          </div>
                          <h4 className="font-extrabold text-2xl text-slate-900 dark:text-white">
                            ${req.amountRequested.toLocaleString()}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">Requested on {new Date(req.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getStatusColor(req.status)}`}>
                          {req.status}
                        </span>
                      </div>
                      
                      <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 line-clamp-3">
                        {req.description}
                      </p>

                      {req.amountApproved && (req.status === 'approved' || req.status === 'funded') && (
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                            Approved Amount: ${req.amountApproved.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                  {myRequests.length === 0 && (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
                      <CreditCard size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{language === 'en' ? 'No Assistance Requests' : 'ምንም የእርዳታ ጥያቄዎች የሉም'}</h3>
                      <p className="text-xs text-slate-500">{language === 'en' ? "You haven't requested any financial assistance." : 'ምንም የገንዘብ እርዳታ አልጠየቁም።'}</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: BENEVOLENCE BOARD (LEADERS ONLY) */}
              {activeTab === "board" && isLeader && (
                <div className="space-y-6">
                  {boardRequests.map((req) => (
                    <div key={req._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 p-6 shadow-sm">
                      
                      <div className="flex flex-wrap justify-between items-start gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <div className="flex gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusColor(req.status)}`}>
                              {req.status}
                            </span>
                            <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                              {getCategoryIcon(req.category)} {req.category}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-lg text-slate-900 dark:text-white mb-1">
                            {req.applicant?.name} <span className="text-sm font-normal text-slate-500">({req.applicant?.email})</span>
                          </h4>
                          <p className="text-xs text-slate-500">
                            Requested: <span className="font-bold text-slate-900 dark:text-white">${req.amountRequested.toLocaleString()}</span> on {new Date(req.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        {req.status !== 'funded' && req.status !== 'rejected' && (
                          <div className="flex flex-col gap-2 shrink-0 w-32">
                            {req.status === 'pending' && (
                              <button onClick={() => handleUpdateStatus(req._id, "reviewing")} className="w-full py-1.5 bg-blue-500 text-white font-bold rounded text-[10px] uppercase">
                                Start Review
                              </button>
                            )}
                            {(req.status === 'pending' || req.status === 'reviewing') && (
                              <>
                                <button onClick={() => handleUpdateStatus(req._id, "approved")} className="w-full py-1.5 bg-emerald-500 text-white font-bold rounded text-[10px] uppercase">
                                  Approve
                                </button>
                                <button onClick={() => handleUpdateStatus(req._id, "rejected")} className="w-full py-1.5 bg-rose-500 text-white font-bold rounded text-[10px] uppercase">
                                  Reject
                                </button>
                              </>
                            )}
                            {req.status === 'approved' && (
                              <button onClick={() => handleUpdateStatus(req._id, "funded")} className="w-full py-1.5 bg-indigo-500 text-white font-bold rounded text-[10px] uppercase flex justify-center gap-1 items-center">
                                <HandCoins size={12} /> Mark Funded
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white mb-2">Member's Situation</h5>
                          <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed whitespace-pre-wrap">
                            {req.description}
                          </p>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">Approved Amount ($)</label>
                            <input
                              type="number"
                              value={leaderUpdates[req._id]?.amountApproved || ""}
                              onChange={(e) => setLeaderUpdates({
                                ...leaderUpdates,
                                [req._id]: { ...leaderUpdates[req._id], amountApproved: e.target.value }
                              })}
                              disabled={req.status === 'funded' || req.status === 'rejected'}
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:border-purple-500 disabled:opacity-50"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">Private Board Notes (Internal Only)</label>
                            <textarea
                              rows={3}
                              value={leaderUpdates[req._id]?.notes || ""}
                              onChange={(e) => setLeaderUpdates({
                                ...leaderUpdates,
                                [req._id]: { ...leaderUpdates[req._id], notes: e.target.value }
                              })}
                              disabled={req.status === 'funded' || req.status === 'rejected'}
                              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:border-purple-500 resize-none disabled:opacity-50"
                              placeholder="Record decision details here..."
                            />
                          </div>
                          {(req.status !== 'funded' && req.status !== 'rejected') && (
                            <button
                              onClick={() => handleUpdateStatus(req._id, req.status)}
                              className="w-full py-2 bg-slate-800 text-white font-bold rounded-lg text-xs hover:bg-slate-700"
                            >
                              Save Notes & Amount
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  ))}
                  {boardRequests.length === 0 && (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
                      <ShieldAlert size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{language === 'en' ? 'Board is Clear' : 'ቦርድ ባዶ ነው'}</h3>
                      <p className="text-xs text-slate-500">{language === 'en' ? 'No benevolence requests submitted.' : 'ምንም የበጎ አድራጎት ጥያቄዎች አልቀረቡም።'}</p>
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
