import React, { useState, useEffect } from "react";
import { useLanguage } from "@/frontend/context/LanguageContext";
import { Loader2, Plus, Trash2, Calendar, MapPin, Image as ImageIcon, Video, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminEventsManager() {
  const { language } = useLanguage();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Youth Meeting",
    date: new Date().toISOString().slice(0, 10),
    location: "",
    photoAdUrl: "",
    videoAdUrl: "",
    voiceAdUrl: "",
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormData({ title: "", description: "", category: "Youth Meeting", date: new Date().toISOString().slice(0, 10), location: "", photoAdUrl: "", videoAdUrl: "", voiceAdUrl: "" });
        fetchEvents();
      } else {
        alert(language === 'en' ? "Failed to create event." : "ዝግጅት መፍጠር አልተሳካም።");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'en' ? "Are you sure you want to delete this event?" : "ይህን ዝግጅት መሰረዝ እንደሚፈልጉ እርግጠኛ ነዎት?")) return;
    try {
      const res = await fetch(`/api/events?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchEvents();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black">{language === 'en' ? 'Events Manager' : 'የዝግጅት አስተዳደር'}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-card rounded-xl border border-border p-5">
          <h3 className="font-bold mb-4">{language === 'en' ? 'Create New Event' : 'አዲስ ዝግጅት ፍጠር'}</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label>{language === 'en' ? 'Title *' : 'ርዕስ *'}</Label>
              <Input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div>
              <Label>{language === 'en' ? 'Description *' : 'መግለጫ *'}</Label>
              <Input required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div>
              <Label>{language === 'en' ? 'Category *' : 'ምድብ *'}</Label>
              <select 
                className="w-full p-2 border border-border rounded bg-background"
                value={formData.category} 
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Conference">{language === 'en' ? 'Conference' : 'ኮንፈረንስ'}</option>
                <option value="Youth Meeting">{language === 'en' ? 'Youth Meeting' : 'የወጣቶች ስብሰባ'}</option>
                <option value="Prayer Night">{language === 'en' ? 'Prayer Night' : 'የጸሎት ሌሊት'}</option>
                <option value="Retreat">{language === 'en' ? 'Retreat' : 'የዕረፍት ጊዜ'}</option>
                <option value="Bible Study">{language === 'en' ? 'Bible Study' : 'የመጽሐፍ ቅዱስ ጥናት'}</option>
              </select>
            </div>
            <div>
              <Label>{language === 'en' ? 'Date *' : 'ቀን *'}</Label>
              <Input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
            </div>
            <div>
              <Label>{language === 'en' ? 'Location *' : 'ቦታ *'}</Label>
              <Input required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
            </div>
            <div>
              <Label>{language === 'en' ? 'Photo Poster URL' : 'የፎቶ ማስታወቂያ አገናኝ'}</Label>
              <Input placeholder="https://..." value={formData.photoAdUrl} onChange={e => setFormData({ ...formData, photoAdUrl: e.target.value })} />
            </div>
            <div>
              <Label>{language === 'en' ? 'Video Ad URL' : 'የቪዲዮ ማስታወቂያ አገናኝ'}</Label>
              <Input placeholder="https://youtube.com/..." value={formData.videoAdUrl} onChange={e => setFormData({ ...formData, videoAdUrl: e.target.value })} />
            </div>
            <div>
              <Label>{language === 'en' ? 'Voice/Audio Ad URL' : 'የድምጽ ማስታወቂያ አገናኝ'}</Label>
              <Input placeholder="https://..." value={formData.voiceAdUrl} onChange={e => setFormData({ ...formData, voiceAdUrl: e.target.value })} />
            </div>
            <Button type="submit" disabled={creating} className="w-full">
              {creating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
              <span className="ml-2">{language === 'en' ? 'Create Event' : 'ዝግጅት ፍጠር'}</span>
            </Button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>
          ) : events.length === 0 ? (
            <div className="text-center p-10 text-muted-foreground bg-muted/20 rounded-xl">{language === 'en' ? 'No events uploaded yet.' : 'ምንም ዝግጅቶች አልተሰቀሉም።'}</div>
          ) : (
            events.map(e => (
              <div key={e._id} className="p-4 bg-card border border-border rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-foreground">{e.title}</h4>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar size={14}/> {new Date(e.date).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><MapPin size={14}/> {e.location}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-xs">
                    {e.photoAdUrl && <span className="flex items-center gap-1 text-blue-500"><ImageIcon size={14}/> Photo Ad</span>}
                    {e.videoAdUrl && <span className="flex items-center gap-1 text-red-500"><Video size={14}/> Video Ad</span>}
                    {e.voiceAdUrl && <span className="flex items-center gap-1 text-green-500"><Mic size={14}/> Voice Ad</span>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-500/10 hover:text-red-600" onClick={() => handleDelete(e._id)}>
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
