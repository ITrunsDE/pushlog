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

type Product = {
  id: string
  name: string
  slug: string
  _count: { entries: number; subscribers: number }
}

export function ProductList({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter()
  const [products, setProducts] = useState(initialProducts)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDeleteProduct(id: string) {
    if (!confirm('Produkt und alle zugehörigen Einträge und Subscriber löschen?')) return
    setDeleting(id)
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id))
      router.refresh()
    }
    setDeleting(null)
  }

  return (
    <Table className="mt-4">
      <TableHead>
        <TableRow>
          <TableHeader>Name</TableHeader>
          <TableHeader>Slug</TableHeader>
          <TableHeader>Einträge</TableHeader>
          <TableHeader>Subscriber</TableHeader>
          <TableHeader>Öffentlich</TableHeader>
          <TableHeader>Aktionen</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {products.map((product) => (
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
            <TableCell>
              <button
                onClick={() => handleDeleteProduct(product.id)}
                disabled={deleting === product.id}
                className="text-xs text-red-600 hover:underline disabled:opacity-50"
              >
                {deleting === product.id ? '…' : 'Löschen'}
              </button>
            </TableCell>
          </TableRow>
        ))}
        {products.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-zinc-500 py-4">
              Keine Produkte.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
