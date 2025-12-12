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

const AddIcon = () => <span style={{ fontWeight: 'bold' }}>＋</span>
import { Card, TablePagination } from '@mui/material'

import IconifyIcon from 'src/@core/components/icon'
import endpoints from 'src/configs/endpoints'
import { useFetchList } from 'src/hooks/useFetchList'
import { DataService } from 'src/configs/dataService'
import toast from 'react-hot-toast'
import DeleteConfirmDialog from './dialogs/DeleteConfirmDialog'
import { CommandType } from 'src/types/command'
import { useRouter } from 'next/router'
import moment from 'moment'

const CommandTable = () => {
  const router = useRouter()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const { data, total, loading, mutate } = useFetchList(endpoints.command, {
    page: page + 1,
    perPage: rowsPerPage,
    search
  })
  const [selected, setSelected] = useState<any | null>(null)
  const [openDelete, setOpenDelete] = useState(false)

  const handleEdit = (item: any) => {
    router.push(`/commands/${item.id}`)
  }
  const handleDelete = (item: any) => {
    setSelected(item)
    setOpenDelete(true)
  }
  const handleDeleteConfirm = async () => {
    if (selected) {
      // TODO: Replace with your actual DataService
      await DataService.delete(endpoints.commandById(selected.id))
      mutate()
      setOpenDelete(false)
      toast.success('Buyruq muvaffaqiyatli o‘chirildi')
    }
  }

  return (
    <Card>
      <CardHeader
        title='Buyruqlar'
        action={
          <Button variant='contained' startIcon={<AddIcon />} onClick={() => router.push('/commands/create')}>
            Yangi buyruq yaratish
          </Button>
        }
      />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Buyruq nomeri</TableCell>
              <TableCell>Buyruq asosi</TableCell>
              <TableCell>Izoh</TableCell>
              <TableCell>Tashkilot</TableCell>
              <TableCell> Yaratilgan vaqti </TableCell>
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
              data.map((row: CommandType) => (
                <TableRow key={row.id}>
                  <TableCell>{row.command_number}</TableCell>
                  <TableCell>{row.basis}</TableCell>
                  <TableCell>{row.comment}</TableCell>
                  <TableCell>{row.company_detail ? row.company_detail.name : ''}</TableCell>
                  <TableCell>{moment(row.created_time).format('YYYY-MM-DD HH:mm')} </TableCell>

                  <TableCell align='right'>
                    <Stack direction='row' spacing={1} justifyContent='flex-end'>
                      <Tooltip title='Tahrirlash'>
                        <IconButton size='small' onClick={() => handleEdit(row)}>
                          <IconifyIcon icon='tabler:edit' />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title='O‘chirish'>
                        <IconButton size='small' color='error' onClick={() => handleDelete(row)}>
                          <IconifyIcon icon='tabler:trash' />
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

      <DeleteConfirmDialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={handleDeleteConfirm}
        title='Viloyatni o‘chirishni tasdiqlang'
        description={selected ? `“${selected.name_uz}” viloyatini o‘chirmoqchimisiz?` : undefined}
      />
    </Card>
  )
}

export default CommandTable
