import { useCallback, useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'

import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import CustomTextField from 'src/@core/components/mui/text-field'
import EditorControlled from 'src/views/forms/form-elements/editor/EditorControlled'
import { EditorState, ContentState } from 'draft-js'
import { EditorWrapper } from 'src/@core/styles/libs/react-draft-wysiwyg'

// removed unused MenuItem and region fetch
import { DataService } from 'src/configs/dataService'
import endpoints from 'src/configs/endpoints'
import toast from 'react-hot-toast'
import { CommandType } from 'src/types/command'
import { useAuth } from 'src/hooks/useAuth'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { useRouter } from 'next/router'
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  Stack,
  Tabs,
  Tab,
  Divider,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip
} from '@mui/material'
import Icon from 'src/@core/components/icon'
import { useTranslation } from 'react-i18next'

const defaultValues: CommandType = {
  command_number: '',
  basis_en: '',
  basis_uz: '',
  basis_ru: '',
  comment_en: '',
  comment_uz: '',
  comment_ru: ''
}

type CommandFileItem = {
  id: number
  title: string
  file?: string | null
  created_time?: string
}

const CommandForm = () => {
  const router = useRouter()
  const { t } = useTranslation()
  const { id } = router.query
  const { user } = useAuth()
  const [langTab, setLangTab] = useState<'uz' | 'ru' | 'en'>('uz')

  const mode = id ? 'edit' : 'create'
  const itemId = id ? parseInt(id as string, 10) : null

  // Props simulation
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors }
  } = useForm<CommandType>({ defaultValues })

  const [existingFiles, setExistingFiles] = useState<CommandFileItem[]>([])
  const [newAttachments, setNewAttachments] = useState<{ title: string; file: File | null }[]>([])
  const [uploading, setUploading] = useState(false)

  const [commentEnState, setCommentEnState] = useState(EditorState.createEmpty())
  const [commentUzState, setCommentUzState] = useState(EditorState.createEmpty())
  const [commentRuState, setCommentRuState] = useState(EditorState.createEmpty())

  const getInitValues = useCallback(async () => {
    if (mode === 'edit' && itemId) {
      try {
        const response = await DataService.get<CommandType>(endpoints.commandById(itemId))
        const dataInit = response.data
        reset(dataInit)

        // Initialize editor states from item values
        setCommentEnState(EditorState.createWithContent(ContentState.createFromText(dataInit.comment_en || '')))
        setCommentUzState(EditorState.createWithContent(ContentState.createFromText(dataInit.comment_uz || '')))
        setCommentRuState(EditorState.createWithContent(ContentState.createFromText(dataInit.comment_ru || '')))

        // Load existing files
        try {
          const filesResponse = await DataService.get<{ results: any[] }>(endpoints.downloads + `?command=${itemId}`)
          const filesData = filesResponse.data
          const rows = (filesData?.results || (filesData as any) || []) as any[]
          setExistingFiles(
            rows.map(f => ({
              id: Number(f.id),
              title: String(f.title || ''),
              file: f.file ?? f.file_url ?? f.url ?? null,
              created_time: f.created_time
            }))
          )
        } catch (e) {
          setExistingFiles([])
        }
        setNewAttachments([])
      } catch (error) {
        console.error('Failed to fetch command data:', error)
      }
    } else {
      reset(defaultValues)
      setCommentEnState(EditorState.createEmpty())
      setCommentUzState(EditorState.createEmpty())
      setCommentRuState(EditorState.createEmpty())
      setExistingFiles([])
      setNewAttachments([])
    }
  }, [itemId, mode, reset])
  useEffect(() => {
    getInitValues()
  }, [getInitValues])

  const onSubmit = async (values: CommandType) => {
    // TODO: Replace with your actual DataService and endpoints
    try {
      const payload: CommandType = {
        ...values,
        company: user?.company_id || 0
      }
      if (mode === 'create') {
        const res = await DataService.post<{ id: number }>(endpoints.command, payload)
        router.push(`/commands/${res.data.id}`)
      } else if (mode === 'edit' && id) await DataService.put(endpoints.commandById(id), payload)

      toast.success(String(t('commands.toast.saved')))
    } catch (error) {
      console.error('Failed to save command:', error)
    }
  }

  // Handlers for attachments UI
  const handleAddAttachmentRow = () => setNewAttachments(prev => [...prev, { title: '', file: null }])
  const handleRemoveAttachmentRow = (idx: number) => setNewAttachments(prev => prev.filter((_, i) => i !== idx))
  const handleChangeAttachmentTitle = (idx: number, title: string) =>
    setNewAttachments(prev => prev.map((row, i) => (i === idx ? { ...row, title } : row)))
  const handleChangeAttachmentFile = (idx: number, file: File | null) =>
    setNewAttachments(prev => prev.map((row, i) => (i === idx ? { ...row, file } : row)))

  const handleDownload = async (file: CommandFileItem) => {
    try {
      if (file.file) {
        window.open(String(file.file), '_blank', 'noopener,noreferrer')

        return
      }
      await DataService.downloadFile(endpoints.downloadById(file.id), file.title || `command-file-${file.id}`)
    } catch (e) {
      console.error(e)
      toast.error(String(t('commands.attachments.toast.downloadError', { defaultValue: 'Failed to download file' })))
    }
  }

  const uploadAttachments = async () => {
    if (!itemId) return
    const rowsToUpload = newAttachments.filter(r => r.file && r.title.trim().length)
    if (!rowsToUpload.length) return toast.error(String(t('commands.attachments.validation.fileAndTitleRequired')))
    try {
      setUploading(true)
      for (const row of rowsToUpload) {
        const form = new FormData()
        form.append('command', String(itemId))
        form.append('title', row.title)
        if (row.file) form.append('file', row.file)
        await DataService.postForm(endpoints.downloads, form)
      }
      toast.success(String(t('commands.attachments.toast.uploaded')))
      setNewAttachments([])
      getInitValues()
    } catch (e) {
      console.error(e)
      toast.error(String(t('commands.attachments.toast.uploadError')))
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader title={mode === 'create' ? String(t('commands.create.title')) : String(t('commands.edit.title'))} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Controller
                name='command_number'
                control={control}
                rules={{ required: String(t('errors.required')) }}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label={String(t('commands.form.number'))}
                    {...field}
                    error={!!errors.command_number}
                    helperText={errors.command_number?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Stack spacing={2}>
                <Typography variant='subtitle1'>
                  {String(t('commands.form.translations', { defaultValue: 'Translations' }))}
                </Typography>
                <Tabs
                  value={langTab}
                  onChange={(_, v) => setLangTab(v)}
                  variant='scrollable'
                  scrollButtons='auto'
                  sx={{ minHeight: 40 }}
                >
                  <Tab value='uz' label={String(t('language.uz', { defaultValue: 'Uzbek' }))} />
                  <Tab value='ru' label={String(t('language.ru', { defaultValue: 'Russian' }))} />
                  <Tab value='en' label={String(t('language.en', { defaultValue: 'English' }))} />
                </Tabs>

                <Box>
                  {langTab === 'uz' ? (
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Controller
                          name='basis_uz'
                          control={control}
                          render={({ field }) => (
                            <CustomTextField
                              fullWidth
                              multiline
                              minRows={3}
                              label={String(t('commands.form.basisUz'))}
                              {...field}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Controller
                          name='comment_uz'
                          control={control}
                          render={({ field }) => (
                            <EditorWrapper>
                              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                                {String(t('commands.form.commentUz'))}
                              </div>
                              <EditorControlled
                                editorState={commentUzState}
                                onEditorStateChange={state => {
                                  setCommentUzState(state)
                                  field.onChange(state.getCurrentContent().getPlainText())
                                }}
                              />
                            </EditorWrapper>
                          )}
                        />
                      </Grid>
                    </Grid>
                  ) : null}

                  {langTab === 'ru' ? (
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name='basis_ru'
                          control={control}
                          render={({ field }) => (
                            <CustomTextField
                              fullWidth
                              multiline
                              minRows={3}
                              label={String(t('commands.form.basisRu'))}
                              {...field}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name='comment_ru'
                          control={control}
                          render={({ field }) => (
                            <EditorWrapper>
                              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                                {String(t('commands.form.commentRu'))}
                              </div>
                              <EditorControlled
                                editorState={commentRuState}
                                onEditorStateChange={state => {
                                  setCommentRuState(state)
                                  field.onChange(state.getCurrentContent().getPlainText())
                                }}
                              />
                            </EditorWrapper>
                          )}
                        />
                      </Grid>
                    </Grid>
                  ) : null}

                  {langTab === 'en' ? (
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name='basis_en'
                          control={control}
                          render={({ field }) => (
                            <CustomTextField
                              fullWidth
                              multiline
                              minRows={3}
                              label={String(t('commands.form.basisEn'))}
                              {...field}
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Controller
                          name='comment_en'
                          control={control}
                          render={({ field }) => (
                            <EditorWrapper>
                              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                                {String(t('commands.form.commentEn'))}
                              </div>
                              <EditorControlled
                                editorState={commentEnState}
                                onEditorStateChange={state => {
                                  setCommentEnState(state)
                                  field.onChange(state.getCurrentContent().getPlainText())
                                }}
                              />
                            </EditorWrapper>
                          )}
                        />
                      </Grid>
                    </Grid>
                  ) : null}
                </Box>
              </Stack>
            </Grid>

            {mode === 'edit' ? (
              <Grid item xs={12}>
                <Card variant='outlined'>
                  <CardHeader
                    title={String(t('commands.attachments.title'))}
                    subheader={String(t('commands.attachments.subtitle'))}
                  />
                  <CardContent>
                    <Stack spacing={3}>
                      <div>
                        <Typography variant='subtitle2' sx={{ mb: 1 }}>
                          {String(t('commands.attachments.existing', { defaultValue: 'Attached files' }))}
                        </Typography>
                        {existingFiles.length ? (
                          <Table size='small'>
                            <TableHead>
                              <TableRow>
                                <TableCell>
                                  {String(t('commands.attachments.table.title', { defaultValue: 'Title' }))}
                                </TableCell>
                                <TableCell>
                                  {String(t('commands.attachments.table.file', { defaultValue: 'File' }))}
                                </TableCell>
                                <TableCell align='right'>
                                  {String(t('commands.attachments.table.actions', { defaultValue: 'Actions' }))}
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
                                        t('commands.attachments.actions.download', { defaultValue: 'Open / download' })
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
                            {String(t('commands.attachments.empty', { defaultValue: 'No attached files' }))}
                          </Typography>
                        )}
                      </div>

                      <Divider />

                      <div>
                        <Typography variant='subtitle2' sx={{ mb: 1 }}>
                          {String(t('commands.attachments.addNew', { defaultValue: 'Add new files' }))}
                        </Typography>

                        <Stack spacing={2}>
                          {newAttachments.map((row, idx) => (
                            <Card key={idx} variant='outlined'>
                              <CardContent>
                                <Grid container spacing={3} alignItems='end'>
                                  <Grid item xs={12} md={5}>
                                    <CustomTextField
                                      fullWidth
                                      label={String(t('commands.attachments.form.title'))}
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
                                        {String(t('commands.attachments.form.attachFile'))}
                                        <input
                                          hidden
                                          type='file'
                                          onChange={e => handleChangeAttachmentFile(idx, e.target.files?.[0] || null)}
                                        />
                                      </Button>
                                      <span style={{ color: 'rgba(0,0,0,0.6)' }}>
                                        {row.file
                                          ? row.file.name
                                          : String(t('commands.attachments.form.noFileSelected'))}
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
                              {String(t('commands.attachments.addRow'))}
                            </Button>
                            <Button variant='outlined' color='success' onClick={uploadAttachments} disabled={uploading}>
                              {uploading ? String(t('common.loading')) : String(t('commands.attachments.upload'))}
                            </Button>
                          </Stack>
                        </Stack>
                      </div>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ) : null}
          </Grid>
        </CardContent>
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Stack direction='row' spacing={2} sx={{ p: 2 }}>
            <Button
              type='button'
              variant='tonal'
              color='secondary'
              onClick={() => router.push('/commands')}
              disabled={isSubmitting}
            >
              {String(t('common.cancel'))}
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting ? String(t('common.saving')) : String(t('common.save'))}
            </Button>
          </Stack>
        </CardActions>
      </form>
    </Card>
  )
}

export default CommandForm
