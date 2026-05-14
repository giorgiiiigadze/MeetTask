"use client"

import { useRef } from "react"
import { Sparkles, Mic, Database, FileText, LayoutTemplate, MoreHorizontal } from "lucide-react"

const QUICK_ACTIONS = [
    { label: "AI Meeting Notes", icon: <Mic size={14} /> },
    { label: "Database", icon: <Database size={14} /> },
    { label: "Document", icon: <FileText size={14} /> },
    { label: "Templates", icon: <LayoutTemplate size={14} /> },
    { label: "More", icon: <MoreHorizontal size={14} /> },
]

export default function NewPage() {
    const titleRef = useRef<HTMLHeadingElement>(null)

    return (
        <div className="relative flex flex-col h-full max-w-3xl mx-auto">
            <div
                className="flex-1 flex items-center justify-center px-8"
                onClick={() => titleRef.current?.focus()}
            >
                <h1
                    ref={titleRef}
                    contentEditable
                    suppressContentEditableWarning
                    spellCheck
                    role="textbox"
                    aria-multiline="true"
                    aria-roledescription="page title"
                    data-placeholder="New page"
                    style={{
                        maxWidth: "100%",
                        width: "100%",
                        whiteSpace: "break-spaces",
                        wordBreak: "break-word",
                        caretColor: "var(--color-text-primary)",
                        padding: "0 8px",
                        fontSize: "1em",
                        fontWeight: "inherit",
                        margin: 0,
                        cursor: "text",
                        minHeight: "1em",
                        color: "var(--color-text-primary)",
                        outline: "none",
                    }}
                >
                    Hello
                </h1>
            </div>

            <div className="pb-8 flex flex-col items-center gap-3">
                <span
                    className="text-xs font-medium"
                    style={{ color: "var(--color-text-tertiary)" }}
                >
                    Get started with
                </span>
                <div className="flex items-center gap-1.5 flex-wrap justify-center">

                    {QUICK_ACTIONS.map(({ label, icon }) => (
                        <button
                            key={label}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium"
                            style={{ color: "var(--color-text-secondary)", background: "transparent" }}
                            onMouseEnter={e => (e.currentTarget.style.background = "var(--color-state-hover)")}
                            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                            onMouseDown={e => (e.currentTarget.style.background = "var(--color-state-pressed)")}
                            onMouseUp={e => (e.currentTarget.style.background = "var(--color-state-hover)")}
                        >
                            <span style={{ color: "var(--color-icon-secondary)" }}>{icon}</span>
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}