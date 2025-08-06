"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Icons } from "@/components/icons"

type NavItem = {
  title: string
  href: string
  icon: keyof typeof Icons
  disabled?: boolean
}

export function Sidebar() {
  const pathname = usePathname()
  
  const navItems: NavItem[] = [
    {
      title: "Overview",
      href: "/dashboard",
      icon: "dashboard",
    },
    {
      title: "Gigs",
      href: "/dashboard/gigs",
      icon: "briefcase",
    },
    {
      title: "Orders",
      href: "/dashboard/orders",
      icon: "shoppingCart",
    },
    {
      title: "Messages",
      href: "/dashboard/messages",
      icon: "messageSquare",
    },
    {
      title: "Earnings",
      href: "/dashboard/earnings",
      icon: "dollarSign",
    },
    {
      title: "Reviews",
      href: "/dashboard/reviews",
      icon: "star",
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: "settings",
    },
  ]

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center space-x-2">
          <Icons.logo className="h-6 w-6" />
          <span className="font-bold">FreelanceHub</span>
        </Link>
      </div>
      
      <ScrollArea className="flex-1">
        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = Icons[item.icon] || Icons.alertCircle
            const isActive = pathname === item.href
            
            return (
              <Button
                key={item.href}
                asChild
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50 hover:text-accent-foreground"
                )}
              >
                <Link href={item.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            )
          })}
        </nav>
      </ScrollArea>
      
      <div className="border-t p-4">
        <Button variant="outline" className="w-full">
          <Icons.plus className="mr-2 h-4 w-4" />
          Create Gig
        </Button>
      </div>
    </div>
  )
}
