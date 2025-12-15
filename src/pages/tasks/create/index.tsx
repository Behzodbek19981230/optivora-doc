import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import TaskCreateForm from 'src/views/tasks/TaskCreateForm'

const TaskCreatePage = () => {
  return (
    <Card>
      <CardHeader title='Vazifa yaratish' />
      <CardContent>
        <TaskCreateForm />
      </CardContent>
    </Card>
  )
}

export default TaskCreatePage
