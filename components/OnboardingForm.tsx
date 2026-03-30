"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ArrowLeft, Loader2 } from "lucide-react";

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#ef4444",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#06b6d4",
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 20);
}

export function OnboardingForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [color, setColor] = useState(COLORS[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleNameChange(val: string) {
    setName(val);
    if (!slugEdited) setSlug(slugify(val));
  }

  function handleSlugChange(val: string) {
    setSlug(slugify(val));
    setSlugEdited(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), slug: slug.trim(), brandColor: color }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "שגיאה ביצירת החברה");
        return;
      }
      const company = await res.json();
      router.push(`/${company.slug}/dashboard`);
    } catch {
      setError("שגיאת רשת — נסה שוב");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="bg-[#111] border border-[#262626] rounded-2xl p-7 space-y-5 shadow-xl">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
          <Building2 className="h-4 w-4 text-indigo-400" />
        </div>
        <h2 className="text-lg font-semibold text-[#ededed]">צור חברה חדשה</h2>
      </div>

      {/* Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[#a3a3a3]">שם החברה *</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="למשל: Acme Corp"
          className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-[#ededed] placeholder:text-[#3a3a3a] focus:outline-none focus:border-indigo-500 transition-colors"
          disabled={loading}
        />
      </div>

      {/* Slug */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[#a3a3a3]">
          מזהה (prefix לנושאים)
        </label>
        <div className="relative">
          <input
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="acme"
            maxLength={20}
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-[#ededed] placeholder:text-[#3a3a3a] focus:outline-none focus:border-indigo-500 transition-colors font-mono"
            disabled={loading}
          />
          {slug && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#525252] font-mono">
              {slug.toUpperCase()}-1
            </span>
          )}
        </div>
        <p className="text-xs text-[#3a3a3a]">אותיות אנגליות, מספרים ומקפים בלבד</p>
      </div>

      {/* Brand color */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[#a3a3a3]">צבע מותג</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-7 h-7 rounded-lg border-2 transition-all"
              style={{
                backgroundColor: c,
                borderColor: color === c ? "white" : "transparent",
                transform: color === c ? "scale(1.15)" : "scale(1)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Preview */}
      {name && (
        <div className="flex items-center gap-3 p-3 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{ backgroundColor: color }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-[#ededed]">{name}</p>
            <p className="text-xs text-[#525252] font-mono">{slug || "..."}</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !name.trim() || !slug.trim()}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm rounded-xl transition-colors"
      >
        {loading ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> יוצר חברה...</>
        ) : (
          <><span>צור חברה ועבור ללוח הבקרה</span><ArrowLeft className="h-4 w-4" /></>
        )}
      </button>
    </form>
  );
}
