'use client'

import { useState } from 'react'
import { Button } from '@/app/admin/_components/ui/button'
import { Dialog, DialogActions, DialogBody, DialogTitle } from '@/app/admin/_components/ui/dialog'

const PLANS = ['free', 'solo', 'pro'] as const

type Props = {
  userId: string
  currentPlan: string
  isLocked: boolean
}

export function UserActions({ userId, currentPlan, isLocked }: Props) {
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
    if (res.ok) setPlan(newPlan)
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
    if (res.ok) setLocked(!locked)
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
      <div className="flex flex-wrap gap-2 mt-6 items-center">
        <select
          value={plan}
          disabled={loading === 'plan'}
          onChange={(e) => handlePlanChange(e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-950 focus:outline-none"
        >
          {PLANS.map((p) => (
            <option key={p} value={p}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </option>
          ))}
        </select>

        <Button outline onClick={handlePasswordReset} disabled={!!loading}>
          {loading === 'reset' ? '…' : 'Passwort zurücksetzen'}
        </Button>

        <Button outline onClick={handleToggleLock} disabled={!!loading}>
          {loading === 'lock' ? '…' : locked ? 'Entsperren' : 'Sperren'}
        </Button>

        <Button outline onClick={handleImpersonate} disabled={!!loading}>
          {loading === 'imp' ? '…' : 'Login as'}
        </Button>

        <Button color="red" onClick={() => setShowDeleteDialog(true)} disabled={!!loading}>
          Löschen
        </Button>
      </div>

      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)}>
        <DialogTitle>Benutzer löschen</DialogTitle>
        <DialogBody>
          <p className="text-sm text-zinc-600">
            Dieser Vorgang ist unwiderruflich. Alle Daten des Benutzers werden gelöscht.
          </p>
        </DialogBody>
        <DialogActions>
          <Button outline onClick={() => setShowDeleteDialog(false)}>
            Abbrechen
          </Button>
          <Button color="red" onClick={handleDelete} disabled={loading === 'delete'}>
            {loading === 'delete' ? '…' : 'Endgültig löschen'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
