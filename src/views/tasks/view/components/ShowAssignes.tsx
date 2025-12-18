import React from 'react'
import moment from 'moment'
import { TaskPartType } from 'src/types/task'
import { useTranslation } from 'react-i18next'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Avatar,
  Box
} from '@mui/material'
import { Icon } from '@iconify/react'

export default function ShowAssignes({ parts }: { parts?: TaskPartType[] }) {
  const { t } = useTranslation()

  return (
    <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
      <Box sx={{ p: 2, borderBottom: theme => `1px solid ${theme.palette.divider}` }}>
        <Typography variant='subtitle1'>{String(t('tasks.view.parts.title') || 'Parts')}</Typography>
        <Typography variant='caption' color='text.secondary'>
          {String(t('tasks.view.parts.count', { count: parts?.length || 0 }))}
        </Typography>
      </Box>
      <Table size='small'>
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography variant='body2' sx={{ fontSize: 10 }}>
                {String(t('tasks.view.parts.table.assignee') || 'Assignee')}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant='body2' sx={{ fontSize: 10 }}>
                {String(t('tasks.view.parts.table.start') || 'Show date')}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography variant='body2' sx={{ fontSize: 10 }}>
                {String(t('tasks.view.parts.table.status') || 'Is show')}
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {parts && parts.length ? (
            parts.map(part => (
              <TableRow key={part.id} hover>
                <TableCell>
                  <Typography variant='body2' sx={{ fontSize: 12 }}>
                    {part.assignee_detail?.fullname || '—'}
                  </Typography>
                </TableCell>
                <TableCell sx={{ fontSize: 12 }}>
                  {part.show_date ? moment(part.show_date).format('DD.MM.YYYY') : '—'}
                </TableCell>
                <TableCell sx={{ fontSize: 12 }}>
                  {part.show_date ? <Icon icon='tabler:eye' /> : <Icon icon='tabler:eye-off' />}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} align='center'>
                <Typography variant='body2' color='text.secondary'>
                  {String(t('tasks.view.parts.empty') || 'No parts')}
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
