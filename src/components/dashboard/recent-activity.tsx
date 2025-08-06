import { formatDistanceToNow } from "date-fns"
import { Icons } from "@/components/icons"

interface Activity {
  id: string
  type: 'order' | 'message' | 'review' | 'withdrawal'
  title: string
  description: string
  date: Date
  user: {
    name: string
    avatar: string
  }
}

const activities: Activity[] = [
  {
    id: '1',
    type: 'order',
    title: 'New Order',
    description: 'You received a new order for "Logo Design"',
    date: new Date('2025-07-23T14:30:00'),
    user: {
      name: 'Alex Johnson',
      avatar: '/avatars/02.png',
    },
  },
  {
    id: '2',
    type: 'message',
    title: 'New Message',
    description: 'Sarah Miller sent you a message about your gig',
    date: new Date('2025-07-23T12:15:00'),
    user: {
      name: 'Sarah Miller',
      avatar: '/avatars/03.png',
    },
  },
  {
    id: '3',
    type: 'review',
    title: 'New Review',
    description: 'You received a 5-star review from Michael Chen',
    date: new Date('2025-07-22T19:45:00'),
    user: {
      name: 'Michael Chen',
      avatar: '/avatars/04.png',
    },
  },
  {
    id: '4',
    type: 'withdrawal',
    title: 'Withdrawal Processed',
    description: 'Your withdrawal of $1,250 has been processed',
    date: new Date('2025-07-22T09:20:00'),
    user: {
      name: 'System',
      avatar: '/avatars/logo.png',
    },
  },
  {
    id: '5',
    type: 'order',
    title: 'Order Completed',
    description: 'Your order for "Website Redesign" has been completed',
    date: new Date('2025-07-21T16:10:00'),
    user: {
      name: 'Emily Wilson',
      avatar: '/avatars/05.png',
    },
  },
]

const activityIcons = {
  order: Icons.shoppingCart,
  message: Icons.messageSquare,
  review: Icons.star,
  withdrawal: Icons.wallet,
}

export function RecentActivity() {
  return (
    <div className="space-y-6">
      {activities.map((activity) => {
        const Icon = activityIcons[activity.type] || Icons.alertCircle
        const timeAgo = formatDistanceToNow(activity.date, { addSuffix: true })
        
        return (
          <div key={activity.id} className="flex items-start">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{activity.title}</p>
              <p className="text-sm text-muted-foreground">{activity.description}</p>
              <div className="flex items-center pt-1">
                <span className="text-xs text-muted-foreground">{timeAgo}</span>
                {activity.user.name !== 'System' && (
                  <span className="mx-2 text-muted-foreground">•</span>
                )}
                {activity.user.name !== 'System' && (
                  <span className="text-xs text-muted-foreground">
                    {activity.user.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
