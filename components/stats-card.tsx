"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  color?: string;
}

export function StatsCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color = "indigo",
}: StatsCardProps) {
  const colorClasses: Record<string, string> = {
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    rose: "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
  };

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-black">
      <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", colorClasses[color] || colorClasses.indigo)}>
        <Icon className="h-6 w-6" />
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {value}
          </span>
          {change && (
            <span className={cn(
              "text-xs font-semibold",
              trend === "up" ? "text-emerald-500" : trend === "down" ? "text-rose-500" : "text-zinc-500"
            )}>
              {change}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
