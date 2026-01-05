import { useState } from 'react'
import { Card, CardHeader } from '@mui/material'
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import IconifyIcon from 'src/@core/components/icon'
import endpoints from 'src/configs/endpoints'
import { useFetchList } from 'src/hooks/useFetchList'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { getDataGridLocaleText } from 'src/@core/utils/getDataGridLocaleText'
import Chip from '@mui/material/Chip'

type EmployeeAccountType = {
  id: number
  company: number
  company_detail?: {
    id: number
    name: string
  }
  employee: number
  employee_detail?: {
    id: number
    fullname: string
    username: string
  }
  date: string
  type: 'input' | 'output'
  comment?: string
  created_time?: string
}

const EmployeeAccountTable = () => {
  const { t } = useTranslation()
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 })
  const {
    data = [],
    loading,
    total
  } = useFetchList<EmployeeAccountType>(endpoints.employeeAccount, {
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize
  })

  const columns: GridColDef[] = [
    {
      field: 'employee_detail',
      headerName: String(t('employeeAccount.table.employee') || 'Employee'),
      flex: 0.2,
      minWidth: 180,
      valueGetter: params =>
        params.row.employee_detail ? params.row.employee_detail.fullname || params.row.employee_detail.username : ''
    },
    {
      field: 'company_detail',
      headerName: String(t('employeeAccount.table.company') || 'Company'),
      flex: 0.18,
      minWidth: 160,
      valueGetter: params => (params.row.company_detail ? params.row.company_detail.name : '')
    },
    {
      field: 'type',
      headerName: String(t('employeeAccount.table.type') || 'Type'),
      flex: 0.15,
      minWidth: 120,
      renderCell: params => {
        const type = params.row.type
        const isInput = type === 'input'

        return (
          <Chip
            label={isInput ? String(t('attendance.input') || 'Input') : String(t('attendance.output') || 'Output')}
            color={isInput ? 'success' : 'info'}
            size='small'
            variant='outlined'
          />
        )
      }
    },
    {
      field: 'date',
      headerName: String(t('employeeAccount.table.date') || 'Date'),
      flex: 0.2,
      minWidth: 180,
      valueGetter: params =>
        params.row.date ? moment(params.row.date).format('DD.MM.YYYY HH:mm') : ''
    },
    {
      field: 'comment',
      headerName: String(t('employeeAccount.table.comment') || 'Comment'),
      flex: 0.3,
      minWidth: 200,
      valueGetter: params => params.row.comment || '—'
    }
  ]

  return (
    <Card>
      <CardHeader
        title={String(t('employeeAccount.title') || 'Employee Account')}
        avatar={<IconifyIcon icon='tabler:clock-hour-4' fontSize='1.5rem' />}
      />
      <DataGrid
        autoHeight
        rows={data}
        columns={columns}
        loading={loading}
        rowCount={total}
        pageSizeOptions={[10, 25, 50]}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        paginationMode='server'
        localeText={getDataGridLocaleText(t)}
        disableRowSelectionOnClick
      />
    </Card>
  )
}

export default EmployeeAccountTable
