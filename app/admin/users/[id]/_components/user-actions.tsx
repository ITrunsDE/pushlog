'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogActions, DialogBody, DialogTitle } from '@/app/admin/_components/ui/dialog'

const outlineBtn = "rounded-lg border border-zinc-300 dark:border-zinc-600 px-3 py-1.5 text-sm font-medium text-zinc-950 dark:text-white hover:bg-zinc-950/5 dark:hover:bg-white/10 disabled:opacity-50"
const dangerBtn = "rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"

const PLANS = ['free', 'solo', 'pro'] as const

type Props = {
  userId: string
  currentPlan: string
  isLocked: boolean
}

export function UserActions({ userId, currentPlan, isLocked }: Props) {
  const router = useRouter()
  const [plan, setPlan] = useState(currentPlan)
  const [locked, setLocked] = useState(isLocked)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  async function handlePlanChange(newPlan: string) {
    setLoading('plan')
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: newPlan }),
    })
    if (res.ok) {
      setPlan(newPlan)
      router.refresh()
    }
    setLoading(null)
  }

  async function handlePasswordReset() {
    setLoading('reset')
    await fetch(`/api/admin/users/${userId}/reset-password`, { method: 'POST' })
    setLoading(null)
    alert('Passwort-Reset E-Mail gesendet.')
  }

  async function handleToggleLock() {
    setLoading('lock')
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ locked: !locked }),
    })
    if (res.ok) {
      setLocked(!locked)
      router.refresh()
    }
    setLoading(null)
  }

  async function handleImpersonate() {
    setLoading('imp')
    const res = await fetch(`/api/admin/users/${userId}/impersonate`, { method: 'POST' })
    if (res.ok) window.location.href = '/dashboard'
    setLoading(null)
  }

  async function handleDelete() {
    setLoading('delete')
    const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
    if (res.ok) window.location.href = '/admin/users'
    setLoading(null)
    setShowDeleteDialog(false)
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mt-6">
        <select
          value={plan}
          disabled={loading === 'plan'}
          onChange={(e) => handlePlanChange(e.target.value)}
          className="rounded-lg border border-zinc-300 dark:border-zinc-600 px-3 py-1.5 text-sm font-medium text-zinc-950 dark:text-white dark:bg-zinc-800 focus:outline-none"
        >
          {PLANS.map((p) => (
            <option key={p} value={p}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>

        <button className={outlineBtn} onClick={handlePasswordReset} disabled={!!loading}>
          {loading === 'reset' ? '…' : 'Passwort zurücksetzen'}
        </button>

        <button className={outlineBtn} onClick={handleToggleLock} disabled={!!loading}>
          {loading === 'lock' ? '…' : locked ? 'Entsperren' : 'Sperren'}
        </button>

        <button className={outlineBtn} onClick={handleImpersonate} disabled={!!loading}>
          {loading === 'imp' ? '…' : 'Login as'}
        </button>
      </div>

      <div className="mt-2">
        <button className={dangerBtn} onClick={() => setShowDeleteDialog(true)} disabled={!!loading}>
          Benutzer löschen
        </button>
      </div>

      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Benutzer löschen</DialogTitle>
        <DialogBody>
          <p className="text-sm text-zinc-600">
            Dieser Vorgang ist unwiderruflich. Alle Daten des Benutzers werden gelöscht.
          </p>
        </DialogBody>
        <DialogActions>
          <button className={outlineBtn} onClick={() => setShowDeleteDialog(false)}>
            Abbrechen
          </button>
          <button
            onClick={handleDelete}
            disabled={loading === 'delete'}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
          >
            {loading === 'delete' ? '…' : 'Endgültig löschen'}
          </button>
        </DialogActions>
      </Dialog>
    </>
  )
}
