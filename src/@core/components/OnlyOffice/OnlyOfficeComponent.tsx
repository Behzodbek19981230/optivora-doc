'use client'

import React, { useEffect, useRef } from 'react'
import type { FC } from 'react'

interface Props {
  fileId: string
  onlyOfficeConfig: any
  onDocumentStateChange?: () => void
}

function loadOnlyOfficeScript(baseUrl: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById('onlyoffice-api') as HTMLScriptElement | null
    if (existing) {
      if ((window as any).DocsAPI) return resolve()
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Failed to load OnlyOffice script')))
      return
    }
    const s = document.createElement('script')
    s.id = 'onlyoffice-api'
    s.src = `${baseUrl}/web-apps/apps/api/documents/api.js`
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load OnlyOffice script'))
    document.body.appendChild(s)
  })
}

export const OnlyOfficeComponent: FC<Props> = React.memo(({ onlyOfficeConfig, fileId }) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const editorRef = useRef<any>(null)
  const dsUrl =
    process.env.NEXT_PUBLIC_ONLYOFFICE_URL || process.env.NEXT_PUBLIC_ONLY_OFFICE_URL || 'http://localhost:8082'

  useEffect(() => {
    const init = async () => {
      await loadOnlyOfficeScript(dsUrl)
      const DocsAPI = (window as any).DocsAPI
      if (editorRef.current && editorRef.current.destroyEditor) {
        try {
          editorRef.current.destroyEditor()
        } catch {}
      }
      editorRef.current = new DocsAPI.DocEditor(containerRef.current!.id, {
        ...onlyOfficeConfig,
        width: '100%',
        height: '100%'
      })
    }
    init()
    return () => {
      if (editorRef.current && editorRef.current.destroyEditor) {
        try {
          editorRef.current.destroyEditor()
        } catch {}
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId])

  return <div ref={containerRef} id={`onlyoffice-editor-${fileId}`} style={{ height: '84dvh', width: '100%' }} />
})
