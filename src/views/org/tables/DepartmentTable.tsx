import { useState } from 'react'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import { CardContent } from '@mui/material'
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import DeleteConfirmDialog from 'src/views/locations/dialogs/DeleteConfirmDialog'
import Icon from 'src/@core/components/icon'
import endpoints from 'src/configs/endpoints'
import { useFetchList } from 'src/hooks/useFetchList'
import { DataService } from 'src/configs/dataService'
import toast from 'react-hot-toast'
import DepartmentFormDialog from '../dialogs/DepartmentFormDialog'
import { useTranslation } from 'react-i18next'
import { getDataGridLocaleText } from 'src/@core/utils/getDataGridLocaleText'

const DepartmentTable = () => {
  const { t } = useTranslation()
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 })
  const [search, setSearch] = useState('')
  const {
    data = [],
    total,
    loading,
    mutate
  } = useFetchList<any>(endpoints.department, {
    page: paginationModel.page + 1,
    perPage: paginationModel.pageSize,
    search
  })
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
      await DataService.delete(endpoints.departmentById(selected.id))
      mutate()
      setOpenDelete(false)
      toast.success(String(t('org.departments.toast.deleted')))
    }
  }

  return (
    <>
      <CardHeader
        title={String(t('org.departments.title'))}
        action={
          <Button variant='contained' startIcon={<Icon icon='tabler:plus' />} onClick={handleCreate}>
            {String(t('org.departments.create.title'))}
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
              { field: 'name', headerName: String(t('org.departments.table.name')), flex: 0.25, minWidth: 200 },
              { field: 'name_en', headerName: String(t('org.common.nameEn')), flex: 0.2, minWidth: 160 },
              { field: 'name_uz', headerName: String(t('org.common.nameUz')), flex: 0.2, minWidth: 160 },
              { field: 'name_ru', headerName: String(t('org.common.nameRu')), flex: 0.2, minWidth: 160 },
              {
                field: 'actions',
                headerName: String(t('common.actions')),
                flex: 0.15,
                minWidth: 140,
                sortable: false,
                renderCell: params => {
                  const row = params.row as any
                  return (
                    <>
                      <IconButton size='small' onClick={() => handleEdit(row)}>
                        <Icon icon='tabler:edit' />
                      </IconButton>
                      <IconButton size='small' color='error' onClick={() => handleDelete(row)}>
                        <Icon icon='tabler:trash' />
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
      <DepartmentFormDialog
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
        title={String(t('org.departments.deleteConfirm.title'))}
        description={
          selected
            ? String(
                t('org.departments.deleteConfirm.description', {
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

export default DepartmentTable
