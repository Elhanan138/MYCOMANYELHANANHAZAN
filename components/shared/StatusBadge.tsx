import { cn, getStatusBgColor } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/constants";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        getStatusBgColor(status),
        className
      )}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}
