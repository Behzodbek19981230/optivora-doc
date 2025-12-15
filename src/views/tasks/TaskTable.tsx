import { useState } from 'react'
import { Stack, Button, Tooltip, IconButton } from '@mui/material'
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import endpoints from 'src/configs/endpoints'
import { useFetchList } from 'src/hooks/useFetchList'
import IconifyIcon from 'src/@core/components/icon'
import Link from 'next/link'
import { useRouter } from 'next/router'

export type TaskRow = {
  id: number
  name: string
  status: string
  type: string
  priority: string
  start_date: string
  end_date: string
}

const TaskTable = () => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 })
  const router = useRouter()
  const {
    data = [],
    total,
    loading
  } = useFetchList<TaskRow>(endpoints.task, {
    page: paginationModel.page + 1,
    perPage: paginationModel.pageSize
  })

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', flex: 0.3, minWidth: 180 },
    { field: 'status', headerName: 'Status', flex: 0.2, minWidth: 140 },
    { field: 'type', headerName: 'Type', flex: 0.15, minWidth: 120 },
    { field: 'priority', headerName: 'Priority', flex: 0.15, minWidth: 120 },
    { field: 'start_date', headerName: 'Start', flex: 0.15, minWidth: 130 },
    { field: 'end_date', headerName: 'End', flex: 0.15, minWidth: 130 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: params => {
        const id = (params.row as any).id
        return (
          <Stack direction='row' spacing={1}>
            <Tooltip title='View'>
              <IconButton size='small' component={Link} href={`/tasks/view/${id}`}>
                <IconifyIcon icon='tabler:eye' />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      }
    }
  ]

  return (
    <>
      <Stack direction='row' justifyContent='flex-end' sx={{ mb: 2 }}>
        <Button
          variant='contained'
          startIcon={<IconifyIcon icon='tabler:plus' />}
          onClick={() => router.push('/tasks/create')}
        >
          Vazifa yaratish
        </Button>
      </Stack>
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
        getRowId={row => (row as any).id as number}
      />
    </>
  )
}

export default TaskTable
