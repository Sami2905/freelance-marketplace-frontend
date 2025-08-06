import { ReactNode } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { MobileNavigation } from "@/components/dashboard/mobile-navigation"

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden border-r bg-background md:block md:w-64 lg:w-80">
        <div className="fixed h-full w-full max-w-[280px] overflow-y-auto">
          <Sidebar />
        </div>
      </aside>

      <div className="flex w-full flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:gap-x-6 lg:px-8">
          <MobileNavigation />
          <div className="flex flex-1 items-center justify-between">
            <DashboardHeader />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-muted/20 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
