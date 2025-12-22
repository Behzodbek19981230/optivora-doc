// ** MUI Import
import Grid from '@mui/material/Grid'
import { useQuery } from '@tanstack/react-query'

// ** Custom Component Import
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'
import { DataService } from 'src/configs/dataService'
import { useAuth } from 'src/hooks/useAuth'
import EcommerceCongratulationsJohn from 'src/views/dashboards/EcommerceCongratulationsJohn'

import DashboardCards from 'src/views/dashboards/DashboardCards'
import AcceptedVsArchivedChart from 'src/views/dashboards/AcceptedVsArchivedChart'
import DocumentsByStatusChart from 'src/views/dashboards/DocumentsByStatusChart'
import { useTranslation } from 'react-i18next'

type DashboardCardsData = {
  employees_count: number
  documents_count: number
  archive_documents_count: number
  orders_count: number
}

type DashboardChartDataset = {
  key: string
  label: string
  data: number[]
}

type DashboardChart = {
  labels: string[]
  datasets: DashboardChartDataset[]
}

type DashboardStats = {
  company_id: number
  year: number
  cards: DashboardCardsData
  charts: {
    accepted_vs_archived: DashboardChart
    documents_by_status: DashboardChart
  }
}

function isDashboardStats(v: unknown): v is DashboardStats {
  const x = v as any

  return !!x && typeof x === 'object' && !!x.cards && !!x.charts && !!x.charts.accepted_vs_archived
}

const Home = () => {
  const { user } = useAuth()
  const { t } = useTranslation()
  const { data, isLoading, isError } = useQuery<unknown>({
    queryKey: ['dashboard/stats/'],
    queryFn: async () => {
      const res = await DataService.post<unknown>(
        'dashboard/stats/',
        user?.company_id != null
          ? {
              company: Number(user?.company_id)
            }
          : {}
      )

      return res.data
    },
    enabled: !!user,
    staleTime: 10_000
  })

  console.log('Data from API:', data)

  if (isLoading) return <div>{String(t('common.loading'))}</div>
  if (isError) return <div>{String(t('errors.somethingWentWrong'))}</div>

  const mockData = {
    company_id: 3,
    year: 2025,
    cards: {
      employees_count: 2,
      documents_count: 2,
      archive_documents_count: 0,
      orders_count: 0
    },
    charts: {
      accepted_vs_archived: {
        labels: [
          String(t('month.jan')),
          String(t('month.feb')),
          String(t('month.mar')),
          String(t('month.apr')),
          String(t('month.may')),
          String(t('month.jun')),
          String(t('month.jul')),
          String(t('month.aug')),
          String(t('month.sep')),
          String(t('month.oct')),
          String(t('month.nov')),
          String(t('month.dec'))
        ],
        datasets: [
          {
            key: 'accepted',
            label: 'Qabul qilingan',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2]
          },
          {
            key: 'archived',
            label: 'Arxiv (DONE)',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          }
        ]
      },
      documents_by_status: {
        labels: [
          String(t('month.jan')),
          String(t('month.feb')),
          String(t('month.mar')),
          String(t('month.apr')),
          String(t('month.may')),
          String(t('month.jun')),
          String(t('month.jul')),
          String(t('month.aug')),
          String(t('month.sep')),
          String(t('month.oct')),
          String(t('month.nov')),
          String(t('month.dec'))
        ],
        datasets: [
          {
            key: 'new',
            label: 'Yangi ro‘yxatga olingan',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2]
          },
          {
            key: 'in_progress',
            label: 'Jarayonda',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          },
          {
            key: 'on_review',
            label: 'Ko‘rib chiqilmoqda',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          },
          {
            key: 'returned',
            label: 'Qaytarilgan',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          },
          {
            key: 'done',
            label: 'Ijrosi ta’minlangan',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          },
          {
            key: 'cancelled',
            label: 'Bekor qilingan',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          }
        ]
      }
    }
  }

  const apiPayload: any = data as any
  const apiStats: DashboardStats | undefined = isDashboardStats(apiPayload)
    ? apiPayload
    : isDashboardStats(apiPayload?.results)
    ? apiPayload.results
    : undefined

  const dashboardData: DashboardStats = apiStats || mockData

  return (
    <ApexChartWrapper>
      <Grid container spacing={6}>
        <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
          <EcommerceCongratulationsJohn />
        </Grid>
        <Grid item xs={12} md={8} sx={{ display: 'flex' }}>
          <DashboardCards cards={dashboardData.cards} />
        </Grid>
        <Grid item xs={12} lg={6}>
          <AcceptedVsArchivedChart chartData={dashboardData.charts.accepted_vs_archived} />
        </Grid>
        <Grid item xs={12} lg={6}>
          <DocumentsByStatusChart chartData={dashboardData.charts.documents_by_status} />
        </Grid>
      </Grid>
    </ApexChartWrapper>
  )
}

export default Home
