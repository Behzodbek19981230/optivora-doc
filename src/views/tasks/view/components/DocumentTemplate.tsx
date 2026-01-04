import React, { useMemo, useRef, useState } from 'react'
import { Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { Icon } from '@iconify/react'
import { TaskPartType, TaskType } from 'src/types/task'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

export default function DocumentTemplate({
  fullTask
}: {
  fullTask: {
    parts: TaskPartType[]
    task: TaskType
  }
}) {
  const printRef = useRef<HTMLDivElement>(null)
  const isPrintingRef = useRef(false)
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  const PAGE_W = 794 // A4 @ ~96dpi
  const PAGE_H = 1123
  const DIALOG_SCALE = 0.9

  // UI thumbnail size (user requested ~350px width). Keep A4 aspect ratio.
  const THUMB_W = 350
  const THUMB_H = Math.round(THUMB_W * (PAGE_H / PAGE_W))

  const thumbScale = useMemo(() => {
    // Fit page into the thumbnail (no overflow/crop with A4 aspect ratio)
    const sw = THUMB_W / PAGE_W
    const sh = THUMB_H / PAGE_H

    return Math.min(sw, sh)
  }, [PAGE_H, PAGE_W, THUMB_H, THUMB_W])

  const translateStatus = (s?: string) => {
    if (!s) return '—'
    const toCamel = (str: string) =>
      str
        .split('_')
        .map((seg, i) => (i === 0 ? seg : seg.charAt(0).toUpperCase() + seg.slice(1)))
        .join('')

    const key = `documents.status.${toCamel(s)}`
    const translated = String(t(key))

    return translated === key ? s : translated
  }

  const formatDate = (v?: string | Date | null, withTime = false) => {
    if (!v) return '—'
    const m = moment(v)
    if (!m.isValid()) return '—'

    return m.format(withTime ? 'DD.MM.YYYY HH:mm' : 'DD.MM.YYYY')
  }

  const buildPrintCss = () => `
    @page { size: A4; margin: 12mm; }
    html, body { margin: 0; padding: 0; background: #fff; }
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; color: #111827; font: 12pt/1.45 "Times New Roman", Times, serif; }

    .print-paper{
      width:210mm; min-height:297mm; box-sizing:border-box;
      padding:14mm 12mm; margin:0 auto; background:#fff;
    }

    .doc-topline{ height: 6px; background: #0F172A; border-radius: 999px; margin-bottom: 10mm; }
    .doc-header{ display:flex; align-items:center; justify-content:space-between; gap: 12mm; }
    .doc-header-left{ display:flex; align-items:center; gap: 6mm; min-width: 50mm; }
    .doc-logo{ width: 22mm; height: 22mm; object-fit: contain; }
    .doc-company{ font-weight: 700; font-size: 18pt; text-align:center; flex:1; }
    .doc-header-right{ min-width: 50mm; text-align:right; font-size: 11pt; color: #334155; }

    .doc-subline{ border-top: 1px solid #CBD5E1; margin: 6mm 0 8mm; }

    .section-title{ font-weight: 700; font-size: 13pt; margin: 0 0 3mm; }
    .meta-grid{ display:grid; grid-template-columns: 1fr 1fr; gap: 3mm 10mm; margin-bottom: 8mm; }
    .meta-row{ display:flex; gap: 4mm; }
    .meta-label{ width: 40mm; font-weight: 700; color: #0F172A; }
    .meta-value{ flex: 1; color: #111827; }

    .note-box{ border: 1px solid #E2E8F0; border-radius: 6px; padding: 4mm; background: #F8FAFC; white-space: pre-wrap; }

    table.parts-table{ width:100%; border-collapse: collapse; margin-top: 4mm; font-size: 11pt; }
    .parts-table th, .parts-table td{ border: 1px solid #E2E8F0; padding: 3mm 2.5mm; vertical-align: top; }
    .parts-table th{ background: #F1F5F9; color:#0F172A; font-weight:700; text-align:left; }
    .parts-table td{ color:#111827; }
    .muted{ color:#64748B; }

    .doc-footer{ margin-top: 10mm; display:flex; justify-content:space-between; gap: 10mm; font-size: 10.5pt; color:#334155; }
    .no-print, [data-no-print] { display: none !important; }
  `

  const openPrintView = (autoPrint: boolean) => {
    const host = printRef.current
    if (!host) return
    if (isPrintingRef.current) return
    isPrintingRef.current = true

    const paperEl = host.querySelector('.print-paper') as HTMLElement | null
    const printContents = paperEl ? paperEl.innerHTML : host.innerHTML

    let printWindow: Window | null = null
    try {
      printWindow = window.open('', '_blank', 'height=900,width=900')
    } catch (e) {
      console.error('window.open failed', e)
    }
    if (!printWindow) {
      isPrintingRef.current = false

      return
    }

    try {
      ;(printWindow as any).opener = null
    } catch (e) {
      // ignore
    }

    const css = buildPrintCss()

    try {
      printWindow.document.open()
      printWindow.document.write(
        `<!doctype html><html><head><meta charset="utf-8"><title>${String(
          t('tasks.view.document.header.overline', { defaultValue: 'Document' })
        )}</title><style>${css}</style></head><body><div class="print-paper">${printContents}</div></body></html>`
      )
      printWindow.document.close()
    } catch (e) {
      console.error('Failed to write to print window', e)
      try {
        printWindow.close()
      } catch (er) {
        // ignore
      }
      isPrintingRef.current = false

      return
    }

    const tryPrint = () => {
      try {
        if (!printWindow || printWindow.closed) return
        printWindow.focus()
        if (autoPrint) printWindow.print()
      } catch (e) {
        console.error('Print failed', e)
      } finally {
        isPrintingRef.current = false
      }
    }

    // Give the browser time to layout & load images before printing
    setTimeout(tryPrint, 800)
  }

  const handleOpenPdfView = () => openPrintView(false)
  const handlePrint = () => openPrintView(true)

  return (
    <Card>
      <Box ref={printRef}>
        <style>{`
          /* Screen preview shell (dialog) */
          .doc-preview-shell{
            padding: 14px 10px 16px;
            background: radial-gradient(1200px 400px at 50% 0%, rgba(99,102,241,0.08), rgba(15,23,42,0) 60%),
                        linear-gradient(180deg, rgba(15,23,42,0.02), rgba(15,23,42,0.06));
            border-radius: 14px;
            overflow: auto;
          }
          .print-paper{
            box-sizing: border-box;
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 14px 32px rgba(15, 23, 42, 0.12), 0 2px 8px rgba(15, 23, 42, 0.06);
            overflow: hidden;
            border: 1px solid rgba(15, 23, 42, 0.08);
            padding: 44px 42px;
            color: #111827;
            font: 14px/1.5 "Times New Roman", Times, serif;
          }

          .doc-topline{ height: 6px; background: #0F172A; border-radius: 999px; margin-bottom: 28px; }
          .doc-header{ display:flex; align-items:center; justify-content:space-between; gap: 34px; }
          .doc-header-left{ display:flex; align-items:center; gap: 16px; min-width: 180px; }
          .doc-logo{ width: 64px; height: 64px; object-fit: contain; }
          .doc-company{ font-weight: 700; font-size: 24px; text-align:center; flex:1; }
          .doc-header-right{ min-width: 180px; text-align:right; font-size: 12px; color: #475569; }
          .doc-subline{ border-top: 1px solid rgba(148, 163, 184, 0.55); margin: 18px 0 22px; }

          .section-title{ font-weight: 700; font-size: 16px; margin: 0 0 8px; }
          .meta-grid{ display:grid; grid-template-columns: 1fr 1fr; gap: 10px 28px; margin-bottom: 18px; }
          .meta-row{ display:flex; gap: 12px; }
          .meta-label{ width: 140px; font-weight: 700; color: #0F172A; }
          .meta-value{ flex:1; color: #111827; }
          .note-box{ border: 1px solid rgba(148, 163, 184, 0.45); border-radius: 10px; padding: 12px; background: rgba(248, 250, 252, 1); white-space: pre-wrap; }

          table.parts-table{ width:100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
          .parts-table th, .parts-table td{ border: 1px solid rgba(226, 232, 240, 1); padding: 9px 8px; vertical-align: top; }
          .parts-table th{ background: rgba(241, 245, 249, 1); color:#0F172A; font-weight:700; text-align:left; }
          .parts-table td{ color:#111827; }
          .muted{ color:#64748B; }
          .doc-footer{ margin-top: 22px; display:flex; justify-content:space-between; gap: 20px; font-size: 12px; color:#475569; }

          /* Thumbnail */
          .doc-thumb{
            width:${THUMB_W}px;
            height:${THUMB_H}px;
            border-radius: 12px;
            overflow: hidden;
            cursor: pointer;
            position: relative;
            background: rgba(15,23,42,0.03);
            border: 1px solid rgba(15,23,42,0.10);
            box-shadow: 0 10px 24px rgba(15, 23, 42, 0.10), 0 1px 6px rgba(15, 23, 42, 0.06);
          }
          .doc-thumb-overlay{
            position:absolute;
            inset:auto 6px 6px 6px;
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap: 8px;
            padding: 6px 8px;
            border-radius: 10px;
            background: rgba(15, 23, 42, 0.70);
            color: #fff;
            font: 12px/1.2 Arial, Helvetica, sans-serif;
          }
          .doc-thumb-overlay span{ opacity: 0.92; }
        `}</style>

        <Box sx={{ p: 2 }}>
          {/* Small thumbnail in UI */}
          <div className='doc-thumb' onClick={() => setOpen(true)} role='button' tabIndex={0}>
            <div style={{ width: `${PAGE_W * thumbScale}px`, height: `${PAGE_H * thumbScale}px` }}>
              <div
                className='print-paper'
                style={{
                  width: `${PAGE_W}px`,
                  minHeight: `${PAGE_H}px`,
                  transform: `scale(${thumbScale})`,
                  transformOrigin: 'top left'
                }}
              >
                <div className='doc-topline' />

                <div className='doc-header'>
                  <div className='doc-header-left'>
                    <img className='doc-logo' src='/logo.svg' alt='Logo' />
                  </div>
                  <div className='doc-company'>{fullTask?.task?.company_detail?.name || '—'}</div>
                  <div className='doc-header-right'>
                    <div className='muted'>
                      {String(t('tasks.view.document.fields.inputDocNumber', { defaultValue: 'Incoming number' }))}
                    </div>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>№{fullTask?.task?.input_doc_number ?? '—'}</div>
                  </div>
                </div>

                <div className='doc-subline' />

                <div className='section-title'>
                  {String(t('tasks.view.document.sections.main', { defaultValue: 'Main information' }))}
                </div>

                <div className='meta-grid'>
                  <div className='meta-row'>
                    <div className='meta-label'>
                      {String(t('tasks.view.document.fields.signedBy', { defaultValue: 'Signed by' }))}
                    </div>
                    <div className='meta-value'>{fullTask?.task?.signed_by_detail?.fullname || '—'}</div>
                  </div>
                  <div className='meta-row'>
                    <div className='meta-label'>
                      {String(t('tasks.view.document.fields.signedDate', { defaultValue: 'Signed date' }))}
                    </div>
                    <div className='meta-value'>{formatDate(fullTask?.task?.signed_date)}</div>
                  </div>

                  <div className='meta-row'>
                    <div className='meta-label'>
                      {String(t('tasks.view.actions.partStatus', { defaultValue: 'Status' }))}
                    </div>
                    <div className='meta-value'>{translateStatus(fullTask?.task?.status)}</div>
                  </div>
                  <div className='meta-row'>
                    <div className='meta-label'>
                      {String(t('tasks.view.actions.deadline', { defaultValue: 'Deadline' }))}
                    </div>
                    <div className='meta-value'>{formatDate(fullTask?.task?.end_date, true)}</div>
                  </div>
                </div>

                <div className='section-title'>
                  {String(t('tasks.view.document.sections.note', { defaultValue: 'Note' }))}
                </div>
                <div className='note-box'>{fullTask?.task?.note || '—'}</div>

                <div style={{ height: 18 }} />

                <div className='section-title'>
                  {String(t('tasks.view.document.sections.parts', { defaultValue: 'Parts' }))}
                </div>

                <table className='parts-table'>
                  <thead>
                    <tr>
                      <th style={{ width: '18%' }}>
                        {String(t('tasks.view.parts.table.assignee', { defaultValue: 'Assignee' }))}
                      </th>
                      <th style={{ width: '18%' }}>
                        {String(t('tasks.view.parts.table.department', { defaultValue: 'Department' }))}
                      </th>
                      <th style={{ width: '12%' }}>
                        {String(t('tasks.view.document.fields.startDate', { defaultValue: 'Start date' }))}
                      </th>
                      <th style={{ width: '12%' }}>
                        {String(t('tasks.view.document.fields.endDate', { defaultValue: 'End date' }))}
                      </th>
                      <th style={{ width: '12%' }}>
                        {String(t('tasks.view.actions.partStatus', { defaultValue: 'Status' }))}
                      </th>
                      <th>{String(t('tasks.form.note', { defaultValue: 'Note' }))}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(fullTask?.parts || []).map(part => (
                      <tr key={part.id}>
                        <td>{part.assignee_detail?.fullname || '—'}</td>
                        <td>{part.department_detail?.name || '—'}</td>
                        <td>{formatDate(part.start_date, true)}</td>
                        <td>{formatDate(part.end_date, true)}</td>
                        <td>{translateStatus(part.status)}</td>
                        <td>{part.note || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className='doc-footer'>
                  <div>
                    <div className='muted'>{String(t('common.createdAt', { defaultValue: 'Created at' }))}</div>
                    <div>{formatDate((fullTask?.task as any)?.created_time, true)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className='muted'>
                      {String(t('tasks.view.document.header.overline', { defaultValue: 'Document' }))}
                    </div>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>
                      {String(
                        t('tasks.view.document.header.fallbackTitle', {
                          id: fullTask?.task?.id ?? '—',
                          defaultValue: 'Task #{{id}}'
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='doc-thumb-overlay'>
              <span>{String(t('tasks.view.document.actions.openPdf', { defaultValue: 'Open PDF view' }))}</span>
              <Icon icon='tabler:zoom-in' />
            </div>
          </div>

          {/* Full preview in dialog */}
          <Dialog open={open} onClose={() => setOpen(false)} maxWidth='lg' fullWidth>
            <DialogTitle>{String(t('tasks.view.document.header.overline', { defaultValue: 'Document' }))}</DialogTitle>
            <DialogContent dividers>
              <Box className='doc-preview-shell'>
                <Box
                  sx={{
                    width: `${Math.round(PAGE_W * DIALOG_SCALE)}px`,
                    minHeight: `${Math.round(PAGE_H * DIALOG_SCALE)}px`,
                    margin: '0 auto'
                  }}
                >
                  <div style={{ width: `${PAGE_W * DIALOG_SCALE}px`, minHeight: `${PAGE_H * DIALOG_SCALE}px` }}>
                    <div
                      className='print-paper'
                      style={{
                        width: `${PAGE_W}px`,
                        minHeight: `${PAGE_H}px`,
                        transform: `scale(${DIALOG_SCALE})`,
                        transformOrigin: 'top left'
                      }}
                    >
                      {/* same content as thumbnail */}
                      <div className='doc-topline' />

                      <div className='doc-header'>
                        <div className='doc-header-left'>
                          <img className='doc-logo' src='/logo.svg' alt='Logo' />
                        </div>
                        <div className='doc-company'>{fullTask?.task?.company_detail?.name || '—'}</div>
                        <div className='doc-header-right'>
                          <div className='muted'>
                            {String(
                              t('tasks.view.document.fields.inputDocNumber', { defaultValue: 'Incoming number' })
                            )}
                          </div>
                          <div style={{ fontWeight: 700, color: '#0F172A' }}>
                            №{fullTask?.task?.input_doc_number ?? '—'}
                          </div>
                        </div>
                      </div>

                      <div className='doc-subline' />

                      <div className='section-title'>
                        {String(t('tasks.view.document.sections.main', { defaultValue: 'Main information' }))}
                      </div>

                      <div className='meta-grid'>
                        <div className='meta-row'>
                          <div className='meta-label'>
                            {String(t('tasks.view.document.fields.signedBy', { defaultValue: 'Signed by' }))}
                          </div>
                          <div className='meta-value'>{fullTask?.task?.signed_by_detail?.fullname || '—'}</div>
                        </div>
                        <div className='meta-row'>
                          <div className='meta-label'>
                            {String(t('tasks.view.document.fields.signedDate', { defaultValue: 'Signed date' }))}
                          </div>
                          <div className='meta-value'>{formatDate(fullTask?.task?.signed_date)}</div>
                        </div>

                        <div className='meta-row'>
                          <div className='meta-label'>
                            {String(t('tasks.view.actions.partStatus', { defaultValue: 'Status' }))}
                          </div>
                          <div className='meta-value'>{translateStatus(fullTask?.task?.status)}</div>
                        </div>
                        <div className='meta-row'>
                          <div className='meta-label'>
                            {String(t('tasks.view.actions.deadline', { defaultValue: 'Deadline' }))}
                          </div>
                          <div className='meta-value'>{formatDate(fullTask?.task?.end_date, true)}</div>
                        </div>
                      </div>

                      <div className='section-title'>
                        {String(t('tasks.view.document.sections.note', { defaultValue: 'Note' }))}
                      </div>
                      <div className='note-box'>{fullTask?.task?.note || '—'}</div>

                      <div style={{ height: 18 }} />

                      <div className='section-title'>
                        {String(t('tasks.view.document.sections.parts', { defaultValue: 'Parts' }))}
                      </div>

                      <table className='parts-table'>
                        <thead>
                          <tr>
                            <th style={{ width: '18%' }}>
                              {String(t('tasks.view.parts.table.assignee', { defaultValue: 'Assignee' }))}
                            </th>
                            <th style={{ width: '18%' }}>
                              {String(t('tasks.view.parts.table.department', { defaultValue: 'Department' }))}
                            </th>
                            <th style={{ width: '12%' }}>
                              {String(t('tasks.view.document.fields.startDate', { defaultValue: 'Start date' }))}
                            </th>
                            <th style={{ width: '12%' }}>
                              {String(t('tasks.view.document.fields.endDate', { defaultValue: 'End date' }))}
                            </th>
                            <th style={{ width: '12%' }}>
                              {String(t('tasks.view.actions.partStatus', { defaultValue: 'Status' }))}
                            </th>
                            <th>{String(t('tasks.form.note', { defaultValue: 'Note' }))}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(fullTask?.parts || []).map(part => (
                            <tr key={part.id}>
                              <td>{part.assignee_detail?.fullname || '—'}</td>
                              <td>{part.department_detail?.name || '—'}</td>
                              <td>{formatDate(part.start_date, true)}</td>
                              <td>{formatDate(part.end_date, true)}</td>
                              <td>{translateStatus(part.status)}</td>
                              <td>{part.note || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <div className='doc-footer'>
                        <div>
                          <div className='muted'>{String(t('common.createdAt', { defaultValue: 'Created at' }))}</div>
                          <div>{formatDate((fullTask?.task as any)?.created_time, true)}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div className='muted'>
                            {String(t('tasks.view.document.header.overline', { defaultValue: 'Document' }))}
                          </div>
                          <div style={{ fontWeight: 700, color: '#0F172A' }}>
                            {String(
                              t('tasks.view.document.header.fallbackTitle', {
                                id: fullTask?.task?.id ?? '—',
                                defaultValue: 'Task #{{id}}'
                              })
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleOpenPdfView} startIcon={<Icon icon='tabler:file-type-pdf' />}>
                {String(t('tasks.view.document.actions.openPdf', { defaultValue: 'Open PDF view' }))}
              </Button>
              <Button onClick={handlePrint} variant='contained' startIcon={<Icon icon='tabler:printer' />}>
                {String(t('tasks.view.document.actions.print', { defaultValue: 'Print / Save as PDF' }))}
              </Button>
              <Button onClick={() => setOpen(false)}>{String(t('common.close', { defaultValue: 'Close' }))}</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Card>
  )
}
