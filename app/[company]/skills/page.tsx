"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Zap, Plus, Eye, Code2, Search, Trash2 } from "lucide-react";
import type { Skill } from "@/types";
import { formatDateTime } from "@/lib/utils";

const MODE_LABELS: Record<string, string> = {
  inline: "טקסט מוטבע",
  file: "קובץ",
  url: "כתובת URL",
};

const SOURCE_LABELS: Record<string, string> = {
  manual: "ידני",
  import: "ייבוא",
  generated: "נוצר אוטומטית",
};

export default function SkillsPage() {
  const { company } = useParams<{ company: string }>();
  const [companyId, setCompanyId] = useState<string>("");
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Skill | null>(null);
  const [viewMode, setViewMode] = useState<"view" | "code">("view");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: "", key: "", content: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/companies/${company}`)
      .then((r) => r.json())
      .then((c) => {
        setCompanyId(c.id);
        return fetch(`/api/skills?companyId=${c.id}`);
      })
      .then((r) => r.json())
      .then((data) => {
        setSkills(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [company]);

  const filtered = skills.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.key.toLowerCase().includes(search.toLowerCase())
  );

  async function createSkill() {
    setSaving(true);
    try {
      const res = await fetch(`/api/skills`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newSkill, companyId, source: "manual", mode: "inline" }),
      });
      if (res.ok) {
        const created = await res.json();
        setSkills((s) => [created, ...s]);
        setNewSkill({ name: "", key: "", content: "" });
        setShowCreate(false);
      }
    } catch (e) { console.error(e); }
    setSaving(false);
  }

  async function deleteSkill(id: string) {
    if (!confirm("האם למחוק מיומנות זו?")) return;
    await fetch(`/api/skills/${id}`, { method: "DELETE" });
    setSkills((s) => s.filter((x) => x.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  return (
    <div className="flex h-full">
      {/* Left panel */}
      <div className="w-72 border-l border-[#262626] flex flex-col bg-[#0d0d0d]">
        <div className="p-4 border-b border-[#262626] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              <h1 className="text-lg font-bold text-[#ededed]">מיומנויות</h1>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#525252]" />
            <input
              type="text"
              placeholder="חיפוש מיומנויות..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 pr-9 text-sm text-[#ededed] placeholder:text-[#525252] focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-[#1a1a1a] rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-xs text-[#525252]">אין מיומנויות</p>
            </div>
          ) : (
            filtered.map((skill) => (
              <button
                key={skill.id}
                onClick={() => setSelected(skill)}
                className={`w-full text-right p-3 border-b border-[#1a1a1a] hover:bg-[#141414] transition-colors ${
                  selected?.id === skill.id ? "bg-[#141414]" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#ededed] truncate">{skill.name}</div>
                    <div className="text-xs text-[#525252] font-mono truncate">{skill.key}</div>
                  </div>
                  <span className="text-xs text-[#525252] flex-shrink-0">
                    {SOURCE_LABELS[skill.source] || skill.source}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col bg-[#0a0a0a]">
        {showCreate ? (
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[#ededed]">מיומנות חדשה</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#a3a3a3] mb-1 block">שם</label>
                <input
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#ededed] focus:outline-none focus:border-indigo-500"
                  placeholder="שם המיומנות"
                />
              </div>
              <div>
                <label className="text-xs text-[#a3a3a3] mb-1 block">מפתח ייחודי</label>
                <input
                  value={newSkill.key}
                  onChange={(e) => setNewSkill({ ...newSkill, key: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#ededed] font-mono focus:outline-none focus:border-indigo-500"
                  placeholder="org/name/skill"
                />
              </div>
              <div>
                <label className="text-xs text-[#a3a3a3] mb-1 block">תוכן (Markdown)</label>
                <textarea
                  value={newSkill.content}
                  onChange={(e) => setNewSkill({ ...newSkill, content: e.target.value })}
                  rows={10}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#ededed] font-mono focus:outline-none focus:border-indigo-500 resize-none"
                  placeholder="# מיומנות&#10;&#10;תאר את המיומנות כאן..."
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={createSkill}
                disabled={saving || !newSkill.name || !newSkill.key}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm rounded-lg"
              >
                {saving ? "שומר..." : "צור מיומנות"}
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#222] text-[#a3a3a3] text-sm rounded-lg"
              >
                ביטול
              </button>
            </div>
          </div>
        ) : selected ? (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-[#262626] flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#ededed]">{selected.name}</h2>
                <p className="text-xs font-mono text-[#525252]">{selected.key}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-[#2a2a2a] overflow-hidden">
                  <button
                    onClick={() => setViewMode("view")}
                    className={`p-1.5 text-xs flex items-center gap-1 ${viewMode === "view" ? "bg-[#1e1e1e] text-[#ededed]" : "text-[#525252] hover:bg-[#141414]"}`}
                  >
                    <Eye className="h-3 w-3" /> תצוגה
                  </button>
                  <button
                    onClick={() => setViewMode("code")}
                    className={`p-1.5 text-xs flex items-center gap-1 ${viewMode === "code" ? "bg-[#1e1e1e] text-[#ededed]" : "text-[#525252] hover:bg-[#141414]"}`}
                  >
                    <Code2 className="h-3 w-3" /> קוד
                  </button>
                </div>
                <button
                  onClick={() => deleteSkill(selected.id)}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-4 border-b border-[#1e1e1e] flex gap-4">
              <div>
                <span className="text-xs text-[#525252]">מקור: </span>
                <span className="text-xs text-[#a3a3a3]">{SOURCE_LABELS[selected.source] || selected.source}</span>
              </div>
              <div>
                <span className="text-xs text-[#525252]">מצב: </span>
                <span className="text-xs text-[#a3a3a3]">{MODE_LABELS[selected.mode] || selected.mode}</span>
              </div>
              <div>
                <span className="text-xs text-[#525252]">עודכן: </span>
                <span className="text-xs text-[#a3a3a3]">{formatDateTime(selected.updatedAt)}</span>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {viewMode === "code" ? (
                <pre className="text-xs font-mono text-[#a3a3a3] whitespace-pre-wrap leading-relaxed">
                  {selected.content || "(אין תוכן)"}
                </pre>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none">
                  {selected.content ? (
                    <pre className="whitespace-pre-wrap text-sm text-[#c0c0c0] leading-relaxed">
                      {selected.content}
                    </pre>
                  ) : (
                    <p className="text-[#525252]">(אין תוכן)</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <Zap className="h-12 w-12 text-[#333] mb-4" />
            <p className="text-[#525252] text-sm">בחר מיומנות להצגה</p>
            <p className="text-[#3a3a3a] text-xs mt-1">
              או צור מיומנות חדשה עם כפתור +
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
