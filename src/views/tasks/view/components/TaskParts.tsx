import React from 'react'
import {
  Card,
  CardContent,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material'
import { TaskPartType } from 'src/types/task'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

export default function TaskParts({
  parts,
  selectedPartId,
  setSelectedPartId,
  onDelete, // eslint-disable-line @typescript-eslint/no-unused-vars
  onEdit // eslint-disable-line @typescript-eslint/no-unused-vars
}: {
  parts: TaskPartType[]
  selectedPartId: number | undefined
  setSelectedPartId: (id: number) => void
  onDelete: (id: number) => void
  onEdit: (id: number) => void
}) {
  const { t } = useTranslation()

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
