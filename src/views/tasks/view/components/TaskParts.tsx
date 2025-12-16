import React from 'react'
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

export default function TaskParts({
  parts,
  selectedPartId,
  setSelectedPartId
}: {
  parts: TaskPartType[]
  selectedPartId: number | undefined
  setSelectedPartId: (id: number) => void
}) {
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

  return (
    <Card>
      <>
        <CardContent>
          <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 2 }}>
            <Typography variant='subtitle2'>Qismlar (TaskPart)</Typography>
            <Typography variant='caption' color='text.secondary'>
              {parts.length} ta
            </Typography>
          </Stack>
        </CardContent>

        {!parts.length ? (
          <CardContent>
            <Typography variant='body2' color='text.secondary'>
              Qismlar mavjud emas
            </Typography>
          </CardContent>
        ) : (
          <Table size='small' sx={{ '& .MuiTableCell-root': { py: 1 } }}>
            <TableHead>
              <TableRow>
                <TableCell>Qism nomi</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Bo‘lim</TableCell>
                <TableCell>Ijrochi</TableCell>
                <TableCell>Boshlanish</TableCell>
                <TableCell>Tugash</TableCell>
                <TableCell align='right'>Amallar</TableCell>
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
                        <Icon icon='mdi:subdirectory-arrow-right' />
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          {p.title || `Qism #${p.id}`}
                        </Typography>
                      </Stack>
                      {!!p.note && (
                        <Typography variant='caption' color='text.secondary' sx={{ display: 'block', mt: 0.5 }}>
                          {p.note}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip size='small' label={p.status} color={statusColor(p.status) as any} variant='outlined' />
                    </TableCell>
                    <TableCell>{p.department_detail?.name || p.department}</TableCell>
                    <TableCell>{p.assignee_detail?.fullname || p.assignee}</TableCell>
                    <TableCell>{p.start_date || '—'}</TableCell>
                    <TableCell>{p.end_date || '—'}</TableCell>
                    <TableCell align='right' onClick={e => e.stopPropagation()}>
                      <Tooltip title='Oʻchirish'>
                        <IconButton size='small'>
                          <Icon icon='mdi:delete' />
                        </IconButton>
                      </Tooltip>
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
