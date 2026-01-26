import { useState } from 'react'
import {
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CardActionArea,
  Typography,
  Box,
  Chip
} from '@mui/material'
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import { useRouter } from 'next/router'
import IconifyIcon from 'src/@core/components/icon'
import { useFetchList } from 'src/hooks/useFetchList'
import endpoints from 'src/configs/endpoints'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { DataService } from 'src/configs/dataService'
import useThemedToast from 'src/@core/hooks/useThemedToast'
import { useAuth } from 'src/hooks/useAuth'
import { getDataGridLocaleText } from 'src/@core/utils/getDataGridLocaleText'
import moment from 'moment'

export type DocumentRow = {
  company: number
  created_by: number
  department: number
  end_date: string
  id: number
  input_doc_number: string
  list_of_magazine: number
  name: string
  note: string
  output_doc_number: string
  priority: string
  sending_org: string
  respon_person: string
  signed_by: number
  start_date: string
  status: string
  task_form: number
  type: string
  updated_by: number
}

type Props = { status: string; ownerFilter?: 'mine' | 'all' }
const statusColor = (status?: string) => {
  switch (status) {
    case 'new':
      return 'error'
    case 'in_progress':
      return 'primary'
    case 'on_review':
      return 'warning'
    case 'returned':
      return 'warning'
    case 'done':
      return 'success'
    case 'cancelled':
      return 'error'
    case 'archive':
      return 'secondary'
    default:
      return 'default'
  }
}
const DocumentTable = ({ status, ownerFilter }: Props) => {
  const router = useRouter()
  const { t } = useTranslation()
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 })
  const toast = useThemedToast()
  const { user } = useAuth()

  const [createOpen, setCreateOpen] = useState(false)
  const [createType, setCreateType] = useState<'task' | 'application'>('task')
  const [creating, setCreating] = useState(false)

  const listEndpoint = ownerFilter === 'mine' ? endpoints.taskSelf : endpoints.task
  const params: any = { page: paginationModel.page + 1, limit: paginationModel.pageSize, status }

  const { data = [], total, loading } = useFetchList<DocumentRow>(listEndpoint, params)
  const onArchive = async (id: number) => {
    if (!confirm(String(t('documents.table.archiveConfirm')))) return
    try {
      await DataService.patch(endpoints.taskById(id.toString()) + '/archive/')
      toast.success(String(t('documents.table.archiveSuccess')))

      // Refresh data
      router.replace(router.asPath)
    } catch (e: any) {
      toast.error(e?.message || String(t('documents.table.archiveError')))
    }
  }

  const onDelete = async (id: number) => {
    if (!confirm(String(t('documents.table.deleteConfirm')))) return
    try {
      await DataService.delete(endpoints.taskById(id.toString()))
      toast.success(String(t('documents.table.deleteSuccess')))
      router.replace(router.asPath)
    } catch (e: any) {
      toast.error(e?.message || String(t('documents.table.deleteError')))
    }
  }

  const columns: GridColDef[] = [
    { field: 'input_doc_number', headerName: String(t('tasks.form.inputDocNumber')), flex: 0.2, minWidth: 150 },
    { field: 'name', headerName: String(t('documents.table.name')), flex: 0.3, minWidth: 180 },
    {
      field: 'status',
      headerName: String(t('documents.table.status')),
      flex: 0.2,
      minWidth: 140,
      renderCell: params => {
        const status = (params.row as any).status

        return (
          <Chip label={t(`documents.status.${status}`)} color={statusColor(status)} size='small' variant='outlined' />
        )
      }
    },
    {
      field: 'created_by',
      headerName: String(t('tasks.form.signedBy', { defaultValue: 'Signed by' })),
      flex: 0.2,
      minWidth: 150,
      renderCell: params => {
        const createdBy = (params.row as any).signed_by_detail

        return (
          <Box
            sx={{
              width: '100%',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              overflowWrap: 'anywhere',
              lineHeight: 1.2
            }}
          >
            {createdBy ? `${createdBy.fullname}` : ''}
          </Box>
        )
      }
    },
    {
      field: 'type',
      headerName: String(t('documents.table.type')),
      flex: 0.15,
      minWidth: 120,
      renderCell: params => {
        const type = (params.row as any).type

        return t(`tasks.type.${type}`)
      }
    },
    {
      field: 'priority',
      headerName: String(t('documents.table.priority')),
      flex: 0.15,
      minWidth: 120,
      renderCell: params => {
        const priority = (params.row as any).priority
        if (!priority) return ''

        return (
          <Chip
            label={t(`tasks.priority.${priority}`)}
            color={priority === 'ordinary' ? 'primary' : 'warning'}
            size='small'
          />
        )
      }
    },
    {
      field: 'start_date',
      headerName: String(t('documents.table.start')),
      flex: 0.15,
      minWidth: 130,
      renderCell: params => {
        const startDate = (params.row as any).start_date

        return moment(startDate).isValid() ? moment(startDate).format('DD.MM.YYYY HH:mm') : ''
      }
    },
    {
      field: 'end_date',
      headerName: String(t('documents.table.end')),
      flex: 0.15,
      minWidth: 130,
      renderCell: params => {
        const endDate = (params.row as any).end_date

        return moment(endDate).isValid() ? moment(endDate).format('DD.MM.YYYY HH:mm') : ''
      }
    },
    {
      field: 'actions',
      headerName: String(t('common.actions')),
      width: 180,
      sortable: false,
      renderCell: params => {
        const id = (params.row as any).id

        return (
          <Stack direction='row' spacing={1}>
            <Tooltip title={String(t('common.view'))}>
              <IconButton size='small' component={Link} href={`/tasks/view/${id}`}>
                <IconifyIcon icon='tabler:eye' />
              </IconButton>
            </Tooltip>
            {['new'].includes(status) && user?.role_detail?.some((role: any) => role.name === 'Manager') && (
              <Tooltip title={String(t('common.edit'))}>
                <IconButton size='small' component={Link} href={`/tasks/update/${id}`}>
                  <IconifyIcon icon='tabler:pencil' />
                </IconButton>
              </Tooltip>
            )}
            {user?.role_detail?.some((role: any) => role.name === 'Manager') && !['archive'].includes(status) && (
              <Tooltip title={String(t('documents.table.archive'))}>
                <IconButton size='small' onClick={() => onArchive(id)}>
                  <IconifyIcon icon='tabler:archive' />
                </IconButton>
              </Tooltip>
            )}
            {user?.role_detail?.some((role: any) => role.name === 'Manager') && ['new'].includes(status) && (
              <Tooltip title={String(t('common.delete'))}>
                <IconButton size='small' color='error' onClick={() => onDelete(id)}>
                  <IconifyIcon icon='tabler:trash' />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        )
      }
    }
  ]

  return (
    <Card variant='outlined'>
      <CardContent sx={{ pb: 0 }}>
        {status !== 'archive' && (
          <Stack direction='row' justifyContent='flex-end' sx={{ mb: 2 }}>
            {user?.role_detail?.some((role: any) => role.name !== 'Performer') && (
              <Button variant='contained' onClick={() => setCreateOpen(true)}>
                {String(t('tasks.create.title'))}
              </Button>
            )}
          </Stack>
        )}

        <Dialog open={createOpen} onClose={creating ? undefined : () => setCreateOpen(false)} fullWidth maxWidth='sm'>
          <DialogTitle>{String(t('tasks.create.modal.title'))}</DialogTitle>
          <DialogContent>
            <Typography variant='body2' sx={{ color: 'text.secondary', mb: 4 }}>
              {String(t('tasks.create.modal.subtitle'))}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Card
                  variant='outlined'
                  sx={{
                    borderColor: createType === 'task' ? 'primary.main' : 'divider',
                    bgcolor: createType === 'task' ? 'primary.lighter' : 'background.paper'
                  }}
                >
                  <CardActionArea onClick={() => setCreateType('task')}>
                    <CardContent sx={{ height: 100 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <IconifyIcon icon='tabler:clipboard-list' />
                        <Typography variant='h6'>{String(t('tasks.type.task'))}</Typography>
                      </Box>
                      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                        {String(t('tasks.create.modal.taskHint'))}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card
                  variant='outlined'
                  sx={{
                    borderColor: createType === 'application' ? 'primary.main' : 'divider',
                    bgcolor: createType === 'application' ? 'primary.lighter' : 'background.paper'
                  }}
                >
                  <CardActionArea onClick={() => setCreateType('application')}>
                    <CardContent sx={{ height: 100 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <IconifyIcon icon='tabler:file-text' />
                        <Typography variant='h6'>{String(t('tasks.type.application'))}</Typography>
                      </Box>
                      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                        {String(t('tasks.create.modal.applicationHint'))}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button variant='tonal' color='secondary' onClick={() => setCreateOpen(false)} disabled={creating}>
              {String(t('common.cancel'))}
            </Button>
            <Button
              variant='contained'
              onClick={async () => {
                try {
                  setCreating(true)
                  const res = await DataService.post(endpoints.task, {
                    type: createType,
                    status: 'new',
                    company: user?.company_id
                  })
                  const id = (res.data as any)?.id
                  toast.success(String(t('tasks.toast.created')))
                  setCreateOpen(false)
                  if (id) router.push(`/tasks/update/${id}`)
                } catch (e: any) {
                  toast.error(e?.message || String(t('tasks.toast.createError')))
                } finally {
                  setCreating(false)
                }
              }}
              disabled={creating}
            >
              {creating ? String(t('common.creating')) : String(t('common.create'))}
            </Button>
          </DialogActions>
        </Dialog>

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
          localeText={{
            ...getDataGridLocaleText(t),
            noRowsLabel: String(t('documents.table.emptyForStatus', { status: t(`documents.status.${status}`) }))
          }}
        />
      </CardContent>
    </Card>
  )
}

export default DocumentTable
