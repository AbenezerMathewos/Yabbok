"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/frontend/components/shared/Navbar";
import { Footer } from "@/frontend/components/shared/Footer";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { Loader2, Users, UserPlus, BookOpen, ShieldCheck, CheckCircle, XCircle } from "lucide-react";

export default function MentorshipPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, language } = useLanguage();

  const user = session?.user as any;
  const [activeTab, setActiveTab] = useState<"find" | "connections" | "become">("find");
  
  // Data states
  const [mentors, setMentors] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [myProfile, setMyProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Forms
  const [requestGoals, setRequestGoals] = useState("");
  const [mentorForm, setMentorForm] = useState({
    expertise: [] as string[],
    bio: "",
    maxMentees: 3
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [mentorsRes, connRes, profRes] = await Promise.all([
        fetch("/api/mentorship/mentors"),
        fetch("/api/mentorship/connections"),
        fetch("/api/mentorship/profile")
      ]);
      
      if (mentorsRes.ok) setMentors(await mentorsRes.json());
      if (connRes.ok) setConnections(await connRes.json());
      if (profRes.ok) {
        const prof = await profRes.json();
        setMyProfile(prof);
        if (prof) {
          setMentorForm({
            expertise: prof.expertise,
            bio: prof.bio,
            maxMentees: prof.maxMentees
          });
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

  const handleRequestMentor = async (mentorId: string) => {
    const goals = prompt("What are your spiritual or career goals for this mentorship?");
    if (!goals) return;

    try {
      const res = await fetch("/api/mentorship/connections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorId, goals: [goals] })
      });
      if (res.ok) {
        alert("Mentorship request sent successfully!");
        loadData();
        setActiveTab("connections");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to send request.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateConnection = async (connectionId: string, connStatus: string) => {
    try {
      const res = await fetch("/api/mentorship/connections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId, status: connStatus })
      });
      if (res.ok) {
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || "Update failed.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegisterMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/mentorship/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mentorForm)
      });
      if (res.ok) {
        alert("Mentor profile updated! Pending admin approval.");
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || "Registration failed.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleExpertise = (skill: string) => {
    setMentorForm(prev => {
      const exists = prev.expertise.includes(skill);
      return {
        ...prev,
        expertise: exists 
          ? prev.expertise.filter(e => e !== skill)
          : [...prev.expertise, skill]
      };
    });
  };

  if (status === "loading" || !session) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-gold-500" size={36} />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white">
              {language === 'en' ? 'Spiritual Mentorship Matchmaking' : 'መንፈሳዊ የምክር እና የማስተማር አገልግሎት'}
            </h1>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              {language === 'en' 
                ? 'Connect with mature church members for spiritual guidance, career advice, and life coaching based on biblical principles.' 
                : 'በመጽሐፍ ቅዱሳዊ መርሆዎች ላይ የተመሠረተ መንፈሳዊ መመሪያ፣ የሙያ ምክር እና የሕይወት ስልጠና ለማግኘት ከበሰሉ የቤተክርስቲያን አባላት ጋር ይገናኙ።'}
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveTab("find")}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "find"
                  ? "bg-gold-500 text-slate-950 shadow-md"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Users size={16} />
              {language === 'en' ? 'Find a Mentor' : 'አማካሪ ያግኙ'}
            </button>
            <button
              onClick={() => setActiveTab("connections")}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "connections"
                  ? "bg-gold-500 text-slate-950 shadow-md"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <ShieldCheck size={16} />
              {language === 'en' ? 'My Connections' : 'የእኔ ግንኙነቶች'}
              {connections.filter(c => c.status === "pending" && c.mentorId?._id === user?.id).length > 0 && (
                <span className="w-5 h-5 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px]">
                  {connections.filter(c => c.status === "pending" && c.mentorId?._id === user?.id).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("become")}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === "become"
                  ? "bg-gold-500 text-slate-950 shadow-md"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <UserPlus size={16} />
              {language === 'en' ? 'Become a Mentor' : 'አማካሪ ይሁኑ'}
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-gold-500" size={32} />
            </div>
          ) : (
            <>
              {/* TAB 1: FIND A MENTOR */}
              {activeTab === "find" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mentors.length > 0 ? (
                    mentors.map((mentor) => (
                      <div key={mentor._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 p-6 shadow-sm flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gold-500 flex items-center justify-center text-white font-bold text-xl shrink-0 overflow-hidden">
                              {mentor.user?.profilePhoto ? (
                                <img src={mentor.user.profilePhoto} alt={mentor.user.name} className="w-full h-full object-cover" />
                              ) : (
                                mentor.user?.name?.charAt(0)
                              )}
                            </div>
                            <div>
                              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                                {mentor.user?.name}
                              </h3>
                              <span className="text-[10px] uppercase font-bold text-slate-400 block mt-0.5">
                                {mentor.user?.churchBranch} · {mentor.user?.educationalStatus}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3 mb-4">
                            {mentor.bio || "No biography provided."}
                          </p>

                          <div className="flex flex-wrap gap-1.5 mb-6">
                            {mentor.expertise.map((skill: string) => (
                              <span key={skill} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <button 
                          onClick={() => handleRequestMentor(mentor.user?._id)}
                          disabled={mentor.user?._id === user?.id || mentor.currentMentees >= mentor.maxMentees}
                          className="w-full py-2.5 bg-gold-500 hover:bg-gold-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-slate-950 font-bold rounded-xl text-xs transition-colors"
                        >
                          {mentor.user?._id === user?.id 
                            ? "This is you" 
                            : mentor.currentMentees >= mentor.maxMentees 
                            ? "Mentor is full" 
                            : "Request Mentorship"}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-20 text-center">
                      <Users size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{language === 'en' ? 'No Mentors Available' : 'ምንም አማካሪዎች አይገኙም'}</h3>
                      <p className="text-xs text-slate-500">{language === 'en' ? 'Check back later or become the first mentor!' : 'በኋላ ተመልሰው ያረጋግጡ ወይም የመጀመሪያው አማካሪ ይሁኑ!'} </p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: MY CONNECTIONS */}
              {activeTab === "connections" && (
                <div className="space-y-6">
                  {connections.length > 0 ? (
                    connections.map((conn) => {
                      const isMentor = conn.mentorId?._id === user?.id;
                      const partner = isMentor ? conn.menteeId : conn.mentorId;

                      return (
                        <div key={conn._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 p-6 shadow-sm">
                          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-4 mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold overflow-hidden shrink-0">
                                {partner?.profilePhoto ? (
                                  <img src={partner.profilePhoto} alt={partner.name} className="w-full h-full object-cover" />
                                ) : (
                                  partner?.name?.charAt(0)
                                )}
                              </div>
                              <div>
                                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                                  {partner?.name}
                                </h4>
                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                  Role: {isMentor ? "Mentee" : "Mentor"} · {partner?.churchBranch}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                conn.status === 'active' ? 'bg-emerald-500/10 text-emerald-600' :
                                conn.status === 'pending' ? 'bg-amber-500/10 text-amber-600 animate-pulse' :
                                'bg-slate-100 dark:bg-slate-800 text-slate-500'
                              }`}>
                                Status: {conn.status}
                              </span>

                              {/* Actions for Pending */}
                              {conn.status === "pending" && isMentor && (
                                <>
                                  <button onClick={() => handleUpdateConnection(conn._id, "active")} className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg" title="Accept">
                                    <CheckCircle size={16} />
                                  </button>
                                  <button onClick={() => handleUpdateConnection(conn._id, "declined")} className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg" title="Decline">
                                    <XCircle size={16} />
                                  </button>
                                </>
                              )}

                              {/* Actions for Active */}
                              {conn.status === "active" && (
                                <button onClick={() => handleUpdateConnection(conn._id, "completed")} className="px-3 py-1 bg-slate-800 hover:bg-slate-950 text-white rounded-lg text-[10px] font-bold uppercase">
                                  Mark Completed
                                </button>
                              )}
                            </div>
                          </div>

                          <div>
                            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Mentorship Goals</h5>
                            <div className="flex flex-wrap gap-2">
                              {conn.goals.map((goal: string, i: number) => (
                                <span key={i} className="px-2.5 py-1 rounded-lg bg-gold-500/10 text-gold-600 dark:text-gold-400 text-xs font-semibold">
                                  🎯 {goal}
                                </span>
                              ))}
                              {conn.goals.length === 0 && <span className="text-xs text-slate-400 italic">No specific goals set.</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-20 text-center">
                      <ShieldCheck size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{language === 'en' ? 'No Connections Yet' : 'እስካሁን ምንም ግንኙነቶች የሉም'}</h3>
                      <p className="text-xs text-slate-500">{language === 'en' ? 'Go to "Find a Mentor" to request guidance.' : 'መመሪያ ለመጠየቅ ወደ "አማካሪ ያግኙ" ይሂዱ።'}</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: BECOME A MENTOR */}
              {activeTab === "become" && (
                <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 p-8 shadow-sm">
                  {myProfile ? (
                    <div className="mb-6 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-start gap-3">
                      <CheckCircle size={20} className="shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-sm">Profile Registered</h4>
                        <p className="text-xs mt-1 leading-relaxed">
                          Your mentor profile is registered. 
                          Status: <span className="font-bold">{myProfile.isApproved ? "Approved (Live)" : "Pending Admin Approval"}</span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 p-4 rounded-xl border border-gold-500/20 bg-gold-500/10 text-gold-700 dark:text-gold-400">
                      <h4 className="font-bold text-sm">Become a Mentor</h4>
                      <p className="text-xs mt-1 leading-relaxed">
                        Share your wisdom and experience with the younger generation. Fill out the form below to register. You will need admin approval before appearing on the public list.
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleRegisterMentor} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">
                        Areas of Expertise
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {["Spiritual Growth", "Career Advice", "Marriage & Family", "Bible Study", "Leadership", "Mental Health", "Education", "Evangelism"].map(skill => {
                          const isSelected = mentorForm.expertise.includes(skill);
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => toggleExpertise(skill)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                                isSelected 
                                  ? "bg-gold-500 border-gold-500 text-slate-950 shadow-sm" 
                                  : "bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 hover:border-gold-500"
                              }`}
                            >
                              {skill}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">
                        Biography & Experience
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={mentorForm.bio}
                        onChange={(e) => setMentorForm({ ...mentorForm, bio: e.target.value })}
                        placeholder="Briefly describe your spiritual journey, career, and how you can help mentees..."
                        className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-xs resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2">
                        Maximum Concurrent Mentees
                      </label>
                      <select
                        value={mentorForm.maxMentees}
                        onChange={(e) => setMentorForm({ ...mentorForm, maxMentees: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-xs"
                      >
                        {[1, 2, 3, 4, 5, 10].map(num => (
                          <option key={num} value={num}>{num} {num === 1 ? 'Mentee' : 'Mentees'}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={mentorForm.expertise.length === 0}
                      className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-gold-500 dark:hover:bg-gold-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded-xl text-xs transition-colors"
                    >
                      {myProfile ? "Update Profile" : "Submit Mentor Application"}
                    </button>
                  </form>
                </div>
              )}
            </>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
