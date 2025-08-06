import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/icons"

const quickActions = [
  {
    title: "Create New Gig",
    description: "List a new service to start earning",
    icon: Icons.plus,
    href: "/dashboard/gigs/new",
    variant: "default" as const,
  },
  {
    title: "Withdraw Earnings",
    description: "Transfer money to your bank account",
    icon: Icons.dollarSign,
    href: "/dashboard/earnings/withdraw",
    variant: "outline" as const,
  },
  {
    title: "View Messages",
    description: "Check your inbox and respond to clients",
    icon: Icons.messageSquare,
    href: "/dashboard/messages",
    variant: "outline" as const,
  },
  {
    title: "Analytics",
    description: "View detailed performance metrics",
    icon: Icons.dashboard,
    href: "/dashboard/analytics",
    variant: "outline" as const,
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, i) => {
            const Icon = action.icon
            return (
              <Button
                key={i}
                variant={action.variant}
                className="h-auto flex-col items-start justify-start p-4 text-left"
                asChild
              >
                <a href={action.href}>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{action.title}</p>
                    <p className="text-sm font-normal text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </a>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
