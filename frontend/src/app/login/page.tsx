"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { motion } from "framer-motion";
import { LogIn, Loader2, AlertCircle, Eye, EyeOff, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { t, language } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (session) router.push("/dashboard");
    const error = searchParams.get("error");
    if (error) {
      setErrorMsg(error === "CredentialsSignin" ? t("loginError") : error);
    }
  }, [session, router, searchParams, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await signIn("credentials", {
        email: email.toLowerCase(),
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });
      if (res?.error) {
        setErrorMsg(res.error);
        setLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setErrorMsg("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const testimonials = [
    { text: language === "en" ? "This platform connected me with mentors who shaped my faith journey." : "ይህ መድረክ ሃይማኖቴን ያሳደጉ አማካሪዎችን ያገናኘኝ ነው።", name: "Bereket T." },
    { text: language === "en" ? "Prayer requests are answered faster — I feel surrounded by community." : "የጸሎት ጥያቄዎቼ ፈጠን ብለው ይመለሳሉ — በህብረት ውስጥ ሆኜ ይሰማኛል።", name: "Tigist A." },
    { text: language === "en" ? "The sermons archive is incredible. I revisit them weekly for growth." : "የስብከት ቤተ-ሞገስ አስደናቂ ነው። ለዕድገት ሳምንታዊ ጎብኘዋለሁ።", name: "Samuel G." },
  ];

  const [testimonialIndex, setTestimonialIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIndex((i) => (i + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT PANEL — Brand Identity ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-slate-900 flex-col justify-between p-12">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950/80" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-slate-950 to-transparent" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg gold-glow">
              <BookOpen size={20} className="text-slate-950" />
            </div>
            <div>
              <p className="text-white font-black text-lg leading-none tracking-tight">Yabbok</p>
              <p className="text-gold-400 text-[10px] font-bold uppercase tracking-widest leading-none mt-0.5">Fellowship</p>
            </div>
          </Link>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block text-[10px] uppercase font-black tracking-[0.2em] text-gold-400 mb-4">
              📖 {language === "en" ? "Verse of the Day" : "የቀኑ ቃል"}
            </span>
            <blockquote className="text-2xl font-bold text-white leading-relaxed mb-4 italic">
              &ldquo;{t("verseText")}&rdquo;
            </blockquote>
            <cite className="text-gold-400 font-bold text-sm not-italic">— {t("verseRef")}</cite>
          </motion.div>
        </div>

        {/* Testimonial Carousel */}
        <div className="relative z-10 border border-white/10 rounded-2xl p-6 bg-white/5 backdrop-blur-sm">
          <motion.div
            key={testimonialIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-slate-300 text-sm leading-relaxed mb-3 italic">
              &ldquo;{testimonials[testimonialIndex].text}&rdquo;
            </p>
            <p className="text-gold-400 font-bold text-xs">— {testimonials[testimonialIndex].name}</p>
          </motion.div>
          <div className="flex gap-1.5 mt-4">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setTestimonialIndex(i)}
                className={`h-1 rounded-full transition-all duration-300 ${i === testimonialIndex ? "w-6 bg-gold-500" : "w-2 bg-white/20"}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — Login Form ── */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
              <BookOpen size={16} className="text-slate-950" />
            </div>
            <span className="font-black text-foreground">Yabbok Fellowship</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-foreground tracking-tight mb-2">
              {t("loginTitle")}
            </h1>
            <p className="text-muted-foreground text-sm font-medium">{t("loginSubtitle")}</p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-sm font-medium"
            >
              <AlertCircle size={18} className="shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">
                {t("formEmail")}
              </Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="h-12 rounded-xl border-border focus-visible:ring-primary text-sm"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-semibold text-foreground">
                  {t("regPassword")}
                </Label>
                <Link href="#" className="text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                  {t("loginForgot")}
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 rounded-xl border-border focus-visible:ring-primary text-sm pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                className="rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer select-none">
                {language === "en" ? "Remember me" : "አስታውሰኝ"}
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 shadow-lg transition-all gold-glow"
            >
              {loading ? (
                <Loader2 className="animate-spin mr-2" size={18} />
              ) : (
                <LogIn size={18} className="mr-2" />
              )}
              {loading ? (language === "en" ? "Signing in…" : "እየገባ ነው…") : t("btnSignIn")}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            {language === "en" ? "Don't have an account?" : "አካውንት የለዎትም?"}{" "}
            <Link href="/register" className="text-primary font-bold hover:underline">
              {language === "en" ? "Create one" : "ይመዝገቡ"}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center animate-pulse">
            <BookOpen size={24} className="text-slate-950" />
          </div>
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
