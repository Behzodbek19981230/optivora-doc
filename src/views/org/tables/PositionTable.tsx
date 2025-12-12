import { useState } from 'react'
import CardHeader from '@mui/material/CardHeader'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import { TablePagination } from '@mui/material'
import DeleteConfirmDialog from 'src/views/locations/dialogs/DeleteConfirmDialog'
import Icon from 'src/@core/components/icon'
import endpoints from 'src/configs/endpoints'
import { useFetchList } from 'src/hooks/useFetchList'
import { DataService } from 'src/configs/dataService'
import toast from 'react-hot-toast'
import PositionFormDialog from '../dialogs/PositionFormDialog'

const PositionTable = () => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const { data, total, loading, mutate } = useFetchList<any>(endpoints.position, {
    page: page + 1,
    perPage: rowsPerPage,
    search
  })
  const [openForm, setOpenForm] = useState(false)
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [selected, setSelected] = useState<any | null>(null)
  const [openDelete, setOpenDelete] = useState(false)

  const handleCreate = () => {
    setFormMode('create')
    setSelected(null)
    setOpenForm(true)
  }
  const handleEdit = (item: any) => {
    setFormMode('edit')
    setSelected(item)
    setOpenForm(true)
  }
  const handleDelete = (item: any) => {
    setSelected(item)
    setOpenDelete(true)
  }
  const handleDeleteConfirm = async () => {
    if (selected) {
      await DataService.delete(endpoints.positionById(selected.id))
      mutate()
      setOpenDelete(false)
      toast.success('Lavozim muvaffaqiyatli o\u2018chirildi')
    }
  }

  return (
    <>
      <CardHeader
        title='Lavozimlar'
        action={
          <Button variant='contained' startIcon={<Icon icon='tabler:plus' />} onClick={handleCreate}>
            Yangi lavozim
          </Button>
        }
      />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nomi</TableCell>
              <TableCell>Nomi (EN)</TableCell>
              <TableCell>Nomi (UZ)</TableCell>
              <TableCell>Nomi (RU)</TableCell>
              <TableCell>Bo'lim</TableCell>
              <TableCell align='right'>Amallar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align='center'>
                  Yuklanmoqda…
                </TableCell>
              </TableRow>
            ) : data && data.length > 0 ? (
              data.map((row: any) => (
                <TableRow key={row.id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.name_en}</TableCell>
                  <TableCell>{row.name_uz}</TableCell>
                  <TableCell>{row.name_ru}</TableCell>
                  <TableCell>{row.department_detail?.name_uz || row.department}</TableCell>
                  <TableCell align='right'>
                    <Stack direction='row' spacing={1} justifyContent='flex-end'>
                      <Tooltip title='Tahrirlash'>
                        <IconButton size='small' onClick={() => handleEdit(row)}>
                          <Icon icon='tabler:edit' />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="O'chirish">
                        <IconButton size='small' color='error' onClick={() => handleDelete(row)}>
                          <Icon icon='tabler:trash' />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align='center'>
                  Ma‘lumotlar yo‘q
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component='div'
        count={total}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={e => {
          setRowsPerPage(parseInt(e.target.value, 10))
          setPage(0)
        }}
        rowsPerPageOptions={[5, 10, 20, 50]}
      />
      <PositionFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSaved={mutate}
        mode={formMode}
        item={selected}
      />
      <DeleteConfirmDialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={handleDeleteConfirm}
        title='Lavozimni o\u2018chirishni tasdiqlang'
        description={selected ? `“${selected.name_uz || selected.name}” lavozimini o\u2018chirmoqchimisiz?` : undefined}
      />
    </>
  )
}

export default PositionTable
