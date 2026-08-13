"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { Navbar } from "@/frontend/components/shared/Navbar";
import { Footer } from "@/frontend/components/shared/Footer";
import { LogIn, Loader2, AlertCircle } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { t, language } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // If already logged in, send to dashboard
    if (session) {
      router.push("/dashboard");
    }

    // Check url search parameters for errors
    const error = searchParams.get("error");
    if (error) {
      if (error === "CredentialsSignin") {
        setErrorMsg(t("loginError"));
      } else {
        setErrorMsg(error);
      }
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
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="flex-grow bg-slate-50 dark:bg-slate-950 flex items-center justify-center py-16 transition-colors duration-300">
        <div className="w-full max-w-md px-4">
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-gold-500 to-amber-500"></div>

            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {t("loginTitle")}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {t("loginSubtitle")}
              </p>
            </div>

            {/* Error alerts */}
            {errorMsg && (
              <div className="p-4 mb-4 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 text-xs flex gap-2 items-center">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  {t("formEmail")}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  {t("regPassword")}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-sm"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-1.5 text-slate-500 cursor-pointer">
                  <input type="checkbox" className="rounded text-gold-500 focus:ring-gold-500" />
                  <span>{language === 'en' ? 'Remember Me' : 'አስታውሰኝ'}</span>
                </label>
                <Link href="#" className="text-gold-600 dark:text-gold-400 hover:underline">
                  {t("loginForgot")}
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gold-500 hover:bg-gold-600 disabled:bg-slate-300 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <>
                    <LogIn size={14} />
                    <span>{t("btnSignIn")}</span>
                  </>
                )}
              </button>
            </form>

            {/* Footer registration link */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs">
              <Link href="/register" className="text-slate-500 hover:text-gold-500 transition-colors">
                {t("loginRegisterLink")}
              </Link>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-gold-500" size={36} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
