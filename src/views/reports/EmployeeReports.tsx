
// ** MUI Components
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'


// ** Types
import { useQuery } from '@tanstack/react-query'
import { DataService } from 'src/configs/dataService'
import { useAuth } from 'src/hooks/useAuth'
import { EmployeesResponseType } from 'src/types/report'
import { Skeleton } from '@mui/material'
import Icon from 'src/@core/components/icon'

const EmployeeReports = () => {
    const {user}=useAuth()
   const { data, isLoading } = useQuery<EmployeesResponseType>({
    queryKey: ['reports/employees/'],
    queryFn: async () => {
      const params: any = {
        company:user?.company_id,
        perPage: 50
      }
     
      const res = await DataService.post<EmployeesResponseType>('reports/employees/', params)

      return res.data || { results: [] }
    },
    staleTime: 10_000
  })

  
if(isLoading){
    return <Grid container spacing={6}>
    {[...Array(6)].map((item, index) => {
      return (
        <Grid key={index} item xs={12} sm={6} md={4}>
         <Skeleton variant='rectangular' height={300} sx={{ borderRadius: 2 }} />
        </Grid>
      )
    })}
  </Grid>
}
  
  
return (
    <Grid container spacing={6}>
      {data &&
        Array.isArray(data.employees) &&
        data.employees.map((item, index) => {
          return (
            <Grid key={index} item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  position: 'relative',
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'box-shadow 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                  }
                }}
              >
                
                <CardContent sx={{ pt: 9.5, pb: 5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                    <Avatar
                      src={item.avatar || undefined}
                      sx={{
                        mb: 3,
                        width: 100,
                        height: 100,
                        border: '3px solid',
                        borderColor: 'primary.main',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Typography variant='h5' sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>{item.fullname}</Typography>
                    <Typography sx={{ mb: 3, color: 'text.secondary', fontWeight: 500, textAlign: 'center' }}>{item.username}</Typography>
                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center' }}>
                      <Icon icon='tabler:mail' fontSize={18} style={{ marginRight: 8, color: 'primary.main' }} />
                      <Typography variant='body2' sx={{ color: 'text.primary' }}>
                        {item.email}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'center' }}>
                      <Icon icon='tabler:phone' fontSize={18} style={{ marginRight: 8, color: 'primary.main' }} />
                      <Typography variant='body2' sx={{ color: 'text.primary' }}>
                        {item.phone_number}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        gap: 1,
                        width: '100%',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-around'
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          flexDirection: 'column',
                          p: 1.5,
                          minWidth: 70,
                          textAlign: 'center'
                        }}
                      >
                        <Icon icon='tabler:list' fontSize={24} style={{ marginBottom: 4, color: 'text.secondary' }} />
                        <Typography variant='h6' sx={{ fontWeight: 600,  }}>{item.stats.total}</Typography>
                        <Typography sx={{  fontSize: 12 }}>Total</Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          flexDirection: 'column',
                          p: 1.5,
                        
                          minWidth: 70,
                          textAlign: 'center'
                        }}
                      >
                        <Icon icon='tabler:check' fontSize={24} style={{ marginBottom: 4, color: 'success.main' }} />
                        <Typography variant='h6' sx={{ fontWeight: 600, }}>{item.stats.done}</Typography>
                        <Typography sx={{  fontSize: 12 }}>Done</Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          flexDirection: 'column',
                          p: 1.5,
                         
                          minWidth: 70,
                          textAlign: 'center'
                        }}
                      >
                        <Icon icon='tabler:clock' fontSize={24} style={{ marginBottom: 4, color: 'warning.main' }} />
                        <Typography variant='h6' sx={{ fontWeight: 600, }}>{item.stats.in_progress}</Typography>
                        <Typography sx={{  fontSize: 12 }}>In Progress</Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          flexDirection: 'column',
                          p: 1.5,
                       
                          minWidth: 70,
                          textAlign: 'center'
                        }}
                      >
                        <Icon icon='tabler:alert-triangle' fontSize={24} style={{ marginBottom: 4,  }} />
                        <Typography variant='h6' sx={{ fontWeight: 600,  }}>{item.stats.overdue}</Typography>
                        <Typography sx={{ fontSize: 12 }}>Overdue</Typography>
                      </Box>
                    </Box>
                   
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
    </Grid>
  )
}

export default EmployeeReports
