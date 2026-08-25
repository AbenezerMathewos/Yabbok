"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { User, Camera, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { BadgeShowcase } from "./BadgeShowcase";

export function DashboardProfile() {
  const { t } = useLanguage();
  const { update: updateSession } = useSession();

  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    bio: "",
    profilePhoto: "",
    educationalStatus: "",
  });
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string>("");
  const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setProfileForm({
            name: data.name || "",
            phone: data.phone || "",
            bio: data.bio || "",
            profilePhoto: data.profilePhoto || "",
            educationalStatus: data.educationalStatus || "University Student",
          });
          setProfilePhotoPreview(data.profilePhoto || "");
        }
      })
      .catch((err) => console.error("Error loading profile:", err));
  }, []);

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setProfileError("Photo must be under 5MB.");
      return;
    }
    setProfilePhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setProfilePhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
    setProfileError("");
  };

  const uploadProfilePhoto = async (): Promise<string> => {
    if (!profilePhotoFile) return profileForm.profilePhoto;
    setUploadingProfilePhoto(true);
    const fd = new FormData();
    fd.append("file", profilePhotoFile);
    fd.append("folder", "profiles");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    setUploadingProfilePhoto(false);
    if (res.ok) {
      const { url } = await res.json();
      return url;
    }
    throw new Error("Photo upload failed");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess(false);
    setProfileError("");

    try {
      let photoUrl = profileForm.profilePhoto;
      if (profilePhotoFile) {
        try {
          photoUrl = await uploadProfilePhoto();
        } catch (err) {
          setProfileError("Profile photo upload failed. Please try again.");
          return;
        }
      }

      const updatedForm = { ...profileForm, profilePhoto: photoUrl };
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedForm),
      });

      const data = await res.json();
      if (!res.ok) {
        setProfileError(data.error || "Failed to update profile.");
      } else {
        setProfileSuccess(true);
        setProfileForm(updatedForm);
        setProfilePhotoFile(null);
        await updateSession({
          name: updatedForm.name,
          profilePhoto: photoUrl,
        });
      }
    } catch (err) {
      setProfileError("An error occurred during submission. Check connection.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
        {profileSuccess && (
          <div className="p-4 mb-5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs text-center font-bold">
            ✓ Profile details updated successfully!
          </div>
        )}
      {profileError && (
        <div className="p-4 mb-5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs text-center font-semibold">
          ⚠️ {profileError}
        </div>
      )}

      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
          ✍️ Manage Your Profile Details
        </h3>

        {/* Profile Photo Upload */}
        <div className="flex flex-col items-center gap-3 py-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div
            onClick={() => profilePhotoInputRef.current?.click()}
            className="relative w-24 h-24 rounded-full border-4 border-dashed border-slate-300 dark:border-slate-700 hover:border-gold-500 cursor-pointer overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800 transition-all group"
          >
            {profilePhotoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profilePhotoPreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <User size={36} className="text-slate-400 group-hover:text-gold-500 transition-colors" />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-full">
              <Camera size={20} className="text-white" />
            </div>
          </div>
          <div className="text-center">
            <button
              type="button"
              onClick={() => profilePhotoInputRef.current?.click()}
              className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline"
            >
              {profilePhotoPreview ? "Change Profile Photo" : "Upload Profile Photo"}
            </button>
            <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WEBP · Max 5MB</p>
          </div>
          <input
            ref={profilePhotoInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleProfilePhotoChange}
            className="hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            {t("formName")}
          </label>
          <input
            type="text"
            required
            value={profileForm.name}
            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-xs"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              {t("regPhone")}
            </label>
            <input
              type="tel"
              required
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Educational Status
            </label>
            <select
              value={profileForm.educationalStatus}
              onChange={(e) => setProfileForm({ ...profileForm, educationalStatus: e.target.value })}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-xs"
            >
              {["Elementary School", "High School", "University Student", "Graduate", "Employee / Worker", "Business Owner"].map((edu) => (
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
            rows={3}
            value={profileForm.bio}
            onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
            className="w-full p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500 text-xs resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={uploadingProfilePhoto}
          className="px-6 py-2.5 bg-gold-500 hover:bg-gold-600 disabled:bg-slate-300 text-slate-950 font-bold rounded-xl text-xs shadow transition-all flex items-center justify-center gap-1.5"
        >
          {uploadingProfilePhoto ? (
            <>
              <Loader2 className="animate-spin" size={14} />
              <span>Uploading Photo...</span>
            </>
          ) : (
            <span>Update My Profile</span>
          )}
          </button>
        </form>
      </div>

      <BadgeShowcase />
    </div>
  );
}
