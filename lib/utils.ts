import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("he-IL", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("he-IL", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) return formatDate(d);
  if (days > 0) return `לפני ${days} ימים`;
  if (hours > 0) return `לפני ${hours} שעות`;
  if (minutes > 0) return `לפני ${minutes} דקות`;
  return "עכשיו";
}

export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount == null) return "$0.00";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(num);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateIssueIdentifier(companySlug: string, number: number): string {
  return `${companySlug.toUpperCase()}-${number}`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: "text-green-400",
    done: "text-green-400",
    completed: "text-green-400",
    in_progress: "text-yellow-400",
    running: "text-yellow-400",
    error: "text-red-400",
    failed: "text-red-400",
    cancelled: "text-red-400",
    todo: "text-blue-400",
    queued: "text-blue-400",
    blocked: "text-orange-400",
    in_review: "text-purple-400",
    inactive: "text-neutral-400",
    archived: "text-neutral-400",
    paused: "text-neutral-400",
    pending: "text-yellow-400",
    on_hold: "text-orange-400",
  };
  return colors[status] || "text-neutral-400";
}

export function getStatusBgColor(status: string): string {
  const colors: Record<string, string> = {
    active: "bg-green-400/10 text-green-400 border-green-400/20",
    done: "bg-green-400/10 text-green-400 border-green-400/20",
    completed: "bg-green-400/10 text-green-400 border-green-400/20",
    in_progress: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
    running: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
    error: "bg-red-400/10 text-red-400 border-red-400/20",
    failed: "bg-red-400/10 text-red-400 border-red-400/20",
    cancelled: "bg-red-400/10 text-red-400 border-red-400/20",
    todo: "bg-blue-400/10 text-blue-400 border-blue-400/20",
    queued: "bg-blue-400/10 text-blue-400 border-blue-400/20",
    blocked: "bg-orange-400/10 text-orange-400 border-orange-400/20",
    in_review: "bg-purple-400/10 text-purple-400 border-purple-400/20",
    inactive: "bg-neutral-400/10 text-neutral-400 border-neutral-400/20",
    archived: "bg-neutral-400/10 text-neutral-400 border-neutral-400/20",
    paused: "bg-neutral-400/10 text-neutral-400 border-neutral-400/20",
    pending: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
    on_hold: "bg-orange-400/10 text-orange-400 border-orange-400/20",
  };
  return colors[status] || "bg-neutral-400/10 text-neutral-400 border-neutral-400/20";
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    urgent: "text-red-400",
    high: "text-orange-400",
    medium: "text-yellow-400",
    low: "text-blue-400",
    no_priority: "text-neutral-500",
  };
  return colors[priority] || "text-neutral-500";
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}
