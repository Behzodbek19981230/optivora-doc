import { useState } from 'react'
import { Stack, Button, IconButton, Tooltip, CardHeader, Card } from '@mui/material'
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import endpoints from 'src/configs/endpoints'
import { useFetchList } from 'src/hooks/useFetchList'
import IconifyIcon from 'src/@core/components/icon'
import { DataService } from 'src/configs/dataService'
import useThemedToast from 'src/@core/hooks/useThemedToast'
import DocumentFormDialog from './dialogs/DocumentFormDialog'

type DocForm = {
  id?: number
  name: string
  name_en: string
  name_uz: string
  name_ru: string
}

const DocumentFormTable = () => {
  const toast = useThemedToast()
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 })
  const [open, setOpen] = useState(false)
  const [editItem, setEditItem] = useState<DocForm | null>(null)
  const handleCreate = () => {
    setEditItem(null)
    setOpen(true)
  }

  const {
    data = [],
    total,
    loading,
    mutate
  } = useFetchList<DocForm>(endpoints.documentForm, {
    page: paginationModel.page + 1,
    perPage: paginationModel.pageSize
  })

  const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 0.25, minWidth: 160 },
    { field: 'name_en', headerName: 'Name (EN)', flex: 0.2, minWidth: 140 },
    { field: 'name_uz', headerName: 'Name (UZ)', flex: 0.2, minWidth: 140 },
    { field: 'name_ru', headerName: 'Name (RU)', flex: 0.2, minWidth: 140 },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.15,
      minWidth: 130,
      sortable: false,
      renderCell: params => {
        const row = params.row as DocForm
        return (
          <Stack direction='row' spacing={1}>
            <Tooltip title='Edit'>
              <IconButton
                size='small'
                onClick={() => {
                  setEditItem(row)
                  setOpen(true)
                }}
              >
                <IconifyIcon icon='tabler:edit' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Delete'>
              <IconButton
                size='small'
                color='error'
                onClick={async () => {
                  await DataService.delete(endpoints.documentFormById(row.id as number))
                  toast.success('Deleted')
                  mutate()
                }}
              >
                <IconifyIcon icon='tabler:trash' />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      }
    }
  ]

  return (
    <Card>
      <CardHeader
        title='Hujjat shakllari'
        action={
          <Button variant='contained' onClick={handleCreate}>
            Yaratish
          </Button>
        }
      />

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

      <DocumentFormDialog
        open={open}
        item={editItem}
        onClose={() => setOpen(false)}
        onSaved={() => {
          setOpen(false)
          mutate()
        }}
      />
    </Card>
  )
}

export default DocumentFormTable
