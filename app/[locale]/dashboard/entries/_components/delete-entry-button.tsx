'use client'

import { useRouter } from '@/lib/navigation'
import { useTranslations } from 'next-intl'

export function DeleteEntryButton({ id }: { id: string }) {
  const router = useRouter()
  const t = useTranslations('dashboard')

  async function handleDelete() {
    if (!confirm(t('deleteEntryConfirm'))) return
    await fetch(`/api/entries/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <button onClick={handleDelete} className="text-xs text-red-600 hover:underline">
      {t('delete')}
    </button>
  )
}
