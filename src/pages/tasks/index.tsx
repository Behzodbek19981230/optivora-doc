import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import TaskTable from 'src/views/tasks/TaskTable'
import { useTranslation } from 'react-i18next'

const TasksPage = () => {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader title={String(t('tasks.title'))} />
      <CardContent>
        <TaskTable />
      </CardContent>
    </Card>
  )
}

export default TasksPage
