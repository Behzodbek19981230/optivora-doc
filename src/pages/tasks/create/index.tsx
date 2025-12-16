import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import TaskCreateForm from 'src/views/tasks/TaskCreateForm'
import { useTranslation } from 'react-i18next'

const TaskCreatePage = () => {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader title={String(t('tasks.create.title'))} />
      <CardContent>
        <TaskCreateForm />
      </CardContent>
    </Card>
  )
}

export default TaskCreatePage
