'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuEmailHeader,
} from "../../ui/DropdownMenu"
import {
  Globe,
  HelpCircle,
  Zap,
  Download,
  Info,
  LogOut,
  ChevronsUpDown,
  RefreshCw,
  Unplug,
  PlugZap,
} from "lucide-react"
import { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/client"

import { SiNotion } from "react-icons/si"

import { ConfirmDialog } from "../../ui/ConfrimDialog"

import { formatLastSynced } from "@/src/lib/format"
import { ConnectionBadge } from "../../ui/ConnectionBadge"

interface NotionConnection {
  connected: boolean
  workspaceName?: string
  workspaceIcon?: string
  lastSynced?: Date
}

interface SidebarHeaderProps {
  user?: User
  loading?: boolean
  notion?: NotionConnection
  onDisconnectNotion?: () => void
}

function SidebarHeaderSkeleton() {
  return (
    <div className="px-1 py-1 w-full flex items-center justify-start gap-0.5">
      <div className="flex items-center gap-1.5 px-1.5 py-1 rounded-md flex-1 min-w-0">
        <div className="h-6 w-6 rounded shrink-0 bg-[var(--color-tgray-100)] animate-pulse" />
        <div className="h-3 w-24 rounded bg-[var(--color-tgray-100)] animate-pulse" />
        <div className="ml-auto h-4 w-4 rounded bg-[var(--color-tgray-100)] animate-pulse shrink-0" />
      </div>
    </div>
  )
}

function NotionSection({ notion }: { notion: NotionConnection }) {
  return (
    <div className="px-2.5 py-2 mx-1 rounded-md bg-[var(--color-tgray-50)]" style={{ width: 'calc(100% - 8px)' }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 rounded bg-[var(--color-tgray-200)] flex items-center justify-center shrink-0">
          <SiNotion className="w-3 h-3 text-[var(--color-text-primary)]" />
        </div>
        <span className="text-[11px] font-semibold tracking-wider text-[var(--color-text-tertiary)] flex-1">
          Notion
        </span>
        
        <ConnectionBadge connected={notion.connected} />
      </div>

      {notion.connected && notion.workspaceName && (
        <div className="flex items-center gap-1.5 mb-1.5">
          {notion.workspaceIcon
            ? <img src={notion.workspaceIcon} className="w-3.5 h-3.5 rounded shrink-0" alt="" />
            : <div className="w-3.5 h-3.5 rounded bg-[var(--color-tgray-300)] shrink-0 flex items-center justify-center text-[8px] font-bold text-[var(--color-text-secondary)]">
                {notion.workspaceName[0].toUpperCase()}
              </div>
          }
          <span className="text-[12px] text-[var(--color-text-primary)] font-medium truncate">
            {notion.workspaceName}
          </span>
        </div>
      )}

      {notion.connected && notion.lastSynced && (
        <div className="flex items-center gap-1 text-[10px] text-[var(--color-text-tertiary)]">
          <RefreshCw className="w-2.5 h-2.5 shrink-0" />
          Synced {formatLastSynced(notion.lastSynced)}
        </div>
      )}
    </div>
  )
}

export default function SidebarHeader({ user, loading, notion, onDisconnectNotion }: SidebarHeaderProps) {
  const [showNotionConfirm, setShowNotionConfirm] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (loading || !user) return <SidebarHeaderSkeleton />

  const name = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User"
  const email = user.email ?? ""
  const avatar = user.user_metadata?.avatar_url as string | undefined
  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <>
      <div className="px-1 py-1 w-full flex items-center justify-start gap-0.5">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex-1 min-w-0">
            <div className="
              flex items-center gap-1.5 px-1.5 py-1 rounded-md
              hover:bg-[var(--color-state-hover)]
              transition-colors duration-100
              cursor-pointer
            ">
              <Avatar className="h-6 w-6 rounded-full shrink-0">
                {avatar && <AvatarImage src={avatar} alt={name} />}
                <AvatarFallback className="text-[10px] font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-[14px] font-medium text-[var(--color-text-primary)] truncate">
                {name}
              </span>
              <ChevronsUpDown className="ml-auto shrink-0 w-3.5 h-3.5 text-[var(--color-text-tertiary)]" />
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" minWidth={240}>

            {email && <DropdownMenuEmailHeader email={email} />}

            <DropdownMenuSeparator />

            <DropdownMenuItem icon={<Globe className="w-4 h-4" />} hasSubmenu>
              Language
            </DropdownMenuItem>
            <DropdownMenuItem icon={<HelpCircle className="w-4 h-4" />}>
              Get help
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem icon={<Zap className="w-4 h-4" />}>
              Upgrade plan
            </DropdownMenuItem>
            <DropdownMenuItem icon={<Download className="w-4 h-4" />}>
              Get apps and extensions
            </DropdownMenuItem>
            <DropdownMenuItem icon={<Info className="w-4 h-4" />} hasSubmenu>
              Learn more
            </DropdownMenuItem>

            {notion && (
              <>
                <DropdownMenuSeparator />
                <div className="py-1">
                  <NotionSection notion={notion} />
                </div>
                {/* {notion.connected ? (
                  <DropdownMenuItem
                    icon={<Unplug className="w-4 h-4" />}
                    variant="danger"
                    onClick={() => setShowNotionConfirm(true)}
                  >
                    Disconnect Notion
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem icon={<PlugZap className="w-4 h-4" />}>
                    Connect Notion
                  </DropdownMenuItem>
                )} */}
              </>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              icon={<LogOut className="w-4 h-4" />}
              variant="danger"
              onClick={() => setShowLogoutConfirm(true)}
            >
              Log out
            </DropdownMenuItem>

          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ConfirmDialog
        open={showNotionConfirm}
        title="Disconnect Notion?"
        description="This will remove access to your Notion workspace. You can reconnect at any time."
        confirmLabel="Disconnect"
        variant="danger"
        onConfirm={() => { setShowNotionConfirm(false); onDisconnectNotion?.() }}
        onCancel={() => setShowNotionConfirm(false)}
      />

      <ConfirmDialog
        open={showLogoutConfirm}
        title="Log out?"
        description="You will be signed out of your account and redirected to the login page."
        confirmLabel="Log out"
        variant="danger"
        onConfirm={() => { setShowLogoutConfirm(false); handleLogout() }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  )
}