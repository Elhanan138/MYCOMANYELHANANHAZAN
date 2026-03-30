"use client";

import { useState } from "react";
import { Search, Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TopBarProps {
  title?: string;
  actions?: React.ReactNode;
}

export function TopBar({ title, actions }: TopBarProps) {
  return (
    <header className="flex items-center justify-between h-14 px-6 border-b border-[#262626] bg-[#0a0a0a]">
      <div className="flex items-center gap-4">
        {title && (
          <h1 className="text-base font-semibold text-[#ededed]">{title}</h1>
        )}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Bell className="h-4 w-4 text-[#a3a3a3]" />
        </Button>
      </div>
    </header>
  );
}
