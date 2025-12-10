'use client'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type DocumentMeta = {
  id: string
  name: string
  ext: string
  size: number
  createdAt: number
  updatedAt: number
}

const DOC_SERVER = process.env.NEXT_PUBLIC_DOC_SERVER || 'http://localhost:4000'
const ONLYOFFICE_URL = process.env.NEXT_PUBLIC_ONLYOFFICE_URL || 'http://localhost:8082'

function loadOnlyOfficeScript(): Promise<void> {
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
    s.src = `${ONLYOFFICE_URL}/web-apps/apps/api/documents/api.js`
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load OnlyOffice script'))
    document.body.appendChild(s)
  })
}

export default function OnlyOfficePage() {
  const [docs, setDocs] = useState<DocumentMeta[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const editorRef = useRef<any>(null)

  const baseUrl = useMemo(() => DOC_SERVER, [])

  useEffect(() => {
    // Load documents list
    fetch(`${baseUrl}/documents`)
      .then(async r => {
        const data = await r.json()
        setDocs(data || [])
        if (!selectedId && Array.isArray(data) && data.length > 0) {
          setSelectedId(data[0].id)
        }
      })
      .catch(() => setDocs([]))
  }, [baseUrl])

  const ensureDefaultDoc = useCallback(async () => {
    try {
      const existing = docs.find(
        d => `${d.name}${d.ext}`.toLowerCase() === 'test.docx' || `${d.name}${d.ext}`.toLowerCase() === 'test.docs'
      )
      if (existing) {
        setSelectedId(existing.id)
        return existing
      }
      const res = await fetch(`${baseUrl}/documents/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'test', ext: '.docx', contentBase64: '' })
      })
      const created = await res.json()
      const listRes = await fetch(`${baseUrl}/documents`)
      const data = await listRes.json()
      setDocs(data || [])
      setSelectedId(created.id)
      return created
    } catch (e) {
      console.error('Failed to create default doc', e)
      alert('Default document could not be created. Ensure the backend is running on port 4000.')
    }
  }, [baseUrl, docs])

  const openEditor = useCallback(async () => {
    if (!selectedId) {
      const created = await ensureDefaultDoc()
      if (!created) return
    }
    setLoading(true)
    try {
      await loadOnlyOfficeScript()
      const idToOpen = selectedId || docs.find(d => `${d.name}${d.ext}`.toLowerCase().startsWith('test.'))?.id
      const res = await fetch(`${baseUrl}/documents/onlyoffice-config/${encodeURIComponent(idToOpen as string)}`, {
        method: 'POST'
      })
      const config = await res.json()
      // OnlyOffice DocsAPI available globally
      const DocsAPI = (window as any).DocsAPI
      const containerId = 'onlyoffice-editor-container'
      // Destroy previous instance if any
      if (editorRef.current && editorRef.current.destroyEditor) {
        try {
          editorRef.current.destroyEditor()
        } catch {}
      }
      editorRef.current = new DocsAPI.DocEditor(containerId, {
        ...config,
        width: '100%',
        height: '800px'
      })
    } catch (e) {
      console.error(e)
      alert('Failed to open OnlyOffice editor. Check server and OnlyOffice containers.')
    } finally {
      setLoading(false)
    }
  }, [baseUrl, selectedId, docs, ensureDefaultDoc])

  return (
    <div style={{ padding: 16 }}>
      <h2>OnlyOffice Word Editor</h2>
      <p>
        Backend: <code>{DOC_SERVER}</code> · DocumentServer: <code>{ONLYOFFICE_URL}</code>
      </p>

      <div style={{ marginBottom: 12 }}>
        <label htmlFor='docSelect'>Select document:</label>{' '}
        <select id='docSelect' value={selectedId ?? ''} onChange={e => setSelectedId(e.target.value)}>
          {docs.length === 0 && <option value=''>No documents found (upload one via API)</option>}
          {docs.map(d => (
            <option key={d.id} value={d.id}>{`${d.name}${d.ext}`}</option>
          ))}
        </select>
        <button style={{ marginLeft: 8 }} onClick={openEditor} disabled={!selectedId || loading}>
          {loading ? 'Opening…' : 'Open in OnlyOffice'}
        </button>
      </div>

      <div id='onlyoffice-editor-container' style={{ border: '1px solid #ddd', borderRadius: 8, overflow: 'hidden' }} />
    </div>
  )
}
