"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/frontend/components/shared/Navbar";
import { Footer } from "@/frontend/components/shared/Footer";
import { Loader2, Users, Search, ClipboardList, Briefcase, Plus, CheckCircle, XCircle } from "lucide-react";
import { useLanguage } from "@/frontend/context/LanguageContext";

export default function VolunteerPage() {
  const { language } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();

  const user = session?.user as any;
  const isLeader = ['admin', 'super_admin', 'moderator', 'church_leader'].includes(user?.role);
  
  const [activeTab, setActiveTab] = useState<"browse" | "my_apps" | "manage">("browse");
  const [loading, setLoading] = useState(true);
  
  // Data
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  
  // Manage Data (For Leaders)
  const [pendingOpps, setPendingOpps] = useState<any[]>([]);
  const [allApplications, setAllApplications] = useState<any[]>([]);

  // Form State for creating an opportunity
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    skillsRequired: "",
    date: "",
    churchBranch: "",
  });

  const [applyNotes, setApplyNotes] = useState<{[key: string]: string}>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const resOpps = await fetch("/api/volunteer/opportunities");
      if (resOpps.ok) setOpportunities(await resOpps.json());

      const resApps = await fetch("/api/volunteer/applications");
      if (resApps.ok) setMyApplications(await resApps.json());

      if (isLeader) {
        const resPendingOpps = await fetch("/api/volunteer/opportunities?view=pending");
        if (resPendingOpps.ok) setPendingOpps(await resPendingOpps.json());

        const resAllApps = await fetch("/api/volunteer/applications?view=admin");
        if (resAllApps.ok) setAllApplications(await resAllApps.json());
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

  const handleCreateOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        skillsRequired: formData.skillsRequired.split(",").map(s => s.trim()).filter(s => s),
      };

      const res = await fetch("/api/volunteer/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(isLeader ? "Opportunity published successfully." : "Opportunity submitted for pastoral review!");
        setFormData({ title: "", description: "", skillsRequired: "", date: "", churchBranch: "" });
        setShowForm(false);
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create opportunity.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApply = async (opportunityId: string) => {
    try {
      const res = await fetch("/api/volunteer/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId, notes: applyNotes[opportunityId] || "" }),
      });

      if (res.ok) {
        alert("Application submitted!");
        setApplyNotes({ ...applyNotes, [opportunityId]: "" });
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to apply.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateOpportunityStatus = async (opportunityId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/volunteer/opportunities", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunityId, status: newStatus }),
      });
      if (res.ok) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/volunteer/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, status: newStatus }),
      });
      if (res.ok) loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (status === "loading" || !session) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-teal-500" size={36} />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
      case "accepted":
      case "approved": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
      case "declined":
      case "rejected": return "bg-rose-500/10 text-rose-600 dark:text-rose-400";
      default: return "bg-slate-500/10 text-slate-600 dark:text-slate-400";
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white flex items-center justify-center gap-3">
              <Users className="text-teal-500" size={32} />
              {language === 'en' ? 'Volunteer & Skills Mobilization' : 'የበጎ ፈቃደኞች እና የክህሎት ማስተባበሪያ'}
            </h1>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {language === 'en' 
                ? 'Use your God-given talents to serve the church and the community. Browse open opportunities or propose a new initiative.' 
                : 'እግዚአብሔር የሰጠዎትን ተሰጥኦ ቤተክርስቲያንን እና ማህበረሰቡን ለማገልገል ይጠቀሙበት። ክፍት እድሎችን ያስሱ ወይም አዲስ አነሳሽነት ያቅርቡ።'}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveTab("browse")}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "browse"
                  ? "bg-teal-500 text-white shadow-md"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Search size={16} /> {language === 'en' ? 'Browse Opportunities' : 'እድሎችን ያስሱ'}
            </button>
            <button
              onClick={() => setActiveTab("my_apps")}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "my_apps"
                  ? "bg-teal-500 text-white shadow-md"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <ClipboardList size={16} /> {language === 'en' ? 'My Applications' : 'የእኔ ማመልከቻዎች'}
            </button>
            
            {isLeader && (
              <button
                onClick={() => setActiveTab("manage")}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                  activeTab === "manage"
                    ? "bg-teal-700 text-white shadow-md"
                    : "bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-900/50 text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                }`}
              >
                <Briefcase size={16} /> {language === 'en' ? 'Manage Mobilization' : 'ማስተባበሪያ አስተዳድር'}
                {(pendingOpps.length > 0 || allApplications.filter(a => a.status === 'pending').length > 0) && (
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white text-teal-700 text-[10px]">
                    {pendingOpps.length + allApplications.filter(a => a.status === 'pending').length}
                  </span>
                )}
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-teal-500" size={32} />
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* TAB 1: BROWSE OPPORTUNITIES */}
              {activeTab === "browse" && (
                <div className="space-y-6">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowForm(!showForm)}
                      className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-xl text-xs flex items-center gap-2 hover:bg-slate-800 dark:hover:bg-white"
                    >
                      {showForm ? <XCircle size={16} /> : <Plus size={16} />}
                      {showForm ? (language === 'en' ? "Cancel" : "ሰርዝ") : (isLeader ? (language === 'en' ? "Create Opportunity" : "እድል ፍጠር") : (language === 'en' ? "Suggest an Opportunity" : "እድል ሀሳብ አቅርብ"))}
                    </button>
                  </div>

                  {showForm && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 p-6 shadow-sm mb-6 max-w-2xl mx-auto">
                      <h3 className="font-extrabold text-base mb-4 text-slate-900 dark:text-white">
                        {isLeader ? (language === 'en' ? "Create Official Opportunity" : "ይፋዊ እድል ፍጠር") : (language === 'en' ? "Propose a Volunteer Opportunity" : "የበጎ ፈቃድ እድል ያቅርቡ")}
                      </h3>
                      {!isLeader && (
                        <p className="text-xs text-slate-500 mb-4">
                          Have an idea for how we can serve? Propose an opportunity here. Church leaders will review and approve it for the congregation.
                        </p>
                      )}
                      <form onSubmit={handleCreateOpportunity} className="space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">Title</label>
                          <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:border-teal-500" placeholder="e.g. Graphic Designer for Youth Retreat" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">Description</label>
                          <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:border-teal-500" placeholder="What will the volunteer be doing?" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">Skills Required (Comma separated)</label>
                          <input type="text" value={formData.skillsRequired} onChange={e => setFormData({...formData, skillsRequired: e.target.value})} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:border-teal-500" placeholder="e.g. Photoshop, Event Planning, Heavy Lifting" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">Date (Optional)</label>
                            <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:border-teal-500" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1">Branch/Location (Optional)</label>
                            <input type="text" value={formData.churchBranch} onChange={e => setFormData({...formData, churchBranch: e.target.value})} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:border-teal-500" placeholder="e.g. Main Campus" />
                          </div>
                        </div>
                        <button type="submit" className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl text-xs">
                          {isLeader ? (language === 'en' ? "Publish Opportunity" : "እድል አትም") : (language === 'en' ? "Submit Proposal" : "ሀሳቡን አስገባ")}
                        </button>
                      </form>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {opportunities.map((opp) => (
                      <div key={opp._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 p-6 flex flex-col justify-between shadow-sm">
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-3">
                            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-2">{opp.title}</h3>
                            {opp.date && (
                              <span className="shrink-0 text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                {new Date(opp.date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">{opp.description}</p>
                          
                          {opp.skillsRequired && opp.skillsRequired.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {opp.skillsRequired.map((skill: string, idx: number) => (
                                <span key={idx} className="px-2 py-0.5 rounded text-[9px] font-bold bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-300 uppercase tracking-wider border border-teal-100 dark:border-teal-800">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {opp.churchBranch && (
                            <p className="text-[10px] text-slate-500 mb-4 font-bold flex items-center gap-1">
                              📍 {opp.churchBranch}
                            </p>
                          )}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                          {myApplications.find(a => a.opportunity._id === opp._id || a.opportunity === opp._id) ? (
                            <button disabled className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 font-bold rounded-xl text-xs cursor-not-allowed">
                              Already Applied
                            </button>
                          ) : (
                            <div className="flex flex-col gap-2">
                              <input
                                type="text"
                                placeholder="Optional note for the leader..."
                                value={applyNotes[opp._id] || ""}
                                onChange={(e) => setApplyNotes({...applyNotes, [opp._id]: e.target.value})}
                                className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 text-[10px] focus:outline-none focus:border-teal-500"
                              />
                              <button onClick={() => handleApply(opp._id)} className="w-full py-2 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl text-xs">
                                Apply to Serve
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {opportunities.length === 0 && !showForm && (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
                      <Search size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{language === 'en' ? 'No Opportunities Right Now' : 'በአሁኑ ጊዜ ምንም እድሎች የሉም'}</h3>
                      <p className="text-xs text-slate-500">{language === 'en' ? 'Check back later or propose a new way to serve.' : 'በኋላ ተመልሰው ያረጋግጡ ወይም ለማገልገል አዲስ መንገድ ያቅርቡ።'}</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: MY APPLICATIONS */}
              {activeTab === "my_apps" && (
                <div className="max-w-3xl mx-auto space-y-4">
                  {myApplications.map((app) => (
                    <div key={app._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 p-5 flex flex-wrap justify-between items-center gap-4 shadow-sm">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{app.opportunity?.title || "Deleted Opportunity"}</h4>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{app.opportunity?.description || "No description available."}</p>
                        {app.notes && (
                          <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg inline-block">
                            <span className="font-bold">Your note:</span> {app.notes}
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </div>
                  ))}
                  {myApplications.length === 0 && (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
                      <ClipboardList size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Applications</h3>
                      <p className="text-xs text-slate-500">You haven't volunteered for anything yet.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: MANAGE (ADMIN/LEADERS ONLY) */}
              {activeTab === "manage" && isLeader && (
                <div className="space-y-8">
                  
                  {/* Pending Proposed Opportunities */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 p-6 shadow-sm">
                    <h3 className="font-extrabold text-base mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                      Proposed Opportunities
                      <span className="bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300 text-[10px] px-2 py-0.5 rounded-full">{pendingOpps.length}</span>
                    </h3>
                    <div className="space-y-4">
                      {pendingOpps.map((opp) => (
                        <div key={opp._id} className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-4 flex flex-wrap justify-between items-start gap-4 border border-slate-100 dark:border-slate-800">
                          <div className="flex-grow">
                            <div className="flex gap-2 items-center mb-1">
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{opp.title}</h4>
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                                By {opp.createdBy?.name || "Unknown"}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{opp.description}</p>
                            {opp.skillsRequired && opp.skillsRequired.length > 0 && (
                              <div className="flex gap-1 text-[10px] text-slate-500">Skills: {opp.skillsRequired.join(", ")}</div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleUpdateOpportunityStatus(opp._id, "approved")} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-[10px] uppercase">
                              Approve
                            </button>
                            <button onClick={() => handleUpdateOpportunityStatus(opp._id, "rejected")} className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg text-[10px] uppercase">
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                      {pendingOpps.length === 0 && (
                        <p className="text-xs text-slate-400 italic text-center py-6">No pending proposals from members.</p>
                      )}
                    </div>
                  </div>

                  {/* Incoming Volunteer Applications */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 p-6 shadow-sm">
                    <h3 className="font-extrabold text-base mb-4 text-slate-900 dark:text-white flex items-center gap-2">
                      Incoming Volunteer Applications
                      <span className="bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300 text-[10px] px-2 py-0.5 rounded-full">{allApplications.length}</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {allApplications.map((app) => (
                        <div key={app._id} className="bg-slate-50 dark:bg-slate-950/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1">
                                {app.applicant?.name} 
                                <span className="text-[10px] font-normal text-slate-500">({app.applicant?.email})</span>
                              </h4>
                              <p className="text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase mt-1 tracking-wider">
                                Applied for: {app.opportunity?.title}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${getStatusColor(app.status)}`}>
                              {app.status}
                            </span>
                          </div>
                          
                          {app.notes && (
                            <p className="text-[10px] text-slate-600 dark:text-slate-400 mb-3 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                              "{app.notes}"
                            </p>
                          )}
                          
                          {app.status === "pending" && (
                            <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                              <button onClick={() => handleUpdateApplicationStatus(app._id, "accepted")} className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-[10px] uppercase flex items-center justify-center gap-1">
                                <CheckCircle size={12} /> Accept
                              </button>
                              <button onClick={() => handleUpdateApplicationStatus(app._id, "declined")} className="flex-1 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg text-[10px] uppercase flex items-center justify-center gap-1">
                                <XCircle size={12} /> Decline
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                      {allApplications.length === 0 && (
                        <div className="col-span-full text-xs text-slate-400 italic text-center py-6">
                          No applications have been submitted yet.
                        </div>
                      )}
                    </div>
                  </div>

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
