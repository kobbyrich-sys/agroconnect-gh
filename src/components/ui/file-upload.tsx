import { useState, useRef } from 'react'

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>
  accept?: string
  multiple?: boolean
  disabled?: boolean
  label?: string
}

export function FileUpload({ onUpload, accept = 'image/*', multiple = false, disabled = false, label = 'Upload' }: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)
    for (const file of files) {
      await onUpload(file)
    }
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} onChange={handleChange} className="hidden" disabled={disabled || uploading} />
      <button type="button" onClick={() => inputRef.current?.click()} disabled={disabled || uploading} className="inline-flex items-center gap-2 rounded-lg border border-earth-300 px-4 py-2 text-sm font-medium text-earth-700 hover:bg-earth-50 disabled:opacity-50">
        {uploading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-earth-300 border-t-agro-600" />
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" /></svg>
        )}
        {uploading ? 'Uploading...' : label}
      </button>
    </div>
  )
}
