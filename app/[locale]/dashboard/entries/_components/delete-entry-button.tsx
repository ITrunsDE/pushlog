'use client'

import { useRouter } from '@/lib/navigation'

export function DeleteEntryButton({ id }: { id: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Eintrag wirklich löschen?')) return
    await fetch(`/api/entries/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <button onClick={handleDelete} className="text-xs text-red-600 hover:underline">
      Löschen
    </button>
  )
}
