import { useState } from 'react'
import { Card, CardContent, IconButton, Tooltip } from '@mui/material'
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import { useRouter } from 'next/router'
import IconifyIcon from 'src/@core/components/icon'
import { useFetchList } from 'src/hooks/useFetchList'
import endpoints from 'src/configs/endpoints'
import { DocumentStatus } from './DocumentTabs'

// Placeholder table. Wire to real endpoint when available.

type Props = { status: DocumentStatus }

const DocumentTable = ({ status }: Props) => {
  const router = useRouter()
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 })

  const {
    data = [],
    total,
    loading
  } = useFetchList<any>(endpoints.documents, {
    page: paginationModel.page + 1,
    perPage: paginationModel.pageSize,
    status
  })

  const columns: GridColDef[] = [
    { field: 'number', headerName: 'Document No', flex: 0.2, minWidth: 160 },
    { field: 'title', headerName: 'Title', flex: 0.35, minWidth: 240 },
    { field: 'company', headerName: 'Company', flex: 0.2, minWidth: 160 },
    { field: 'created_time', headerName: 'Created', flex: 0.2, minWidth: 160 },
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
            <IconButton size='small' onClick={() => router.push(`/documents/view/${row.id}`)}>
              <IconifyIcon icon='tabler:eye' />
            </IconButton>
          </Tooltip>
        )
      }
    }
  ]

  return (
    <Card variant='outlined'>
      <>
        <DataGrid
          autoHeight
          rowHeight={56}
          rows={data}
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
      </>
    </Card>
  )
}

export default DocumentTable
