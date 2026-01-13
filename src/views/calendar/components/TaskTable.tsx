import React from 'react'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { useTranslation } from 'react-i18next'
import { TaskPartType } from 'src/types/task'
import { useRouter } from 'next/router'
import { getDataGridLocaleText } from 'src/@core/utils/getDataGridLocaleText'
import { Chip } from '@mui/material'
import moment from 'moment'

type Props = {
  data: TaskPartType[]
  loading: boolean
  total: number
}
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

export default function TaskTable({ data, loading, total }: Props) {
  const { t } = useTranslation()
  const router = useRouter()

  const columns: GridColDef[] = [
    { field: 'id', headerName: String(t('common.id')), width: 90 },
    { field: 'title', headerName: String(t('documents.table.name')), flex: 0.3, minWidth: 180 },
    {
      field: 'status',
      headerName: String(t('documents.table.status')),
      flex: 0.2,
      minWidth: 140,
      renderCell: params => {
        const status = (params.row as any).status || 'new'

        return (
          <Chip label={t(`documents.status.${status}`)} color={statusColor(status)} size='small' variant='outlined' />
        )
      }
    },
    {
      field: 'responsible_person',
      headerName: String(t('documents.table.responsible')),
      flex: 0.2,
      minWidth: 150
    },
    {
      field: 'department',
      headerName: String(t('documents.table.department')),
      flex: 0.15,
      minWidth: 120,
      renderCell: params => {
        const department = (params.row as any).department

        return department?.name || ''
      }
    },
    {
      field: 'start_date',
      headerName: String(t('documents.table.start')),
      flex: 0.15,
      minWidth: 130,
      renderCell: params => {
        const startDate = (params.row as any).start_date

        return moment(startDate).isValid() ? moment(startDate).format('DD.MM.YYYY HH:mm') : ''
      }
    },
    {
      field: 'end_date',
      headerName: String(t('documents.table.end')),
      flex: 0.15,
      minWidth: 130,
      renderCell: params => {
        const endDate = (params.row as any).end_date

        return moment(endDate).isValid() ? moment(endDate).format('DD.MM.YYYY HH:mm') : ''
      }
    }
  ]

  return (
    <DataGrid
      autoHeight
      rowHeight={56}
      rows={data}
      columns={columns}
      loading={loading}
      rowCount={total}
      onRowClick={params => {
        const taskId = (params.row as any).task_detail?.id || (params.row as any).id
        if (taskId) {
          router.push(`/tasks/view/${taskId}`)
        }
      }}
      getRowId={row => row.id}
      localeText={getDataGridLocaleText(t)}
    />
  )
}
