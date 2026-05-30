'use client'

import { useState } from 'react'
import { useRouter, usePathname } from '@/lib/navigation'

interface Tab {
  id: string
  label: string
  content: React.ReactNode
}

interface SettingsTabsProps {
  tabs: Tab[]
  defaultTab?: string
}

export function SettingsTabs({ tabs, defaultTab = 'produkt' }: SettingsTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState(defaultTab)

  const activeContent = tabs.find((t) => t.id === activeTab)?.content

  function handleTabChange(tabId: string) {
    setActiveTab(tabId)
    router.replace(`${pathname}?tab=${tabId}`, { scroll: false })
  }

  return (
    <div>
      <div
        className="flex gap-1 border-b mb-6"
        style={{ borderColor: 'var(--border-soft)' }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id ? 'border-[var(--primary)]' : 'border-transparent'
            }`}
            style={{
              color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-mid)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeContent}
    </div>
  )
}
