import { useState } from 'react'
import {
  Stack,
  Button,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box
} from '@mui/material'
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import endpoints from 'src/configs/endpoints'
import { useFetchList } from 'src/hooks/useFetchList'
import IconifyIcon from 'src/@core/components/icon'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { DataService } from 'src/configs/dataService'
import useThemedToast from 'src/@core/hooks/useThemedToast'
import { useAuth } from 'src/hooks/useAuth'

export type TaskRow = {
  id: number
  name: string
  status: string
  type: string
  priority: string
  start_date: string
  end_date: string
}

const TaskTable = () => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 })
  const router = useRouter()
  const { t } = useTranslation()
  const toast = useThemedToast()
  const { user } = useAuth()

  const [createOpen, setCreateOpen] = useState(false)
  const [createType, setCreateType] = useState<'task' | 'application'>('task')
  const [creating, setCreating] = useState(false)
  const {
    data = [],
    total,
    loading
  } = useFetchList<TaskRow>(endpoints.task, {
    page: paginationModel.page + 1,
    perPage: paginationModel.pageSize
  })

  const columns: GridColDef[] = [
    { field: 'id', headerName: String(t('common.id')), width: 90 },
    { field: 'name', headerName: String(t('tasks.table.name')), flex: 0.3, minWidth: 180 },
    { field: 'status', headerName: String(t('tasks.table.status')), flex: 0.2, minWidth: 140 },
    { field: 'type', headerName: String(t('tasks.table.type')), flex: 0.15, minWidth: 120 },
    { field: 'priority', headerName: String(t('tasks.table.priority')), flex: 0.15, minWidth: 120 },
    { field: 'start_date', headerName: String(t('tasks.table.start')), flex: 0.15, minWidth: 130 },
    { field: 'end_date', headerName: String(t('tasks.table.end')), flex: 0.15, minWidth: 130 },
    {
      field: 'actions',
      headerName: String(t('common.actions')),
      width: 120,
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
            <Tooltip title={String(t('common.edit'))}>
              <IconButton size='small' component={Link} href={`/tasks/update/${id}`}>
                <IconifyIcon icon='tabler:pencil' />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      }
    }
  ]

  return (
    <>
      <Stack direction='row' justifyContent='flex-end' sx={{ mb: 2 }}>
        <Button variant='contained' startIcon={<IconifyIcon icon='tabler:plus' />} onClick={() => setCreateOpen(true)}>
          {String(t('tasks.create.title'))}
        </Button>
      </Stack>

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
                // Create a minimal task and move user to the full update form.
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
      />
    </>
  )
}

export default TaskTable
