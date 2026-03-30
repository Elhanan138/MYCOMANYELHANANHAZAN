"use client";

import { useEffect, useState } from "react";
import { Settings, Heart, Zap, Puzzle, RefreshCw, CheckCircle, XCircle, Activity } from "lucide-react";
import type { Agent } from "@/types";

interface HeartbeatStatus {
  agentId: string;
  agentName: string;
  companyName: string;
  enabled: boolean;
  intervalSec: number;
  lastRun: string | null;
}

export default function InstanceSettingsPage() {
  const [tab, setTab] = useState<"general" | "heartbeats" | "experimental" | "plugins">("general");
  const [heartbeats, setHeartbeats] = useState<HeartbeatStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    censorLogs: false,
    isolatedWorkspaces: false,
    autoRestartDevServer: false,
  });

  useEffect(() => {
    if (tab === "heartbeats") {
      setLoading(true);
      fetch("/api/instance/heartbeats")
        .then((r) => r.json())
        .then((data) => setHeartbeats(Array.isArray(data) ? data : []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [tab]);

  const tabs = [
    { key: "general", label: "כללי", icon: Settings },
    { key: "heartbeats", label: "פעימות לב", icon: Heart },
    { key: "experimental", label: "ניסיוני", icon: Zap },
    { key: "plugins", label: "תוספים", icon: Puzzle },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-[#a3a3a3]" />
          <div>
            <h1 className="text-2xl font-bold text-[#ededed]">הגדרות מערכת</h1>
            <p className="text-sm text-[#a3a3a3]">הגדרות גלובליות של מופע Paperclip</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[#262626]">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key as typeof tab)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  tab === t.key ? "border-indigo-500 text-[#ededed]" : "border-transparent text-[#525252] hover:text-[#a3a3a3]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* General */}
        {tab === "general" && (
          <div className="bg-[#111] border border-[#262626] rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[#ededed]">הגדרות כלליות</h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm text-[#ededed]">צנזר שם משתמש ביומנים</p>
                  <p className="text-xs text-[#525252]">מסתיר את שם המשתמש מהיומנים והפלטים</p>
                </div>
                <div
                  onClick={() => setSettings((s) => ({ ...s, censorLogs: !s.censorLogs }))}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full cursor-pointer transition-colors ${
                    settings.censorLogs ? "bg-indigo-600" : "bg-[#333]"
                  }`}
                >
                  <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                    settings.censorLogs ? "translate-x-4" : "translate-x-0.5"
                  }`} />
                </div>
              </label>
            </div>

            <div className="pt-4 border-t border-[#1e1e1e]">
              <h3 className="text-xs font-medium text-[#a3a3a3] mb-3">מידע על המופע</h3>
              <div className="space-y-2 text-xs text-[#525252]">
                <div className="flex justify-between">
                  <span>גרסה</span>
                  <span className="font-mono text-[#a3a3a3]">v0.1.0-alpha</span>
                </div>
                <div className="flex justify-between">
                  <span>סביבה</span>
                  <span className="font-mono text-[#a3a3a3]">{process.env.NODE_ENV || "development"}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Heartbeats */}
        {tab === "heartbeats" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#111] border border-[#262626] rounded-xl p-4">
                <div className="text-2xl font-bold text-green-400">
                  {heartbeats.filter((h) => h.enabled).length}
                </div>
                <div className="text-xs text-[#525252] mt-1">פעימות פעילות</div>
              </div>
              <div className="bg-[#111] border border-[#262626] rounded-xl p-4">
                <div className="text-2xl font-bold text-[#525252]">
                  {heartbeats.filter((h) => !h.enabled).length}
                </div>
                <div className="text-xs text-[#525252] mt-1">פעימות מושבתות</div>
              </div>
            </div>

            <div className="bg-[#111] border border-[#262626] rounded-xl">
              <div className="p-4 border-b border-[#1e1e1e]">
                <h2 className="text-sm font-semibold text-[#ededed]">כל הסוכנים</h2>
              </div>
              {loading ? (
                <div className="p-4 space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-14 bg-[#1a1a1a] rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : heartbeats.length === 0 ? (
                <div className="p-8 text-center">
                  <Activity className="h-8 w-8 text-[#333] mx-auto mb-2" />
                  <p className="text-sm text-[#525252]">אין סוכנים עם פעימות לב</p>
                </div>
              ) : (
                <div className="divide-y divide-[#1a1a1a]">
                  {heartbeats.map((h) => (
                    <div key={h.agentId} className="flex items-center justify-between p-4">
                      <div>
                        <p className="text-sm font-medium text-[#ededed]">{h.agentName}</p>
                        <p className="text-xs text-[#525252]">
                          {h.companyName} · כל {h.intervalSec}ש׳
                          {h.lastRun && ` · אחרון: ${new Date(h.lastRun).toLocaleString("he-IL")}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {h.enabled ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-[#525252]" />
                        )}
                        <span className={`text-xs ${h.enabled ? "text-green-400" : "text-[#525252]"}`}>
                          {h.enabled ? "פעיל" : "מושבת"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Experimental */}
        {tab === "experimental" && (
          <div className="bg-[#111] border border-[#262626] rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-400" />
              <h2 className="text-sm font-semibold text-[#ededed]">תכונות ניסיוניות</h2>
            </div>
            <div className="p-3 bg-yellow-400/5 border border-yellow-400/20 rounded-lg text-xs text-yellow-400">
              תכונות אלו נמצאות בפיתוח ועלולות להכיל באגים. השתמש בזהירות.
            </div>
            <div className="space-y-4">
              {[
                { key: "isolatedWorkspaces", label: "סביבות עבודה מבודדות", desc: "הרץ כל סוכן בסביבה מבודדת נפרדת" },
                { key: "autoRestartDevServer", label: "הפעלה מחדש אוטומטית של שרת פיתוח", desc: "הפעל מחדש אוטומטית לאחר כישלון" },
              ].map((feature) => (
                <label key={feature.key} className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-sm text-[#ededed]">{feature.label}</p>
                    <p className="text-xs text-[#525252]">{feature.desc}</p>
                  </div>
                  <div
                    onClick={() => setSettings((s) => ({ ...s, [feature.key]: !s[feature.key as keyof typeof s] }))}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full cursor-pointer transition-colors ${
                      settings[feature.key as keyof typeof settings] ? "bg-indigo-600" : "bg-[#333]"
                    }`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                      settings[feature.key as keyof typeof settings] ? "translate-x-4" : "translate-x-0.5"
                    }`} />
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Plugins */}
        {tab === "plugins" && (
          <div className="space-y-4">
            <div className="p-3 bg-orange-400/5 border border-orange-400/20 rounded-lg text-xs text-orange-400">
              מנהל תוספים נמצא בשלב אלפא. התקן תוספים רק ממקורות מהימנים.
            </div>
            <div className="bg-[#111] border border-[#262626] rounded-xl p-5">
              <h2 className="text-sm font-semibold text-[#ededed] mb-4">תוספים מובנים</h2>
              <div className="space-y-3">
                {[
                  { name: "paperclip-core", desc: "תוסף ליבה עם פרוטוקול heartbeat וכלי API", installed: true },
                  { name: "paperclip-github", desc: "אינטגרציה עם GitHub Issues ו-PRs", installed: false },
                  { name: "paperclip-slack", desc: "התראות ועדכונים דרך Slack", installed: false },
                ].map((plugin) => (
                  <div key={plugin.name} className="flex items-center justify-between p-3 bg-[#0d0d0d] rounded-lg border border-[#1e1e1e]">
                    <div>
                      <p className="text-sm font-mono text-[#ededed]">{plugin.name}</p>
                      <p className="text-xs text-[#525252]">{plugin.desc}</p>
                    </div>
                    {plugin.installed ? (
                      <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded border border-green-400/20">
                        מותקן
                      </span>
                    ) : (
                      <button className="text-xs text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded border border-indigo-400/20 hover:bg-indigo-400/20">
                        התקן
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
