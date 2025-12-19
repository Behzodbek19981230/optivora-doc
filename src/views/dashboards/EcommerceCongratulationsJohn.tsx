// ** MUI Imports
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'
import { useAuth } from 'src/hooks/useAuth'
import { useTranslation } from 'react-i18next'

const Illustration = styled('img')(({ theme }) => ({
  right: 20,
  bottom: 0,
  position: 'absolute',
  [theme.breakpoints.down('sm')]: {
    right: 5,
    width: 110
  }
}))

const EcommerceCongratulationsJohn = () => {
  const { user } = useAuth()
  const { t } = useTranslation()
  return (
    <Card sx={{ position: 'relative', flex: 1 }}>
      <CardContent sx={{ height: 192 }}>
        <Typography variant='h5' sx={{ mb: 0.5 }}>
          {String(t('dashboards.congrats.title', { name: user?.fullname || '' }))}
        </Typography>
        <Typography sx={{ mb: 2, color: 'text.secondary' }}>{String(t('dashboards.congrats.subtitle'))}</Typography>

        <Illustration width={116} alt='congratulations john' src='/images/cards/congratulations-john.png' />
      </CardContent>
    </Card>
  )
}

export default EcommerceCongratulationsJohn
