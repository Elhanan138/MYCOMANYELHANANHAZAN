import { notFound } from "next/navigation";
import Link from "next/link";
import { Target, ArrowRight, Bot, ChevronLeft } from "lucide-react";
import { getStatusBgColor, formatDateTime } from "@/lib/utils";
import { STATUS_LABELS, GOAL_LEVEL_LABELS } from "@/lib/constants";
import type { Goal, Company } from "@/types";

async function getCompany(slug: string): Promise<Company | null> {
  try {
    const base = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const res = await fetch(`${base}/api/companies/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function getGoal(goalId: string): Promise<Goal | null> {
  try {
    const base = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const res = await fetch(`${base}/api/goals/${goalId}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch { return null; }
}

async function getSubGoals(companyId: string, parentId: string): Promise<Goal[]> {
  try {
    const base = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const res = await fetch(`${base}/api/companies/${companyId}/goals?parentId=${parentId}`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

interface Props { params: Promise<{ company: string; id: string }> }

export default async function GoalDetailPage({ params }: Props) {
  const { company: slug, id } = await params;
  const company = await getCompany(slug);
  if (!company) notFound();
  const goal = await getGoal(id);
  if (!goal) notFound();
  const subGoals = await getSubGoals(company.id, id);

  return (
    <div className="p-6 max-w-3xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#525252]">
        <Link href={`/${slug}/goals`} className="hover:text-[#a3a3a3]">מטרות</Link>
        <ChevronLeft className="h-4 w-4" />
        <span className="text-[#a3a3a3]">{goal.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-orange-400/10 flex items-center justify-center flex-shrink-0 mt-1">
          <Target className="h-5 w-5 text-orange-400" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[#ededed]">{goal.name}</h1>
          {goal.description && (
            <p className="text-sm text-[#a3a3a3] mt-2 leading-relaxed">{goal.description}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Properties */}
        <div className="bg-[#111] border border-[#262626] rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[#ededed]">מאפיינים</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#525252]">סטטוס</span>
              <span className={`text-xs px-2 py-0.5 rounded border ${getStatusBgColor(goal.status)}`}>
                {STATUS_LABELS[goal.status] || goal.status}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#525252]">רמה</span>
              <span className="text-sm text-[#a3a3a3]">
                {GOAL_LEVEL_LABELS[goal.level] || goal.level}
              </span>
            </div>
            {goal.owner && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#525252]">בעלים</span>
                <div className="flex items-center gap-1.5">
                  <Bot className="h-3.5 w-3.5 text-[#525252]" />
                  <Link
                    href={`/${slug}/agents/${goal.owner.id}`}
                    className="text-sm text-indigo-400 hover:underline"
                  >
                    {goal.owner.name}
                  </Link>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#525252]">נוצר</span>
              <span className="text-xs text-[#a3a3a3]">{formatDateTime(goal.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#525252]">עודכן</span>
              <span className="text-xs text-[#a3a3a3]">{formatDateTime(goal.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Sub-goals */}
        <div className="bg-[#111] border border-[#262626] rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-[#ededed]">תת-מטרות ({subGoals.length})</h2>
          {subGoals.length === 0 ? (
            <p className="text-xs text-[#525252] py-4 text-center">אין תת-מטרות</p>
          ) : (
            <div className="space-y-2">
              {subGoals.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/${slug}/goals/${sub.id}`}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#1a1a1a] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-3.5 w-3.5 text-[#525252]" />
                    <span className="text-sm text-[#c0c0c0]">{sub.name}</span>
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded border ${getStatusBgColor(sub.status)}`}>
                    {STATUS_LABELS[sub.status] || sub.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
