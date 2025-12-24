import { useState } from 'react'
import { useRouter } from 'src/spa/router/useRouter'
import { useFetchList } from 'src/hooks/useFetchList'
import { DataService } from 'src/configs/dataService'
import endpoints from 'src/configs/endpoints'
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography
} from '@mui/material'
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'

import Icon from 'src/@core/components/icon'
import CompanyFormDialog from './dialogs/CompanyFormDialog'
import CompanyViewDialog from './dialogs/CompanyViewDialog'
import CustomAvatar from 'src/@core/components/mui/avatar'
import { getInitials } from 'src/@core/utils/get-initials'
import { useTranslation } from 'react-i18next'
import { getDataGridLocaleText } from 'src/@core/utils/getDataGridLocaleText'

type Company = {
  id: number
  code: string
  name: string
  is_active: boolean
  phone: string
  country: number
  region: number
  district: number
  address: string
  created_by: number
  logo?: string
}

const CompanyTable = () => {
  const router = useRouter()
  const { t } = useTranslation()
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 })
  const {
    data = [],
    loading,
    mutate
  } = useFetchList<Company>(endpoints.company, {
    perPage: paginationModel.pageSize,
    page: paginationModel.page + 1
  })
  const [open, setOpen] = useState(false)
  const [editItem, setEditItem] = useState<Company | null>(null)
  const [openView, setOpenView] = useState(false)
  const [viewId, setViewId] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteItem, setDeleteItem] = useState<Company | null>(null)

  const handleCreate = () => {
    setEditItem(null)
    setOpen(true)
  }

  const handleEdit = (item: Company) => {
    setEditItem(item)
    setOpen(true)
  }

  const handleDelete = (item: Company) => {
    setDeleteItem(item)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (deleteItem) {
      await DataService.delete(endpoints.companyById(deleteItem.id))
      mutate()
      setDeleteDialogOpen(false)
      setDeleteItem(null)
    }
  }

  const columns: GridColDef[] = [
    { field: 'code', headerName: String(t('company.table.code')), flex: 0.15, minWidth: 120 },
    { field: 'name', headerName: String(t('company.table.name')), flex: 0.25, minWidth: 180 },
    {
      field: 'is_active',
      headerName: String(t('company.table.active')),
      flex: 0.1,
      minWidth: 100,
      valueGetter: params => (params.row.is_active ? String(t('common.yes')) : String(t('common.no')))
    },
    { field: 'phone', headerName: String(t('company.table.phone')), flex: 0.2, minWidth: 160 },
    {
      field: 'country',
      headerName: String(t('company.form.country')),
      flex: 0.12,
      minWidth: 120,
      valueGetter: params => (params.row as any).country_detail?.name || params.row.country
    },
    {
      field: 'region',
      headerName: String(t('company.table.region')),
      flex: 0.12,
      minWidth: 120,
      valueGetter: params => (params.row as any).region_detail?.name_uz || params.row.region
    },
    {
      field: 'district',
      headerName: String(t('company.table.district')),
      flex: 0.12,
      minWidth: 120,
      valueGetter: params => (params.row as any).district_detail?.name_uz || params.row.district
    },
    { field: 'address', headerName: String(t('company.table.address')), flex: 0.3, minWidth: 220 },
    {
      field: 'logo',
      headerName: String(t('company.table.logo')),
      flex: 0.15,
      minWidth: 140,
      renderCell: params => {
        const row = params.row as Company
        return (
          <CustomAvatar
            src={row.logo}
            variant='circular'
            sx={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              '& img': { width: '100%', height: '100%', objectFit: 'cover' }
            }}
          >
            {getInitials(row.name)}
          </CustomAvatar>
        )
      }
    },
    {
      field: 'actions',
      headerName: String(t('common.actions')),
      sortable: false,
      flex: 0.15,
      minWidth: 140,
      renderCell: params => {
        const row = params.row as Company
        return (
          <>
            <IconButton
              aria-label='view'
              onClick={() => {
                setViewId(row.id)
                setOpenView(true)
              }}
            >
              <Icon icon='tabler:eye' />
            </IconButton>
            <IconButton aria-label='edit' onClick={() => handleEdit(row)}>
              <Icon icon='tabler:edit' />
            </IconButton>
            <IconButton aria-label='delete' color='error' onClick={() => handleDelete(row)}>
              <Icon icon='tabler:trash' />
            </IconButton>
          </>
        )
      }
    }
  ]
  return (
    <Card>
      <CardHeader
        title={String(t('company.title'))}
        action={
          <Button variant='contained' onClick={handleCreate}>
            {String(t('common.create'))}
          </Button>
        }
      />
      <>
        <DataGrid
          autoHeight
          rowHeight={56}
          rows={data}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          getRowId={row => (row as Company).id}
          localeText={getDataGridLocaleText(t)}
        />
      </>

      {open && (
        <CompanyFormDialog
          open={open}
          onClose={() => setOpen(false)}
          onSaved={mutate}
          mode={editItem ? 'edit' : 'create'}
          item={editItem || undefined}
        />
      )}

      {openView && <CompanyViewDialog open={openView} onClose={() => setOpenView(false)} id={viewId} />}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{String(t('common.deleteConfirm.title'))}</DialogTitle>
        <DialogContent>
          <Typography>
            {String(t('common.deleteConfirm.description'))} "{deleteItem?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{String(t('common.cancel'))}</Button>
          <Button onClick={confirmDelete} color='error' variant='contained'>
            {String(t('common.delete'))}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default CompanyTable
