// ** React Imports
import { MouseEvent, useState } from 'react'

// ** MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { styled, useTheme } from '@mui/material/styles'

// ** Third Party Imports
import { ApexOptions } from 'apexcharts'

// ** Custom Components Imports
import ReactApexcharts from 'src/@core/components/react-apexcharts'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'
import { useTranslation } from 'react-i18next'

interface ChartData {
  labels: string[]
  datasets: {
    key: string
    label: string
    data: number[]
  }[]
}

interface AcceptedVsArchivedChartProps {
  chartData: ChartData
}

const AcceptedVsArchivedChart = ({ chartData }: AcceptedVsArchivedChartProps) => {
  // ** Hooks & Var
  const theme = useTheme()
  const { t } = useTranslation()

  const series = chartData.datasets.map(dataset => ({
    name: String(t(`dashboards.charts.${dataset.key}`)),
    data: dataset.data
  }))

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      stacked: false,
      parentHeightOffset: 0,
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '60%'
      }
    },
    dataLabels: { enabled: false },
    colors: [hexToRGBA(theme.palette.primary.main, 1), hexToRGBA(theme.palette.warning.main, 1)],
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      labels: { colors: theme.palette.text.secondary },
      markers: {
        width: 12,
        height: 12,
        radius: 10,
        offsetY: 1
      }
    },
    stroke: {
      width: 2,
      colors: [theme.palette.background.paper]
    },
    xaxis: {
      categories: chartData.labels,
      labels: {
        style: { colors: theme.palette.text.secondary }
      }
    },
    yaxis: {
      labels: {
        style: { colors: theme.palette.text.secondary }
      }
    },
    grid: {
      borderColor: theme.palette.divider,
      padding: {
        top: -10,
        right: 0,
        left: -10,
        bottom: 0
      }
    },
    tooltip: {
      theme: 'light'
    }
  }

  return (
    <Card>
      <CardHeader title={String(t('dashboards.charts.acceptedVsArchived'))} />
      <CardContent>
        <ReactApexcharts type='bar' height={400} options={options} series={series} />
      </CardContent>
    </Card>
  )
}

export default AcceptedVsArchivedChart
