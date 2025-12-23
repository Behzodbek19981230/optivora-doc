import React, { useMemo } from 'react'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { useTranslation } from 'react-i18next'
import { TaskPartType } from 'src/types/task'
import { useRouter } from 'next/router'
import { getDataGridLocaleText } from 'src/@core/utils/getDataGridLocaleText'

type Props = {
  data: TaskPartType[]
  loading: boolean
  total: number
}

export default function TaskTable({ data, loading, total }: Props) {
  const { t } = useTranslation()
  const router = useRouter()

  const columns: GridColDef<TaskPartType>[] = [
    {
      field: 'id',
      headerName: String(t('common.id')),
      width: 90
    },
    {
      field: 'title',
      headerName: String(t('documents.table.name')),
      flex: 0.3,
      minWidth: 180
    },
    {
      field: 'status',
      headerName: String(t('documents.table.status')),
      flex: 0.2,
      minWidth: 140
    },
    {
      field: 'type',
      headerName: String(t('documents.table.type')),
      flex: 0.15,
      minWidth: 120,
      valueGetter: params => t(params.row.task_detail?.type ?? '-')
    },
    {
      field: 'priority',
      headerName: String(t('documents.table.priority')),
      flex: 0.15,
      minWidth: 120,
      valueGetter: params => t(params.row.task_detail?.priority ?? '-')
    },
    {
      field: 'start_date',
      headerName: String(t('documents.table.start')),
      flex: 0.15,
      minWidth: 130
    },
    {
      field: 'end_date',
      headerName: String(t('documents.table.end')),
      flex: 0.15,
      minWidth: 130
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
      onRowClick={params => router.push(`/tasks/view/${params.row?.task_detail?.id}`)}
      getRowId={row => row.id}
      localeText={getDataGridLocaleText(t)}
    />
  )
}
