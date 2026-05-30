export function planBadgeClass(plan: string): string {
  switch (plan) {
    case 'pro':  return 'bg-green-100 text-green-700'
    case 'solo': return 'bg-amber-100 text-amber-700'
    default:     return 'bg-zinc-100 text-zinc-700'
  }
}

export function categoryBadgeClass(category: string): string {
  switch (category) {
    case 'feature':     return 'bg-blue-100 text-blue-700'
    case 'fix':         return 'bg-red-100 text-red-700'
    case 'improvement': return 'bg-amber-100 text-amber-700'
    case 'security':    return 'bg-green-100 text-green-700'
    case 'performance': return 'bg-purple-100 text-purple-700'
    default:            return 'bg-zinc-100 text-zinc-600'
  }
}

export function statusBadgeClass(locked: boolean): string {
  return locked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
}
