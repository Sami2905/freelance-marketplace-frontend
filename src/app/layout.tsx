import type { Metadata, Viewport } from "next";
import { GeistSans, GeistMono } from "geist/font";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./AuthContext";
import { ToastProvider } from "@radix-ui/react-toast";

// Force dynamic rendering for the entire app
export const dynamic = 'force-dynamic';

// Fonts configuration
const fontSans = GeistSans;
const fontMono = GeistMono;

// Metadata
export const metadata: Metadata = {
  title: {
    default: "Freelance Marketplace",
    template: "%s | Freelance Marketplace",
  },
  description: "A modern freelance marketplace platform connecting talented freelancers with clients worldwide.",
  keywords: ["freelance", "marketplace", "hire", "work", "remote", "freelancer", "jobs"],
  authors: [
    {
      name: "Your Name",
      url: "https://your-website.com",
    },
  ],
  creator: "Your Name",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://your-website.com",
    title: "Freelance Marketplace",
    description: "A modern freelance marketplace platform connecting talented freelancers with clients worldwide.",
    siteName: "Freelance Marketplace",
  },
  twitter: {
    card: "summary_large_image",
    title: "Freelance Marketplace",
    description: "A modern freelance marketplace platform connecting talented freelancers with clients worldwide.",
    creator: "@yourtwitter",
  },
  icons: {
    icon: "/favicon.ico"
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        `${fontSans.variable} ${fontMono.variable} font-sans antialiased`,
        "min-h-screen"
      )}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              <ToastProvider>
                <div className="relative flex min-h-screen flex-col">
                  {children}
                  <Toaster />
                </div>
              </ToastProvider>
            </TooltipProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
