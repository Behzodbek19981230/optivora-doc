import { useState } from 'react'
import { useRouter } from 'next/router'
import { useFetchList } from 'src/hooks/useFetchList'
import { DataService } from 'src/configs/dataService'
import endpoints from 'src/configs/endpoints'
import { Card, CardHeader, CardContent, Button, IconButton } from '@mui/material'
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'

import Icon from 'src/@core/components/icon'
import CompanyFormDialog from './dialogs/CompanyFormDialog'
import CustomAvatar from 'src/@core/components/mui/avatar'
import { getInitials } from 'src/@core/utils/get-initials'

type Company = {
  id: number
  code: string
  name: string
  is_active: boolean
  phone: string
  region: number
  district: number
  address: string
  created_by: number
  logo?: string
}

const CompanyTable = () => {
  const router = useRouter()
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

  const handleCreate = () => {
    setEditItem(null)
    setOpen(true)
  }

  const handleEdit = (item: Company) => {
    setEditItem(item)
    setOpen(true)
  }

  const handleDelete = async (id: number) => {
    await DataService.delete(endpoints.companyById(id))
    mutate()
  }

  const columns: GridColDef[] = [
    { field: 'code', headerName: 'Kod', flex: 0.15, minWidth: 120 },
    { field: 'name', headerName: 'Nomi', flex: 0.25, minWidth: 180 },
    {
      field: 'is_active',
      headerName: 'Faol',
      flex: 0.1,
      minWidth: 100,
      valueGetter: params => (params.row.is_active ? 'Ha' : 'Yo‘q')
    },
    { field: 'phone', headerName: 'Telefon', flex: 0.2, minWidth: 160 },
    { field: 'region', headerName: 'Viloyat', flex: 0.1, minWidth: 100 },
    { field: 'district', headerName: 'Tuman', flex: 0.1, minWidth: 100 },
    { field: 'address', headerName: 'Manzil', flex: 0.3, minWidth: 220 },
    {
      field: 'logo',
      headerName: 'Logo',
      flex: 0.2,
      minWidth: 160,
      renderCell: params => {
        return <img src={params.value} alt='Logo' style={{ width: 100, height: 50, objectFit: 'contain' }} />
      }
    },
    {
      field: 'actions',
      headerName: 'Amallar',
      sortable: false,
      flex: 0.15,
      minWidth: 140,
      renderCell: params => {
        const row = params.row as Company
        return (
          <>
            <IconButton aria-label='view' onClick={() => router.push(`/company/view?id=${row.id}`)}>
              <Icon icon='tabler:eye' />
            </IconButton>
            <IconButton aria-label='edit' onClick={() => handleEdit(row)}>
              <Icon icon='tabler:edit' />
            </IconButton>
            <IconButton aria-label='delete' color='error' onClick={() => handleDelete(row.id)}>
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
        title='Kompaniyalar'
        action={
          <Button variant='contained' onClick={handleCreate}>
            Yaratish
          </Button>
        }
      />
      <CardContent>
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
        />
      </CardContent>

      {open && (
        <CompanyFormDialog
          open={open}
          onClose={() => setOpen(false)}
          onSaved={mutate}
          mode={editItem ? 'edit' : 'create'}
          item={editItem || undefined}
        />
      )}
    </Card>
  )
}

export default CompanyTable
