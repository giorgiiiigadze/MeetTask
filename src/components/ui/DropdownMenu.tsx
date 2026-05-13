'use client'

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  ReactNode,
  KeyboardEvent,
} from 'react'
import { createPortal } from 'react-dom'
import { ChevronRight } from 'lucide-react'

type Align = 'start' | 'center' | 'end'
type Side  = 'top' | 'bottom'

interface DropdownContextValue {
  open: boolean
  setOpen: (v: boolean) => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
}

const DropdownContext = createContext<DropdownContextValue | null>(null)

const useDropdown = () => {
  const ctx = useContext(DropdownContext)
  if (!ctx) throw new Error('Must be used within <DropdownMenu>')
  return ctx
}

interface DropdownMenuProps {
  children: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export const DropdownMenu = ({ children, open: controlledOpen, onOpenChange }: DropdownMenuProps) => {
  const [internalOpen, setInternalOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen

  const setOpen = useCallback((v: boolean) => {
    if (!isControlled) setInternalOpen(v)
    onOpenChange?.(v)
  }, [isControlled, onOpenChange])

  return (
    <DropdownContext.Provider value={{ open, setOpen, triggerRef }}>
      <div className="relative inline-block">
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

interface DropdownMenuTriggerProps {
  children: ReactNode
  className?: string
}

export const DropdownMenuTrigger = ({ children, className = '' }: DropdownMenuTriggerProps) => {
  const { open, setOpen, triggerRef } = useDropdown()

  return (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      className={`cursor-pointer bg-transparent border-none p-0 m-0 w-full ${className}`}
    >
      {children}
    </button>
  )
}

interface DropdownMenuContentProps {
  children: ReactNode
  align?: Align
  side?: Side
  sideOffset?: number
  className?: string
  minWidth?: number
}

export const DropdownMenuContent = ({
  children,
  align = 'start',
  side = 'bottom',
  sideOffset = 6,
  className = '',
  minWidth = 180,
}: DropdownMenuContentProps) => {
  const { open, setOpen, triggerRef } = useDropdown()
  const contentRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  const calcPosition = useCallback(() => {
    const trigger = triggerRef.current
    const content = contentRef.current
    if (!trigger) return

    const tr = trigger.getBoundingClientRect()
    const cw = content?.offsetWidth  || minWidth
    const ch = content?.offsetHeight || 0

    let top = side === 'bottom'
      ? tr.bottom + sideOffset + window.scrollY
      : tr.top - ch - sideOffset + window.scrollY

    let left = window.scrollX + (
      align === 'start'  ? tr.left :
      align === 'end'    ? tr.right - cw :
      tr.left + tr.width / 2 - cw / 2
    )

    const vw = window.innerWidth
    if (left + cw > vw - 8) left = vw - cw - 8
    if (left < 8) left = 8

    setCoords({ top, left })
  }, [align, side, sideOffset, minWidth, triggerRef])

  useEffect(() => {
    if (open) {
      setMounted(true)
      requestAnimationFrame(() => {
        calcPosition()
        requestAnimationFrame(() => setVisible(true))
      })
    } else {
      setVisible(false)
      const t = setTimeout(() => setMounted(false), 150)
      return () => clearTimeout(t)
    }
  }, [open, calcPosition])

  useEffect(() => {
    if (!open) return
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); setOpen(false) }
    }
    const onPointer = (e: PointerEvent) => {
      if (
        !contentRef.current?.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open, setOpen, triggerRef])

  if (!mounted) return null

  return createPortal(
    <div
      ref={contentRef}
      role="menu"
      aria-orientation="vertical"
      onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'Tab') setOpen(false)
      }}
      style={{
        position: 'absolute',
        top: coords.top,
        left: coords.left,
        minWidth,
        zIndex: 9999,
        transformOrigin: side === 'bottom' ? 'top' : 'bottom',
        transform: visible ? 'scale(1)' : 'scale(0.96)',
        opacity: visible ? 1 : 0,
        transition: 'transform 120ms cubic-bezier(0.16,1,0.3,1), opacity 120ms ease',
      }}
      className={`
        rounded-lg py-1
        bg-[var(--color-popup-bg)]
        shadow-[var(--shadow-popup)]
        outline-none
        ${className}
      `}
    >
      {children}
    </div>,
    document.body
  )
}

interface DropdownMenuItemProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'default' | 'danger'
  icon?: ReactNode
  shortcut?: string
  hasSubmenu?: boolean
  className?: string
}

export const DropdownMenuItem = ({
  children,
  onClick,
  disabled = false,
  variant = 'default',
  icon,
  shortcut,
  hasSubmenu = false,
  className = '',
}: DropdownMenuItemProps) => {
  const { setOpen } = useDropdown()

  const handleClick = () => {
    if (disabled) return
    onClick?.()
    if (!hasSubmenu) setOpen(false)
  }

  const colorClass = variant === 'danger'
    ? 'text-[var(--color-red-600)] hover:bg-[var(--color-red-50)] hover:text-[var(--color-red-600)]'
    : 'text-[var(--color-text-primary)] hover:bg-[var(--color-state-hover)]'

  return (
    <button
      role="menuitem"
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={`
        w-full flex items-center gap-2.5
        px-2.5 py-[5px] mx-1
        text-[14px] text-left rounded-md
        transition-colors duration-75
        cursor-pointer select-none
        disabled:opacity-40 disabled:cursor-not-allowed
        capitalize
        ${colorClass}
        ${className}
      `}
      style={{ width: 'calc(100% - 8px)' }}
    >
      {icon && (
        <span className="shrink-0 w-4 h-4 flex items-center justify-center text-[var(--color-text-secondary)]">
          {icon}
        </span>
      )}
      <span className="flex-1 truncate">{children}</span>
      {shortcut && !hasSubmenu && (
        <span className="ml-auto pl-4 text-xs text-[var(--color-text-tertiary)] font-normal shrink-0">
          {shortcut}
        </span>
      )}
      {hasSubmenu && (
        <ChevronRight className="ml-auto w-3.5 h-3.5 text-[var(--color-text-tertiary)] shrink-0" />
      )}
    </button>
  )
}

export const DropdownMenuSeparator = ({ className = '' }: { className?: string }) => (
  <div
    role="separator"
    className={`my-1 h-px bg-[var(--color-border-primary)] ${className}`}
  />
)

export const DropdownMenuLabel = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div
    className={`
      px-2.5 py-1
      text-[11px] font-semibold uppercase tracking-wider
      text-[var(--color-text-tertiary)]
      select-none
      ${className}
    `}
  >
    {children}
  </div>
)

export const DropdownMenuEmailHeader = ({ email, className = '' }: { email: string; className?: string }) => (
  <div className={`px-3 py-2 ${className}`}>
    <p className="text-xs text-[var(--color-text-tertiary)] truncate select-none">
      {email}
    </p>
  </div>
)