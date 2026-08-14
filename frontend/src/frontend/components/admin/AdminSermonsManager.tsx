import React, { useState, useEffect } from "react";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { Loader2, Plus, Trash2, Video, Music, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ConfirmModal } from "@/frontend/components/ui/ConfirmModal";

export function AdminSermonsManager() {
  const { language } = useLanguage();
  const [sermons, setSermons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    speaker: "",
    date: new Date().toISOString().slice(0, 10),
    description: "",
    audioUrl: "",
    videoUrl: "",
    notes: "",
  });

  const fetchSermons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sermons");
      if (res.ok) {
        const data = await res.json();
        setSermons(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSermons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/sermons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData({ title: "", speaker: "", date: new Date().toISOString().slice(0, 10), description: "", audioUrl: "", videoUrl: "", notes: "" });
        fetchSermons();
        toast.success(language === 'en' ? "Sermon created successfully!" : "ስብከቱ በተሳካ ሁኔታ ተፈጥሯል።");
      } else {
        toast.error(language === 'en' ? "Failed to create sermon." : "ስብከት መፍጠር አልተሳካም።");
      }
    } catch (e) {
      toast.error(language === 'en' ? "An error occurred." : "ስህተት ተከስቷል።");
    } finally {
      setCreating(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/sermons?id=${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        fetchSermons();
        toast.success(language === 'en' ? "Sermon deleted." : "ስብከቱ ተሰርዟል።");
      } else {
        toast.error(language === 'en' ? "Failed to delete sermon." : "ስብከት መሰረዝ አልተሳካም።");
      }
    } catch (e) {
      toast.error(language === 'en' ? "An error occurred." : "ስህተት ተከስቷል።");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <ConfirmModal
        isOpen={!!deleteId}
        title={language === 'en' ? "Delete Sermon" : "ስብከት ሰርዝ"}
        message={language === 'en' ? "Are you sure you want to delete this sermon? This action cannot be undone." : "ይህን ስብከት መሰረዝ እንደሚፈልጉ እርግጠኛ ነዎት? ይህ እርምጃ ሊመለስ አይችልም።"}
        confirmText={language === 'en' ? "Delete" : "ሰርዝ"}
        cancelText={language === 'en' ? "Cancel" : "ሰርዝ"}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black">{language === 'en' ? 'Sermons Manager' : 'የስብከት አስተዳደር'}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-card rounded-xl border border-border p-5">
          <h3 className="font-bold mb-4">{language === 'en' ? 'Upload New Sermon' : 'አዲስ ስብከት ስቀል'}</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label>{language === 'en' ? 'Title *' : 'ርዕስ *'}</Label>
              <Input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div>
              <Label>{language === 'en' ? 'Speaker *' : 'ሰባኪ *'}</Label>
              <Input required value={formData.speaker} onChange={e => setFormData({ ...formData, speaker: e.target.value })} />
            </div>
            <div>
              <Label>{language === 'en' ? 'Date *' : 'ቀን *'}</Label>
              <Input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
            </div>
            <div>
              <Label>{language === 'en' ? 'Description *' : 'መግለጫ *'}</Label>
              <Input required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div>
              <Label>{language === 'en' ? 'Audio URL' : 'የድምጽ አገናኝ'}</Label>
              <Input placeholder="https://..." value={formData.audioUrl} onChange={e => setFormData({ ...formData, audioUrl: e.target.value })} />
            </div>
            <div>
              <Label>{language === 'en' ? 'Video URL' : 'የቪዲዮ አገናኝ'}</Label>
              <Input placeholder="https://youtube.com/..." value={formData.videoUrl} onChange={e => setFormData({ ...formData, videoUrl: e.target.value })} />
            </div>
            <div>
              <Label>{language === 'en' ? 'Notes (Text)' : 'ማስታወሻ (ጽሑፍ)'}</Label>
              <Input placeholder={language === 'en' ? 'Sermon notes...' : 'የስብከት ማስታወሻዎች...'} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
            </div>
            <Button type="submit" disabled={creating} className="w-full">
              {creating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
              <span className="ml-2">{language === 'en' ? 'Create Sermon' : 'ስብከት ፍጠር'}</span>
            </Button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>
          ) : sermons.length === 0 ? (
            <div className="text-center p-10 text-muted-foreground bg-muted/20 rounded-xl">{language === 'en' ? 'No sermons uploaded yet.' : 'ምንም ስብከቶች አልተሰቀሉም።'}</div>
          ) : (
            sermons.map(s => (
              <div key={s._id} className="p-4 bg-card border border-border rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-foreground">{s.title}</h4>
                  <p className="text-sm text-muted-foreground">{s.speaker} • {new Date(s.date).toLocaleDateString()}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {s.audioUrl && <span className="flex items-center gap-1 text-blue-500"><Music size={14}/> Audio</span>}
                    {s.videoUrl && <span className="flex items-center gap-1 text-red-500"><Video size={14}/> Video</span>}
                    {s.notes && <span className="flex items-center gap-1 text-green-500"><FileText size={14}/> Text</span>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10 hover:text-red-600" onClick={() => setDeleteId(s._id)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
