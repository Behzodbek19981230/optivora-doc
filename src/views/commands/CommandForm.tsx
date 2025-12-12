import { useEffect, useState } from 'react'
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
import { Card, CardContent, CardHeader, IconButton, Stack } from '@mui/material'
import Icon from 'src/@core/components/icon'

type Props = {
  open: boolean
  onClose: () => void
  onSaved: () => void
  mode: 'create' | 'edit'
  item?: CommandType | null
}

const defaultValues: CommandType = {
  command_number: '',
  basis: '',
  basis_en: '',
  basis_uz: '',
  basis_ru: '',
  comment: '',
  comment_en: '',
  comment_uz: '',
  comment_ru: ''
}

const CommandForm = () => {
  const router = useRouter()
  const { id } = router.query
  const { user } = useAuth()

  const mode = id ? 'edit' : 'create'
  const itemId = id ? parseInt(id as string, 10) : null

  // Props simulation
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors }
  } = useForm<CommandType>({ defaultValues })
  // Attachments state for edit mode: multiple rows with title + file
  const [attachments, setAttachments] = useState<{ title: string; file: File | null }[]>([])
  const [uploading, setUploading] = useState(false)

  // Editor states for rich text fields (we use plain text when submitting)
  const [basisState, setBasisState] = useState(EditorState.createEmpty())
  const [basisEnState, setBasisEnState] = useState(EditorState.createEmpty())
  const [basisUzState, setBasisUzState] = useState(EditorState.createEmpty())
  const [basisRuState, setBasisRuState] = useState(EditorState.createEmpty())
  const [commentState, setCommentState] = useState(EditorState.createEmpty())
  const [commentEnState, setCommentEnState] = useState(EditorState.createEmpty())
  const [commentUzState, setCommentUzState] = useState(EditorState.createEmpty())
  const [commentRuState, setCommentRuState] = useState(EditorState.createEmpty())
  async function getInitValues() {
    if (mode === 'edit' && itemId) {
      try {
        const response = await DataService.get<CommandType>(endpoints.commandById(itemId))
        const dataInit = response.data
        reset(dataInit)

        // Initialize editor states from item values (fall back to plain text)
        setBasisState(EditorState.createWithContent(ContentState.createFromText(dataInit.basis || '')))
        setBasisEnState(EditorState.createWithContent(ContentState.createFromText(dataInit.basis_en || '')))
        setBasisUzState(EditorState.createWithContent(ContentState.createFromText(dataInit.basis_uz || '')))
        setBasisRuState(EditorState.createWithContent(ContentState.createFromText(dataInit.basis_ru || '')))
        setCommentState(EditorState.createWithContent(ContentState.createFromText(dataInit.comment || '')))
        setCommentEnState(EditorState.createWithContent(ContentState.createFromText(dataInit.comment_en || '')))
        setCommentUzState(EditorState.createWithContent(ContentState.createFromText(dataInit.comment_uz || '')))
        setCommentRuState(EditorState.createWithContent(ContentState.createFromText(dataInit.comment_ru || '')))
        const filesResponse = await DataService.get<{ results: any[] }>(endpoints.downloads + `?command=${itemId}`)
        const filesData = filesResponse.data
        setAttachments(
          filesData.results.map(f => ({
            title: f.title,
            file: null // existing files cannot be represented as File objects
          }))
        )
      } catch (error) {
        console.error('Failed to fetch command data:', error)
      }
    } else {
      reset(defaultValues)
      setBasisState(EditorState.createEmpty())
      setBasisEnState(EditorState.createEmpty())
      setBasisUzState(EditorState.createEmpty())
      setBasisRuState(EditorState.createEmpty())
      setCommentState(EditorState.createEmpty())
      setCommentEnState(EditorState.createEmpty())
      setCommentUzState(EditorState.createEmpty())
      setCommentRuState(EditorState.createEmpty())
    }
  }
  useEffect(() => {
    getInitValues()
  }, [mode, itemId])

  const onSubmit = async (values: CommandType) => {
    // TODO: Replace with your actual DataService and endpoints
    try {
      // Extract plain text from editor states to send to server (backend expects strings)
      const getPlain = (st: EditorState) => st.getCurrentContent().getPlainText() || ''
      const payload: CommandType = {
        ...values,
        company: user?.company_id || 0,
        basis: getPlain(basisState),
        basis_en: getPlain(basisEnState),
        basis_uz: getPlain(basisUzState),
        basis_ru: getPlain(basisRuState),
        comment: getPlain(commentState),
        comment_en: getPlain(commentEnState),
        comment_uz: getPlain(commentUzState),
        comment_ru: getPlain(commentRuState)
      }
      if (mode === 'create') {
        const res = await DataService.post<{ id: number }>(endpoints.command, payload)
        router.push(`/commands/${res.data.id}`)
      } else if (mode === 'edit' && id) await DataService.put(endpoints.commandById(id), payload)

      toast.success('Buyruq muvaffaqiyatli saqlandi')
    } catch (error) {
      console.error('Failed to save command:', error)
    }
  }

  // Handlers for attachments UI
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
        form.append('command', String(itemId))
        form.append('title', row.title)
        if (row.file) form.append('file', row.file)
        await DataService.postForm(endpoints.downloads, form)
      }
      toast.success('Fayllar muvaffaqiyatli yuklandi')
      setAttachments([])
      getInitValues()
    } catch (e) {
      console.error(e)
      toast.error('Yuklashda xato yuz berdi')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader title={mode === 'create' ? 'Yangi buyruq yaratish' : 'Buyruqni tahrirlash'} />
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Controller
                name='command_number'
                control={control}
                rules={{ required: 'Majburiy maydon' }}
                render={({ field }) => (
                  <CustomTextField
                    fullWidth
                    label='Buyruq nomeri'
                    {...field}
                    error={!!errors.command_number}
                    helperText={errors.command_number?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='basis'
                control={control}
                rules={{ required: 'Majburiy maydon' }}
                render={({ field }) => (
                  <EditorWrapper>
                    <div style={{ marginBottom: 8, fontWeight: 500 }}>Buyruq asosi</div>
                    <EditorControlled
                      editorState={basisState}
                      onEditorStateChange={state => {
                        setBasisState(state)
                        // update form value with plain text
                        field.onChange(state.getCurrentContent().getPlainText())
                      }}
                    />
                    {errors.basis ? (
                      <div style={{ color: '#d32f2f', marginTop: 8, fontSize: 12 }}>{errors.basis.message}</div>
                    ) : null}
                  </EditorWrapper>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name='basis_en'
                control={control}
                rules={{ required: 'Majburiy maydon' }}
                render={({ field }) => (
                  <EditorWrapper>
                    <div style={{ marginBottom: 8, fontWeight: 500 }}>Asos (EN)</div>
                    <EditorControlled
                      editorState={basisEnState}
                      onEditorStateChange={state => {
                        setBasisEnState(state)
                        field.onChange(state.getCurrentContent().getPlainText())
                      }}
                    />
                    {errors.basis_en ? (
                      <div style={{ color: '#d32f2f', marginTop: 8, fontSize: 12 }}>{errors.basis_en.message}</div>
                    ) : null}
                  </EditorWrapper>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name='basis_uz'
                control={control}
                rules={{ required: 'Majburiy maydon' }}
                render={({ field }) => (
                  <EditorWrapper>
                    <div style={{ marginBottom: 8, fontWeight: 500 }}>Asos (UZ)</div>
                    <EditorControlled
                      editorState={basisUzState}
                      onEditorStateChange={state => {
                        setBasisUzState(state)
                        field.onChange(state.getCurrentContent().getPlainText())
                      }}
                    />
                    {errors.basis_uz ? (
                      <div style={{ color: '#d32f2f', marginTop: 8, fontSize: 12 }}>{errors.basis_uz.message}</div>
                    ) : null}
                  </EditorWrapper>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name='basis_ru'
                control={control}
                rules={{ required: 'Majburiy maydon' }}
                render={({ field }) => (
                  <EditorWrapper>
                    <div style={{ marginBottom: 8, fontWeight: 500 }}>Asos (RU)</div>
                    <EditorControlled
                      editorState={basisRuState}
                      onEditorStateChange={state => {
                        setBasisRuState(state)
                        field.onChange(state.getCurrentContent().getPlainText())
                      }}
                    />
                    {errors.basis_ru ? (
                      <div style={{ color: '#d32f2f', marginTop: 8, fontSize: 12 }}>{errors.basis_ru.message}</div>
                    ) : null}
                  </EditorWrapper>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name='comment'
                control={control}
                rules={{ required: 'Majburiy maydon' }}
                render={({ field }) => (
                  <EditorWrapper>
                    <div style={{ marginBottom: 8, fontWeight: 500 }}>Izoh</div>
                    <EditorControlled
                      editorState={commentState}
                      onEditorStateChange={state => {
                        setCommentState(state)
                        field.onChange(state.getCurrentContent().getPlainText())
                      }}
                    />
                    {errors.comment ? (
                      <div style={{ color: '#d32f2f', marginTop: 8, fontSize: 12 }}>{errors.comment.message}</div>
                    ) : null}
                  </EditorWrapper>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name='comment_en'
                control={control}
                rules={{ required: 'Majburiy maydon' }}
                render={({ field }) => (
                  <EditorWrapper>
                    <div style={{ marginBottom: 8, fontWeight: 500 }}>Izoh (EN)</div>
                    <EditorControlled
                      editorState={commentEnState}
                      onEditorStateChange={state => {
                        setCommentEnState(state)
                        field.onChange(state.getCurrentContent().getPlainText())
                      }}
                    />
                    {errors.comment_en ? (
                      <div style={{ color: '#d32f2f', marginTop: 8, fontSize: 12 }}>{errors.comment_en.message}</div>
                    ) : null}
                  </EditorWrapper>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name='comment_uz'
                control={control}
                rules={{ required: 'Majburiy maydon' }}
                render={({ field }) => (
                  <EditorWrapper>
                    <div style={{ marginBottom: 8, fontWeight: 500 }}>Izoh (UZ)</div>
                    <EditorControlled
                      editorState={commentUzState}
                      onEditorStateChange={state => {
                        setCommentUzState(state)
                        field.onChange(state.getCurrentContent().getPlainText())
                      }}
                    />
                    {errors.comment_uz ? (
                      <div style={{ color: '#d32f2f', marginTop: 8, fontSize: 12 }}>{errors.comment_uz.message}</div>
                    ) : null}
                  </EditorWrapper>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name='comment_ru'
                control={control}
                rules={{ required: 'Majburiy maydon' }}
                render={({ field }) => (
                  <EditorWrapper>
                    <div style={{ marginBottom: 8, fontWeight: 500 }}>Izoh (RU)</div>
                    <EditorControlled
                      editorState={commentRuState}
                      onEditorStateChange={state => {
                        setCommentRuState(state)
                        field.onChange(state.getCurrentContent().getPlainText())
                      }}
                    />
                    {errors.comment_ru ? (
                      <div style={{ color: '#d32f2f', marginTop: 8, fontSize: 12 }}>{errors.comment_ru.message}</div>
                    ) : null}
                  </EditorWrapper>
                )}
              />
            </Grid>

            {mode === 'edit' ? (
              <Grid item xs={12}>
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
                                  <Button
                                    variant='outlined'
                                    component='label'
                                    startIcon={<Icon icon='tabler:paperclip' />}
                                  >
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
              </Grid>
            ) : null}
          </Grid>
        </CardContent>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px' }}>
          <Button
            type='button'
            variant='tonal'
            color='secondary'
            onClick={() => {
              router.push('/commands')
            }}
            disabled={isSubmitting}
          >
            Bekor qilish
          </Button>
          <Button type='submit' disabled={isSubmitting}>
            {isSubmitting ? 'Saqlanmoqda…' : 'Saqlash'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default CommandForm
