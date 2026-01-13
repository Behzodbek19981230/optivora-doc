import { useState } from 'react'
import { Card, CardContent, IconButton, Tooltip, Stack, Chip } from '@mui/material'
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import { useRouter } from 'next/router'
import IconifyIcon from 'src/@core/components/icon'
import { useFetchList } from 'src/hooks/useFetchList'
import endpoints from 'src/configs/endpoints'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { useAuth } from 'src/hooks/useAuth'
import { getDataGridLocaleText } from 'src/@core/utils/getDataGridLocaleText'
import moment from 'moment'
import { TaskPartType } from 'src/types/task'

type Props = { status: string; ownerFilter?: 'mine' | 'all' }
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

const TaskPartTable = ({ status, ownerFilter }: Props) => {
  const router = useRouter()
  const { t } = useTranslation()
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 })
  const { user } = useAuth()

  const listEndpoint = ownerFilter === 'mine' ? endpoints.taskPartSelf : endpoints.taskPart
  const params: any = { page: paginationModel.page + 1, limit: paginationModel.pageSize, status }

  // If ownerFilter is 'mine', add assignee filter
  if (ownerFilter === 'mine' && user?.id) {
    params.assignee = user.id
  }

  const { data = [], total, loading } = useFetchList<TaskPartType>(listEndpoint, params)

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
      field: 'assignee_detail',
      headerName: String(t('documents.table.responsible')),
      flex: 0.2,
      minWidth: 150,
      renderCell: params => {
        const assignee = (params.row as any).assignee_detail

        return assignee?.fullname || ''
      }
    },
    {
      field: 'department_detail',
      headerName: String(t('documents.table.department')),
      flex: 0.15,
      minWidth: 120,
      renderCell: params => {
        const department = (params.row as any).department_detail

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
    },
    {
      field: 'actions',
      headerName: String(t('common.actions')),
      width: 120,
      sortable: false,
      renderCell: params => {
        const taskId = (params.row as any).task_detail?.id || (params.row as any).task

        return (
          <Stack direction='row' spacing={1}>
            {taskId && (
              <Tooltip title={String(t('common.view'))}>
                <IconButton size='small' component={Link} href={`/tasks/view/${taskId}`}>
                  <IconifyIcon icon='tabler:eye' />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        )
      }
    }
  ]

  return (
    <Card variant='outlined'>
      <CardContent sx={{ pb: 0 }}>
        <DataGrid
          autoHeight
          rowHeight={56}
          rows={data as any[]}
          columns={columns}
          loading={loading}
          rowCount={total}
          paginationMode='server'
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          onRowClick={params => router.push(`/task-parts/view/${params.row.id}`)}
          getRowId={row => (row as any).id as number}
          localeText={{
            ...getDataGridLocaleText(t),
            noRowsLabel: String(t('documents.table.emptyForStatus', { status }))
          }}
        />
      </CardContent>
    </Card>
  )
}

export default TaskPartTable
