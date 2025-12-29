import { useEffect, useState } from 'react'
import { Autocomplete, Box, Stack, Typography, Divider, Button, Grid, Chip } from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { DataService } from 'src/configs/dataService'
import endpoints from 'src/configs/endpoints'
import CustomTextField from 'src/@core/components/mui/text-field'
import { useFetchList } from 'src/hooks/useFetchList'

type Props = { taskId: string }

type Part = {
  id: number
  title: string
  status: string
  department: number
  assignee: number
  start_date: string
  end_date: string
  note: string
}

const TaskPartPanel = ({ taskId }: Props) => {
  const [parts, setParts] = useState<Part[]>([])
  const [selected, setSelected] = useState<Part | null>(null)
  const [quickAssignee, setQuickAssignee] = useState<number>(0)
  const { control, handleSubmit, reset } = useForm<Part>({
    defaultValues: {
      id: 0,
      title: '',
      status: 'new',
      department: 0,
      assignee: 0,
      start_date: '',
      end_date: '',
      note: ''
    }
  })

  const { data: users } = useFetchList<{ id: number; fullname: string }>(endpoints.users, {
    page: 1,
    limit: 100,
    roles__name: 'Performer'
  })

  useEffect(() => {
    const fetch = async () => {
      const res = await DataService.get<any>(endpoints.taskPart, { task: taskId, limit: 50 })
      setParts((res.data?.results || []) as Part[])
      const first = (res.data?.results || [])[0] || null
      setSelected(first)
      if (first) reset(first)
    }
    if (taskId) fetch()
  }, [taskId, reset])

  useEffect(() => {
    if (selected) reset(selected)
  }, [selected, reset])

  const refreshList = async () => {
    const res = await DataService.get<any>(endpoints.taskPart, { task: taskId, limit: 50 })
    const list = (res.data?.results || []) as Part[]
    setParts(list)
    const refreshed = selected ? list.find(p => p.id === selected.id) || null : null
    setSelected(refreshed || list[0] || null)
    if (refreshed || list[0]) reset((refreshed || list[0]) as Part)
  }

  const submitUpdate = async (values: Part) => {
    if (!selected) return
    await DataService.put(endpoints.taskPartById(selected.id), {
      title: values.title,
      status: values.status,
      department: values.department,
      assignee: values.assignee,
      start_date: values.start_date,
      end_date: values.end_date,
      note: values.note,
      updated_by: 1
    })
    await refreshList()
  }

  const createDefaultAssigneePart = async () => {
    if (!taskId || !quickAssignee) return
    await DataService.post(endpoints.taskPart, {
      task: Number(taskId),
      title: 'Default',
      department: 0,
      assignee: quickAssignee,
      start_date: '',
      end_date: '',
      status: 'new',
      note: '',
      created_by: 1,
      updated_by: 1
    })
    await refreshList()
  }

  const addNewPart = async () => {
    if (!taskId) return
    await DataService.post(endpoints.taskPart, {
      task: Number(taskId),
      title: 'Yangi qism',
      department: 0,
      assignee: 0,
      start_date: '',
      end_date: '',
      status: 'new',
      note: ''
    })
    await refreshList()
  }

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Typography variant='subtitle1'>1) Oddiy biriktirish (1 ta ijrochi):</Typography>
        <Typography variant='caption'>Ijrochi → TaskPart.assignee (default part)</Typography>
        <Stack direction='row' spacing={2} sx={{ mt: 2 }}>
          <Autocomplete
            options={users || []}
            value={(users || []).find(u => u.id === quickAssignee) || null}
            onChange={(_, v) => setQuickAssignee(v?.id || 0)}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            getOptionLabel={o => o?.fullname || ''}
            renderInput={params => <CustomTextField {...params} fullWidth label='Ijrochini tanlang' placeholder='---' />}
          />
          <Button variant='contained' onClick={createDefaultAssigneePart} disabled={!quickAssignee}>
            Biriktirish
          </Button>
        </Stack>
      </Grid>
      <Grid item xs={12}>
        <Divider sx={{ my: 3 }} />
        <Stack direction='row' justifyContent='space-between' alignItems='center'>
          <Typography variant='subtitle1'>2) Qismlarga bo‘lish (Split): TaskPart lar</Typography>
          <Button size='small' variant='outlined' onClick={addNewPart}>
            + Qism qo‘shish
          </Button>
        </Stack>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {parts.map(p => (
            <Box
              key={p.id}
              sx={{
                p: 2,
                border: theme => `1px solid rgba(${theme.palette.customColors.main}, 0.2)`,
                borderRadius: 2,
                cursor: 'pointer'
              }}
              onClick={() => setSelected(p)}
            >
              <Stack direction='row' spacing={2} alignItems='center'>
                <Typography variant='body2'>{p.title}</Typography>
                <Chip label={p.status} size='small' />
                <Typography variant='caption'>
                  {p.start_date} → {p.end_date}
                </Typography>
                <Typography variant='caption'>• Assignee: {p.assignee}</Typography>
                <Typography variant='caption'>• Bo‘lim: {p.department}</Typography>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Grid>
      <Grid item xs={12}>
        <Divider sx={{ my: 3 }} />
        <Typography variant='subtitle1'>Tanlangan qism amallari</Typography>
        {selected ? (
          <form onSubmit={handleSubmit(submitUpdate)}>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant='caption'>Qism nomi</Typography>
                <Controller
                  name='title'
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant='caption'>Status</Typography>
                <Controller
                  name='status'
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
                    >
                      <option value='new'>New</option>
                      <option value='in_progress'>In progress</option>
                      <option value='on_review'>On review</option>
                      <option value='returned'>Returned</option>
                      <option value='done'>Done</option>
                      <option value='cancelled'>Cancelled</option>
                    </select>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant='caption'>Ijrochi (assignee)</Typography>
                <Controller
                  name='assignee'
                  control={control}
                  render={({ field }) => (
                    <input
                      type='number'
                      {...field}
                      style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant='caption'>Boʻlim (department)</Typography>
                <Controller
                  name='department'
                  control={control}
                  render={({ field }) => (
                    <input
                      type='number'
                      {...field}
                      style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant='caption'>Boshlash (start_date)</Typography>
                <Controller
                  name='start_date'
                  control={control}
                  render={({ field }) => (
                    <input
                      type='date'
                      {...field}
                      style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant='caption'>Tugash (end_date)</Typography>
                <Controller
                  name='end_date'
                  control={control}
                  render={({ field }) => (
                    <input
                      type='date'
                      {...field}
                      style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant='caption'>Izoh (note)</Typography>
                <Controller
                  name='note'
                  control={control}
                  render={({ field }) => (
                    <textarea
                      rows={3}
                      {...field}
                      style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Stack direction='row' spacing={2}>
                  <Button variant='contained' size='small' type='submit'>
                    Saqlash
                  </Button>
                  <Button
                    variant='outlined'
                    size='small'
                    color='info'
                    onClick={() => {
                      if (!selected) return
                      submitUpdate({ ...selected, status: 'on_review' })
                    }}
                  >
                    Koʻrib chiqishga yuborish
                  </Button>
                  <Button
                    variant='outlined'
                    size='small'
                    color='warning'
                    onClick={() => {
                      if (!selected) return
                      submitUpdate({ ...selected, status: 'returned' })
                    }}
                  >
                    Qaytarish
                  </Button>
                  <Button
                    variant='outlined'
                    size='small'
                    color='success'
                    onClick={() => {
                      if (!selected) return
                      submitUpdate({ ...selected, status: 'done' })
                    }}
                  >
                    Bajarildi
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </form>
        ) : (
          <Typography variant='body2' sx={{ mt: 2 }}>
            Qism tanlanmagan
          </Typography>
        )}
      </Grid>
    </Grid>
  )
}

export default TaskPartPanel
