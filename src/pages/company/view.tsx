import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, Grid, Typography, CircularProgress, Box } from '@mui/material'
import { DataService } from 'src/configs/dataService'
import endpoints from 'src/configs/endpoints'

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
      <CardHeader title='Kompaniya maʼlumotlari' />
      <CardContent>
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : company ? (
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography>Kod: {company.code}</Typography>
              <Typography>Nomi: {company.name}</Typography>
              <Typography>Faol: {company.is_active ? 'Ha' : 'Yo‘q'}</Typography>
              <Typography>Telefon: {company.phone}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography>Viloyat: {company.region}</Typography>
              <Typography>Tuman: {company.district}</Typography>
              <Typography>Manzil: {company.address}</Typography>
            </Grid>
          </Grid>
        ) : (
          <Typography color='text.secondary'>Maʼlumot topilmadi</Typography>
        )}
      </CardContent>
    </Card>
  )
}

export default CompanyViewPage
