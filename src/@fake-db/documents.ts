import mock from './mock'

type Executor = {
  id: number
  name: string
  avatar?: string
  seen_at: string | null
}

type Chrono = {
  id: number
  time: string
  actor: string
  action: string
  note?: string
}

type Doc = {
  id: number
  number: string
  title: string
  company: string
  created_time: string
  status: 'all' | 'in-progress' | 'accepted' | 'cancelled' | 'completed' | 'returned'
  executors: Executor[]
  chronology: Chrono[]
}

const now = new Date()
const fmt = (d: Date) => d.toISOString()

const sampleChrono = (idStart: number, who: string): Chrono[] => [
  { id: idStart + 1, time: fmt(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5)), actor: 'System', action: 'Created' },
  {
    id: idStart + 2,
    time: fmt(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 4)),
    actor: who,
    action: 'Updated title',
    note: 'Minor correction'
  },
  {
    id: idStart + 3,
    time: fmt(new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2)),
    actor: 'Reviewer',
    action: 'Commented',
    note: 'Looks good'
  }
]

const docs: Doc[] = Array.from({ length: 48 }).map((_, i) => {
  const statuses: Doc['status'][] = ['in-progress', 'accepted', 'cancelled', 'completed', 'returned']
  const status = statuses[i % statuses.length]
  const id = i + 1
  const titleOwner = `User ${((i % 7) + 1).toString().padStart(2, '0')}`

  return {
    id,
    number: `DOC-${2025}-${id.toString().padStart(4, '0')}`,
    title: `Sample Document ${id}`,
    company: ['Acme LLC', 'Globex', 'Initech', 'Umbrella'][i % 4],
    created_time: fmt(new Date(now.getTime() - 1000 * 60 * 60 * 12 * i)),
    status,
    executors: [
      { id: 1, name: 'Alice Johnson', seen_at: i % 2 === 0 ? fmt(new Date(now.getTime() - 1000 * 60 * 60)) : null },
      { id: 2, name: 'Bob Smith', seen_at: i % 3 === 0 ? fmt(new Date(now.getTime() - 1000 * 60 * 60 * 6)) : null },
      { id: 3, name: 'Charlie Lee', seen_at: null }
    ],
    chronology: sampleChrono(id * 10, titleOwner)
  }
})

// List endpoint with pagination and status filter
mock.onGet('/documents/').reply(config => {
  const params = config.params || {}
  const page = Number(params.page || 1)
  const perPage = Number(params.perPage || 10)
  const status = String(params.status || 'all') as Doc['status'] | 'all'

  const filtered = status === 'all' ? docs : docs.filter(d => d.status === status)
  const start = (page - 1) * perPage
  const end = start + perPage
  const slice = filtered.slice(start, end)

  return [
    200,
    {
      results: slice.map(d => ({
        id: d.id,
        number: d.number,
        title: d.title,
        company: d.company,
        created_time: d.created_time,
        status: d.status
      })),
      pagination: {
        currentPage: page,
        perPage,
        lastPage: Math.ceil(filtered.length / perPage),
        total: filtered.length
      }
    }
  ]
})

// Detail endpoint
mock.onGet(/\/documents\/(\d+)$/).reply(config => {
  const idStr = config.url?.split('/').pop() || '0'
  const id = Number(idStr)
  const doc = docs.find(d => d.id === id)
  if (!doc) return [404, { message: 'Not Found' }]

  return [200, doc]
})
