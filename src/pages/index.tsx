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

const Home = () => {
  const { user } = useAuth()
  const { t } = useTranslation()
  const { data, isLoading, isError } = useQuery<{ results: any }>({
    queryKey: ['dashboard/stats/'],
    queryFn: async () => {
      const res = await DataService.post<{ results: any }>(
        'dashboard/stats/',
        user?.company_id != null
          ? {
              company: Number(user?.company_id)
            }
          : {}
      )
      return res.data || { results: [] }
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

  const dashboardData = data || mockData

  return (
    <ApexChartWrapper>
      <Grid container spacing={6}>
        <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
          <EcommerceCongratulationsJohn />
        </Grid>
        <Grid item xs={12} md={8} sx={{ display: 'flex' }}>
          {dashboardData?.cards && <DashboardCards cards={dashboardData.cards} />}
        </Grid>
        <Grid item xs={12} lg={6}>
          {dashboardData?.charts?.accepted_vs_archived && (
            <AcceptedVsArchivedChart chartData={dashboardData.charts.accepted_vs_archived} />
          )}
        </Grid>
        <Grid item xs={12} lg={6}>
          {dashboardData?.charts?.documents_by_status && (
            <DocumentsByStatusChart chartData={dashboardData.charts.documents_by_status} />
          )}
        </Grid>
      </Grid>
    </ApexChartWrapper>
  )
}

export default Home
