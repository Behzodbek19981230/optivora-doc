import React from 'react'
import { DataGrid, GridColDef } from '@mui/x-data-grid'
import { useTranslation } from 'react-i18next'
import { TaskType } from 'src/types/task'
type Props = {
  data: TaskType[]
  loading: boolean
  total: number
  paginationModel: any
  setPaginationModel: (model: any) => void
}

export default function TaskTable({ data, loading, total, paginationModel, setPaginationModel }: Props) {
  const { t } = useTranslation()

  const columns: GridColDef[] = [
    { field: 'id', headerName: String(t('common.id')), width: 90 },
    { field: 'name', headerName: String(t('documents.table.name')), flex: 0.3, minWidth: 180 },
    { field: 'status', headerName: String(t('documents.table.status')), flex: 0.2, minWidth: 140 },
    { field: 'type', headerName: String(t('documents.table.type')), flex: 0.15, minWidth: 120 },
    { field: 'priority', headerName: String(t('documents.table.priority')), flex: 0.15, minWidth: 120 },
    { field: 'start_date', headerName: String(t('documents.table.start')), flex: 0.15, minWidth: 130 },
    { field: 'end_date', headerName: String(t('documents.table.end')), flex: 0.15, minWidth: 130 }
  ]

  return (
    <DataGrid
      autoHeight
      rowHeight={56}
      rows={data as any[]}
      columns={columns}
      loading={loading}
      rowCount={total}
      paginationMode='server'
      disableRowSelectionOnClick
      getRowId={row => (row as any).id as number}
    />
  )
}
