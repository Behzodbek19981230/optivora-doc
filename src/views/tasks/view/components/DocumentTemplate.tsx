import React from 'react'
import { useRef } from 'react'
import { Box, Container, Divider, Typography, Paper, Card, IconButton, useTheme } from '@mui/material'
import { useReactToPrint } from 'react-to-print'
import { Icon } from '@iconify/react'
import { TaskPartType, TaskType } from 'src/types/task'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

export default function DocumentTemplate({
  fullTask
}: {
  fullTask: {
    parts: TaskPartType[]
    task: TaskType
  }
}) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Virtual-Qabulxona-Hujjat'
  })

  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <Card>
      <Box sx={{ maxHeight: 500 }} ref={printRef}>
        <Container maxWidth='md' sx={{ p: 4, position: 'relative' }}>
          <Box
            sx={{
              display: 'flex',
              position: 'absolute',
              top: '10px',
              left: '10px',
              justifyContent: 'flex-end',
              mb: 2,
              '@media print': { display: 'none' }
            }}
          >
            <IconButton onClick={handlePrint}>
              <Icon icon='tabler:printer' />
            </IconButton>
          </Box>

          <Paper
            elevation={0}
            sx={{
              margin: '0 auto',
              p: 6,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: `1px solid ${theme.palette.divider}`,
              '@media print': {
                height: '200mm',
                width: '210mm'
              }
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Image src='/logo.svg' alt='Logo' width={100} height={100} />
              </Box>

              <Divider sx={{ my: 4 }} />

              {/* Title */}
              <Typography align='center' sx={{ fontWeight: 600, mb: 4, fontFamily: 'serif' }}>
                {fullTask?.task?.company_detail?.name}
              </Typography>
            </Box>

            {/* Names */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography sx={{ fontWeight: 400, fontFamily: 'serif' }}>
                {t('Imzolovchi')}: {fullTask?.task?.signed_by_detail?.fullname}
              </Typography>
              <Typography sx={{ fontWeight: 400, textDecoration: 'underline', mt: 1, fontFamily: 'serif' }}>
                {t('Ijrochilar')}: {fullTask?.parts?.map(part => part.assignee_detail?.fullname).join(', ')}
              </Typography>
            </Box>

            {/* Body */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography sx={{ mb: 2, fontFamily: 'serif' }}>{fullTask?.task?.note}</Typography>
            </Box>

            {/* Footer */}
            <Box sx={{ textAlign: 'center', mt: 6 }}>
              <Typography sx={{ fontWeight: 500, fontFamily: 'serif' }}>
                {t('Deadline')}: {moment(fullTask?.task?.end_date).format('DD.MM.YYYY')}
              </Typography>
            </Box>

            <Box sx={{ mt: 6 }}>
              <Typography variant='body2' sx={{ fontFamily: 'serif' }}>
                №{fullTask?.task?.input_doc_number}
              </Typography>
              <Typography variant='body2' sx={{ fontFamily: 'serif' }}>
                {moment(fullTask?.task?.start_date).format('DD.MM.YYYY')}
              </Typography>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Card>
  )
}
