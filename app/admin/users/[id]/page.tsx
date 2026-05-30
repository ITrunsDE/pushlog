import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { Heading } from '@/app/admin/_components/ui/heading'
import { Divider } from '@/app/admin/_components/ui/divider'
import { Badge } from '@/app/admin/_components/ui/badge'
import { Avatar } from '@/app/admin/_components/ui/avatar'
import { StatCard } from '@/app/admin/_components/stat-card'
import { UserActions } from './_components/user-actions'
import { SubscriberList } from './_components/subscriber-list'
import { EntryList } from './_components/entry-list'
import { ProductList } from './_components/product-list'

export const dynamic = 'force-dynamic'

function planColor(plan: string): 'green' | 'amber' | 'zinc' {
  if (plan === 'pro') return 'green'
  if (plan === 'solo') return 'amber'
  return 'zinc'
}

function formatDate(date: Date | string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const SUBSCRIBER_LIMITS: Record<string, number> = {
  free: 100,
  solo: 1000,
  pro: 10000,
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const user = await db.user.findUnique({
    where: { id },
    include: {
      products: {
        include: {
          _count: { select: { entries: true, subscribers: true } },
        },
      },
    },
  })

  if (!user) notFound()

  const recentEntries = await db.changelogEntry.findMany({
    where: { product: { userId: id } },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { product: { select: { name: true } }, sections: true },
  })

  const subscribers = await db.subscriber.findMany({
    where: { product: { userId: id } },
    orderBy: { createdAt: 'desc' },
    include: { product: { select: { name: true } } },
  })

  const confirmedSubscribers = subscribers.filter((s) => s.confirmedAt).length
  const subscriberLimit = SUBSCRIBER_LIMITS[user.plan] ?? 100
  const entryCount = user.products.reduce((sum, p) => sum + p._count.entries, 0)
  const entryLimit = user.plan === 'free' ? 25 : '∞'
  const aiLimit = user.plan === 'free' ? 5 : '∞'

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar
            initials={(user.name?.[0] ?? user.email[0]).toUpperCase()}
            className="size-16 bg-zinc-200"
          />
          <div>
            <Heading>{user.name ?? user.email}</Heading>
            <p className="text-zinc-500">{user.email}</p>
            <div className="flex flex-wrap gap-2 mt-1 items-center">
              <Badge color={planColor(user.plan)}>{user.plan}</Badge>
              {user.locked && <Badge color="red">Gesperrt</Badge>}
              <span className="text-xs text-zinc-400">
                seit {formatDate(user.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <UserActions
        userId={user.id}
        currentPlan={user.plan}
        isLocked={user.locked}
      />

      {/* Usage Grid */}
      <div className="grid grid-cols-3 gap-6 mt-8">
        <StatCard
          title="KI-Generierungen"
          value={`${user.aiGenerationsThisMonth} / ${aiLimit}`}
        />
        <StatCard
          title="Subscriber"
          value={`${confirmedSubscribers} / ${subscriberLimit}`}
        />
        <StatCard
          title="Einträge"
          value={`${entryCount} / ${entryLimit}`}
        />
      </div>

      {/* Products */}
      <Heading level={2} className="mt-10">Produkte</Heading>
      <Divider className="mt-4" />
      <ProductList initialProducts={user.products} />

      {/* Recent Entries */}
      <Heading level={2} className="mt-10">Letzte Einträge</Heading>
      <Divider className="mt-4" />
      <EntryList initialEntries={JSON.parse(JSON.stringify(recentEntries))} />

      {/* Subscribers */}
      <Heading level={2} className="mt-10">Subscriber</Heading>
      <Divider className="mt-4" />
      <SubscriberList
        initialSubscribers={JSON.parse(JSON.stringify(subscribers))}
      />
    </>
  )
}
