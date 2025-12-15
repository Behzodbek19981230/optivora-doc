import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import TaskTable from 'src/views/tasks/TaskTable'

const TasksPage = () => {
  return (
    <Card>
      <CardHeader title='Vazifalar (Tasks)' />
      <CardContent>
        <TaskTable />
      </CardContent>
    </Card>
  )
}

export default TasksPage
