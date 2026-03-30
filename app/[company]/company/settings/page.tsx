"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Settings, Save, AlertTriangle, Archive, Palette, Building2 } from "lucide-react";
import type { Company } from "@/types";
import { toast } from "sonner";

export default function CompanySettingsPage() {
  const { company: slug } = useParams<{ company: string }>();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    brandColor: "#6366f1",
  });

  useEffect(() => {
    fetch(`/api/companies/${slug}`)
      .then((r) => r.json())
      .then((c: Company) => {
        setCompany(c);
        setForm({
          name: c.name,
          description: c.description || "",
          brandColor: c.brandColor || "#6366f1",
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  async function save() {
    if (!company) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/companies/${company.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await res.json();
        setCompany(updated);
        toast.success("הגדרות החברה נשמרו בהצלחה");
        if (updated.slug !== slug) {
          router.replace(`/${updated.slug}/company/settings`);
        }
      } else {
        toast.error("שגיאה בשמירת ההגדרות");
      }
    } catch { toast.error("שגיאה בשמירת ההגדרות"); }
    setSaving(false);
  }

  async function archive() {
    if (!company) return;
    if (!confirm(`האם לארכב את "${company.name}"? פעולה זו תסתיר את החברה מהסרגל הצדדי.`)) return;
    setArchiving(true);
    try {
      const res = await fetch(`/api/companies/${company.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archivedAt: new Date().toISOString() }),
      });
      if (res.ok) {
        toast.success("החברה הועברה לארכיב");
        router.push("/");
      }
    } catch { toast.error("שגיאה בארכוב החברה"); }
    setArchiving(false);
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-[#111] rounded-xl border border-[#1e1e1e] animate-pulse" />
        ))}
      </div>
    );
  }

  if (!company) return <div className="p-6 text-[#525252]">חברה לא נמצאה</div>;

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-[#a3a3a3]" />
        <div>
          <h1 className="text-2xl font-bold text-[#ededed]">הגדרות חברה</h1>
          <p className="text-sm text-[#a3a3a3]">{company.name}</p>
        </div>
      </div>

      {/* General */}
      <div className="bg-[#111] border border-[#262626] rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="h-4 w-4 text-[#a3a3a3]" />
          <h2 className="text-sm font-semibold text-[#ededed]">כללי</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-[#a3a3a3] mb-1 block">שם החברה *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#ededed] focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-xs text-[#a3a3a3] mb-1 block">תיאור</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#ededed] focus:outline-none focus:border-indigo-500 resize-none"
              placeholder="תאר את החברה..."
            />
          </div>
          <div>
            <label className="text-xs text-[#a3a3a3] mb-1 block">קידומת נושאים</label>
            <div className="px-3 py-2 bg-[#0d0d0d] border border-[#1e1e1e] rounded-lg text-sm text-[#525252] font-mono">
              {company.slug.toUpperCase()}-1, {company.slug.toUpperCase()}-2, ...
            </div>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-[#111] border border-[#262626] rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Palette className="h-4 w-4 text-[#a3a3a3]" />
          <h2 className="text-sm font-semibold text-[#ededed]">מראה</h2>
        </div>
        <div>
          <label className="text-xs text-[#a3a3a3] mb-2 block">צבע מותג</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={form.brandColor}
              onChange={(e) => setForm({ ...form, brandColor: e.target.value })}
              className="h-10 w-16 rounded-lg border border-[#2a2a2a] bg-transparent cursor-pointer"
            />
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white"
              style={{ backgroundColor: form.brandColor }}
            >
              {company.name.charAt(0)}
            </div>
            <span className="text-sm text-[#a3a3a3] font-mono">{form.brandColor}</span>
          </div>
        </div>
      </div>

      {/* Save */}
      <button
        onClick={save}
        disabled={saving || !form.name}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm rounded-lg"
      >
        <Save className="h-4 w-4" />
        {saving ? "שומר..." : "שמור שינויים"}
      </button>

      {/* Danger zone */}
      <div className="bg-red-950/20 border border-red-900/40 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <h2 className="text-sm font-semibold text-red-400">אזור מסוכן</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#ededed]">ארכב חברה</p>
            <p className="text-xs text-[#525252]">
              תסתיר את החברה מהסרגל הצדדי אך תשמור את כל הנתונים
            </p>
          </div>
          <button
            onClick={archive}
            disabled={archiving}
            className="flex items-center gap-2 px-3 py-1.5 border border-red-700/50 text-red-400 hover:bg-red-600/10 text-sm rounded-lg disabled:opacity-50"
          >
            <Archive className="h-4 w-4" />
            {archiving ? "מארכב..." : "ארכב"}
          </button>
        </div>
      </div>
    </div>
  );
}
