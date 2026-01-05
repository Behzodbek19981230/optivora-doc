import React, { useState } from 'react'
import {
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import { TaskPartType } from 'src/types/task'
import { useTranslation } from 'react-i18next'
import { DataService } from 'src/configs/dataService'
import endpoints from 'src/configs/endpoints'
import useThemedToast from 'src/@core/hooks/useThemedToast'
import moment from 'moment'

export default function TaskParts({
  parts,
  selectedPartId,
  setSelectedPartId,
  onDelete,
  onEdit
}: {
  parts: TaskPartType[]
  selectedPartId: number | undefined
  setSelectedPartId: (id: number) => void
  onDelete: (id: number) => void
  onEdit: (id: number) => void
}) {
  const { t } = useTranslation()
  const toast = useThemedToast()
  const [sendingEmail, setSendingEmail] = useState<Record<number, boolean>>({})

  const handleSendToEmail = async (e: React.MouseEvent, part: TaskPartType) => {
    e.stopPropagation()
    const taskId = part.task

    if (!taskId) {
      toast.error(String(t('errors.generic')) || 'Task ID not found')

      return
    }

    setSendingEmail(prev => ({ ...prev, [part.id]: true }))

    try {
      await DataService.post(endpoints.taskSendToEmail, { task_id: taskId })
      toast.success(String(t('tasks.view.parts.emailSent') || 'Email sent successfully'))
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || String(t('errors.generic'))
      toast.error(message)
    } finally {
      setSendingEmail(prev => ({ ...prev, [part.id]: false }))
    }
  }
  const statusColor = (status?: string) => {
    switch (status) {
      case 'new':
        return 'default'
      case 'in_progress':
        return 'info'
      case 'on_review':
        return 'warning'
      case 'returned':
        return 'warning'
      case 'done':
        return 'success'
      case 'cancelled':
        return 'error'
      default:
        return 'default'
    }
  }

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
      <>
        <CardContent>
          <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 2 }}>
            <Typography variant='subtitle2'>{String(t('tasks.view.parts.title'))}</Typography>
            <Typography variant='caption' color='text.secondary'>
              {String(t('tasks.view.parts.count', { count: parts.length }))}
            </Typography>
          </Stack>
        </CardContent>

        {!parts.length ? (
          <CardContent>
            <Typography variant='body2' color='text.secondary'>
              {String(t('tasks.view.parts.empty'))}
            </Typography>
          </CardContent>
        ) : (
          <Table size='small' sx={{ '& .MuiTableCell-root': { py: 1 } }}>
            <TableHead>
              <TableRow>
                <TableCell>{String(t('tasks.view.parts.table.title'))}</TableCell>
                <TableCell>{String(t('tasks.view.parts.table.status'))}</TableCell>
                <TableCell>{String(t('tasks.view.parts.table.department'))}</TableCell>
                <TableCell>{String(t('tasks.view.parts.table.assignee'))}</TableCell>
                <TableCell>{String(t('tasks.view.parts.table.start'))}</TableCell>
                <TableCell>{String(t('tasks.view.parts.table.end'))}</TableCell>
                <TableCell align='right'>{String(t('common.actions'))}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {parts.map(p => {
                const isSelected = selectedPartId === p.id

                return (
                  <TableRow
                    key={p.id}
                    hover
                    selected={isSelected}
                    onClick={() => setSelectedPartId(p.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Stack direction='row' spacing={1} alignItems='center'>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          {p.title || String(t('tasks.view.parts.partFallbackTitle', { id: p.id }))}
                        </Typography>
                      </Stack>
                      {!!p.note && (
                        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.5 }}>
                          {p.note}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size='small'
                        label={translateStatus(p.status)}
                        color={statusColor(p.status) as any}
                        variant='outlined'
                      />
                    </TableCell>
                    <TableCell>{p.department_detail?.name || p.department}</TableCell>
                    <TableCell>{p.assignee_detail?.fullname || p.assignee}</TableCell>
                    <TableCell>
                      {moment(p.start_date).isValid() ? moment(p.start_date).format('DD.MM.YYYY HH:mm') : '—'}
                    </TableCell>
                    <TableCell>
                      {moment(p.end_date).isValid() ? moment(p.end_date).format('DD.MM.YYYY HH:mm') : '—'}
                    </TableCell>
                    <TableCell align='right' onClick={e => e.stopPropagation()}>
                      <Stack direction='row' spacing={1} justifyContent='flex-end'>
                        <Tooltip title={String(t('tasks.view.parts.sendToEmail') || 'Send to email')}>
                          <IconButton
                            size='small'
                            onClick={e => handleSendToEmail(e, p)}
                            disabled={sendingEmail[p.id] || !p.task}
                          >
                            <Icon icon={sendingEmail[p.id] ? 'mdi:loading' : 'mdi:email-send'} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </>
    </Card>
  )
}
