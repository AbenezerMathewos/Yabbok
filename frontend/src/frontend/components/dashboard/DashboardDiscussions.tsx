"use client";

import React, { useState, useEffect } from "react";

export function DashboardDiscussions() {
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [newTopic, setNewTopic] = useState({ title: "", content: "", category: "Faith" });
  const [replyInput, setReplyInput] = useState<{[key: string]: string}>({});

  const fetchDiscussions = () => {
    fetch("/api/discussions")
      .then((res) => res.json())
      .then((data) => setDiscussions(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchDiscussions();
  }, []);

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

  return (
    <div className="space-y-6">
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

          <button type="submit" className="px-6 py-2 bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold rounded-xl text-xs">
            Create Forum Topic
          </button>
        </form>
      </div>

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
              
              <button onClick={() => handleDiscussionAction(topic._id, "like")} className="hover:text-gold-500 flex items-center gap-1 font-semibold">
                👍 Like ({topic.likes?.length || 0})
              </button>

              <button onClick={() => handleDiscussionAction(topic._id, "bookmark")} className="hover:text-gold-500 flex items-center gap-1 font-semibold">
                🔖 Bookmark ({topic.bookmarks?.length || 0})
              </button>
            </div>

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

              <div className="flex gap-2 pt-2 mt-2 border-t border-slate-200/50">
                <input
                  type="text"
                  value={replyInput[topic._id] || ""}
                  onChange={(e) => setReplyInput({ ...replyInput, [topic._id]: e.target.value })}
                  placeholder="Write a forum reply..."
                  className="flex-grow px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-xs focus:outline-none"
                />
                <button onClick={() => handleAddTopicReply(topic._id)} className="px-4 py-1.5 bg-gold-500 text-slate-950 font-bold rounded-lg text-xs">
                  Reply
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
