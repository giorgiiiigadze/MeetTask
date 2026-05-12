import { cn } from "@/lib/utils"

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: "none" | "sm" | "md" | "lg"
  hover?: boolean
  onClick?: () => void
}

const paddingStyles = {
  none: "",
  sm:   "p-3",
  md:   "p-4",
  lg:   "p-6",
}

export function Card({ children, className, padding = "md", hover = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-element)]",
        paddingStyles[padding],
        hover && "transition-colors duration-100 cursor-pointer hover:bg-[var(--color-card-hover-bg)]",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
  border?: boolean
}

export function CardHeader({ children, className, border = false }: CardHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between",
        border && "pb-3 mb-3 border-b border-[var(--color-border-primary)]",
        className
      )}
    >
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: React.ReactNode
  className?: string
  description?: string
}

export function CardTitle({ children, className, description }: CardTitleProps) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <h3 className="text-sm font-medium text-[var(--color-text-primary)] leading-snug">
        {children}
      </h3>
      {description && (
        <p className="text-xs text-[var(--color-text-tertiary)]">{description}</p>
      )}
    </div>
  )
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn("text-sm text-[var(--color-text-secondary)]", className)}>
      {children}
    </div>
  )
}

interface CardFooterProps {
  children: React.ReactNode
  className?: string
  border?: boolean
}

export function CardFooter({ children, className, border = false }: CardFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center",
        border && "pt-3 mt-3 border-t border-[var(--color-border-primary)]",
        className
      )}
    >
      {children}
    </div>
  )
}