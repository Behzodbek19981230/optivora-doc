// ** MUI Import
import Grid from '@mui/material/Grid'

// ** Custom Component Import
import ApexChartWrapper from 'src/@core/styles/libs/react-apexcharts'
import EcommerceCongratulationsJohn from 'src/views/dashboards/EcommerceCongratulationsJohn'
import EcommerceEarningReports from 'src/views/dashboards/EcommerceEarningReports'
import EcommerceExpenses from 'src/views/dashboards/EcommerceExpenses'
import EcommerceGeneratedLeads from 'src/views/dashboards/EcommerceGeneratedLeads'
import EcommerceInvoiceTable from 'src/views/dashboards/EcommerceInvoiceTable'
import EcommerceOrders from 'src/views/dashboards/EcommerceOrders'
import EcommercePopularProducts from 'src/views/dashboards/EcommercePopularProducts'
import EcommerceProfit from 'src/views/dashboards/EcommerceProfit'
import EcommerceRevenueReport from 'src/views/dashboards/EcommerceRevenueReport'
import EcommerceStatistics from 'src/views/dashboards/EcommerceStatistics'
import EcommerceTransactions from 'src/views/dashboards/EcommerceTransactions'

const EcommerceDashboard = () => {
  return (
    <ApexChartWrapper>
      <Grid container spacing={6}>
        <Grid item xs={12} md={4}>
          <EcommerceCongratulationsJohn />
        </Grid>
        <Grid item xs={12} md={8}>
          <EcommerceStatistics />
        </Grid>
        <Grid item xs={12} lg={4}>
          <Grid container spacing={6}>
            <Grid item xs={6} md={3} lg={6}>
              <EcommerceExpenses />
            </Grid>
            <Grid item xs={6} md={3} lg={6}>
              <EcommerceProfit />
            </Grid>
            <Grid item xs={12} md={6} lg={12}>
              <EcommerceGeneratedLeads />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} lg={8}>
          <EcommerceRevenueReport />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <EcommerceEarningReports />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <EcommercePopularProducts />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <EcommerceOrders />
        </Grid>
        <Grid item xs={12} md={6} lg={4}>
          <EcommerceTransactions />
        </Grid>
        <Grid item xs={12} lg={8}>
          <EcommerceInvoiceTable />
        </Grid>
      </Grid>
    </ApexChartWrapper>
  )
}

export default EcommerceDashboard
