"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/frontend/components/shared/Navbar";
import { Footer } from "@/frontend/components/shared/Footer";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { Skeleton } from "@/frontend/components/ui/skeleton";
import { Award, CheckCircle2, HelpCircle, ArrowRight, RotateCcw, Sparkles, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function QuizPage() {
  const { language } = useLanguage();
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetch("/api/quiz")
      .then((r) => r.json())
      .then((data) => {
        setQuiz(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSelectOption = (questionId: string, optionIdx: number) => {
    setSelectedAnswers({ ...selectedAnswers, [questionId]: optionIdx });
  };

  const handleSubmitQuiz = async () => {
    if (Object.keys(selectedAnswers).length < quiz.questions.length) {
      toast.warning(
        language === "en"
          ? "Please answer all questions before submitting!"
          : "እባክዎን ከማስገባትዎ በፊት ሁሉንም ጥያቄዎች ይመልሱ!"
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: selectedAnswers }),
      });
      const data = await res.json();
      setResult(data);

      if (data.unlockedBadge) {
        toast.success(
          language === "en"
            ? `🎉 Badge Unlocked: ${data.unlockedBadge.nameEn}!`
            : `🎉 አዲስ ባጅ አግኝተዋል፡ ${data.unlockedBadge.nameAm}!`
        );
      }
    } catch (e) {
      toast.error(language === "en" ? "Failed to submit quiz" : "ጥያቄዎችን ማስገባት አልተሳካም");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setResult(null);
    setCurrentIdx(0);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-slate-950 py-16 px-4">
          <div className="max-w-2xl mx-auto space-y-6">
            <Skeleton className="h-12 w-3/4 bg-slate-900 mx-auto rounded-2xl" />
            <Skeleton className="h-64 w-full bg-slate-900 rounded-3xl" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const currentQ = quiz?.questions[currentIdx];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 text-white py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/20 text-gold-400 text-xs font-bold uppercase tracking-widest border border-gold-500/30">
              <Sparkles size={16} />
              {language === "en" ? "Interactive Bible Quiz" : "የመጽሐፍ ቅዱስ ጥያቄና መልስ"}
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {language === "en" ? quiz?.titleEn : quiz?.titleAm}
            </h1>
            <p className="text-slate-400 text-sm font-medium flex items-center justify-center gap-2">
              <BookOpen size={16} className="text-gold-500" />
              {quiz?.passage}
            </p>
          </div>

          {/* Result view */}
          {result ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/40 flex items-center justify-center font-black text-2xl shadow-lg">
                🏆 {result.percentage}%
              </div>

              <div>
                <h2 className="text-2xl font-black text-white">
                  {result.passed
                    ? language === "en" ? "Congratulations! Quiz Passed!" : "እንኳን ደስ አለዎት! ጥያቄውን ተወጥተዋል!"
                    : language === "en" ? "Keep Learning & Try Again!" : "በረታተው እንደገና ይሞክሩ!"}
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  {language === "en"
                    ? `You scored ${result.score} out of ${result.totalPoints} points.`
                    : `ከ ${result.totalPoints} ነጥብ ${result.score} ነጥብ አግኝተዋል።`}
                </p>
              </div>

              {/* Unlocked Badge Alert */}
              {result.unlockedBadge && (
                <div className="p-4 rounded-2xl bg-gold-500/10 border border-gold-500/30 flex items-center gap-4 text-left max-w-md mx-auto">
                  <span className="text-3xl">{result.unlockedBadge.icon}</span>
                  <div>
                    <span className="text-gold-400 font-extrabold text-sm block">
                      {language === "en" ? result.unlockedBadge.nameEn : result.unlockedBadge.nameAm}
                    </span>
                    <span className="text-slate-400 text-xs block">
                      {language === "en" ? result.unlockedBadge.descriptionEn : result.unlockedBadge.descriptionAm}
                    </span>
                  </div>
                </div>
              )}

              {/* Explanations */}
              <div className="space-y-4 text-left pt-4 border-t border-slate-800">
                <h3 className="font-extrabold text-xs text-gold-400 uppercase tracking-widest">
                  {language === "en" ? "Scripture Explanations" : "የጥቅስ ማብራሪያዎች"}
                </h3>
                {quiz.questions.map((q: any, i: number) => (
                  <div key={q.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <p className="font-bold text-xs text-white">
                      {i + 1}. {language === "en" ? q.questionEn : q.questionAm}
                    </p>
                    <p className="text-xs text-emerald-400 font-semibold">
                      ✓ {language === "en" ? q.optionsEn[q.correctIndex] : q.optionsAm[q.correctIndex]}
                    </p>
                    <p className="text-[11px] text-slate-400 italic">
                      📖 {language === "en" ? q.explanationEn : q.explanationAm}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex justify-center gap-4 pt-4">
                <button
                  onClick={handleReset}
                  className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors flex items-center gap-2"
                >
                  <RotateCcw size={16} />
                  {language === "en" ? "Retake Quiz" : "እንደገና ይሞክሩ"}
                </button>
                <Link
                  href="/badges"
                  className="px-6 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 shadow"
                >
                  <Award size={16} />
                  {language === "en" ? "View Badges" : "ባጆችን ይመልከቱ"}
                </Link>
              </div>
            </motion.div>
          ) : (
            /* Quiz Cards */
            <div className="space-y-6">
              
              {/* Progress bar */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>
                  {language === "en" ? `Question ${currentIdx + 1} of ${quiz.questions.length}` : `ጥያቄ ${currentIdx + 1} ከ ${quiz.questions.length}`}
                </span>
                <span>{Math.round(((currentIdx + 1) / quiz.questions.length) * 100)}%</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold-500 transition-all duration-300"
                  style={{ width: `${((currentIdx + 1) / quiz.questions.length) * 100}%` }}
                />
              </div>

              {/* Question Card */}
              <motion.div
                key={currentQ.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6"
              >
                <h3 className="text-xl font-extrabold text-white leading-relaxed">
                  {language === "en" ? currentQ.questionEn : currentQ.questionAm}
                </h3>

                {/* Options List */}
                <div className="space-y-3">
                  {(language === "en" ? currentQ.optionsEn : currentQ.optionsAm).map((opt: string, oIdx: number) => {
                    const isSelected = selectedAnswers[currentQ.id] === oIdx;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectOption(currentQ.id, oIdx)}
                        className={`w-full p-4 rounded-2xl border text-left font-bold text-sm transition-all duration-200 flex items-center justify-between ${
                          isSelected
                            ? "bg-gold-500/20 border-gold-500 text-gold-300 shadow-md"
                            : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <CheckCircle2 size={18} className="text-gold-400" />}
                      </button>
                    );
                  })}
                </div>

                {/* Question Navigation */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-800/80">
                  <button
                    disabled={currentIdx === 0}
                    onClick={() => setCurrentIdx(currentIdx - 1)}
                    className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs font-bold disabled:opacity-30"
                  >
                    {language === "en" ? "Previous" : "ቀዳሚ"}
                  </button>

                  {currentIdx < quiz.questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentIdx(currentIdx + 1)}
                      className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-2 shadow"
                    >
                      {language === "en" ? "Next" : "ቀጣይ"}
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={submitting}
                      className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow disabled:opacity-50"
                    >
                      <Sparkles size={14} />
                      {language === "en" ? "Submit Quiz" : "መልስ አስገባ"}
                    </button>
                  )}
                </div>

              </motion.div>

            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}
