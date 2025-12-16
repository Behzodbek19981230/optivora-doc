import { useState } from 'react'
import { Card, CardContent, IconButton, Tooltip, Stack, Button } from '@mui/material'
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import { useRouter } from 'next/router'
import IconifyIcon from 'src/@core/components/icon'
import { useFetchList } from 'src/hooks/useFetchList'
import endpoints from 'src/configs/endpoints'
import { DocumentStatus } from './DocumentTabs'
import Link from 'next/link'

export type DocumentRow = {
  company: number
  created_by: number
  department: number
  end_date: string
  id: number
  input_doc_number: string
  list_of_magazine: number
  name: string
  note: string
  output_doc_number: string
  priority: string
  sending_org: string
  sending_respon_person: string
  signed_by: number
  start_date: string
  status: string
  task_form: number
  type: string
  updated_by: number
}

type Props = { status: DocumentStatus }

const DocumentTable = ({ status }: Props) => {
  const router = useRouter()
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 })

  const {
    data = [],
    total,
    loading
  } = useFetchList<DocumentRow>(endpoints.task, {
    page: paginationModel.page + 1,
    perPage: paginationModel.pageSize,
    status
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
            <Tooltip title='Edit'>
              <IconButton size='small' component={Link} href={`/tasks/update/${id}`}>
                <IconifyIcon icon='tabler:pencil' />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      }
    }
  ]

  return (
    <Card variant='outlined'>
      <CardContent sx={{ pb: 0 }}>
        <Stack direction='row' justifyContent='flex-end' sx={{ mb: 2 }}>
          <Button variant='contained' onClick={() => router.push('/tasks/create')}>
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
          localeText={{ noRowsLabel: `No documents for status: "${status}"` }}
        />
      </CardContent>
    </Card>
  )
}

export default DocumentTable
