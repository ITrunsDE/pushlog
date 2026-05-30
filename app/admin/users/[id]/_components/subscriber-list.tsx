'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/admin/_components/ui/table'
import { Badge } from '@/app/admin/_components/ui/badge'
import { Button } from '@/app/admin/_components/ui/button'

type Subscriber = {
  id: string
  email: string
  confirmedAt: string | null
  digestFrequency: string
  product: { name: string }
}

export function SubscriberList({ initialSubscribers }: { initialSubscribers: Subscriber[] }) {
  const [subscribers, setSubscribers] = useState(initialSubscribers)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDeleteSubscriber(id: string) {
    setDeleting(id)
    const res = await fetch(`/api/admin/subscribers/${id}`, { method: 'DELETE' })
    if (res.ok) setSubscribers((prev) => prev.filter((s) => s.id !== id))
    setDeleting(null)
  }

  return (
    <Table className="mt-4">
      <TableHead>
        <TableRow>
          <TableHeader>E-Mail</TableHeader>
          <TableHeader>Produkt</TableHeader>
          <TableHeader>Status</TableHeader>
          <TableHeader>Frequenz</TableHeader>
          <TableHeader>Aktionen</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {subscribers.map((sub) => (
          <TableRow key={sub.id}>
            <TableCell>{sub.email}</TableCell>
            <TableCell className="text-zinc-500">{sub.product.name}</TableCell>
            <TableCell>
              <Badge color={sub.confirmedAt ? 'green' : 'zinc'}>
                {sub.confirmedAt ? 'Bestätigt' : 'Ausstehend'}
              </Badge>
            </TableCell>
            <TableCell>{sub.digestFrequency}</TableCell>
            <TableCell>
              <Button
                plain
                onClick={() => handleDeleteSubscriber(sub.id)}
                disabled={deleting === sub.id}
              >
                {deleting === sub.id ? '…' : 'Löschen'}
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {subscribers.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-zinc-500 py-4">
              Keine Subscriber.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
