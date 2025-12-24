import React from 'react'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { useTranslation } from 'react-i18next'
import { TaskPartType } from 'src/types/task'
import { useRouter } from 'next/router'
import { getDataGridLocaleText } from 'src/@core/utils/getDataGridLocaleText'
import { Chip } from '@mui/material'

type Props = {
  data: TaskPartType[]
  loading: boolean
  total: number
}
const statusColor = (status?: string) => {
  switch (status) {
    case 'new':
      return 'info'
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
        const status = (params.row as any).status

        return (
          <Chip label={t(`documents.status.${status}`)} color={statusColor(status)} size='small' variant='outlined' />
        )
      }
    },
    {
      field: 'task_detail',
      headerName: String(t('documents.table.type')),
      flex: 0.15,
      minWidth: 120,
      renderCell: params => {
        const type = (params.row as any).task_detail?.type

        return t(`tasks.type.${type}`)
      }
    },
    {
      field: 'priority',
      headerName: String(t('documents.table.priority')),
      flex: 0.15,
      minWidth: 120,
      renderCell: params => {
        const priority = (params.row as any).task_detail?.priority

        return (
          <Chip
            label={t(`tasks.priority.${priority}`)}
            color={priority === 'ordinary' ? 'primary' : 'warning'}
            size='small'
          />
        )
      }
    },
    { field: 'start_date', headerName: String(t('documents.table.start')), flex: 0.15, minWidth: 130 },
    { field: 'end_date', headerName: String(t('documents.table.end')), flex: 0.15, minWidth: 130 }
  ]

  return (
    <DataGrid
      autoHeight
      rowHeight={56}
      rows={data}
      columns={columns}
      loading={loading}
      rowCount={total}
      onRowClick={params => router.push(`/tasks/view/${params.row?.task_detail?.id}`)}
      getRowId={row => row.id}
      localeText={getDataGridLocaleText(t)}
    />
  )
}
