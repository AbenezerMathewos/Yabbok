"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { Navbar } from "@/frontend/components/shared/Navbar";
import { Footer } from "@/frontend/components/shared/Footer";
import { Check, ArrowRight, ArrowLeft, Loader2, CheckCircle2, Camera, User } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { t, language } = useLanguage();

  // Multi-step state
  const [step, setStep] = useState(1);
  const [churches, setChurches] = useState([]);
  const [loadingChurches, setLoadingChurches] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Form states
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
    // Fetch churches for dropdown selection
    fetch("/api/churches")
      .then((res) => res.json())
      .then((data) => {
        setChurches(data);
        if (data.length > 0) {
          setForm((f) => ({ ...f, churchId: data[0]._id }));
        }
        setLoadingChurches(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingChurches(false);
      });
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Photo must be under 5MB.");
      return;
    }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
    setErrorMsg("");
  };

  const uploadPhoto = async (): Promise<string> => {
    if (!photoFile) return form.profilePhoto;
    setUploadingPhoto(true);
    const fd = new FormData();
    fd.append("file", photoFile);
    fd.append("folder", "profiles");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    setUploadingPhoto(false);
    if (res.ok) {
      const { url } = await res.json();
      return url;
    }
    throw new Error("Photo upload failed");
  };

  const handleMinistryToggle = (area: string) => {
    if (form.ministryAreas.includes(area)) {
      setForm({ ...form, ministryAreas: form.ministryAreas.filter((m) => m !== area) });
    } else {
      setForm({ ...form, ministryAreas: [...form.ministryAreas, area] });
    }
  };

  const handleNext = () => {
    setErrorMsg("");
    if (step === 1) {
      const missing = [];
      if (!form.name) missing.push("Full Name");
      if (!form.email) missing.push("Email");
      if (!form.phone) missing.push("Phone");
      if (!form.dob) missing.push("Date of Birth");
      if (missing.length > 0) {
        setErrorMsg(`Please fill in: ${missing.join(", ")}`);
        return;
      }
    } else if (step === 2) {
      const missing = [];
      if (!form.churchId) missing.push("Church");
      if (!form.churchBranch) missing.push("Church Branch / Sub-branch");
      if (!form.region) missing.push("Region / City");
      if (missing.length > 0) {
        setErrorMsg(`Please fill in: ${missing.join(", ")}`);
        return;
      }
    }
    setStep(step + 1);
  };

  const handlePrev = () => {
    setErrorMsg("");
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!photoFile) {
      setErrorMsg("Please upload a profile photo from local storage.");
      return;
    }

    if (!form.password) {
      setErrorMsg("Please enter a password.");
      return;
    }
    if (!form.confirmPassword) {
      setErrorMsg("Please confirm your password.");
      return;
    }
    if (form.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setErrorMsg(t("errPasswordMatch"));
      return;
    }

    setSubmitting(true);

    try {
      // Upload photo first if selected
      let photoUrl = form.profilePhoto;
      if (photoFile) {
        try {
          photoUrl = await uploadPhoto();
        } catch {
          setErrorMsg("Photo upload failed. Please try again.");
          setSubmitting(false);
          return;
        }
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, profilePhoto: photoUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Registration failed. Try again.");
        setSubmitting(false);
      } else {
        setSuccess(true);
        setSubmitting(false);
      }
    } catch (err) {
      setErrorMsg("An error occurred during submission. Check connection.");
      setSubmitting(false);
    }
  };

  const ministryOptions = [
    "Choir",
    "Worship Team",
    "Evangelism",
    "Prayer Ministry",
    "Media Team",
    "Usher",
    "Sunday School",
    "Youth Leadership",
    "Bible Study Leader",
    "Other",
  ];

  const educationOptions = [
    "Elementary School",
    "High School",
    "University Student",
    "Graduate",
    "Employee / Worker",
    "Business Owner",
  ];

  return (
    <>
      <Navbar />

      <main className="flex-grow bg-slate-50 dark:bg-slate-950 flex items-center justify-center py-16 transition-colors duration-300">
        <div className="w-full max-w-2xl px-4">
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-gold-500 to-amber-500"></div>

            {/* Success page */}
            {success ? (
              <div className="text-center py-10">
                <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-4 animate-bounce" />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                  {language === "en" ? "Registration Submitted!" : "ምዝገባው ተልኳል!"}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
                  {t("regSuccess")}
                </p>
                <Link
                  href="/login"
                  className="px-8 py-3 bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold rounded-xl text-xs transition-all shadow"
                >
                  {t("btnLogin")}
                </Link>
              </div>
            ) : (
              <div>
                {/* Headers */}
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {t("regTitle")}
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {t("regSubtitle")}
                  </p>
                </div>

                {/* Progress Indicators */}
                <div className="flex items-center justify-center gap-2 mb-8">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${
                        step === s 
                          ? "bg-gold-500 border-gold-500 text-slate-950" 
                          : step > s 
                          ? "bg-emerald-500 border-emerald-500 text-white" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600"
                      }`}>
                        {step > s ? <Check size={14} /> : s}
                      </span>
                      {s < 3 && <div className={`w-12 h-1 ${step > s ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"}`} />}
                    </div>
                  ))}
                </div>

                {/* Errors message banner */}
                {errorMsg && (
                  <div className="p-4 mb-5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs text-center font-semibold">
                    ⚠️ {errorMsg}
                  </div>
                )}

                {/* Form wizard steps */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Step 1: Personal */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-gold-500 uppercase tracking-wider">
                        Step 1: {t("regStepPersonal")}
                      </h3>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          {t("formName")} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                            {t("formEmail")} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                            {t("regPhone")} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder="+251..."
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                            {t("regGender")}
                          </label>
                          <select
                            value={form.gender}
                            onChange={(e) => setForm({ ...form, gender: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-sm"
                          >
                            <option value="male">{t("regMale")}</option>
                            <option value="female">{t("regFemale")}</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                            {t("regDob")} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            required
                            value={form.dob}
                            onChange={(e) => setForm({ ...form, dob: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Church Details */}
                  {step === 2 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-gold-500 uppercase tracking-wider">
                        Step 2: {t("regStepChurch")}
                      </h3>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                          {t("regChurchName")} <span className="text-red-500">*</span>
                        </label>
                        {loadingChurches ? (
                          <div className="flex gap-2 items-center text-xs text-slate-400">
                            <Loader2 className="animate-spin" size={14} /> Loading Churches...
                          </div>
                        ) : churches.length === 0 ? (
                          <div className="p-3 rounded-xl border border-amber-400/40 bg-amber-50 dark:bg-amber-900/10 text-xs text-amber-700 dark:text-amber-400">
                            ⚠️ No churches have been added yet. Please ask an admin to add your church first, or{" "}
                            <a href="/login" className="underline font-bold">log in as admin</a>{" "}
                            and add one from the Admin Panel → Church Management.
                          </div>
                        ) : (
                          <select
                            value={form.churchId}
                            onChange={(e) => setForm({ ...form, churchId: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-sm"
                          >
                            <option value="">-- Select your church --</option>
                            {churches.map((church: any) => (
                              <option key={church._id} value={church._id}>
                                {church.name} ({church.city})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                            {t("regChurchBranch")} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Youth Choir or Sunday Branch"
                            value={form.churchBranch}
                            onChange={(e) => setForm({ ...form, churchBranch: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                            {t("regRegion")} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Sidama / Hawassa"
                            value={form.region}
                            onChange={(e) => setForm({ ...form, region: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Ministry & Credentials */}
                  {step === 3 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-gold-500 uppercase tracking-wider">
                        Step 3: {t("regStepMinistry")}
                      </h3>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                          {t("regMinistryArea")}
                        </label>
                        <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                          {ministryOptions.map((area) => {
                            const isChecked = form.ministryAreas.includes(area);
                            return (
                              <label key={area} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleMinistryToggle(area)}
                                  className="rounded text-gold-500 focus:ring-gold-500"
                                />
                                <span>{area}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Profile Photo Upload */}
                      <div className="flex flex-col items-center gap-3 mb-2">
                        <div
                          onClick={() => photoInputRef.current?.click()}
                          className="relative w-24 h-24 rounded-full border-4 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 cursor-pointer overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800 transition-all group"
                        >
                          {photoPreview ? (
                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <User size={36} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
                            <Camera size={20} className="text-white" />
                          </div>
                        </div>
                        <div className="text-center">
                          <button
                            type="button"
                            onClick={() => photoInputRef.current?.click()}
                            className="text-xs font-bold text-amber-600 hover:text-amber-700 underline"
                          >
                            {photoPreview ? "Change Photo" : "Upload Profile Photo"}
                          </button>
                          <p className="text-[10px] text-slate-400 mt-0.5">Required · JPG, PNG, WEBP · Max 5MB</p>
                        </div>
                        <input
                          ref={photoInputRef}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                            {t("regEduStatus")} <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={form.educationalStatus}
                            onChange={(e) => setForm({ ...form, educationalStatus: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-sm"
                          >
                            {educationOptions.map((edu) => (
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
                          rows={2}
                          value={form.bio}
                          onChange={(e) => setForm({ ...form, bio: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-sm resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                            {t("regPassword")} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="password"
                            required
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            placeholder="••••••••"
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                            {t("regConfirmPassword")} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="password"
                            required
                            value={form.confirmPassword}
                            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                            placeholder="••••••••"
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Multi-step Footer Navigation */}
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                    {step > 1 ? (
                      <button
                        type="button"
                        onClick={handlePrev}
                        className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-gold-500 flex items-center gap-1"
                      >
                        <ArrowLeft size={12} />
                        <span>{t("btnPrev")}</span>
                      </button>
                    ) : (
                      <div />
                    )}

                    {step < 3 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1"
                      >
                        <span>{t("btnNext")}</span>
                        <ArrowRight size={12} />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2.5 bg-gold-500 hover:bg-gold-600 disabled:bg-slate-300 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow"
                      >
                        {submitting ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : (
                          <>
                            <Check size={14} />
                            <span>{t("btnSubmit")}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* Sign in footer link */}
            {!success && (
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-400">
                {language === 'en' ? 'Already have an account?' : 'ቀድሞውኑ አካውንት አለዎት?'} &nbsp;
                <Link href="/login" className="text-gold-600 dark:text-gold-400 font-semibold hover:underline">
                  {t("btnLogin")}
                </Link>
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
