"use client"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

// Get the type of icon keys from the Icons object
type IconName = keyof typeof Icons

interface StatCardProps {
  title: string
  value: string
  change: string
  changeType: "increase" | "decrease"
  icon: IconName
}

export function StatCard({
  title,
  value,
  change,
  changeType,
  icon,
}: StatCardProps) {
  const Icon = Icons[icon] || Icons.alertCircle
  
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
          </div>
          <div className="rounded-lg bg-primary/10 p-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="mt-4">
          <div
            className={cn(
              "inline-flex items-center text-sm font-medium",
              changeType === "increase"
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            )}
          >
            {changeType === "increase" ? (
              <Icons.arrowUp className="mr-1 h-4 w-4" />
            ) : (
              <Icons.arrowDown className="mr-1 h-4 w-4" />
            )}
            {change} {changeType === "increase" ? "up" : "down"} from last month
          </div>
        </div>
      </div>
    </div>
  )
}
