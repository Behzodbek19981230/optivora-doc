import { useRouter } from 'next/router'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import TaskDetail from 'src/views/tasks/view/TaskDetail'

const TaskViewPage = () => {
  const router = useRouter()
  const { id } = router.query
  return (
    <Card>
      <CardHeader title={`Task #${id}`} />
      <CardContent>
        <TaskDetail id={id as string} />
      </CardContent>
    </Card>
  )
}

export default TaskViewPage
