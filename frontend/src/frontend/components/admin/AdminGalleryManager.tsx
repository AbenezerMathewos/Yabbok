"use client";

import React, { useEffect, useState, useRef } from "react";
import { createGalleryItem, deleteGalleryItem, fetchGalleryItems } from "@/frontend/lib/api/galleryApi";
import { PlusCircle, Image as ImageIcon, Loader2 } from "lucide-react";
import { validFileSize } from "@/frontend/lib/validation/forms";
import { EmptyState } from "@/frontend/components/shared/EmptyState";
import { useLanguage } from "@/frontend/context/LanguageContext";

export function AdminGalleryManager() {
  const { t, language } = useLanguage();
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [newGalleryItem, setNewGalleryItem] = useState({
    title: "",
    description: "",
    category: "worship",
    imageUrl: "",
  });
  const [galleryPhotoFile, setGalleryPhotoFile] = useState<File | null>(null);
  const [galleryPhotoPreview, setGalleryPhotoPreview] = useState<string>("");
  const [uploadingGalleryPhoto, setUploadingGalleryPhoto] = useState(false);
  const [gallerySuccess, setGallerySuccess] = useState(false);
  const [galleryError, setGalleryError] = useState("");
  const galleryPhotoInputRef = useRef<HTMLInputElement>(null);

  const loadGallery = async () => {
    setLoading(true);
    try {
      const data = await fetchGalleryItems({ category: "all" });
      setGalleryItems(data as any[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const handleGalleryPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setGalleryError("Image must be under 5MB.");
      return;
    }
    setGalleryPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setGalleryPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
    setGalleryError("");
  };

  const uploadGalleryPhoto = async (): Promise<string> => {
    if (!galleryPhotoFile) return "";
    setUploadingGalleryPhoto(true);
    const fd = new FormData();
    fd.append("file", galleryPhotoFile);
    fd.append("folder", "gallery");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    setUploadingGalleryPhoto(false);
    if (res.ok) {
      const { url } = await res.json();
      return url;
    }
    throw new Error("Image upload failed");
  };

  const handleCreateGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setGallerySuccess(false);
    setGalleryError("");

    if (!newGalleryItem.title || !newGalleryItem.category) {
      setGalleryError("Title and category are required.");
      return;
    }
    const fileValidation = validFileSize(galleryPhotoFile, 5);
    if (!fileValidation.valid) {
      setGalleryError(fileValidation.message);
      return;
    }

    try {
      const imageUrl = await uploadGalleryPhoto();
      if (!imageUrl) {
        setGalleryError("Failed to upload image. Please try again.");
        return;
      }

      await createGalleryItem({ ...newGalleryItem, category: newGalleryItem.category as any, imageUrl });
      setNewGalleryItem({ title: "", description: "", category: "worship", imageUrl: "" });
      setGalleryPhotoFile(null);
      setGalleryPhotoPreview("");
      setGallerySuccess(true);
      loadGallery();
    } catch (err) {
      setGalleryError("An error occurred during upload. Check connection.");
    }
  };

  const handleDeleteGalleryItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this gallery item?")) return;
    try {
      await deleteGalleryItem(id);
      loadGallery();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800/60">
        <Loader2 className="animate-spin text-gold-500" size={24} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Add new item form */}
      <div className="lg:col-span-1 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm h-fit">
        <h3 className="font-extrabold text-sm mb-4 uppercase tracking-wider flex items-center gap-1.5 text-gold-500">
          <PlusCircle size={18} />
          <span>Add New Gallery Photo</span>
        </h3>
        {gallerySuccess && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold text-center">
            ✓ Photo added to gallery successfully!
          </div>
        )}
        {galleryError && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs text-center font-semibold">
            ⚠️ {galleryError}
          </div>
        )}

        <form onSubmit={handleCreateGalleryItem} className="space-y-4 text-xs">
          {/* Image Selector / Preview */}
          <div className="flex flex-col items-center gap-2.5 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
            {galleryPhotoPreview ? (
              <img src={galleryPhotoPreview} alt="Preview" className="w-full max-h-36 object-contain rounded-lg shadow-sm" />
            ) : (
              <ImageIcon size={32} className="text-slate-400" />
            )}
            <button
              type="button"
              onClick={() => galleryPhotoInputRef.current?.click()}
              className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg text-[10px] uppercase hover:bg-gold-500 hover:text-slate-950 transition-colors"
            >
              Select Photo
            </button>
            <input
              ref={galleryPhotoInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleGalleryPhotoChange}
              className="hidden"
            />
            <span className="text-[9px] text-slate-400">JPG, PNG, WEBP · Max 5MB</span>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Title</label>
            <input
              type="text"
              required
              value={newGalleryItem.title}
              onChange={(e) => setNewGalleryItem({ ...newGalleryItem, title: e.target.value })}
              placeholder="e.g. Youth Choir Worship Night"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Category</label>
            <select
              value={newGalleryItem.category}
              onChange={(e) => setNewGalleryItem({ ...newGalleryItem, category: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500"
            >
              <option value="worship">Worship</option>
              <option value="conference">Conference</option>
              <option value="education">Education</option>
              <option value="outreach">Outreach</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Description</label>
            <textarea
              rows={2}
              value={newGalleryItem.description}
              onChange={(e) => setNewGalleryItem({ ...newGalleryItem, description: e.target.value })}
              className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 focus:outline-none focus:border-gold-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={uploadingGalleryPhoto}
            className="w-full py-2.5 bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2"
          >
            {uploadingGalleryPhoto && <Loader2 size={14} className="animate-spin" />}
            {uploadingGalleryPhoto ? "Uploading..." : "Upload Photo"}
          </button>
        </form>
      </div>

      {/* Right: Gallery Grid */}
      <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 shadow-sm">
        <h3 className="font-extrabold text-sm uppercase tracking-wider mb-4">
          Gallery Management
        </h3>
        
        {galleryItems.length === 0 ? (
          <EmptyState title="No gallery items found." />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryItems.map((item) => (
              <div key={item._id} className="group relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-square">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 bg-gold-500 text-slate-950 text-[9px] font-bold uppercase rounded">
                      {item.category}
                    </span>
                    <button
                      onClick={() => handleDeleteGalleryItem(item._id)}
                      className="p-1.5 bg-rose-500 text-white rounded hover:bg-rose-600"
                    >
                      <PlusCircle size={14} className="rotate-45" />
                    </button>
                  </div>
                  <div>
                    <h4 className="text-white text-xs font-bold line-clamp-1">{item.title}</h4>
                    <p className="text-slate-300 text-[10px] line-clamp-2 mt-0.5">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
