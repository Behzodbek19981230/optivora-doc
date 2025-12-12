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
import DepartmentFormDialog from '../dialogs/DepartmentFormDialog'

const DepartmentTable = () => {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const { data, total, loading, mutate } = useFetchList<any>(endpoints.department, {
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
      await DataService.delete(endpoints.departmentById(selected.id))
      mutate()
      setOpenDelete(false)
      toast.success('Bo\u2018lim muvaffaqiyatli o\u2018chirildi')
    }
  }

  return (
    <>
      <CardHeader
        title="Bo'limlar"
        action={
          <Button variant='contained' startIcon={<Icon icon='tabler:plus' />} onClick={handleCreate}>
            Yangi bo'lim
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
              <TableCell align='right'>Amallar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align='center'>
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
                  <TableCell align='right'>
                    <Stack direction='row' spacing={1} justifyContent='flex-end'>
                      <Tooltip title='Tahrirlash'>
                        <IconButton size='small' onClick={() => handleEdit(row)}>
                          <Icon icon='tabler:edit' />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='O\u2018chirish'>
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
                <TableCell colSpan={5} align='center'>
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
      <DepartmentFormDialog
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
        title="Bo'limni ochirishni tasdiqlang"
        description={selected ? `“${selected.name_uz || selected.name}” bo'limini ochirmoqchimisiz?` : undefined}
      />
    </>
  )
}

export default DepartmentTable
