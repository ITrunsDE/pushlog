import { db } from '@/lib/db'
import { Heading } from '../_components/ui/heading'
import { StatCard } from '../_components/stat-card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../_components/ui/table'
import { Badge } from '../_components/ui/badge'
import { Avatar } from '../_components/ui/avatar'

export const dynamic = 'force-dynamic'

function planColor(plan: string): 'green' | 'amber' | 'zinc' {
  if (plan === 'pro') return 'green'
  if (plan === 'solo') return 'amber'
  return 'zinc'
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default async function UsersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      plan: true,
      locked: true,
      createdAt: true,
      _count: { select: { products: true } },
      products: {
        select: {
          _count: {
            select: {
              entries: true,
              subscribers: { where: { confirmedAt: { not: null } } },
            },
          },
        },
      },
    },
  })

  const total = users.length
  const free = users.filter((u) => u.plan === 'free').length
  const solo = users.filter((u) => u.plan === 'solo').length
  const pro = users.filter((u) => u.plan === 'pro').length

  const entryCount = (u: (typeof users)[0]) =>
    u.products.reduce((sum, p) => sum + p._count.entries, 0)

  const subscriberCount = (u: (typeof users)[0]) =>
    u.products.reduce((sum, p) => sum + p._count.subscribers, 0)

  return (
    <>
      <Heading>Benutzer</Heading>

      <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 mt-8">
        <StatCard title="Gesamt" value={total} />
        <StatCard title="Free" value={free} />
        <StatCard title="Solo" value={solo} />
        <StatCard title="Pro" value={pro} />
      </div>

      <Table className="mt-8">
        <TableHead>
          <TableRow>
            <TableHeader>Benutzer</TableHeader>
            <TableHeader>Plan</TableHeader>
            <TableHeader>Produkte</TableHeader>
            <TableHeader>Einträge</TableHeader>
            <TableHeader>Subscriber</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Registriert</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} href={`/admin/users/${user.id}`}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar
                    initials={(user.name?.[0] ?? user.email[0]).toUpperCase()}
                    className="size-8 bg-zinc-200"
                  />
                  <div>
                    <div className="font-medium">{user.name ?? '—'}</div>
                    <div className="text-zinc-500 text-xs">{user.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge color={planColor(user.plan)}>{user.plan}</Badge>
              </TableCell>
              <TableCell>{user._count.products}</TableCell>
              <TableCell>{entryCount(user)}</TableCell>
              <TableCell>{subscriberCount(user)}</TableCell>
              <TableCell>
                {user.locked ? (
                  <Badge color="red">Gesperrt</Badge>
                ) : (
                  <Badge color="green">Aktiv</Badge>
                )}
              </TableCell>
              <TableCell className="text-zinc-500">
                {formatDate(user.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {users.length === 0 && (
        <p className="text-center text-zinc-500 py-8">Keine Benutzer gefunden.</p>
      )}
    </>
  )
}
