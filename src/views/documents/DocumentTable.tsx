import { useState } from 'react'
import { Card, CardContent, IconButton, Tooltip, Stack, Button } from '@mui/material'
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import { useRouter } from 'next/router'
import IconifyIcon from 'src/@core/components/icon'
import { useFetchList } from 'src/hooks/useFetchList'
import endpoints from 'src/configs/endpoints'
import { DocumentStatus } from './DocumentTabs'

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
    { field: 'input_doc_number', headerName: 'Input Doc No', flex: 0.2, minWidth: 160 },
    { field: 'output_doc_number', headerName: 'Output Doc No', flex: 0.2, minWidth: 160 },
    { field: 'name', headerName: 'Title', flex: 0.35, minWidth: 240 },
    { field: 'status', headerName: 'Status', flex: 0.16, minWidth: 130 },
    { field: 'type', headerName: 'Type', flex: 0.14, minWidth: 120 },
    { field: 'priority', headerName: 'Priority', flex: 0.14, minWidth: 120 },
    { field: 'company', headerName: 'Company', flex: 0.16, minWidth: 130 },
    { field: 'department', headerName: 'Department', flex: 0.16, minWidth: 130 },
    { field: 'task_form', headerName: 'Task Form', flex: 0.16, minWidth: 130 },
    { field: 'list_of_magazine', headerName: 'Magazine', flex: 0.16, minWidth: 130 },
    { field: 'sending_org', headerName: 'Sending Org', flex: 0.22, minWidth: 180 },
    { field: 'sending_respon_person', headerName: 'Sender Person', flex: 0.22, minWidth: 180 },
    { field: 'signed_by', headerName: 'Signed By', flex: 0.14, minWidth: 120 },
    { field: 'start_date', headerName: 'Start Date', flex: 0.16, minWidth: 150 },
    { field: 'end_date', headerName: 'End Date', flex: 0.16, minWidth: 150 },
    { field: 'created_by', headerName: 'Created By', flex: 0.14, minWidth: 120 },
    { field: 'updated_by', headerName: 'Updated By', flex: 0.14, minWidth: 120 },
    { field: 'note', headerName: 'Note', flex: 0.4, minWidth: 240 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.18,
      minWidth: 130,
      sortable: false,
      renderCell: params => {
        const row = params.row as any
        return (
          <Tooltip title='View'>
            <IconButton size='small' onClick={() => router.push(`/tasks/view/${row.id}`)}>
              <IconifyIcon icon='tabler:eye' />
            </IconButton>
          </Tooltip>
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
