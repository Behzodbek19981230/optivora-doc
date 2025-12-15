import { useState } from 'react'
import { useRouter } from 'next/router'
import { Card, CardHeader, CardContent, Button, IconButton, Chip } from '@mui/material'
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import CustomAvatar from 'src/@core/components/mui/avatar'
import Icon from 'src/@core/components/icon'
import { useFetchList } from 'src/hooks/useFetchList'
import endpoints from 'src/configs/endpoints'
import { DataService } from 'src/configs/dataService'
import UserFormDialog from './dialogs/UserFormDialog'
import { getInitials } from 'src/@core/utils/get-initials'

export type User = {
  id: number
  username: string
  fullname: string
  is_active: boolean
  date_of_birthday?: string
  gender?: string
  phone_number?: string
  avatar?: string
  email: string
  role: string
  region: number
  district: number
  address?: string
  companies: number[] | string[]
  companies_detail?: Array<{ id?: number; name?: string; title?: string } | string | number>
}

const UserTable = () => {
  const router = useRouter()
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 })
  const {
    data = [],
    loading,
    mutate
  } = useFetchList<User>(endpoints.users, {
    perPage: paginationModel.pageSize,
    page: paginationModel.page + 1
  })
  const [open, setOpen] = useState(false)
  const [editItem, setEditItem] = useState<User | null>(null)

  const handleCreate = () => {
    setEditItem(null)
    setOpen(true)
  }
  const handleEdit = (item: User) => {
    setEditItem(item)
    setOpen(true)
  }
  const handleDelete = async (id: number) => {
    await DataService.delete(endpoints.userById(id))
    mutate()
  }

  const renderAvatar = (row: User) => {
    if (row.avatar) {
      return (
        <CustomAvatar
          src={row.avatar}
          variant='circular'
          sx={{
            mr: 2.5,
            width: 38,
            height: 38,
            borderRadius: '50%',
            '& img': { width: '100%', height: '100%', objectFit: 'cover' }
          }}
        />
      )
    }
    return (
      <CustomAvatar skin='light' color='primary' sx={{ mr: 2.5, width: 38, height: 38, fontWeight: 500 }}>
        {getInitials(row.fullname || row.username)}
      </CustomAvatar>
    )
  }

  const columns: GridColDef[] = [
    {
      field: 'fullname',
      headerName: 'F.I.Sh',
      flex: 0.25,
      minWidth: 220,
      renderCell: params => {
        const row = params.row as User
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {renderAvatar(row)}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 500 }}>{row.fullname || row.username}</span>
              <span style={{ color: 'gray', fontSize: 12 }}>{row.email}</span>
            </div>
          </div>
        )
      }
    },
    { field: 'username', headerName: 'Login', flex: 0.15, minWidth: 140 },
    { field: 'role', headerName: 'Rol', flex: 0.12, minWidth: 120 },
    { field: 'phone_number', headerName: 'Telefon', flex: 0.18, minWidth: 160 },
    {
      field: 'is_active',
      headerName: 'Faol',
      flex: 0.1,
      minWidth: 100,
      valueGetter: params => (params.row.is_active ? 'Ha' : 'Yo‘q')
    },
    {
      field: 'companies_detail',
      headerName: 'Kompaniyalar',
      flex: 0.35,
      minWidth: 260,
      sortable: false,
      renderCell: params => {
        const row = params.row as User
        const list = (row.companies_detail || []) as Array<
          { id?: number; name?: string; title?: string } | string | number
        >
        if (!list.length) return <span style={{ color: 'gray' }}>—</span>
        const maxToShow = 3
        const chips = list.slice(0, maxToShow).map((item, idx) => {
          let key = idx
          let label: string
          if (typeof item === 'string') {
            label = item
          } else if (typeof item === 'number') {
            label = String(item)
          } else {
            key = (item.id as number) ?? idx
            label = item.name || (item as any).company_name || item.title || `#${item.id}`
          }
          return <Chip key={key} size='small' label={label} sx={{ mr: 1, mb: 1 }} />
        })
        const extra = list.length - maxToShow
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
            {chips}
            {extra > 0 && <Chip size='small' label={`+${extra}`} sx={{ mb: 1 }} />}
          </div>
        )
      }
    },
    {
      field: 'actions',
      headerName: 'Amallar',
      flex: 0.18,
      minWidth: 160,
      sortable: false,
      renderCell: params => {
        const row = params.row as User
        return (
          <>
            <IconButton aria-label='view' onClick={() => router.push(`/users/view?id=${row.id}`)}>
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
        title='Foydalanuvchilar'
        action={
          <Button variant='contained' onClick={handleCreate}>
            Yaratish
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
          getRowId={row => (row as User).id}
        />
      </>

      {open && (
        <UserFormDialog
          open={open}
          onClose={() => setOpen(false)}
          onSaved={mutate}
          mode={editItem ? 'edit' : 'create'}
          item={
            editItem
              ? ({
                  ...editItem,
                  companies: (editItem.companies || []).map(c => (typeof c === 'string' ? Number(c) : c))
                } as any)
              : undefined
          }
        />
      )}
    </Card>
  )
}

export default UserTable
