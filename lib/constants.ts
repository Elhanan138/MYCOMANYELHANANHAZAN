export const STATUS_LABELS: Record<string, string> = {
  todo: "לביצוע",
  in_progress: "בתהליך",
  in_review: "בסקירה",
  done: "הושלם",
  cancelled: "בוטל",
  blocked: "חסום",
  queued: "בתור",
  running: "רץ",
  failed: "נכשל",
  active: "פעיל",
  inactive: "לא פעיל",
  archived: "בארכיון",
  completed: "הושלם",
  on_hold: "בהמתנה",
  paused: "מושהה",
  pending: "ממתין",
  approved: "אושר",
  rejected: "נדחה",
};

export const PRIORITY_LABELS: Record<string, string> = {
  urgent: "דחוף",
  high: "גבוה",
  medium: "בינוני",
  low: "נמוך",
  no_priority: "ללא עדיפות",
};

export const GOAL_LEVEL_LABELS: Record<string, string> = {
  company: "חברה",
  team: "צוות",
  personal: "אישי",
};

export const TRIGGER_TYPE_LABELS: Record<string, string> = {
  cron: "Cron",
  webhook: "Webhook",
  manual: "ידני",
  interval: "מרווח זמן",
};

export const ADAPTER_TYPE_LABELS: Record<string, string> = {
  cli: "CLI",
  api: "API",
  webhook: "Webhook",
};

export const SKILL_MODE_LABELS: Record<string, string> = {
  inline: "טקסט",
  file: "קובץ",
  url: "כתובת URL",
};

export const APPROVAL_TYPE_LABELS: Record<string, string> = {
  budget: "תקציב",
  action: "פעולה",
  deploy: "פריסה",
  other: "אחר",
};

export const RUN_TYPE_LABELS: Record<string, string> = {
  issue: "נושא",
  routine: "רוטינה",
  manual: "ידני",
  heartbeat: "דופק",
};

export const NAV_ITEMS = [
  {
    section: "עבודה",
    items: [
      { href: "inbox", label: "תיבת דואר", icon: "Inbox" },
      { href: "issues", label: "נושאים", icon: "CircleDot" },
      { href: "routines", label: "רוטינות", icon: "RefreshCw" },
      { href: "goals", label: "מטרות", icon: "Target" },
      { href: "approvals", label: "אישורים", icon: "CheckSquare" },
    ],
  },
  {
    section: "ניהול",
    items: [
      { href: "agents", label: "סוכנים", icon: "Bot" },
      { href: "skills", label: "מיומנויות", icon: "Zap" },
      { href: "org", label: "ארגון", icon: "Network" },
    ],
  },
  {
    section: "נתונים",
    items: [
      { href: "dashboard", label: "לוח בקרה", icon: "LayoutDashboard" },
      { href: "activity", label: "פעילות", icon: "Activity" },
      { href: "costs", label: "עלויות", icon: "DollarSign" },
    ],
  },
];
