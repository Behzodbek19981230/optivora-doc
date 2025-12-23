import type { TFunction } from 'i18next'
import type { GridLocaleText } from '@mui/x-data-grid'

export const getDataGridLocaleText = (t: TFunction): Partial<GridLocaleText> => {
  return {
    noRowsLabel: String(t('common.datagrid.noRows', { defaultValue: 'No rows' })),
    MuiTablePagination: {
      labelRowsPerPage: String(t('common.datagrid.rowsPerPage', { defaultValue: 'Rows per page:' })),
      labelDisplayedRows: ({ from, to, count }) =>
        `${from}–${to} ${String(t('common.datagrid.of', { defaultValue: 'of' }))} ${count !== -1 ? count : `>${to}`}`
    }
  }
}
