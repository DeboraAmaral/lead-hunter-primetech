import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "primary" | "success" | "warning" | "info";
}

const tones: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "bg-muted text-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  info: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

export function StatCard({ label, value, hint, icon: Icon, tone = "default" }: StatCardProps) {
  return (
    <Card className="group relative overflow-hidden p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
          {hint && <p className="mt-1 truncate text-xs text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <div
            className={cn(
              "grid h-10 w-10 shrink-0 place-items-center rounded-xl transition-transform group-hover:scale-105",
              tones[tone],
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </Card>
  );
}
