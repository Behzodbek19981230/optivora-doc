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
  Typography,
  Button,
  IconButton,
  Tooltip
} from '@mui/material'
import { TaskPartType } from 'src/types/task'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import Icon from 'src/@core/components/icon'
import { useAuth } from 'src/hooks/useAuth'

export default function TaskParts({
  parts,
  selectedPartId,
  setSelectedPartId,
  onDelete,
  onAdd
}: {
  parts: TaskPartType[]
  selectedPartId: number | undefined
  setSelectedPartId: (id: number) => void
  onDelete: (id: number) => void
  onEdit: (id: number) => void
  onAdd?: () => void
  taskId?: number
}) {
  const { t } = useTranslation()
  const { user } = useAuth()
  const isAdmin = user?.role_detail?.some((role: any) => role.name === 'Admin')

  const statusColor = (status?: string) => {
    switch (status) {
      case 'new':
        return 'error'
      case 'in_progress':
        return 'primary'
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
            <Stack direction='row' spacing={1} alignItems='center'>
              <Typography variant='caption' color='text.secondary'>
                {String(t('tasks.view.parts.count', { count: parts.length }))}
              </Typography>
              {isAdmin && onAdd && (
                <Button variant='contained' size='small' startIcon={<Icon icon='mdi:plus' />} onClick={onAdd}>
                  {String(t('common.add'))}
                </Button>
              )}
            </Stack>
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
                {isAdmin && <TableCell align='right'>{String(t('common.actions'))}</TableCell>}
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
                    {isAdmin && (
                      <TableCell align='right' onClick={e => e.stopPropagation()}>
                        <Stack direction='row' spacing={1} justifyContent='flex-end'>
                          {/* <Tooltip title={String(t('common.edit'))}>
                            <IconButton
                              size='small'
                              onClick={() => onEdit(p.id)}
                            >
                              <Icon icon='mdi:pencil' />
                            </IconButton>
                          </Tooltip> */}
                          <Tooltip title={String(t('common.delete'))}>
                            <IconButton size='small' color='error' onClick={() => onDelete(p.id)}>
                              <Icon icon='mdi:delete' />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    )}
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
