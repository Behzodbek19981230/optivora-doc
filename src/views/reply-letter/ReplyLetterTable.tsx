import { useState } from 'react'
import { Card, CardHeader, IconButton, Button } from '@mui/material'
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import IconifyIcon from 'src/@core/components/icon'
import { getDataGridLocaleText } from 'src/@core/utils/getDataGridLocaleText'
import endpoints from 'src/configs/endpoints'
import { useFetchList } from 'src/hooks/useFetchList'
import { DataService } from 'src/configs/dataService'
import toast from 'react-hot-toast'
import { useRouter } from 'src/spa/router/useRouter'
import DeleteConfirmDialog from 'src/views/locations/dialogs/DeleteConfirmDialog'
import { useTranslation } from 'react-i18next'

const ReplyLetterTable = () => {
  const router = useRouter()
  const { t } = useTranslation()
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 })
  const [selected, setSelected] = useState<any | null>(null)
  const [openDelete, setOpenDelete] = useState(false)

  const {
    data = [],
    loading,
    mutate
  } = useFetchList(endpoints.replyLetter, {
    page: paginationModel.page + 1,
    perPage: paginationModel.pageSize
  })

  const handleEdit = (item: any) => {
    router.push(`/reply-letter/${item.id}`)
  }

  const handleDelete = (item: any) => {
    setSelected(item)
    setOpenDelete(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selected) return
    await DataService.delete(endpoints.replyLetterById(selected.id))
    mutate()
    setOpenDelete(false)
    toast.success(String(t('replyLetter.toast.deleted')))
  }

  const localeText = getDataGridLocaleText(t)

  const columns: GridColDef[] = [
    { field: 'letter_number', headerName: String(t('replyLetter.table.letterNumber')), flex: 0.18, minWidth: 140 },
    { field: 'basis', headerName: String(t('replyLetter.table.basis')), flex: 0.3, minWidth: 220 },
    {
      field: 'responsible_person',
      headerName: String(t('replyLetter.table.responsiblePerson')),
      flex: 0.2,
      minWidth: 160,
      valueGetter: params =>
        params.row.responsible_person_detail
          ? params.row.responsible_person_detail.fullname
          : params.row.responsible_person
    },
    {
      field: 'organization',
      headerName: String(t('replyLetter.table.company')),
      flex: 0.2,
      minWidth: 160
    },
    {
      field: 'actions',
      headerName: String(t('common.actions')),
      flex: 0.18,
      minWidth: 160,
      sortable: false,
      renderCell: params => {
        const row = params.row as any

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
        title={String(t('replyLetter.title'))}
        action={
          <Button variant='contained' onClick={() => router.push('/reply-letter/create')}>
            {String(t('replyLetter.create.title'))}
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
          getRowId={row => (row as any).id as number}
          localeText={localeText}
        />
      </>

      <DeleteConfirmDialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={handleDeleteConfirm}
        title={String(t('replyLetter.deleteConfirm.title'))}
        description={selected ? `ID: ${selected.id}` : undefined}
      />
    </Card>
  )
}

export default ReplyLetterTable
