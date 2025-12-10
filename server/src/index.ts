import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { deleteDocument, getDocument, listDocuments, saveDocument, updateDocument } from './storage.js'
import { buildOnlyOfficeConfig } from './onlyoffice.js'

const app = express()
const port = process.env.PORT ? Number(process.env.PORT) : 4000
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000'

app.use(cors({ origin: clientOrigin }))
app.use(express.json())

const upload = multer({ storage: multer.memoryStorage() })

// Health
app.get('/health', (_, res) => res.json({ ok: true }))

// List documents
app.get('/documents', (req, res) => {
  res.json(listDocuments())
})

// Get file bytes
app.get('/documents/file/:id', (req, res) => {
  const id = req.params.id
  const doc = getDocument(id)
  if (!doc) return res.status(404).json({ error: 'Not found' })
  const mime = getMimeByExt(doc.meta.ext)
  res.setHeader('Content-Type', mime)
  res.setHeader('Content-Disposition', `inline; filename="${doc.meta.name}${doc.meta.ext}"`)
  res.send(doc.buffer)
})

// Upload new document
app.post('/documents/upload', upload.single('file'), (req, res) => {
  const file = req.file
  if (!file) return res.status(400).json({ error: 'Missing file' })
  const original = file.originalname
  const ext = path.extname(original) || '.docx'
  const base = path.basename(original, ext)
  const meta = saveDocument(base, ext, file.buffer)
  res.json(meta)
})

// Create empty document (from JSON body)
app.post('/documents/create', (req, res) => {
  const { name, ext, contentBase64 } = req.body || {}
  if (!name || !ext) return res.status(400).json({ error: 'name and ext required' })
  const buffer = contentBase64 ? Buffer.from(contentBase64, 'base64') : Buffer.from('')
  const meta = saveDocument(name, ext.startsWith('.') ? ext : `.${ext}`, buffer)
  res.json(meta)
})

// Read one doc meta
app.get('/documents/:id', (req, res) => {
  const doc = getDocument(req.params.id)
  if (!doc) return res.status(404).json({ error: 'Not found' })
  res.json(doc.meta)
})

// Update file content
app.put('/documents/:id', upload.single('file'), (req, res) => {
  const file = req.file
  if (!file) return res.status(400).json({ error: 'Missing file' })
  const meta = updateDocument(req.params.id, file.buffer)
  if (!meta) return res.status(404).json({ error: 'Not found' })
  res.json(meta)
})

// Delete
app.delete('/documents/:id', (req, res) => {
  const ok = deleteDocument(req.params.id)
  if (!ok) return res.status(404).json({ error: 'Not found' })
  res.json({ ok })
})

// OnlyOffice editor config
app.post('/documents/onlyoffice-config/:id', (req, res) => {
  const doc = getDocument(req.params.id)
  if (!doc) return res.status(404).json({ error: 'Not found' })
  const baseUrl = process.env.APP_URL || `http://localhost:${port}`
  const config = buildOnlyOfficeConfig({
    id: doc.meta.id,
    name: doc.meta.name,
    ext: doc.meta.ext,
    user: { id: 'user-1', name: 'Local User' },
    baseUrl
  })
  res.json(config)
})

// OnlyOffice callback to save changes
// See: https://api.onlyoffice.com/editors/callback
app.post('/documents/callback/:id', express.json(), (req, res) => {
  const status = req.body?.status
  const id = req.params.id
  // When status=2 (ready for saving) or 3 (saving), OnlyOffice provides a URL in body.url
  if (status === 2 || status === 3) {
    const url: string | undefined = req.body?.url
    if (!url) return res.json({ error: 'Missing url' })
    fetch(url)
      .then(async resp => {
        const arrBuf = await resp.arrayBuffer()
        const buf = Buffer.from(arrBuf)
        const meta = updateDocument(id, buf)
        if (!meta) return res.json({ error: 'Not found' })
        res.json({ error: 0 })
      })
      .catch(() => res.json({ error: 1 }))
    return
  }
  // Other statuses: just acknowledge
  res.json({ error: 0 })
})

app.listen(port, () => {
  console.log(`Doc server listening on http://localhost:${port}`)
})

function getMimeByExt(ext: string): string {
  const e = ext.replace('.', '').toLowerCase()
  if (['doc', 'docx'].includes(e)) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  if (['xlsx', 'xls'].includes(e)) return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  if (['ppt', 'pptx'].includes(e)) return 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  if (e === 'pdf') return 'application/pdf'
  if (e === 'txt') return 'text/plain'
  return 'application/octet-stream'
}
