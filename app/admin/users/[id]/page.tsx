import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { Heading } from '@/app/admin/_components/ui/heading'
import { Divider } from '@/app/admin/_components/ui/divider'
import { Badge } from '@/app/admin/_components/ui/badge'
import { Avatar } from '@/app/admin/_components/ui/avatar'
import { StatCard } from '@/app/admin/_components/stat-card'
import { categoryBadgeClass } from '@/lib/badge-colors'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/admin/_components/ui/table'
import { UserActions } from './_components/user-actions'
import { SubscriberList } from './_components/subscriber-list'

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
    include: { product: { select: { name: true } } },
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
      <Table className="mt-4">
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Slug</TableHeader>
            <TableHeader>Einträge</TableHeader>
            <TableHeader>Subscriber</TableHeader>
            <TableHeader>Öffentlich</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {user.products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell className="text-zinc-500">{product.slug}</TableCell>
              <TableCell>{product._count.entries}</TableCell>
              <TableCell>{product._count.subscribers}</TableCell>
              <TableCell>
                <a
                  href={`/changelog/${product.slug}`}
                  target="_blank"
                  className="text-blue-600 text-sm hover:underline"
                >
                  Ansehen →
                </a>
              </TableCell>
            </TableRow>
          ))}
          {user.products.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-zinc-500 py-4">
                Keine Produkte.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Recent Entries */}
      <Heading level={2} className="mt-10">Letzte Einträge</Heading>
      <Divider className="mt-4" />
      <Table className="mt-4">
        <TableHead>
          <TableRow>
            <TableHeader>Titel</TableHeader>
            <TableHeader>Produkt</TableHeader>
            <TableHeader>Kategorie</TableHeader>
            <TableHeader>Veröffentlicht</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {recentEntries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>{entry.title}</TableCell>
              <TableCell className="text-zinc-500">{entry.product.name}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${categoryBadgeClass(entry.category)}`}>
                  {entry.category}
                </span>
              </TableCell>
              <TableCell className="text-zinc-500">
                {formatDate(entry.publishedAt)}
              </TableCell>
            </TableRow>
          ))}
          {recentEntries.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-zinc-500 py-4">
                Keine Einträge.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Subscribers */}
      <Heading level={2} className="mt-10">Subscriber</Heading>
      <Divider className="mt-4" />
      <SubscriberList
        initialSubscribers={JSON.parse(JSON.stringify(subscribers))}
      />
    </>
  )
}
