import { type LucideProps } from "lucide-react"
import dynamic from "next/dynamic"

// Icons are dynamically imported to reduce initial bundle size
// and improve performance through code-splitting.

export const Icons = {
  // Brand
  logo: dynamic<LucideProps>(() => import("lucide-react").then((mod) => mod.Rocket), {
    ssr: false,
  }),
  
  // Common
  spinner: dynamic<LucideProps>(() => 
    import("lucide-react").then((mod) => mod.Loader2), {
      ssr: false,
    }
  ),
  plus: dynamic<LucideProps>(() => import("lucide-react").then((mod) => mod.Plus), {
    ssr: false,
  }),
  close: dynamic<LucideProps>(() => import("lucide-react").then((mod) => mod.X), {
    ssr: false,
  }),
  chevronDown: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.ChevronDown),
    { ssr: false }
  ),
  chevronUp: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.ChevronUp),
    { ssr: false }
  ),
  chevronRight: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.ChevronRight),
    { ssr: false }
  ),
  menu: dynamic<LucideProps>(() => import("lucide-react").then((mod) => mod.Menu), {
    ssr: false,
  }),
  
  // Navigation
  dashboard: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.LayoutDashboard),
    { ssr: false }
  ),
  phone: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.Phone),
    { ssr: false }
  ),
  moreVertical: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.MoreVertical),
    { ssr: false }
  ),
  download: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.Download),
    { ssr: false }
  ),
  checkCheck: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.CheckCheck),
    { ssr: false }
  ),
  paperclip: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.Paperclip),
    { ssr: false }
  ),
  mic: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.Mic),
    { ssr: false }
  ),
  send: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.Send),
    { ssr: false }
  ),
  briefcase: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.Briefcase),
    { ssr: false }
  ),
  shoppingCart: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.ShoppingCart),
    { ssr: false }
  ),
  messageSquare: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.MessageSquare),
    { ssr: false }
  ),
  dollarSign: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.DollarSign),
    { ssr: false }
  ),
  star: dynamic<LucideProps>(() => import("lucide-react").then((mod) => mod.Star), {
    ssr: false,
  }),
  settings: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.Settings),
    { ssr: false }
  ),
  
  // Actions
  edit: dynamic<LucideProps>(() => import("lucide-react").then((mod) => mod.Edit), {
    ssr: false,
  }),
  trash: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.Trash2),
    { ssr: false }
  ),
  check: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.Check),
    { ssr: false }
  ),
  x: dynamic<LucideProps>(() => import("lucide-react").then((mod) => mod.X), {
    ssr: false,
  }),
  eye: dynamic<LucideProps>(() => import("lucide-react").then((mod) => mod.Eye), {
    ssr: false,
  }),
  pause: dynamic<LucideProps>(() => import("lucide-react").then((mod) => mod.Pause), {
    ssr: false,
  }),
  play: dynamic<LucideProps>(() => import("lucide-react").then((mod) => mod.Play), {
    ssr: false,
  }),
  
  // Status
  alertCircle: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.AlertCircle),
    { ssr: false }
  ),
  checkCircle: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.CheckCircle2),
    { ssr: false }
  ),
  info: dynamic<LucideProps>(() => import("lucide-react").then((mod) => mod.Info), {
    ssr: false,
  }),
  alertTriangle: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.AlertTriangle),
    { ssr: false }
  ),
  
  // Files & Media
  image: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.Image),
    { ssr: false }
  ),
  fileText: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.FileText),
    { ssr: false }
  ),
  upload: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.Upload),
    { ssr: false }
  ),
  
  // Social
  github: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.Github),
    { ssr: false }
  ),
  twitter: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.Twitter),
    { ssr: false }
  ),
  linkedin: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.Linkedin),
    { ssr: false }
  ),
  
  // Payment
  creditCard: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.CreditCard),
    { ssr: false }
  ),
  wallet: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.Wallet),
    { ssr: false }
  ),
  
  // User
  user: dynamic<LucideProps>(() => import("lucide-react").then((mod) => mod.User), {
    ssr: false,
  }),
  
  // Security
  shield: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.Shield),
    { ssr: false }
  ),
  
  // Authentication
  logOut: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.LogOut),
    { ssr: false }
  ),
  users: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.Users),
    { ssr: false }
  ),
  userPlus: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.UserPlus),
    { ssr: false }
  ),
  
  // Time
  calendar: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.Calendar),
    { ssr: false }
  ),
  clock: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.Clock),
    { ssr: false }
  ),
  
  // Misc
  search: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.Search),
    { ssr: false }
  ),
  filter: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.Filter),
    { ssr: false }
  ),
  moreHorizontal: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.MoreHorizontal),
    { ssr: false }
  ),
  externalLink: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.ExternalLink),
    { ssr: false }
  ),
  arrowRight: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.ArrowRight),
    { ssr: false }
  ),
  arrowLeft: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.ArrowLeft),
    { ssr: false }
  ),
  chevronLeft: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.ChevronLeft),
    { ssr: false }
  ),
  loader: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.Loader2),
    { ssr: false }
  ),
  messageCircle: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.MessageCircle),
    { ssr: false }
  ),
  
  // Communication
  mail: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.Mail),
    { ssr: false }
  ),
  
  // Files
  file: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.File),
    { ssr: false }
  ),
  folder: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.Folder),
    { ssr: false }
  ),
  
  // Arrows
  arrowUp: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.ArrowUp),
    { ssr: false }
  ),
  arrowDown: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.ArrowDown),
    { ssr: false }
  ),
  
  // Media
  camera: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.Camera),
    { ssr: false }
  ),
  video: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.Video),
    { ssr: false }
  ),
  
  // Toggle
  sun: dynamic<LucideProps>(() => import("lucide-react").then((mod) => mod.Sun), {
    ssr: false,
  }),
  moon: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.Moon),
    { ssr: false }
  ),
  
  // Navigation
  home: dynamic<LucideProps>(() => import("lucide-react").then((mod) => mod.Home), {
    ssr: false,
  }),
  bell: dynamic<LucideProps>(() => import("lucide-react").then((mod) => mod.Bell), {
    ssr: false,
  }),
  
  // Actions
  minus: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.Minus),
    { ssr: false }
  ),
  
  // Additional icons for marketplace
  bookmark: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.Bookmark),
    { ssr: false }
  ),
  globe: dynamic<LucideProps>(
    () => import("lucide-react").then((mod) => mod.Globe),
    { ssr: false }
  ),
}

export type IconName = keyof typeof Icons
