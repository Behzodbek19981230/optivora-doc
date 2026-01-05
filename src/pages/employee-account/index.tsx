import { Grid } from '@mui/material'
import EmployeeAccountTable from 'src/views/employee-account/EmployeeAccountTable'

const EmployeeAccountPage = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <EmployeeAccountTable />
      </Grid>
    </Grid>
  )
}

EmployeeAccountPage.acl = { action: 'read', subject: 'employee-account' }
EmployeeAccountPage.authGuard = true

export default EmployeeAccountPage
