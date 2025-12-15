import mock from './mock'

// Enums
export const TASK_STATUS = ['new', 'in_progress', 'on_review', 'returned', 'done', 'cancelled'] as const
export const TASK_PRIORITY = ['ordinary', 'orgently'] as const
export const TASK_TYPE = ['task', 'application'] as const

// Types
export type Task = {
  id: number
  status: (typeof TASK_STATUS)[number]
  company: number
  type: (typeof TASK_TYPE)[number]
  name: string
  task_form: number
  sending_org: string
  input_doc_number: string
  output_doc_number: string
  start_date: string
  end_date: string
  priority: (typeof TASK_PRIORITY)[number]
  sending_respon_person: string
  department: number
  signed_by: number
  note: string
  created_by: number
  updated_by: number
  list_of_magazine: number
}

export type TaskPart = {
  id: number
  task: number
  title: string
  department: number
  assignee: number
  start_date: string
  end_date: string
  status: (typeof TASK_STATUS)[number]
  note: string
  created_by: number
  updated_by: number
}

export type TaskEvent = {
  id: number
  task: number
  part: number | null
  actor: number
  event_type: 'CREATED' | 'ASSIGNED' | 'STATUS_CHANGED' | 'FILE_ADDED' | 'COMMENTED' | 'APPROVED' | 'SENT_FOR_REVIEW'
  message: string
  from_status?: (typeof TASK_STATUS)[number]
  to_status?: (typeof TASK_STATUS)[number]
  extra: Record<string, any>
  created_by: number
  updated_by: number
  created_at?: string
}

export type TaskComment = {
  id: number
  task: number
  part: number | null
  author: number
  text: string
  is_system: boolean
  created_by: number
  updated_by: number
  created_at?: string
}

export type TaskAttachment = {
  id: number
  task: number
  part: number | null
  title: string
  file: string
  uploaded_by: number
  created_by: number
  updated_by: number
  created_at?: string
}

let tasks: Task[] = [
  {
    id: 1,
    status: 'in_progress',
    company: 1,
    type: 'task',
    name: 'Task #12345',
    task_form: 1,
    sending_org: 'Org A',
    input_doc_number: 'IN-001',
    output_doc_number: 'OUT-001',
    start_date: '2025-12-01',
    end_date: '2025-12-20',
    priority: 'orgently',
    sending_respon_person: 'Behzod',
    department: 2,
    signed_by: 5,
    note: 'Shoshilinch',
    created_by: 1,
    updated_by: 1,
    list_of_magazine: 1
  }
]

let parts: TaskPart[] = [
  {
    id: 1,
    task: 1,
    title: 'Qism 1',
    department: 2,
    assignee: 10,
    start_date: '2025-12-01',
    end_date: '2025-12-10',
    status: 'in_progress',
    note: '',
    created_by: 1,
    updated_by: 1
  },
  {
    id: 2,
    task: 1,
    title: 'Qism 2',
    department: 3,
    assignee: 11,
    start_date: '2025-12-05',
    end_date: '2025-12-18',
    status: 'new',
    note: '',
    created_by: 1,
    updated_by: 1
  }
]

let events: TaskEvent[] = [
  {
    id: 1,
    task: 1,
    part: null,
    actor: 1,
    event_type: 'CREATED',
    message: 'Task yaratildi',
    extra: {},
    created_by: 1,
    updated_by: 1,
    created_at: '2025-12-01T21:00:00Z'
  },
  {
    id: 2,
    task: 1,
    part: 1,
    actor: 1,
    event_type: 'STATUS_CHANGED',
    message: 'NEW -> IN_PROGRESS',
    from_status: 'new',
    to_status: 'in_progress',
    extra: {},
    created_by: 1,
    updated_by: 1,
    created_at: '2025-12-01T22:10:00Z'
  },
  {
    id: 3,
    task: 1,
    part: null,
    actor: 1,
    event_type: 'FILE_ADDED',
    message: 'xxx.docx',
    extra: { filename: 'xxx.docx' },
    created_by: 1,
    updated_by: 1,
    created_at: '2025-12-01T23:05:00Z'
  }
]

let comments: TaskComment[] = [
  {
    id: 1,
    task: 1,
    part: 1,
    author: 1,
    text: "Ko'rib chiqing",
    is_system: false,
    created_by: 1,
    updated_by: 1,
    created_at: '2025-12-02T10:00:00Z'
  },
  {
    id: 2,
    task: 1,
    part: 2,
    author: 1,
    text: 'Ijorisi tezlatilsin',
    is_system: false,
    created_by: 1,
    updated_by: 1,
    created_at: '2025-12-02T11:00:00Z'
  }
]

let attachments: TaskAttachment[] = [
  {
    id: 1,
    task: 1,
    part: null,
    title: 'Fayl 1',
    file: '/files/1688839529.docx',
    uploaded_by: 1,
    created_by: 1,
    updated_by: 1,
    created_at: '2025-12-01T23:05:00Z'
  }
]

const paginate = <T>(items: T[], page = 1, perPage = 10) => {
  const start = (page - 1) * perPage
  const end = start + perPage
  const slice = items.slice(start, end)
  return {
    results: slice,
    pagination: {
      currentPage: page,
      perPage,
      lastPage: Math.ceil(items.length / perPage),
      total: items.length
    }
  }
}
const recomputeTaskStatus = (taskId: number) => {
  const task = tasks.find(t => t.id === taskId)
  if (!task) return
  const taskParts = parts.filter(p => p.task === taskId)
  if (taskParts.length === 0) return
  const statuses = taskParts.map(p => p.status)
  if (statuses.some(s => s === 'in_progress' || s === 'on_review')) {
    task.status = 'in_progress'
  } else if (statuses.some(s => s === 'returned')) {
    task.status = 'returned'
  } else if (statuses.every(s => s === 'done')) {
    task.status = 'done'
  } else if (statuses.some(s => s === 'cancelled')) {
    task.status = 'cancelled'
  } else {
    task.status = 'new'
  }
}

// Task list
mock.onGet('/task/').reply(config => {
  const { page = 1, perPage = 10, status } = config.params || {}
  let data = tasks
  if (status) data = data.filter(t => t.status === status)
  return [200, paginate(data, Number(page), Number(perPage))]
})
// Task detail
mock.onGet(/\/task\/\d+$/).reply(config => {
  const idStr = config.url?.split('/').pop() || '0'
  const id = Number(idStr)
  const item = tasks.find(t => t.id === id)
  return item ? [200, item] : [404, { message: 'Not Found' }]
})
// Task create
mock.onPost('/task/').reply(config => {
  const body = JSON.parse(config.data || '{}') as Partial<Task>
  const id = Math.max(0, ...tasks.map(t => t.id)) + 1
  const item: Task = {
    id,
    status: (body.status as Task['status']) || 'new',
    company: body.company || 0,
    type: (body.type as Task['type']) || 'task',
    name: body.name || '',
    task_form: body.task_form || 0,
    sending_org: body.sending_org || '',
    input_doc_number: body.input_doc_number || '',
    output_doc_number: body.output_doc_number || '',
    start_date: body.start_date || '',
    end_date: body.end_date || '',
    priority: (body.priority as Task['priority']) || 'ordinary',
    sending_respon_person: body.sending_respon_person || '',
    department: body.department || 0,
    signed_by: body.signed_by || 0,
    note: body.note || '',
    created_by: body.created_by || 0,
    updated_by: body.updated_by || 0,
    list_of_magazine: body.list_of_magazine || 0
  }
  tasks.push(item)
  return [201, item]
})
// Task update
mock.onPut(/\/task\/\d+$/).reply(config => {
  const idStr = config.url?.split('/').pop() || '0'
  const id = Number(idStr)
  const body = JSON.parse(config.data || '{}') as Partial<Task>
  const idx = tasks.findIndex(t => t.id === id)
  if (idx === -1) return [404, { message: 'Not Found' }]
  tasks[idx] = { ...tasks[idx], ...body, id }
  return [200, tasks[idx]]
})
// Task delete
mock.onDelete(/\/task\/\d+$/).reply(config => {
  const idStr = config.url?.split('/').pop() || '0'
  const id = Number(idStr)
  tasks = tasks.filter(t => t.id !== id)
  return [204]
})

// Parts
mock.onGet('/task-part/').reply(config => {
  const { task, page = 1, perPage = 10 } = config.params || {}
  const data = task ? parts.filter(p => p.task === Number(task)) : parts
  return [200, paginate(data, Number(page), Number(perPage))]
})
mock.onPost('/task-part/').reply(config => {
  const body = JSON.parse(config.data || '{}') as Partial<TaskPart>
  const id = Math.max(0, ...parts.map(p => p.id)) + 1
  const item: TaskPart = {
    id,
    task: body.task || 0,
    title: body.title || '',
    department: body.department || 0,
    assignee: body.assignee || 0,
    start_date: body.start_date || '',
    end_date: body.end_date || '',
    status: (body.status as TaskPart['status']) || 'new',
    note: body.note || '',
    created_by: body.created_by || 0,
    updated_by: body.updated_by || 0
  }
  parts.push(item)
  return [201, item]
})
mock.onPut(/\/task-part\/\d+$/).reply(config => {
  const idStr = config.url?.split('/').pop() || '0'
  const id = Number(idStr)
  const body = JSON.parse(config.data || '{}') as Partial<TaskPart>
  const idx = parts.findIndex(p => p.id === id)
  if (idx === -1) return [404, { message: 'Not Found' }]
  const prevStatus = parts[idx].status
  parts[idx] = { ...parts[idx], ...body, id }
  recomputeTaskStatus(parts[idx].task)
  if (body.status && body.status !== prevStatus) {
    const evId = Math.max(0, ...events.map(e => e.id)) + 1
    events.push({
      id: evId,
      task: parts[idx].task,
      part: parts[idx].id,
      actor: body.updated_by || 0,
      event_type: 'STATUS_CHANGED',
      message: `${prevStatus} -> ${body.status}`,
      from_status: prevStatus as any,
      to_status: body.status as any,
      extra: {},
      created_by: body.updated_by || 0,
      updated_by: body.updated_by || 0,
      created_at: new Date().toISOString()
    })
  }
  return [200, parts[idx]]
})
mock.onDelete(/\/task-part\/\d+$/).reply(config => {
  const idStr = config.url?.split('/').pop() || '0'
  const id = Number(idStr)
  parts = parts.filter(p => p.id !== id)
  return [204]
})

// Events
mock.onGet('/task-event/').reply(config => {
  const { task, part, page = 1, perPage = 10 } = config.params || {}
  let data = events
  if (task) data = data.filter(e => e.task === Number(task))
  if (part) data = data.filter(e => e.part === Number(part))
  return [200, paginate(data, Number(page), Number(perPage))]
})
mock.onPost('/task-event/').reply(config => {
  const body = JSON.parse(config.data || '{}') as Partial<TaskEvent>
  const id = Math.max(0, ...events.map(e => e.id)) + 1
  const item: TaskEvent = {
    id,
    task: body.task || 0,
    part: body.part || null,
    actor: body.actor || 0,
    event_type: (body.event_type as TaskEvent['event_type']) || 'STATUS_CHANGED',
    message: body.message || '',
    from_status: body.from_status,
    to_status: body.to_status,
    extra: body.extra || {},
    created_by: body.created_by || 0,
    updated_by: body.updated_by || 0,
    created_at: new Date().toISOString()
  }
  events.push(item)
  return [201, item]
})

// Comments
mock.onGet('/task-comment/').reply(config => {
  const { task, part, page = 1, perPage = 10 } = config.params || {}
  let data = comments
  if (task) data = data.filter(c => c.task === Number(task))
  if (part) data = data.filter(c => c.part === Number(part))
  return [200, paginate(data, Number(page), Number(perPage))]
})
mock.onPost('/task-comment/').reply(config => {
  const body = JSON.parse(config.data || '{}') as Partial<TaskComment>
  const id = Math.max(0, ...comments.map(c => c.id)) + 1
  const item: TaskComment = {
    id,
    task: body.task || 0,
    part: body.part || null,
    author: body.author || 0,
    text: body.text || '',
    is_system: !!body.is_system,
    created_by: body.created_by || 0,
    updated_by: body.updated_by || 0,
    created_at: new Date().toISOString()
  }
  comments.push(item)
  return [201, item]
})

// Attachments
mock.onGet('/task-attachment/').reply(config => {
  const { task, part, page = 1, perPage = 10 } = config.params || {}
  let data = attachments
  if (task) data = data.filter(a => a.task === Number(task))
  if (part) data = data.filter(a => a.part === Number(part))
  return [200, paginate(data, Number(page), Number(perPage))]
})
mock.onPost('/task-attachment/').reply(config => {
  const body = JSON.parse(config.data || '{}') as Partial<TaskAttachment>
  const id = Math.max(0, ...attachments.map(a => a.id)) + 1
  const item: TaskAttachment = {
    id,
    task: body.task || 0,
    part: body.part || null,
    title: body.title || '',
    file: body.file || '',
    uploaded_by: body.uploaded_by || 0,
    created_by: body.created_by || 0,
    updated_by: body.updated_by || 0,
    created_at: new Date().toISOString()
  }
  attachments.push(item)
  return [201, item]
})
