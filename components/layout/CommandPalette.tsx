"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  CircleDot,
  Bot,
  Target,
  RefreshCw,
  LayoutDashboard,
  Activity,
  DollarSign,
  Settings,
  Search,
} from "lucide-react";

interface CommandPaletteProps {
  companySlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COMMANDS = [
  { label: "לוח בקרה", href: "dashboard", icon: LayoutDashboard },
  { label: "נושאים", href: "issues", icon: CircleDot },
  { label: "סוכנים", href: "agents", icon: Bot },
  { label: "מטרות", href: "goals", icon: Target },
  { label: "רוטינות", href: "routines", icon: RefreshCw },
  { label: "פעילות", href: "activity", icon: Activity },
  { label: "עלויות", href: "costs", icon: DollarSign },
  { label: "הגדרות חברה", href: "company/settings", icon: Settings },
];

export function CommandPalette({
  companySlug,
  open,
  onOpenChange,
}: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = COMMANDS.filter((c) =>
    c.label.includes(query) || c.href.includes(query.toLowerCase())
  );

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const navigate = (href: string) => {
    router.push(`/${companySlug}/${href}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-lg">
        <div className="flex items-center border-b border-[#262626] px-3">
          <Search className="h-4 w-4 text-[#a3a3a3] ml-2" />
          <input
            className="flex-1 py-3 text-sm bg-transparent outline-none text-[#ededed] placeholder:text-[#525252]"
            placeholder="חפש פקודה..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-6 text-center text-sm text-[#a3a3a3]">אין תוצאות</div>
          ) : (
            filtered.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.href}
                  onClick={() => navigate(cmd.href)}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm text-[#ededed] hover:bg-[#1e1e1e] transition-colors"
                >
                  <Icon className="h-4 w-4 text-[#a3a3a3]" />
                  {cmd.label}
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
