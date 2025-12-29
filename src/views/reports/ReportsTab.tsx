import { useState } from 'react'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'

import { useTranslation } from 'react-i18next'
import EmployeeReports from './EmployeeReports'
import OrganizationReports from './OrganizationReports'
import { TabContext,TabPanel } from '@mui/lab'
import { Grid, styled } from '@mui/material'
import { Icon } from '@iconify/react'
import MuiTabList, { TabListProps } from '@mui/lab/TabList'

const TabList = styled(MuiTabList)<TabListProps>(({ theme }) => ({
  borderBottom: '0 !important',
  '&, & .MuiTabs-scroller': {
    boxSizing: 'content-box',
    padding: theme.spacing(1.25, 1.25, 2),
    margin: `${theme.spacing(-1.25, -1.25, -2)} !important`
  },
  '& .MuiTabs-indicator': {
    display: 'none'
  },
  '& .Mui-selected': {
    boxShadow: theme.shadows[2],
    backgroundColor: theme.palette.primary.main,
    color: `${theme.palette.common.white} !important`
  },
  '& .MuiTab-root': {
    minWidth: 65,
    minHeight: 38,
    lineHeight: 1,
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
      color: theme.palette.primary.main
    },
    [theme.breakpoints.up('sm')]: {
      minWidth: 130
    }
  }
}))
const ReportsTab = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState<string>('employee')

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue)
  }
  const tabContentList: { [key: string]: React.ReactElement } = {
    employee: <EmployeeReports />,
    organization: <OrganizationReports />
  }

  return (
      <TabContext value={activeTab}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <TabList
              variant='scrollable'
              scrollButtons='auto'
              onChange={handleChange}
              aria-label='customized tabs example'
            >
              <Tab
                value='employee'
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Icon fontSize='1.25rem' icon='tabler:users' style={{
                        marginRight:'2px'
                    }} />
                    {String(t('reports.tabs.employee'))}
                  </Box>
                }
              />
              <Tab
                value='organization'
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Icon fontSize='1.25rem' icon='tabler:building-bank' style={{
                        marginRight:'2px'
                    }} />
                    {String(t('reports.tabs.organization'))}
                  </Box>
                }
              />
            </TabList>
          </Grid>
          <Grid item xs={12}>
            <TabPanel sx={{ p: 0 }} value={activeTab}>
              {tabContentList[activeTab]}
            </TabPanel>
          </Grid>
        </Grid>
      </TabContext>
  )
}

export default ReportsTab
