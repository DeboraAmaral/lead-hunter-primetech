import { LEAD_STATUS_META, type LeadStatus } from "@/types/lead";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: LeadStatus; className?: string }) {
  const meta = LEAD_STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        meta.className,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}
