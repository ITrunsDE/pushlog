import { UsersIcon } from '@heroicons/react/20/solid'
import { ArrowLeftIcon } from '@heroicons/react/20/solid'
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
} from './ui/sidebar'

export function AdminSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-2 py-3">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Pushlog Admin
          </p>
        </div>
      </SidebarHeader>
      <SidebarBody>
        <SidebarSection>
          <SidebarItem href="/admin/users">
            <UsersIcon className="size-5 shrink-0 fill-zinc-500" data-slot="icon" />
            <SidebarLabel>Benutzer</SidebarLabel>
          </SidebarItem>
        </SidebarSection>
      </SidebarBody>
      <SidebarFooter>
        <SidebarItem href="/dashboard">
          <ArrowLeftIcon className="size-5 shrink-0 fill-zinc-500" data-slot="icon" />
          <SidebarLabel>Dashboard</SidebarLabel>
        </SidebarItem>
      </SidebarFooter>
    </Sidebar>
  )
}
