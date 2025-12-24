import { useRouter } from 'src/spa/router/useRouter'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, Grid, Typography, CircularProgress, Box } from '@mui/material'
import { DataService } from 'src/configs/dataService'
import endpoints from 'src/configs/endpoints'
import { useTranslation } from 'react-i18next'

interface Company {
  id: number
  code: string
  name: string
  is_active: boolean
  phone: string
  region: number
  district: number
  address: string
  created_by: number
  logo?: string
}

const CompanyViewPage = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const { id } = router.query
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      setLoading(true)
      try {
        const res = await DataService.get<Company>(endpoints.companyById(id))
        setCompany(res.data)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (!id) return null

  return (
    <Card sx={{ mt: 6 }}>
      <CardHeader title={String(t('company.view.title'))} />
      <CardContent>
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : company ? (
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography>
                {String(t('company.form.code'))}: {company.code}
              </Typography>
              <Typography>
                {String(t('company.form.name'))}: {company.name}
              </Typography>
              <Typography>
                {String(t('company.form.active'))}:{' '}
                {company.is_active ? String(t('common.yes')) : String(t('common.no'))}
              </Typography>
              <Typography>
                {String(t('company.form.phone'))}: {company.phone}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography>
                {String(t('company.form.region'))}: {company.region}
              </Typography>
              <Typography>
                {String(t('company.form.district'))}: {company.district}
              </Typography>
              <Typography>
                {String(t('company.form.address'))}: {company.address}
              </Typography>
            </Grid>
          </Grid>
        ) : (
          <Typography color='text.secondary'>{String(t('common.notFound'))}</Typography>
        )}
      </CardContent>
    </Card>
  )
}

export default CompanyViewPage
