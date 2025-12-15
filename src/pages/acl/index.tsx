import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

const ACLInfoPage = () => {
  return (
    <Card>
      <CardHeader title='Access Control' />
      <CardContent>
        <Typography variant='body2'>This is a placeholder page for ACL documentation and demos.</Typography>
      </CardContent>
    </Card>
  )
}

ACLInfoPage.authGuard = true

export default ACLInfoPage
