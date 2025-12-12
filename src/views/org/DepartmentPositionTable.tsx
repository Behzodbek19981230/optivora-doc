import { useState } from 'react'
import Card from '@mui/material/Card'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'
import DepartmentTable from './tables/DepartmentTable'
import PositionTable from './tables/PositionTable'

const DepartmentPositionTable = () => {
  const [tab, setTab] = useState(0)
  return (
    <Card>
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label="Bo'limlar" />
        <Tab label='Lavozimlar' />
      </Tabs>
      <Box sx={{ p: 2 }}>
        {tab === 0 && <DepartmentTable key={`tab-${tab}`} />}
        {tab === 1 && <PositionTable key={`tab-${tab}`} />}
      </Box>
    </Card>
  )
}

export default DepartmentPositionTable
