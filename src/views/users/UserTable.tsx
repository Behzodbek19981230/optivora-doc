import { useState } from 'react'
import { useRouter } from 'next/router'
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import CustomAvatar from 'src/@core/components/mui/avatar'
import Icon from 'src/@core/components/icon'
import { useFetchList } from 'src/hooks/useFetchList'
import endpoints from 'src/configs/endpoints'
import { DataService } from 'src/configs/dataService'
import UserFormDialog from './dialogs/UserFormDialog'
import UserViewDialog from './dialogs/UserViewDialog'
import { getInitials } from 'src/@core/utils/get-initials'
import { useTranslation } from 'react-i18next'
import { getDataGridLocaleText } from 'src/@core/utils/getDataGridLocaleText'

type User = {
  id: number
  username: string
  fullname: string
  is_active: boolean
  date_of_birthday?: string
  gender?: string
  phone_number?: string
  avatar?: string
  email: string
  date_joined: string
  roles: number[]
  roles_detail?: Array<{ id: number; name: string; description: string }>
  region: number
  region_detail?: {
    id: number
    code: string
    name: string
    name_en: string
    name_uz: string
    name_ru: string
  }
  district: number
  district_detail?: {
    id: number
    code: string
    name: string
    name_en: string
    name_uz: string
    name_ru: string
    region: number
  }
  address?: string
  companies: number[]
  companies_detail?: Array<{
    id: number
    code: string
    name: string
    is_active: boolean
    phone: string
    country: number
    region: number
    district: number
    address: string
    created_time: string
    logo: string
  }>
}

const UserTable = () => {
  const { t } = useTranslation()
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
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewUser, setViewUser] = useState<User | null>(null)

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
            '& img': { width: '100%', height: '100%', objectFit: 'cover' },
            cursor: 'pointer'
          }}
          onClick={() => {
            setSelectedAvatar(row.avatar!)
            setAvatarDialogOpen(true)
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
      headerName: String(t('users.table.fullname')),
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
    { field: 'username', headerName: String(t('users.table.username')), flex: 0.15, minWidth: 140 },
    {
      field: 'role',
      headerName: String(t('users.table.role')),
      flex: 0.12,
      minWidth: 200,

      valueGetter: params => {
        const row = params.row as User
        const roles = row.roles_detail || []
        if (roles.length === 0) return ''

        return roles.map(r => r.name).join(', ')
      }
    },
    { field: 'phone_number', headerName: String(t('users.table.phone')), flex: 0.18, minWidth: 160 },
    {
      field: 'is_active',
      headerName: String(t('users.table.active')),
      flex: 0.1,
      minWidth: 100,
      valueGetter: params => (params.row.is_active ? String(t('common.yes')) : String(t('common.no')))
    },
    {
      field: 'companies_detail',
      headerName: String(t('users.table.companies')),
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
      headerName: String(t('common.actions')),
      flex: 0.18,
      minWidth: 160,
      sortable: false,
      renderCell: params => {
        const row = params.row as User

        return (
          <>
            <IconButton
              aria-label='view'
              onClick={() => {
                setViewUser(row)
                setViewDialogOpen(true)
              }}
            >
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
        title={String(t('users.title'))}
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
          getRowId={row => (row as User).id}
          localeText={getDataGridLocaleText(t)}
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

      <Dialog open={avatarDialogOpen} onClose={() => setAvatarDialogOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>{String(t('users.avatar.title'))}</DialogTitle>
        <DialogContent>
          {selectedAvatar && (
            <img
              src={selectedAvatar}
              alt='User Avatar'
              style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAvatarDialogOpen(false)}>{String(t('common.close'))}</Button>
        </DialogActions>
      </Dialog>

      <UserViewDialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} user={viewUser} />
    </Card>
  )
}

export default UserTable
