"use client"

import { Metadata } from "next"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OverviewChart } from "@/components/dashboard/overview-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { StatCard } from "@/components/dashboard/stat-card"
import { Icons } from "@/components/icons"
import { useAuth } from "@/app/AuthContext"

export default function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }
  // Mock data - replace with real data from your API
  const stats = [
    {
      title: "Total Earnings",
      value: "$12,345",
      change: "+12.5%",
      changeType: "increase" as const,
      icon: "dollarSign" as const,
    },
    {
      title: "Active Orders",
      value: "24",
      change: "+4",
      changeType: "increase" as const,
      icon: "shoppingCart" as const,
    },
    {
      title: "New Messages",
      value: "15",
      change: "+3",
      changeType: "increase" as const,
      icon: "messageSquare" as const,
    },
    {
      title: "Avg. Response Time",
      value: "2.4h",
      change: "-0.5h",
      changeType: "decrease" as const,
      icon: "clock" as const,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your business.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Overview Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  )
}
