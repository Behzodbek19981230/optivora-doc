import { useState } from 'react'
import {
  Card,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Stack,
  TablePagination
} from '@mui/material'
import Tooltip from '@mui/material/Tooltip'
import IconifyIcon from 'src/@core/components/icon'
import endpoints from 'src/configs/endpoints'
import { useFetchList } from 'src/hooks/useFetchList'
import { DataService } from 'src/configs/dataService'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'

const AddIcon = () => <span style={{ fontWeight: 'bold' }}>＋</span>

const ReplyLetterTable = () => {
  const router = useRouter()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selected, setSelected] = useState<any | null>(null)
  const [openDelete, setOpenDelete] = useState(false)

  const { data, total, loading, mutate } = useFetchList(endpoints.replyLetter, {
    page: page + 1,
    perPage: rowsPerPage
  })

  const handleEdit = (item: any) => {
    router.push(`/reply-letter/${item.id}`)
  }

  const handleDelete = (item: any) => {
    setSelected(item)
    setOpenDelete(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selected) return
    await DataService.delete(endpoints.replyLetterById(selected.id))
    mutate()
    setOpenDelete(false)
    toast.success('Javob xati o‘chirildi')
  }

  return (
    <Card>
      <CardHeader
        title='Javob xatlari'
        action={
          <Button variant='contained' startIcon={<AddIcon />} onClick={() => router.push('/reply-letter/create')}>
            Yangi javob xati
          </Button>
        }
      />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Hujjat raqami</TableCell>
              <TableCell>Asos</TableCell>
              <TableCell>Mas'ul</TableCell>
              <TableCell>Tashkilot</TableCell>
              <TableCell>Yaratilgan</TableCell>
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
                  <TableCell>{row.letter_number}</TableCell>
                  <TableCell>{row.basis}</TableCell>
                  <TableCell>
                    {row.responsible_person_detail ? row.responsible_person_detail.name : row.responsible_person}
                  </TableCell>
                  <TableCell>{row.company_detail ? row.company_detail.name : ''}</TableCell>
                  <TableCell>{row.created_time}</TableCell>
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

      {/* Simple delete confirm */}
      {openDelete && <div style={{ display: 'none' }} />}
    </Card>
  )
}

export default ReplyLetterTable
