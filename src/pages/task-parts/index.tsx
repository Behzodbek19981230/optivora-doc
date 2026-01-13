import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { TaskPartStatus } from 'src/views/task-parts/TaskPartTabs'

export default function TaskPartsIndexPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace(`/task-parts/${TaskPartStatus.New}`)
  }, [router])

  return null
}
