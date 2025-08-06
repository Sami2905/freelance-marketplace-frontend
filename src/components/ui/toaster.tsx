"use client"

import * as React from "react"
import { Toast } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast
            key={id}
            {...props}
            className="mb-2 w-full border-l-[6px] shadow-lg"
            style={{
              borderLeftColor: props.variant === "destructive" 
                ? "hsl(0, 72.2%, 50.6%)" 
                : props.variant === "success"
                ? "hsl(142.1, 76.2%, 36.3%)"
                : "hsl(221.2, 83.2%, 53.3%)",
            }}
          >
            <div className="grid gap-1">
              {title && <div className="text-sm font-semibold">{title}</div>}
              {description && (
                <div className="text-sm opacity-90">{description}</div>
              )}
            </div>
            {action}
          </Toast>
        )
      })}
    </div>
  )
}
