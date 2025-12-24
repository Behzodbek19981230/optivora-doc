import { useEffect, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import CustomAvatar from 'src/@core/components/mui/avatar'
import { DataService } from 'src/configs/dataService'
import endpoints from 'src/configs/endpoints'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

type Company = {
  id: number
  code: string
  name: string
  is_active: boolean
  phone: string
  country: number
  country_detail?: {
    id: number
    code: string
    name: string
  }
  region: number
  region_detail: {
    id: number
    code: string
    name: string
    name_en: string
    name_uz: string
    name_ru: string
  }
  district: number
  district_detail: {
    id: number
    code: string
    name: string
    name_en: string
    name_uz: string
    name_ru: string
    region: number
    region_detail: {
      id: number
      code: string
      name: string
      name_en: string
      name_uz: string
      name_ru: string
    }
  }
  address: string
  created_time: string
  created_by: number | null
  logo: string
}

type Props = {
  open: boolean
  onClose: () => void
  id: number | null
}

const CompanyViewDialog = ({ open, onClose, id }: Props) => {
  const { t } = useTranslation()
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !open) return
      setLoading(true)
      try {
        const res = await DataService.get<Company>(endpoints.companyById(id))
        setCompany(res.data)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, open])

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>{String(t('company.view.title'))}</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : company ? (
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CustomAvatar
                  src={`${import.meta.env.VITE_FILE_URL}${company.logo}`}
                  variant='rounded'
                  sx={{
                    width: 200,
                    height: 200,
                    '& img': { width: '100%', height: '100%', objectFit: 'contain' }
                  }}
                />
                <Typography variant='h6' sx={{ mt: 2 }}>
                  {company.name}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant='body2' color='text.secondary'>
                    {String(t('company.form.code'))}
                  </Typography>
                  <Typography variant='body1'>{company.code}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='body2' color='text.secondary'>
                    {String(t('company.form.name'))}
                  </Typography>
                  <Typography variant='body1'>{company.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='body2' color='text.secondary'>
                    {String(t('company.form.active'))}
                  </Typography>
                  <Typography variant='body1'>
                    {company.is_active ? String(t('common.yes')) : String(t('common.no'))}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='body2' color='text.secondary'>
                    {String(t('company.form.phone'))}
                  </Typography>
                  <Typography variant='body1'>{company.phone}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='body2' color='text.secondary'>
                    {String(t('company.form.country'))}
                  </Typography>
                  <Typography variant='body1'>{company.country_detail?.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='body2' color='text.secondary'>
                    {String(t('company.form.region'))}
                  </Typography>
                  <Typography variant='body1'>{company.region_detail?.name_uz}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='body2' color='text.secondary'>
                    {String(t('company.form.district'))}
                  </Typography>
                  <Typography variant='body1'>{company.district_detail?.name_uz}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='body2' color='text.secondary'>
                    {String(t('company.form.address'))}
                  </Typography>
                  <Typography variant='body1'>{company.address}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant='body2' color='text.secondary'>
                    {String(t('common.createdAt'))}
                  </Typography>
                  <Typography variant='body1'>{moment(company.created_time).format('DD.MM.YYYY HH:mm')}</Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        ) : (
          <Typography color='text.secondary'>{String(t('common.notFound'))}</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{String(t('common.close'))}</Button>
      </DialogActions>
    </Dialog>
  )
}

export default CompanyViewDialog
