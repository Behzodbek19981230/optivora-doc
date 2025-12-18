import React, { useRef } from 'react'
import { Box, Container, Divider, Typography, Paper, Card, IconButton, useTheme } from '@mui/material'
import { Icon } from '@iconify/react'
import { TaskPartType, TaskType } from 'src/types/task'
import Image from 'next/image'
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

  const handlePrint = () => {
    const host = printRef.current
    if (!host) return

    if (isPrintingRef.current) return
    isPrintingRef.current = true

    const paperEl = host.querySelector('.print-paper') as HTMLElement | null
    const printContents = paperEl ? paperEl.innerHTML : host.innerHTML
    let printWindow: Window | null = null
    try {
      printWindow = window.open('', '_blank', 'height=900,width=800')
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

    const css = `
      @page { size: A4; margin: 12mm }
  html,body{margin:0; padding:0; height:100%; background:#fff;}
  body{ -webkit-print-color-adjust:exact; font-family: 'Times New Roman', Times, serif; color:#111; font-size:14pt }
      .print-paper{
        width:210mm; height:297mm; box-sizing:border-box;
        padding:14mm 12mm; margin:0 auto; background:#fff;
        border:12px double #222; border-radius:6px; overflow:hidden;
        display:flex; flex-direction:column; 
      }
  .print-header-logo{ display:flex; flex-direction:column; align-items:center; justify-content:center; margin-bottom:12px }
  .print-header-logo img{ display:block; max-width:160px; height:auto }
    .print-title{ text-align:center; font-size:22pt; font-weight:700; margin-bottom:8px }
    .print-divider{ border-top:1px solid #646464ff; margin:12px 0 }
    .print-section{ margin-bottom:12px; font-size:12pt }
    .print-label{ font-weight:700; min-width:120px; display:inline-block; font-size:14pt }
  .print-footer{ margin-top:auto; text-align:right; font-size:14pt }
  .print-body{ flex:1; display:block; margin-top:40px; margin-bottom:12px }
      img{ max-width:100%; height:auto; display:block }
      .no-print, [data-no-print] { display: none !important }
    `

    try {
      printWindow.document.open()
      printWindow.document.write(
        `<!doctype html><html><head><meta charset="utf-8"><title>Virtual-Qabulxona-Hujjat</title><style>${css}</style></head><body><div class="print-paper">${printContents}</div></body></html>`
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
        printWindow.print()
      } catch (e) {
        console.error('Print failed', e)
      } finally {
        try {
          printWindow && !printWindow.closed && printWindow.close()
        } catch (er) {
          // ignore
        }
        isPrintingRef.current = false
      }
    }

    setTimeout(tryPrint, 800)
  }

  const { t } = useTranslation()

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

  return (
    <Card>
      <Box ref={printRef}>
        {/* Screen-only styles: smaller fonts and subtle border for UI */}
        <style>{`
          .print-paper {
              margin: 4px auto;
              padding: 4px 10px;
              background: #fff;
              border: 1px solid rgba(0,0,0,0.08);
              border-radius: 6px;
              box-shadow: 0 1px 4px rgba(0,0,0,0.04);
              width: auto;
              max-width: 720px;
              font-family: Arial, Helvetica, sans-serif;
              font-size: 10px; /* tighter on-screen */
              display:flex; flex-direction:column;
              color: rgba(0,0,0,0.85);
            }
            .print-header-logo { display:flex; flex-direction:column; align-items:center; justify-content:center; margin-bottom: 4px }
            .print-header-logo img{ display:block; max-width:48px; height:auto }
            .print-title { text-align:center; font-weight:600; font-size:11px; margin-bottom:4px }
            .print-label { font-weight:600; min-width:80px; display:inline-block;font-size:10px }
            .print-divider { border-top:1px solid rgba(0,0,0,0.1); margin:6px 0 }
            .print-section { margin-bottom:2px }
            .print-footer { margin-top:auto; text-align:right; font-size:9px }
            .print-body { flex:1 }
        `}</style>
        <Box sx={{ position: 'relative', p: 2 }}>
          <Box
            sx={{
              display: 'flex',
              position: 'absolute',
              top: '10px',
              left: '10px',
              justifyContent: 'flex-end',
              mb: 2,
              '@media print': { display: 'none' }
            }}
          >
            <IconButton onClick={handlePrint}>
              <Icon icon='tabler:printer' />
            </IconButton>
          </Box>
          <div className='print-paper'>
            {/* Header */}
            <div className='print-header-logo'>
              <Image src='/logo.svg' alt='Logo' width={100} height={100} />
            </div>
            <div className='print-title'>{fullTask?.task?.company_detail?.name}</div>
            <div className='print-divider' />
            {/* Main Info */}
            <div className='print-body'>
              <div className='print-section'>
                <span className='print-label'>{String(t('tasks.view.document.fields.signedBy') || 'Signed by')}:</span>{' '}
                {fullTask?.task?.signed_by_detail?.fullname}
              </div>
              <div className='print-section'>
                <span className='print-label'>
                  {String(t('tasks.view.document.fields.signedDate') || 'Signed date')}:
                </span>{' '}
                {fullTask?.task?.signed_date ? moment(fullTask?.task?.signed_date).format('DD.MM.YYYY') : ''}
              </div>
              <div className='print-section'>
                <span className='print-label'>{String(t('tasks.view.actions.partStatus') || 'Status')}:</span>{' '}
                {translateStatus(fullTask?.task?.status)}
              </div>
              <div className='print-section'>
                <span className='print-label'>{String(t('tasks.form.note') || 'Note')}:</span> {fullTask?.task?.note}
              </div>
              {fullTask?.parts?.map(part => (
                <div key={part.id} className='print-section' style={{ marginBottom: 24 }}>
                  <span className='print-label'>{String(t('tasks.view.parts.table.assignee') || 'Assigned to')}:</span>{' '}
                  {part.assignee_detail.fullname}
                  <br />
                  <span className='print-label'>
                    {String(t('tasks.view.parts.table.department') || 'Department')}:
                  </span>{' '}
                  {part.department_detail?.name}
                  <br />
                  <span className='print-label'>
                    {String(t('tasks.view.document.fields.startDate') || 'Start Date')}:
                  </span>{' '}
                  {moment(part.start_date).format('DD.MM.YYYY')}
                  <br />
                  <span className='print-label'>
                    {String(t('tasks.view.document.fields.endDate') || 'Deadline')}:
                  </span>{' '}
                  {moment(part.end_date).format('DD.MM.YYYY')}
                  <br />
                  <span className='print-label'>{String(t('tasks.view.actions.partStatus') || 'Status')}:</span>{' '}
                  {translateStatus(part.status)}
                  <br />
                  <span className='print-label'>{String(t('tasks.form.note') || 'Note')}:</span> {part.note}
                </div>
              ))}
            </div>
            <div className='print-footer'>
              <span className='print-label'>{String(t('tasks.view.actions.deadline') || 'Deadline')}:</span>{' '}
              {moment(fullTask?.task?.end_date).format('DD.MM.YYYY')}
              <br />
              <span className='print-label'>№{fullTask?.task?.input_doc_number}</span>
            </div>
          </div>
        </Box>
      </Box>
    </Card>
  )
}
