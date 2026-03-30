import { cn } from "@/lib/utils";
import { PRIORITY_LABELS } from "@/lib/constants";
import {
  AlertCircle,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Minus,
} from "lucide-react";

interface PriorityBadgeProps {
  priority: string;
  className?: string;
  showLabel?: boolean;
}

const PRIORITY_ICONS: Record<string, React.ReactNode> = {
  urgent: <AlertCircle className="h-3 w-3 text-red-400" />,
  high: <ArrowUp className="h-3 w-3 text-orange-400" />,
  medium: <ArrowRight className="h-3 w-3 text-yellow-400" />,
  low: <ArrowDown className="h-3 w-3 text-blue-400" />,
  no_priority: <Minus className="h-3 w-3 text-neutral-500" />,
};

export function PriorityBadge({
  priority,
  className,
  showLabel = false,
}: PriorityBadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {PRIORITY_ICONS[priority] || <Minus className="h-3 w-3 text-neutral-500" />}
      {showLabel && (
        <span className="text-xs text-[#a3a3a3]">
          {PRIORITY_LABELS[priority] || priority}
        </span>
      )}
    </span>
  );
}
