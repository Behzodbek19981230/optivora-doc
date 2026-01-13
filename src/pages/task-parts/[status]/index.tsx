import type { GetStaticPaths, GetStaticProps } from 'next/types'
import { Card, CardHeader, CardContent, Tab, Box, styled } from '@mui/material'
import { useState } from 'react'
import { useAuth } from 'src/hooks/useAuth'
import { ROLES } from 'src/configs/consts'
import TaskPartTabs, { TaskPartStatus } from 'src/views/task-parts/TaskPartTabs'
import { useTranslation } from 'react-i18next'
import MuiTabList, { TabListProps } from '@mui/lab/TabList'
import { TabContext } from '@mui/lab'

type Props = { status: TaskPartStatus }
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
    lineHeight: 1,
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
      color: theme.palette.primary.main
    }
  }
}))
const TaskPartsStatusPage = ({ status }: Props) => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const isAdminOrManager =
    !!user?.role_detail?.map(r => r.id.toString()).includes(ROLES.ADMIN) ||
    !!user?.role_detail?.map(r => r.id.toString()).includes(ROLES.MANAGER)

  const [ownerFilter, setOwnerFilter] = useState<'mine' | 'all'>(isAdminOrManager ? 'all' : 'mine')

  return (
    <Card>
      <CardHeader title={String(t('taskParts.title') || 'Task Parts')} />
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <TabContext value={ownerFilter}>
            <TabList value={ownerFilter} onChange={(_: any, v: any) => setOwnerFilter(v)}>
              <Tab value='mine' label={String(t('documents.myDocuments') || 'Mening hujjatlarim')} />
              {isAdminOrManager && <Tab value='all' label={String(t('documents.allDocuments') || 'Barchasi')} />}
            </TabList>
          </TabContext>
        </Box>

        <TaskPartTabs currentStatus={status || TaskPartStatus.New} ownerFilter={ownerFilter} />
      </CardContent>
    </Card>
  )
}

export default TaskPartsStatusPage

export const getStaticPaths: GetStaticPaths = async () => {
  // Next.js `output: 'export'` needs all dynamic paths at build time.
  const statuses = Object.values(TaskPartStatus) as TaskPartStatus[]

  return {
    paths: statuses.map(s => ({ params: { status: s } })),
    fallback: false
  }
}

export const getStaticProps: GetStaticProps<Props> = async ctx => {
  const raw = ctx.params?.status
  const status = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : undefined
  const isValid = status && (Object.values(TaskPartStatus) as string[]).includes(status)

  if (!isValid) return { notFound: true }

  return {
    props: { status: status as TaskPartStatus }
  }
}
