"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { Button } from "./Button"

interface ConfirmDialogProps {
    open: boolean
    title: string
    description: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: "danger" | "primary"
    onConfirm: () => void
    onCancel: () => void
}

export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    variant = "primary",
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!open || !mounted) return null

    const confirmStyles =
        variant === "danger"
            ? "bg-[var(--color-red-50)] text-[var(--color-red-600)] hover:bg-[var(--color-red-500)] hover:text-white"
            : "bg-[var(--color-tgray-100)] text-[var(--color-text-primary)] hover:bg-[var(--color-tgray-200)]"

    return createPortal(
        <div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-[var(--color-overlay)]"
            onClick={onCancel}
        >
            <div
                className="bg-[var(--color-popup-bg)] rounded-lg border-[0.5px] border-[var(--color-border-primary)] shadow-[var(--shadow-popup)] p-5 w-full max-w-[360px] mx-4"
                onClick={e => e.stopPropagation()}
            >
                <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">{title}</p>
                <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed mb-5">
                    {description}
                </p>

                <div className="flex gap-2 justify-end">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={onCancel}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={variant === "danger" ? "danger" : "secondary"}
                        size="sm"
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </Button>
                </div>

            </div>
        </div>,
        document.body
    )
}