import { useState } from 'react'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'
const AddIcon = () => <span style={{ fontWeight: 'bold' }}>＋</span>
import CountryFormDialog from '../dialogs/CountryFormDialog'
import DeleteConfirmDialog from '../dialogs/DeleteConfirmDialog'
import IconifyIcon from 'src/@core/components/icon'
import endpoints from 'src/configs/endpoints'
import { useFetchList } from 'src/hooks/useFetchList'
import { useTranslation } from 'react-i18next'
import { getDataGridLocaleText } from 'src/@core/utils/getDataGridLocaleText'

const CountryTable = () => {
  const { t } = useTranslation()
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 })
  const [search, setSearch] = useState('')
  const {
    data = [],
    total,
    loading,
    mutate
  } = useFetchList<any>(endpoints.country, {
    page: paginationModel.page + 1,
    perPage: paginationModel.pageSize,
    search
  })
  console.log(data)

  const [openForm, setOpenForm] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [selected, setSelected] = useState<any | null>(null)
  const [openDelete, setOpenDelete] = useState(false)

  const handleCreate = () => {
    setFormMode('create')
    setSelected(null)
    setOpenForm(true)
  }
  const handleEdit = (item: any) => {
    setFormMode('edit')
    setSelected(item)
    setOpenForm(true)
  }
  const handleDelete = (item: any) => {
    setSelected(item)
    setOpenDelete(true)
  }
  const handleDeleteConfirm = async () => {
    if (selected) {
      // TODO: Replace with your actual DataService
      // await DataService.delete(`/country/${selected.id}`)
      mutate()
      setOpenDelete(false)
    }
  }

  return (
    <>
      <CardHeader
        title={String(t('locations.countries.title'))}
        action={
          <Button variant='contained' startIcon={<AddIcon />} onClick={handleCreate}>
            {String(t('locations.countries.create'))}
          </Button>
        }
      />
      <>
        <DataGrid
          autoHeight
          rowHeight={56}
          rows={data}
          columns={
            [
              { field: 'code', headerName: String(t('chooseCompany.code')), flex: 0.12, minWidth: 100 },
              { field: 'name_en', headerName: String(t('common.nameEn')), flex: 0.18, minWidth: 140 },
              { field: 'name_uz', headerName: String(t('common.nameUz')), flex: 0.18, minWidth: 140 },
              { field: 'name_ru', headerName: String(t('common.nameRu')), flex: 0.18, minWidth: 140 },
              {
                field: 'actions',
                headerName: String(t('common.actions')),
                flex: 0.16,
                minWidth: 140,
                sortable: false,
                renderCell: params => {
                  const row = params.row as any
                  return (
                    <>
                      <IconButton size='small' onClick={() => handleEdit(row)}>
                        <IconifyIcon icon='tabler:edit' />
                      </IconButton>
                      <IconButton size='small' color='error' onClick={() => handleDelete(row)}>
                        <IconifyIcon icon='tabler:trash' />
                      </IconButton>
                    </>
                  )
                }
              }
            ] as GridColDef[]
          }
          loading={loading}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          getRowId={row => (row as any).id as number}
          localeText={getDataGridLocaleText(t)}
        />
      </>
      <CountryFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSaved={mutate}
        mode={formMode}
        item={selected}
      />
      <DeleteConfirmDialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={handleDeleteConfirm}
        title={String(t('locations.countries.deleteConfirm.title'))}
        description={
          selected
            ? String(
                t('locations.countries.deleteConfirm.description', {
                  name: selected.name_uz || selected.name,
                  id: selected.id
                })
              )
            : undefined
        }
      />
    </>
  )
}

export default CountryTable
