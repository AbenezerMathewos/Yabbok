"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, ArrowLeft, Loader2, CheckCircle2, Camera, User, BookOpen, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { PasswordStrengthMeter } from "@/frontend/components/shared/PasswordStrengthMeter";

export default function RegisterPage() {
  const router = useRouter();
  const { t, language } = useLanguage();

  const [step, setStep] = useState(1);
  const [churches, setChurches] = useState([]);
  const [loadingChurches, setLoadingChurches] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "male",
    dob: "",
    churchId: "",
    churchBranch: "",
    region: "",
    profilePhoto: "",
    ministryAreas: [] as string[],
    educationalStatus: "University Student",
    bio: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetch("/api/churches")
      .then((res) => res.json())
      .then((data) => {
        setChurches(data);
        if (data.length > 0) setForm((f) => ({ ...f, churchId: data[0]._id }));
        setLoadingChurches(false);
      })
      .catch(() => setLoadingChurches(false));
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setErrorMsg("Photo must be under 5MB."); return; }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
    setErrorMsg("");
  };

  const uploadPhoto = async (): Promise<string> => {
    if (!photoFile) return form.profilePhoto;
    const fd = new FormData();
    fd.append("file", photoFile);
    fd.append("folder", "profiles");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (res.ok) { const { url } = await res.json(); return url; }
    throw new Error("Photo upload failed");
  };

  const handleMinistryToggle = (area: string) => {
    setForm({
      ...form,
      ministryAreas: form.ministryAreas.includes(area)
        ? form.ministryAreas.filter((m) => m !== area)
        : [...form.ministryAreas, area],
    });
  };

  const handleNext = () => {
    setErrorMsg("");
    if (step === 1) {
      const missing = [];
      if (!form.name) missing.push("Full Name");
      if (!form.email) missing.push("Email");
      if (!form.phone) missing.push("Phone");
      if (!form.dob) missing.push("Date of Birth");
      if (missing.length > 0) { setErrorMsg(`Please fill in: ${missing.join(", ")}`); return; }
    } else if (step === 2) {
      const missing = [];
      if (!form.churchId) missing.push("Church");
      if (!form.churchBranch) missing.push("Church Branch");
      if (!form.region) missing.push("Region / City");
      if (missing.length > 0) { setErrorMsg(`Please fill in: ${missing.join(", ")}`); return; }
    }
    setStep(step + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!photoFile) { setErrorMsg("Please upload a profile photo."); return; }
    if (!form.password) { setErrorMsg("Please enter a password."); return; }
    if (form.password.length < 6) { setErrorMsg("Password must be at least 6 characters."); return; }
    if (form.password !== form.confirmPassword) { setErrorMsg(t("errPasswordMatch")); return; }
    setSubmitting(true);
    try {
      let photoUrl = form.profilePhoto;
      try { photoUrl = await uploadPhoto(); } catch { setErrorMsg("Photo upload failed."); setSubmitting(false); return; }
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, profilePhoto: photoUrl }),
      });
      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error || "Registration failed."); setSubmitting(false); }
      else { setSuccess(true); setSubmitting(false); }
    } catch {
      setErrorMsg("An error occurred. Check your connection.");
      setSubmitting(false);
    }
  };

  const ministryOptions = ["Choir", "Worship Team", "Evangelism", "Prayer Ministry", "Media Team", "Usher", "Sunday School", "Youth Leadership", "Bible Study Leader", "Other"];
  const educationOptions = ["Elementary School", "High School", "University Student", "Graduate", "Employee / Worker", "Business Owner"];
  const TOTAL_STEPS = 3;

  const stepLabels = [
    language === "en" ? "Personal Info" : "የግል መረጃ",
    language === "en" ? "Church Details" : "ቤተክርስቲያን",
    language === "en" ? "Ministry & Account" : "አገልግሎት",
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="border-b border-border/50 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg">
            <BookOpen size={18} className="text-slate-950" />
          </div>
          <div>
            <p className="text-foreground font-black text-base leading-none">Yabbok</p>
            <p className="text-primary text-[10px] font-bold uppercase tracking-widest leading-none mt-0.5">Fellowship</p>
          </div>
        </Link>
        <p className="text-sm text-muted-foreground hidden sm:block">
          {language === "en" ? "Already a member?" : "ቀድሞ አባል ነዎት?"}{" "}
          <Link href="/login" className="text-primary font-bold hover:underline">{t("btnLogin")}</Link>
        </p>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-2xl">

          {/* Success screen */}
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 size={52} className="text-emerald-500" />
              </div>
              <h2 className="text-3xl font-black text-foreground mb-3">
                {language === "en" ? "Registration Submitted!" : "ምዝገባው ተልኳል!"}
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed font-medium">
                {t("regSuccess")}
              </p>
              <Button
                onClick={() => router.push("/login")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold h-12 px-8 rounded-xl gold-glow"
              >
                {t("btnLogin")}
              </Button>
            </motion.div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-10">
                <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">{t("regTitle")}</h1>
                <p className="text-muted-foreground font-medium">{t("regSubtitle")}</p>
              </div>

              {/* Step Progress */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-2">
                  {stepLabels.map((label, i) => {
                    const s = i + 1;
                    const isDone = step > s;
                    const isActive = step === s;
                    return (
                      <div key={s} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all duration-300 ${
                            isDone ? "bg-emerald-500 border-emerald-500 text-white" :
                            isActive ? "bg-primary border-primary text-primary-foreground shadow-lg gold-glow" :
                            "bg-muted border-border text-muted-foreground"
                          }`}>
                            {isDone ? <Check size={16} /> : s}
                          </div>
                          <p className={`text-[10px] font-bold mt-1.5 whitespace-nowrap ${isActive ? "text-primary" : isDone ? "text-emerald-500" : "text-muted-foreground"}`}>
                            {label}
                          </p>
                        </div>
                        {s < TOTAL_STEPS && (
                          <div className={`flex-1 h-0.5 mx-2 mt-[-18px] rounded-full transition-all duration-500 ${step > s ? "bg-emerald-500" : "bg-border"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Error message */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-sm font-semibold flex items-center gap-2"
                  >
                    ⚠️ {errorMsg}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form Card */}
              <div className="bg-card border border-border/60 rounded-3xl shadow-sm overflow-hidden">
                <form onSubmit={handleSubmit}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                      className="p-8 space-y-6"
                    >
                      {/* ── STEP 1: Personal Info ── */}
                      {step === 1 && (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-primary border-primary font-bold uppercase tracking-widest text-[10px]">Step 1</Badge>
                            <h2 className="text-lg font-black text-foreground">{t("regStepPersonal")}</h2>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-semibold">{t("formName")} <span className="text-destructive">*</span></Label>
                            <Input id="name" type="text" required value={form.name}
                              onChange={(e) => setForm({ ...form, name: e.target.value })}
                              className="h-12 rounded-xl" placeholder="Abebe Kebede" />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="reg-email" className="text-sm font-semibold">{t("formEmail")} <span className="text-destructive">*</span></Label>
                              <Input id="reg-email" type="email" required value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="h-12 rounded-xl" placeholder="name@example.com" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="phone" className="text-sm font-semibold">{t("regPhone")} <span className="text-destructive">*</span></Label>
                              <Input id="phone" type="tel" required value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                className="h-12 rounded-xl" placeholder="+251..." />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="gender" className="text-sm font-semibold">{t("regGender")}</Label>
                              <select id="gender" value={form.gender}
                                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                className="w-full h-12 px-4 border border-input rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                <option value="male">{t("regMale")}</option>
                                <option value="female">{t("regFemale")}</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="dob" className="text-sm font-semibold">{t("regDob")} <span className="text-destructive">*</span></Label>
                              <Input id="dob" type="date" required value={form.dob}
                                onChange={(e) => setForm({ ...form, dob: e.target.value })}
                                className="h-12 rounded-xl" />
                            </div>
                          </div>
                        </>
                      )}

                      {/* ── STEP 2: Church Details ── */}
                      {step === 2 && (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-primary border-primary font-bold uppercase tracking-widest text-[10px]">Step 2</Badge>
                            <h2 className="text-lg font-black text-foreground">{t("regStepChurch")}</h2>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="church" className="text-sm font-semibold">{t("regChurchName")} <span className="text-destructive">*</span></Label>
                            {loadingChurches ? (
                              <div className="h-12 flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="animate-spin" size={16} /> Loading churches…
                              </div>
                            ) : churches.length === 0 ? (
                              <div className="p-4 rounded-xl border border-amber-400/40 bg-amber-50 dark:bg-amber-900/10 text-sm text-amber-700 dark:text-amber-400 font-medium">
                                ⚠️ No churches added yet. Ask an admin to add your church first.
                              </div>
                            ) : (
                              <select id="church" value={form.churchId}
                                onChange={(e) => setForm({ ...form, churchId: e.target.value })}
                                className="w-full h-12 px-4 border border-input rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                <option value="">-- {language === "en" ? "Select your church" : "ቤተ ክርስቲያንዎን ይምረጡ"} --</option>
                                {churches.map((church: any) => (
                                  <option key={church._id} value={church._id}>{church.name} ({church.city})</option>
                                ))}
                              </select>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="branch" className="text-sm font-semibold">{t("regChurchBranch")} <span className="text-destructive">*</span></Label>
                              <Input id="branch" type="text" required
                                placeholder="e.g. Youth Choir or Sunday Branch"
                                value={form.churchBranch}
                                onChange={(e) => setForm({ ...form, churchBranch: e.target.value })}
                                className="h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="region" className="text-sm font-semibold">{t("regRegion")} <span className="text-destructive">*</span></Label>
                              <Input id="region" type="text" required
                                placeholder="e.g. Sidama / Hawassa"
                                value={form.region}
                                onChange={(e) => setForm({ ...form, region: e.target.value })}
                                className="h-12 rounded-xl" />
                            </div>
                          </div>
                        </>
                      )}

                      {/* ── STEP 3: Ministry & Credentials ── */}
                      {step === 3 && (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-primary border-primary font-bold uppercase tracking-widest text-[10px]">Step 3</Badge>
                            <h2 className="text-lg font-black text-foreground">{t("regStepMinistry")}</h2>
                          </div>

                          {/* Ministry Areas */}
                          <div className="space-y-3">
                            <Label className="text-sm font-semibold">{t("regMinistryArea")}</Label>
                            <div className="flex flex-wrap gap-2">
                              {ministryOptions.map((area) => {
                                const selected = form.ministryAreas.includes(area);
                                return (
                                  <button
                                    key={area}
                                    type="button"
                                    onClick={() => handleMinistryToggle(area)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 ${
                                      selected
                                        ? "bg-primary border-primary text-primary-foreground shadow-sm"
                                        : "bg-muted border-border text-muted-foreground hover:border-primary/50"
                                    }`}
                                  >
                                    {selected && <Check size={11} className="inline mr-1" />}{area}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Profile Photo */}
                          <div className="space-y-3">
                            <Label className="text-sm font-semibold">
                              {language === "en" ? "Profile Photo" : "የፕሮፋይል ፎቶ"} <span className="text-destructive">*</span>
                            </Label>
                            <div className="flex items-center gap-5">
                              <div
                                onClick={() => photoInputRef.current?.click()}
                                className="relative w-20 h-20 rounded-2xl border-2 border-dashed border-border hover:border-primary cursor-pointer overflow-hidden flex items-center justify-center bg-muted transition-all group shrink-0"
                              >
                                {photoPreview ? (
                                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                  <User size={28} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <Camera size={18} className="text-white" />
                                </div>
                              </div>
                              <div>
                                <button
                                  type="button"
                                  onClick={() => photoInputRef.current?.click()}
                                  className="text-sm font-bold text-primary hover:text-primary/80 underline"
                                >
                                  {photoPreview ? (language === "en" ? "Change photo" : "ፎቶ ቀይር") : (language === "en" ? "Upload profile photo" : "ፎቶ ጫን")}
                                </button>
                                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WEBP · Max 5MB</p>
                              </div>
                              <input ref={photoInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handlePhotoChange} className="hidden" />
                            </div>
                          </div>

                          {/* Education */}
                          <div className="space-y-2">
                            <Label htmlFor="edu" className="text-sm font-semibold">{t("regEduStatus")}</Label>
                            <select id="edu" value={form.educationalStatus}
                              onChange={(e) => setForm({ ...form, educationalStatus: e.target.value })}
                              className="w-full h-12 px-4 border border-input rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                              {educationOptions.map((edu) => <option key={edu} value={edu}>{edu}</option>)}
                            </select>
                          </div>

                          {/* Bio */}
                          <div className="space-y-2">
                            <Label htmlFor="bio" className="text-sm font-semibold">{t("regBio")}</Label>
                            <textarea id="bio" rows={3} value={form.bio}
                              onChange={(e) => setForm({ ...form, bio: e.target.value })}
                              className="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                              placeholder={language === "en" ? "Tell us briefly about yourself…" : "ስለ እራስዎ በአጭሩ ይነግሩን…"} />
                          </div>

                          {/* Password */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="reg-password" className="text-sm font-semibold">{t("regPassword")} <span className="text-destructive">*</span></Label>
                              <div className="relative">
                                <Input id="reg-password" type={showPassword ? "text" : "password"} required
                                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                                  placeholder="••••••••" className="h-12 rounded-xl pr-12" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              </div>
                              <PasswordStrengthMeter password={form.password} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirm-password" className="text-sm font-semibold">{t("regConfirmPassword")} <span className="text-destructive">*</span></Label>
                              <div className="relative">
                                <Input id="confirm-password" type={showConfirmPassword ? "text" : "password"} required
                                  value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                  placeholder="••••••••" className="h-12 rounded-xl pr-12" />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation Footer */}
                  <div className="px-8 py-5 border-t border-border/60 bg-muted/30 flex justify-between items-center">
                    {step > 1 ? (
                      <Button type="button" variant="outline" onClick={() => { setErrorMsg(""); setStep(step - 1); }}
                        className="h-11 px-6 rounded-xl font-bold">
                        <ArrowLeft size={16} className="mr-2" /> {t("btnPrev")}
                      </Button>
                    ) : <div />}

                    {step < TOTAL_STEPS ? (
                      <Button type="button" onClick={handleNext}
                        className="h-11 px-8 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow gold-glow">
                        {t("btnNext")} <ArrowRight size={16} className="ml-2" />
                      </Button>
                    ) : (
                      <Button type="submit" disabled={submitting}
                        className="h-11 px-8 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow gold-glow">
                        {submitting ? <Loader2 className="animate-spin mr-2" size={18} /> : <Check size={18} className="mr-2" />}
                        {submitting ? (language === "en" ? "Submitting…" : "እየተላከ ነው…") : t("btnSubmit")}
                      </Button>
                    )}
                  </div>
                </form>
              </div>

              {/* Footer */}
              <p className="text-center text-sm text-muted-foreground mt-6">
                {language === "en" ? "Already have an account?" : "ቀድሞ አካውንት አለዎት?"}{" "}
                <Link href="/login" className="text-primary font-bold hover:underline">{t("btnLogin")}</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
