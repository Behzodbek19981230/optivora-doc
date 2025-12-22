import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useRouter } from 'next/router'
import {
  Card,
  CardHeader,
  CardContent,
  Grid,
  Button,
  MenuItem,
  Stack,
  CardActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
  Divider,
  Autocomplete
} from '@mui/material'
import CustomTextField from 'src/@core/components/mui/text-field'
import { DataService } from 'src/configs/dataService'
import endpoints from 'src/configs/endpoints'
import toast from 'react-hot-toast'
import Icon from 'src/@core/components/icon'
import { useTranslation } from 'react-i18next'
import EditorControlled from 'src/views/forms/form-elements/editor/EditorControlled'
import { EditorState, ContentState } from 'draft-js'
import { EditorWrapper } from 'src/@core/styles/libs/react-draft-wysiwyg'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'

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

type ReplyLetterFileItem = {
  id: number
  title: string
  file?: string | null
  created_time?: string
}

const ReplyLetterForm = () => {
  const router = useRouter()
  const { t } = useTranslation()
  const { id } = router.query
  const mode = id ? 'edit' : 'create'
  const itemId = id ? Number(id) : null

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm<ReplyLetterFormType>({ defaultValues })

  const [companies, setCompanies] = useState<any[]>([])
  const [persons, setPersons] = useState<any[]>([])
  const [commentState, setCommentState] = useState(EditorState.createEmpty())

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

        setCommentState(EditorState.createWithContent(ContentState.createFromText(String(rdata?.comment || ''))))
      } else {
        reset(defaultValues)

        setCommentState(EditorState.createEmpty())
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
        toast.success(String(t('replyLetter.toast.created')))
        router.push(`/reply-letter/${res.data.id}`)
      } else if (mode === 'edit' && itemId) {
        await DataService.put(endpoints.replyLetterById(itemId), payload)
        toast.success(String(t('replyLetter.toast.saved')))
      }
    } catch (e) {
      console.error(e)
      toast.error(String(t('replyLetter.toast.saveError')))
    }
  }

  // Attachments for edit mode
  const [existingFiles, setExistingFiles] = useState<ReplyLetterFileItem[]>([])
  const [newAttachments, setNewAttachments] = useState<{ title: string; file: File | null }[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const loadFiles = async () => {
      if (mode === 'edit' && itemId) {
        try {
          const res = await DataService.get(endpoints.replyLetterFile + `?reply_letter=${itemId}`)
          const data: any = (res as any).data
          const rows = (data.results || data || []) as any[]
          setExistingFiles(
            rows.map(f => ({
              id: Number(f.id),
              title: String(f.title || ''),
              file: f.file ?? f.file_url ?? f.url ?? null,
              created_time: f.created_time
            }))
          )
        } catch (e) {
          console.error(e)
        }
      }
    }
    loadFiles()
  }, [mode, itemId])

  const handleAddAttachmentRow = () => setNewAttachments(prev => [...prev, { title: '', file: null }])
  const handleRemoveAttachmentRow = (idx: number) => setNewAttachments(prev => prev.filter((_, i) => i !== idx))
  const handleChangeAttachmentTitle = (idx: number, title: string) =>
    setNewAttachments(prev => prev.map((row, i) => (i === idx ? { ...row, title } : row)))
  const handleChangeAttachmentFile = (idx: number, file: File | null) =>
    setNewAttachments(prev => prev.map((row, i) => (i === idx ? { ...row, file } : row)))

  const handleDownload = async (file: ReplyLetterFileItem) => {
    try {
      if (file.file) {
        window.open(String(file.file), '_blank', 'noopener,noreferrer')

        return
      }
      await DataService.downloadFile(
        endpoints.replyLetterFileById(file.id),
        file.title || `reply-letter-file-${file.id}`
      )
    } catch (e) {
      console.error(e)
      toast.error(String(t('replyLetter.attachments.toast.downloadError', { defaultValue: 'Failed to download file' })))
    }
  }

  const uploadAttachments = async () => {
    if (!itemId) return
    const rowsToUpload = newAttachments.filter(r => r.file && r.title.trim().length)
    if (!rowsToUpload.length) return toast.error(String(t('replyLetter.attachments.validation.fileAndTitleRequired')))
    try {
      setUploading(true)
      for (const row of rowsToUpload) {
        const form = new FormData()
        form.append('reply_letter', String(itemId))
        form.append('title', row.title)
        if (row.file) form.append('file', row.file)
        await DataService.postForm(endpoints.replyLetterFile, form)
      }
      toast.success(String(t('replyLetter.attachments.toast.uploaded')))
      setNewAttachments([])

      // reload files
      const res = await DataService.get(endpoints.replyLetterFile + `?reply_letter=${itemId}`)
      const data: any = (res as any).data
      const rows = (data.results || data || []) as any[]
      setExistingFiles(
        rows.map(f => ({
          id: Number(f.id),
          title: String(f.title || ''),
          file: f.file ?? f.file_url ?? f.url ?? null,
          created_time: f.created_time
        }))
      )
    } catch (e) {
      console.error(e)
      toast.error(String(t('replyLetter.attachments.toast.uploadError')))
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader
        title={mode === 'create' ? String(t('replyLetter.create.title')) : String(t('replyLetter.edit.title'))}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Controller
                name='company'
                control={control}
                render={({ field }) => (
                  <CustomTextField select fullWidth label={String(t('replyLetter.form.company'))} {...field}>
                    <MenuItem value={0}>{String(t('common.selectPlaceholder'))}</MenuItem>
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
                render={({ field }) => (
                  <CustomTextField fullWidth label={String(t('replyLetter.form.letterNumber'))} {...field} />
                )}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Controller
                name='responsible_person'
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    options={persons || []}
                    value={persons.find(p => Number(p.id) === Number(field.value)) || null}
                    onChange={(_, newValue) => field.onChange(newValue?.id ? Number(newValue.id) : 0)}
                    isOptionEqualToValue={(option, value) => Number(option.id) === Number((value as any)?.id)}
                    getOptionLabel={option => option?.fullname || option?.username || String(option?.id || '')}
                    renderInput={params => (
                      <CustomTextField
                        {...params}
                        fullWidth
                        label={String(t('replyLetter.form.responsiblePerson'))}
                        placeholder={String(t('common.search', { defaultValue: 'Search' }))}
                      />
                    )}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='basis'
                control={control}
                render={({ field }) => (
                  <CustomTextField fullWidth label={String(t('replyLetter.form.basis'))} {...field} />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name='comment'
                control={control}
                render={({ field }) => (
                  <EditorWrapper>
                    <div style={{ marginBottom: 8, fontWeight: 500 }}>{String(t('replyLetter.form.comment'))}</div>
                    <EditorControlled
                      editorState={commentState}
                      onEditorStateChange={state => {
                        setCommentState(state)
                        field.onChange(state.getCurrentContent().getPlainText())
                      }}
                    />
                  </EditorWrapper>
                )}
              />
            </Grid>
          </Grid>
        </CardContent>
        {mode === 'edit' ? (
          <CardContent>
            <Card variant='outlined'>
              <CardHeader
                title={String(t('replyLetter.attachments.title'))}
                subheader={String(t('replyLetter.attachments.subtitle'))}
              />
              <CardContent>
                <Stack spacing={3}>
                  <div>
                    <Typography variant='subtitle2' sx={{ mb: 1 }}>
                      {String(t('replyLetter.attachments.existing', { defaultValue: 'Attached files' }))}
                    </Typography>
                    {existingFiles.length ? (
                      <Table size='small'>
                        <TableHead>
                          <TableRow>
                            <TableCell>
                              {String(t('replyLetter.attachments.table.title', { defaultValue: 'Title' }))}
                            </TableCell>
                            <TableCell>
                              {String(t('replyLetter.attachments.table.file', { defaultValue: 'File' }))}
                            </TableCell>
                            <TableCell align='right'>
                              {String(t('replyLetter.attachments.table.actions', { defaultValue: 'Actions' }))}
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {existingFiles.map(f => (
                            <TableRow key={f.id}>
                              <TableCell>{f.title || '—'}</TableCell>
                              <TableCell>{f.file ? String(f.file).split('/').pop() : '—'}</TableCell>
                              <TableCell align='right'>
                                <Tooltip
                                  title={String(
                                    t('replyLetter.attachments.actions.download', { defaultValue: 'Open / download' })
                                  )}
                                >
                                  <IconButton size='small' onClick={() => handleDownload(f)}>
                                    <Icon icon='tabler:download' />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <Typography variant='body2' color='text.secondary'>
                        {String(t('replyLetter.attachments.empty', { defaultValue: 'No attached files' }))}
                      </Typography>
                    )}
                  </div>

                  <Divider />

                  <div>
                    <Typography variant='subtitle2' sx={{ mb: 1 }}>
                      {String(t('replyLetter.attachments.addNew', { defaultValue: 'Add new files' }))}
                    </Typography>

                    <Stack spacing={2}>
                      {newAttachments.map((row, idx) => (
                        <Card key={idx} variant='outlined'>
                          <CardContent>
                            <Grid container spacing={3} alignItems='end'>
                              <Grid item xs={12} md={5}>
                                <CustomTextField
                                  fullWidth
                                  label={String(t('replyLetter.attachments.form.title'))}
                                  value={row.title}
                                  onChange={e => handleChangeAttachmentTitle(idx, e.target.value)}
                                />
                              </Grid>
                              <Grid item xs={12} md={5}>
                                <Stack direction='row' spacing={2} alignItems='end'>
                                  <Button
                                    variant='outlined'
                                    component='label'
                                    startIcon={<Icon icon='tabler:paperclip' />}
                                  >
                                    {String(t('replyLetter.attachments.form.attachFile'))}
                                    <input
                                      hidden
                                      type='file'
                                      onChange={e => handleChangeAttachmentFile(idx, e.target.files?.[0] || null)}
                                    />
                                  </Button>
                                  <span style={{ color: 'rgba(0,0,0,0.6)' }}>
                                    {row.file
                                      ? row.file.name
                                      : String(t('replyLetter.attachments.form.noFileSelected'))}
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
                        <Button type='button' variant='contained' color='primary' onClick={handleAddAttachmentRow}>
                          {String(t('replyLetter.attachments.addRow'))}
                        </Button>
                        <Button
                          type='button'
                          variant='outlined'
                          color='success'
                          onClick={uploadAttachments}
                          disabled={uploading}
                        >
                          {uploading ? String(t('common.loading')) : String(t('replyLetter.attachments.upload'))}
                        </Button>
                      </Stack>
                    </Stack>
                  </div>
                </Stack>
              </CardContent>
            </Card>
          </CardContent>
        ) : null}
        <CardActions>
          <Stack direction='row' spacing={2} sx={{ p: 2 }}>
            <Button type='submit' variant='contained' disabled={isSubmitting}>
              {isSubmitting ? String(t('common.saving')) : String(t('common.save'))}
            </Button>
            <Button variant='tonal' onClick={() => router.push('/reply-letter')}>
              {String(t('common.cancel'))}
            </Button>
          </Stack>
        </CardActions>
      </form>
    </Card>
  )
}

export default ReplyLetterForm
