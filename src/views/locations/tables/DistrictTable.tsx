import { useState } from 'react'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import { CardContent } from '@mui/material'
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'
const EditIcon = () => <span style={{ fontWeight: 'bold' }}>✏️</span>
const DeleteIcon = () => <span style={{ fontWeight: 'bold', color: 'red' }}>🗑️</span>
const AddIcon = () => <span style={{ fontWeight: 'bold' }}>＋</span>
import { TablePagination } from '@mui/material'
import DistrictFormDialog from '../dialogs/DistrictFormDialog'
import DeleteConfirmDialog from '../dialogs/DeleteConfirmDialog'
import IconifyIcon from 'src/@core/components/icon'
import endpoints from 'src/configs/endpoints'
import { useFetchList } from 'src/hooks/useFetchList'
import toast from 'react-hot-toast'
import { DataService } from 'src/configs/dataService'

const DistrictTable = () => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 })
  const [search, setSearch] = useState('')
  const {
    data = [],
    total,
    loading,
    mutate
  } = useFetchList<any>(endpoints.district, {
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
      // TODO: Replace with your actual DataService
      await DataService.delete(`/district/${selected.id}`)
      mutate()
      setOpenDelete(false)
      toast.success('Tuman muvaffaqiyatli o‘chirildi')
    }
  }

  return (
    <>
      <CardHeader
        title='Tumanlar'
        action={
          <Button variant='contained' startIcon={<AddIcon />} onClick={handleCreate}>
            Yangi tuman
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
              { field: 'code', headerName: 'Kod', flex: 0.12, minWidth: 100 },
              { field: 'name', headerName: 'Nomi', flex: 0.2, minWidth: 160 },
              { field: 'name_en', headerName: 'Nomi (EN)', flex: 0.18, minWidth: 140 },
              { field: 'name_uz', headerName: 'Nomi (UZ)', flex: 0.18, minWidth: 140 },
              { field: 'name_ru', headerName: 'Nomi (RU)', flex: 0.18, minWidth: 140 },
              {
                field: 'region_detail',
                headerName: 'Viloyat',
                flex: 0.2,
                minWidth: 160,
                valueGetter: params => params.row.region_detail?.name_uz || params.row.region
              },
              {
                field: 'actions',
                headerName: 'Amallar',
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
        />
      </>
      <DistrictFormDialog
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
        title='Tumanni o‘chirishni tasdiqlang'
        description={selected ? `“${selected.name_uz}” tumanini o‘chirmoqchimisiz?` : undefined}
      />
    </>
  )
}

export default DistrictTable
