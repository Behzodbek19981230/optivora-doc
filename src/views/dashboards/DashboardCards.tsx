// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Types
import { ThemeColor } from 'src/@core/layouts/types'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'
import { useTranslation } from 'react-i18next'

interface DataType {
  icon: string
  stats: string
  title: string
  color: ThemeColor
}

interface DashboardCardsProps {
  cards: {
    employees_count: number
    documents_count: number
    archive_documents_count: number
    orders_count: number
  }
}

const renderStats = (cards: DashboardCardsProps['cards'], t: (key: string) => string) => {
  const data: DataType[] = [
    {
      stats: cards.employees_count.toString(),
      title: String(t('dashboards.statistics.employees')),
      color: 'primary',
      icon: 'tabler:users'
    },
    {
      color: 'info',
      stats: cards.documents_count.toString(),
      title: String(t('dashboards.statistics.documents')),
      icon: 'tabler:file-text'
    },
    {
      color: 'error',
      stats: cards.archive_documents_count.toString(),
      title: String(t('dashboards.statistics.archiveDocuments')),
      icon: 'tabler:archive'
    },
    {
      stats: cards.orders_count.toString(),
      color: 'success',
      title: String(t('dashboards.statistics.orders')),
      icon: 'tabler:clipboard-list'
    }
  ]

  return data.map((item: DataType, index: number) => (
    <Grid item xs={6} md={3} key={index}>
      <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
        <CustomAvatar skin='light' color={item.color} sx={{ mr: 4, width: 42, height: 42 }}>
          <Icon icon={item.icon} fontSize='1.5rem' />
        </CustomAvatar>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant='h5'>{item.stats}</Typography>
          <Typography variant='body2'>{item.title}</Typography>
        </Box>
      </Box>
    </Grid>
  ))
}

const DashboardCards = ({ cards }: DashboardCardsProps) => {
  const { t } = useTranslation()
  return (
    <Card sx={{ flex: 1 }}>
      <CardHeader
        title={String(t('dashboards.statistics.title'))}
        sx={{ '& .MuiCardHeader-action': { m: 0, alignSelf: 'center' } }}
        action={
          <Typography variant='body2' sx={{ color: 'text.disabled' }}>
            {String(t('dashboards.statistics.updated'))}
          </Typography>
        }
      />
      <CardContent
        sx={{ pt: theme => `${theme.spacing(7)} !important`, pb: theme => `${theme.spacing(7.5)} !important` }}
      >
        <Grid container spacing={6}>
          {renderStats(cards, t)}
        </Grid>
      </CardContent>
    </Card>
  )
}

export default DashboardCards
