"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Icons } from "@/components/icons"

type NavItem = {
  title: string
  href: string
  icon: keyof typeof Icons
}

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)
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
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        <span className="sr-only">Toggle menu</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
          <div className="fixed inset-y-0 left-0 z-50 w-3/4 max-w-xs border-r bg-background">
            <div className="flex h-16 items-center border-b px-6">
              <Link href="/" className="flex items-center space-x-2">
                <Icons.logo className="h-6 w-6" />
                <span className="font-bold">FreelanceHub</span>
              </Link>
            </div>
            
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <nav className="grid gap-1 p-4">
                {navItems.map((item) => {
                  const Icon = Icons[item.icon] || Icons.alertCircle
                  const isActive = pathname === item.href
                  
                  return (
                    <Button
                      key={item.href}
                      asChild
                      variant={isActive ? "secondary" : "ghost"}
                      className={`w-full justify-start ${isActive ? "bg-accent" : ""}`}
                      onClick={() => setIsOpen(false)}
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
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard/gigs/new" onClick={() => setIsOpen(false)}>
                  <Icons.plus className="mr-2 h-4 w-4" />
                  Create Gig
                </Link>
              </Button>
            </div>
          </div>
          
          <div 
            className="fixed inset-0 z-40 bg-black/50" 
            onClick={() => setIsOpen(false)}
          />
        </div>
      )}
    </div>
  )
}
