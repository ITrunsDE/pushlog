'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/admin/_components/ui/table'
import { categoryBadgeClass } from '@/lib/badge-colors'

type Entry = {
  id: string
  title: string
  publishedAt: string | null
  product: { name: string }
  sections: { id: string; type: string }[]
}

function formatDate(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function EntryList({ initialEntries }: { initialEntries: Entry[] }) {
  const router = useRouter()
  const [entries, setEntries] = useState(initialEntries)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDeleteEntry(id: string) {
    if (!confirm('Eintrag wirklich löschen?')) return
    setDeleting(id)
    const res = await fetch(`/api/admin/entries/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setEntries((prev) => prev.filter((e) => e.id !== id))
      router.refresh()
    }
    setDeleting(null)
  }

  return (
    <Table className="mt-4">
      <TableHead>
        <TableRow>
          <TableHeader>Titel</TableHeader>
          <TableHeader>Produkt</TableHeader>
          <TableHeader>Kategorie</TableHeader>
          <TableHeader>Veröffentlicht</TableHeader>
          <TableHeader>Aktionen</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell>{entry.title}</TableCell>
            <TableCell className="text-zinc-500">{entry.product.name}</TableCell>
            <TableCell>
              <div className="flex gap-1 flex-wrap">
                {entry.sections.map((s) => (
                  <span
                    key={s.id}
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${categoryBadgeClass(s.type)}`}
                  >
                    {s.type}
                  </span>
                ))}
              </div>
            </TableCell>
            <TableCell className="text-zinc-500">{formatDate(entry.publishedAt)}</TableCell>
            <TableCell>
              <button
                onClick={() => handleDeleteEntry(entry.id)}
                disabled={deleting === entry.id}
                className="text-xs text-red-600 hover:underline disabled:opacity-50"
              >
                {deleting === entry.id ? '…' : 'Löschen'}
              </button>
            </TableCell>
          </TableRow>
        ))}
        {entries.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-zinc-500 py-4">
              Keine Einträge.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
