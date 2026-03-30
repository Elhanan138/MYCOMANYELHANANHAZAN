"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CircleDot,
  RefreshCw,
  Target,
  CheckSquare,
  Bot,
  Zap,
  Network,
  Activity,
  DollarSign,
  Settings,
  ChevronDown,
  Building2,
  Inbox,
  PanelLeft,
} from "lucide-react";
import type { Company } from "@/types";

interface SidebarProps {
  company: Company;
  companies: Company[];
}

const NAV_ITEMS = [
  {
    section: "עבודה",
    items: [
      { href: "inbox", label: "תיבת דואר", icon: Inbox },
      { href: "issues", label: "נושאים", icon: CircleDot },
      { href: "routines", label: "רוטינות", icon: RefreshCw },
      { href: "goals", label: "מטרות", icon: Target },
      { href: "approvals", label: "אישורים", icon: CheckSquare },
    ],
  },
  {
    section: "ניהול",
    items: [
      { href: "agents", label: "סוכנים", icon: Bot },
      { href: "skills", label: "מיומנויות", icon: Zap },
      { href: "org", label: "ארגון", icon: Network },
    ],
  },
  {
    section: "נתונים",
    items: [
      { href: "dashboard", label: "לוח בקרה", icon: LayoutDashboard },
      { href: "activity", label: "פעילות", icon: Activity },
      { href: "costs", label: "עלויות", icon: DollarSign },
    ],
  },
];

export function Sidebar({ company, companies }: SidebarProps) {
  const pathname = usePathname();
  const [companySwitcherOpen, setCompanySwitcherOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) => {
    return pathname.includes(`/${company.slug}/${href}`);
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full border-l border-[#262626] bg-[#0d0d0d] transition-all duration-200",
        collapsed ? "w-14" : "w-60"
      )}
    >
      {/* Company switcher */}
      <div className="p-3 border-b border-[#262626]">
        <button
          onClick={() => setCompanySwitcherOpen(!companySwitcherOpen)}
          className={cn(
            "flex items-center gap-2 w-full rounded-md px-2 py-2 hover:bg-[#1e1e1e] transition-colors",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: company.brandColor || "#6366f1" }}
            >
              {company.name.charAt(0)}
            </div>
            {!collapsed && (
              <span className="text-sm font-medium truncate">{company.name}</span>
            )}
          </div>
          {!collapsed && <ChevronDown className="h-3 w-3 text-[#a3a3a3] flex-shrink-0" />}
        </button>

        {/* Company dropdown */}
        {companySwitcherOpen && !collapsed && (
          <div className="absolute z-50 mt-1 w-52 rounded-md border border-[#262626] bg-[#121212] shadow-lg">
            <div className="p-1">
              {companies.map((c) => (
                <Link
                  key={c.id}
                  href={`/${c.slug}/dashboard`}
                  onClick={() => setCompanySwitcherOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded px-2 py-2 text-sm hover:bg-[#1e1e1e] transition-colors",
                    c.id === company.id && "bg-[#1e1e1e]"
                  )}
                >
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: c.brandColor || "#6366f1" }}
                  >
                    {c.name.charAt(0)}
                  </div>
                  <span className="truncate">{c.name}</span>
                </Link>
              ))}
              <div className="border-t border-[#262626] mt-1 pt-1">
                <Link
                  href="/instance/settings"
                  onClick={() => setCompanySwitcherOpen(false)}
                  className="flex items-center gap-2 rounded px-2 py-2 text-sm text-[#a3a3a3] hover:bg-[#1e1e1e] transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span>הגדרות מערכת</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_ITEMS.map((section) => (
          <div key={section.section} className="mb-4">
            {!collapsed && (
              <div className="px-2 mb-1">
                <span className="text-xs font-medium text-[#525252] uppercase tracking-wider">
                  {section.section}
                </span>
              </div>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={`/${company.slug}/${item.href}`}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors",
                    collapsed ? "justify-center" : "",
                    active
                      ? "bg-[#1e1e1e] text-[#ededed]"
                      : "text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-[#ededed]"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom items */}
      <div className="p-2 border-t border-[#262626] space-y-1">
        <Link
          href={`/${company.slug}/company/settings`}
          className={cn(
            "flex items-center gap-2.5 rounded-md px-2 py-2 text-sm text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-[#ededed] transition-colors",
            collapsed ? "justify-center" : ""
          )}
          title={collapsed ? "הגדרות חברה" : undefined}
        >
          <Building2 className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>הגדרות חברה</span>}
        </Link>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex items-center gap-2.5 rounded-md px-2 py-2 text-sm text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-[#ededed] transition-colors w-full",
            collapsed ? "justify-center" : ""
          )}
        >
          <PanelLeft className={cn("h-4 w-4 flex-shrink-0", collapsed && "rotate-180")} />
          {!collapsed && <span>כווץ</span>}
        </button>
      </div>
    </div>
  );
}
