import { useState } from 'react'
import { Card, CardHeader, CardContent, Button, IconButton } from '@mui/material'
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import IconifyIcon from 'src/@core/components/icon'
import endpoints from 'src/configs/endpoints'
import { useFetchList } from 'src/hooks/useFetchList'
import { DataService } from 'src/configs/dataService'
import toast from 'react-hot-toast'
import DeleteConfirmDialog from './dialogs/DeleteConfirmDialog'
import { CommandType } from 'src/types/command'
import { useRouter } from 'next/router'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

const CommandTable = () => {
  const router = useRouter()
  const { t } = useTranslation()
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 })
  const {
    data = [],
    total,
    loading,
    mutate
  } = useFetchList<CommandType>(endpoints.command, {
    page: paginationModel.page + 1,
    perPage: paginationModel.pageSize
  })
  const [selected, setSelected] = useState<any | null>(null)
  const [openDelete, setOpenDelete] = useState(false)

  const handleEdit = (item: any) => {
    router.push(`/commands/${item.id}`)
  }
  const handleDelete = (item: any) => {
    setSelected(item)
    setOpenDelete(true)
  }
  const handleDeleteConfirm = async () => {
    if (selected) {
      // TODO: Replace with your actual DataService
      await DataService.delete(endpoints.commandById(selected.id))
      mutate()
      setOpenDelete(false)
      toast.success(String(t('commands.toast.deleted')))
    }
  }

  const columns: GridColDef[] = [
    { field: 'command_number', headerName: String(t('commands.table.number')), flex: 0.18, minWidth: 160 },
    { field: 'basis', headerName: String(t('commands.table.basis')), flex: 0.3, minWidth: 240 },
    { field: 'comment', headerName: String(t('commands.table.comment')), flex: 0.25, minWidth: 200 },
    {
      field: 'company_detail',
      headerName: String(t('commands.table.company')),
      flex: 0.18,
      minWidth: 160,
      valueGetter: params => (params.row.company_detail ? params.row.company_detail.name : '')
    },
    {
      field: 'created_time',
      headerName: String(t('commands.table.createdAt')),
      flex: 0.2,
      minWidth: 180,
      valueGetter: params => (params.row.created_time ? moment(params.row.created_time).format('YYYY-MM-DD HH:mm') : '')
    },
    {
      field: 'actions',
      headerName: String(t('common.actions')),
      flex: 0.18,
      minWidth: 160,
      sortable: false,
      renderCell: params => {
        const row = params.row as CommandType
        return (
          <>
            <IconButton size='small' aria-label='edit' onClick={() => handleEdit(row)}>
              <IconifyIcon icon='tabler:edit' />
            </IconButton>
            <IconButton size='small' aria-label='delete' color='error' onClick={() => handleDelete(row)}>
              <IconifyIcon icon='tabler:trash' />
            </IconButton>
          </>
        )
      }
    }
  ]

  return (
    <Card>
      <CardHeader
        title={String(t('commands.title'))}
        action={
          <Button variant='contained' onClick={() => router.push('/commands/create')}>
            {String(t('commands.create.title'))}
          </Button>
        }
      />
      <>
        <DataGrid
          autoHeight
          rowHeight={56}
          rows={data as any[]}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          getRowId={row => (row as CommandType).id as number}
        />
      </>

      <DeleteConfirmDialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={handleDeleteConfirm}
        title={String(t('commands.deleteConfirm.title'))}
        description={selected ? `ID: ${selected.id}` : undefined}
      />
    </Card>
  )
}

export default CommandTable
