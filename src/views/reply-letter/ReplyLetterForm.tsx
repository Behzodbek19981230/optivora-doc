import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useRouter } from 'next/router'
import { Card, CardHeader, CardContent, Grid, Button, MenuItem, Stack, CardActions, IconButton } from '@mui/material'
import CustomTextField from 'src/@core/components/mui/text-field'
import { DataService } from 'src/configs/dataService'
import endpoints from 'src/configs/endpoints'
import toast from 'react-hot-toast'
import { useAuth } from 'src/hooks/useAuth'
import Icon from 'src/@core/components/icon'

type ReplyLetterFormType = {
  id?: number
  company: number
  letter_number: string
  responsible_person: number
  basis: string
  comment: string
}

const defaultValues: ReplyLetterFormType = {
  company: 0,
  letter_number: '',
  responsible_person: 0,
  basis: '',
  comment: ''
}

const ReplyLetterForm = () => {
  const router = useRouter()
  const { id } = router.query
  const mode = id ? 'edit' : 'create'
  const itemId = id ? Number(id) : null
  const { user } = useAuth()

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors }
  } = useForm<ReplyLetterFormType>({ defaultValues })

  const [companies, setCompanies] = useState<any[]>([])
  const [persons, setPersons] = useState<any[]>([])

  useEffect(() => {
    // load companies and persons for selects
    const load = async () => {
      try {
        const cRes = await DataService.get(endpoints.company + '?perPage=200')
        const cData: any = (cRes as any).data
        setCompanies(cData.results || cData || [])
      } catch (e) {}
      try {
        const pRes = await DataService.get(endpoints.users + '?perPage=200')
        const pData: any = (pRes as any).data
        setPersons(pData.results || pData || [])
      } catch (e) {}
    }
    load()
  }, [])

  useEffect(() => {
    const getInit = async () => {
      if (mode === 'edit' && itemId) {
        const res = await DataService.get(endpoints.replyLetterById(itemId))
        const rdata: any = (res as any).data
        reset(rdata)
      } else {
        reset(defaultValues)
      }
    }
    getInit()
  }, [mode, itemId, reset])

  const onSubmit = async (values: ReplyLetterFormType) => {
    try {
      const payload = { ...values }
      if (mode === 'create') {
        console.log(endpoints.replyLetter)

        const res = await DataService.post<{ id: number }>(endpoints.replyLetter, payload)
        toast.success('Javob xati yaratildi')
        router.push(`/reply-letter/${res.data.id}`)
      } else if (mode === 'edit' && itemId) {
        await DataService.put(endpoints.replyLetterById(itemId), payload)
        toast.success('Saqlandi')
      }
    } catch (e) {
      console.error(e)
      toast.error('Saqlashda xato')
    }
  }

  // Attachments for edit mode
  const [attachments, setAttachments] = useState<{ title: string; file: File | null }[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const loadFiles = async () => {
      if (mode === 'edit' && itemId) {
        try {
          const res = await DataService.get(endpoints.replyLetterFile + `?reply_letter=${itemId}`)
          const data: any = (res as any).data
          const rows = (data.results || data || []).map((f: any) => ({ title: f.title, file: null }))
          setAttachments(rows)
        } catch (e) {
          console.error(e)
        }
      }
    }
    loadFiles()
  }, [mode, itemId])

  const handleAddAttachmentRow = () => setAttachments(prev => [...prev, { title: '', file: null }])
  const handleRemoveAttachmentRow = (idx: number) => setAttachments(prev => prev.filter((_, i) => i !== idx))
  const handleChangeAttachmentTitle = (idx: number, title: string) =>
    setAttachments(prev => prev.map((row, i) => (i === idx ? { ...row, title } : row)))
  const handleChangeAttachmentFile = (idx: number, file: File | null) =>
    setAttachments(prev => prev.map((row, i) => (i === idx ? { ...row, file } : row)))

  const uploadAttachments = async () => {
    if (!itemId) return
    const rowsToUpload = attachments.filter(r => r.file && r.title.trim().length)
    if (!rowsToUpload.length) return toast.error('Fayl va title kiriting')
    try {
      setUploading(true)
      for (const row of rowsToUpload) {
        const form = new FormData()
        form.append('reply_letter', String(itemId))
        form.append('title', row.title)
        if (row.file) form.append('file', row.file)
        await DataService.postForm(endpoints.replyLetterFile, form)
      }
      toast.success('Fayllar muvaffaqiyatli yuklandi')
      setAttachments([])
      // reload files
      const res = await DataService.get(endpoints.replyLetterFile + `?reply_letter=${itemId}`)
      const data: any = (res as any).data
      const rows = (data.results || data || []).map((f: any) => ({ title: f.title, file: null }))
      setAttachments(rows)
    } catch (e) {
      console.error(e)
      toast.error('Yuklashda xato yuz berdi')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader title={mode === 'create' ? 'Yangi javob xati' : 'Javob xatini tahrirlash'} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Controller
                name='company'
                control={control}
                render={({ field }) => (
                  <CustomTextField select fullWidth label='Tashkilot' {...field}>
                    <MenuItem value={0}>Tanlanmagan</MenuItem>
                    {companies.map(c => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name='letter_number'
                control={control}
                render={({ field }) => <CustomTextField fullWidth label='Hujojat raqami' {...field} />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name='responsible_person'
                control={control}
                render={({ field }) => (
                  <CustomTextField select fullWidth label="Mas'ul shaxs" {...field}>
                    <MenuItem value={0}>Tanlanmagan</MenuItem>
                    {persons.map(p => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.fullname || p.username}
                      </MenuItem>
                    ))}
                  </CustomTextField>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='basis'
                control={control}
                render={({ field }) => <CustomTextField fullWidth label='Asos' {...field} />}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='comment'
                control={control}
                render={({ field }) => <CustomTextField fullWidth label='Izoh' {...field} multiline rows={4} />}
              />
            </Grid>
          </Grid>
        </CardContent>
        {mode === 'edit' ? (
          <CardContent>
            <Card variant='outlined'>
              <CardHeader
                title='Fayllar '
                subheader='Title kiriting va faylni biriktiring. Bir nechta qator qo‘shish mumkin.'
              />
              <CardContent>
                <Stack spacing={3}>
                  {attachments.map((row, idx) => (
                    <Card key={idx} variant='outlined'>
                      <CardContent>
                        <Grid container spacing={3} alignItems='end'>
                          <Grid item xs={12} md={5}>
                            <CustomTextField
                              fullWidth
                              label='Title'
                              value={row.title}
                              onChange={e => handleChangeAttachmentTitle(idx, e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12} md={5}>
                            <Stack direction='row' spacing={2} alignItems='end'>
                              <Button variant='outlined' component='label' startIcon={<Icon icon='tabler:paperclip' />}>
                                Fayl biriktirish
                                <input
                                  hidden
                                  type='file'
                                  onChange={e => handleChangeAttachmentFile(idx, e.target.files?.[0] || null)}
                                />
                              </Button>
                              <span style={{ color: 'rgba(0,0,0,0.6)' }}>
                                {row.file ? row.file.name : 'Fayl tanlanmagan'}
                              </span>
                            </Stack>
                          </Grid>
                          <Grid item xs={12} md={2} sx={{ textAlign: 'right' }}>
                            <IconButton
                              aria-label='remove'
                              color='error'
                              onClick={() => handleRemoveAttachmentRow(idx)}
                            >
                              <Icon icon='tabler:trash' />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}
                  <Stack direction='row' spacing={2}>
                    <Button variant='contained' color='primary' onClick={handleAddAttachmentRow}>
                      Qator qo‘shish
                    </Button>
                    <Button variant='outlined' color='success' onClick={uploadAttachments} disabled={uploading}>
                      {uploading ? 'Yuklanmoqda…' : 'Yuklash'}
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </CardContent>
        ) : null}
        <CardActions>
          <Stack direction='row' spacing={2} sx={{ p: 2 }}>
            <Button type='submit' variant='contained' disabled={isSubmitting}>
              Saqlash
            </Button>
            <Button variant='tonal' onClick={() => router.push('/reply-letter')}>
              Bekor qilish
            </Button>
          </Stack>
        </CardActions>
      </form>
    </Card>
  )
}

export default ReplyLetterForm
