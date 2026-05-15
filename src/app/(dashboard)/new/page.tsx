'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Mic, Database, FileText, LayoutTemplate, MoreHorizontal, Upload, X } from 'lucide-react'

const ACCEPTED_TYPES = '.mp3,.mp4,.m4a,.wav,.webm'
const ACCEPTED_MIME = ['audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/webm', 'audio/x-m4a', 'video/mp4', 'video/webm']

export default function NewPage() {
  const router = useRouter()
  const titleRef = useRef<HTMLHeadingElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    if (!file) return
    if (!ACCEPTED_MIME.includes(file.type)) {
      setUploadError('Unsupported file type. Use MP3, MP4, M4A, WAV, or WebM.')
      return
    }
    setUploadError('')
    setSelectedFile(file)
  }

  async function handleUpload() {
    if (!selectedFile) return
    setUploading(true)
    setUploadError('')

    const form = new FormData()
    form.append('file', selectedFile)
    form.append('title', selectedFile.name.replace(/\.[^.]+$/, ''))

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) {
        setUploadError(data.error ?? 'Upload failed')
        setUploading(false)
        return
      }
      router.push(`/processing?meetingId=${data.meetingId}`)
    } catch {
      setUploadError('Upload failed. Please try again.')
      setUploading(false)
    }
  }

  function clearFile() {
    setSelectedFile(null)
    setUploadError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const QUICK_ACTIONS = [
    { label: 'AI Meeting Notes', icon: <Mic size={14} /> },
    {
      label: 'Upload Recording',
      icon: <Upload size={14} />,
      onClick: () => fileInputRef.current?.click(),
    },
    { label: 'Database', icon: <Database size={14} /> },
    { label: 'Document', icon: <FileText size={14} /> },
    { label: 'Templates', icon: <LayoutTemplate size={14} /> },
    { label: 'More', icon: <MoreHorizontal size={14} /> },
  ]

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
          style={{
            maxWidth: '100%',
            width: '100%',
            whiteSpace: 'break-spaces',
            wordBreak: 'break-word',
            caretColor: 'var(--color-text-primary)',
            padding: '0 8px',
            fontSize: '1em',
            fontWeight: 'inherit',
            margin: 0,
            cursor: 'text',
            minHeight: '1em',
            color: 'var(--color-text-primary)',
            outline: 'none',
          }}
        >
          New page
        </h1>
      </div>

      {/* File upload panel */}
      {selectedFile && (
        <div
          className="mx-8 mb-4 px-4 py-3 rounded-xl flex items-center gap-3"
          style={{
            background: 'var(--color-bg-element)',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--color-border-primary)',
          }}
        >
          <Upload size={14} style={{ color: 'var(--color-icon-secondary)', flexShrink: 0 }} />
          <span
            className="text-xs font-medium flex-1 truncate"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {selectedFile.name}
          </span>
          <button
            onClick={clearFile}
            className="p-0.5 rounded"
            style={{ color: 'var(--color-icon-tertiary)' }}
          >
            <X size={13} />
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-3 py-1 rounded-md text-xs font-medium disabled:opacity-50"
            style={{
              background: 'var(--color-ui-blue-600)',
              color: '#fff',
            }}
          >
            {uploading ? 'Uploading…' : 'Transcribe'}
          </button>
        </div>
      )}

      {uploadError && (
        <p
          className="mx-8 mb-3 text-xs text-center"
          style={{ color: 'var(--color-red-500)' }}
        >
          {uploadError}
        </p>
      )}

      <div className="pb-8 flex flex-col items-center gap-3">
        <span
          className="text-xs font-medium"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          Get started with
        </span>
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {QUICK_ACTIONS.map(({ label, icon, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium"
              style={{ color: 'var(--color-text-secondary)', background: 'transparent' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-state-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              onMouseDown={e => (e.currentTarget.style.background = 'var(--color-state-pressed)')}
              onMouseUp={e => (e.currentTarget.style.background = 'var(--color-state-hover)')}
            >
              <span style={{ color: 'var(--color-icon-secondary)' }}>{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
