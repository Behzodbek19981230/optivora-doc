import mock from './mock'

type Magazine = {
  id: number
  name: string
  name_en: string
  name_uz: string
  name_ru: string
}

let magazines: Magazine[] = [
  {
    id: 1,
    name: 'Registration Journal',
    name_en: 'Registration Journal',
    name_uz: 'Roʻyxat jurnali',
    name_ru: 'Журнал регистрации'
  },
  {
    id: 2,
    name: 'Outgoing Journal',
    name_en: 'Outgoing Journal',
    name_uz: 'Chiquvchi jurnali',
    name_ru: 'Журнал исходящих'
  },
  {
    id: 3,
    name: 'Incoming Journal',
    name_en: 'Incoming Journal',
    name_uz: 'Keluvechi jurnali',
    name_ru: 'Журнал входящих'
  }
]

const paginate = (items: Magazine[], page = 1, perPage = 10) => {
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

// List
mock.onGet('/list-of-magazine/').reply(config => {
  const params = config.params || {}
  const page = Number(params.page || 1)
  const perPage = Number(params.perPage || 10)
  return [200, paginate(magazines, page, perPage)]
})

// Detail
mock.onGet(/\/list-of-magazine\/(\d+)$/).reply(config => {
  const idStr = config.url?.split('/').pop() || '0'
  const id = Number(idStr)
  const item = magazines.find(f => f.id === id)
  return item ? [200, item] : [404, { message: 'Not Found' }]
})

// Create
mock.onPost('/list-of-magazine/').reply(config => {
  const body = JSON.parse(config.data || '{}') as Partial<Magazine>
  const id = Math.max(0, ...magazines.map(f => f.id)) + 1
  const item: Magazine = {
    id,
    name: body.name || '',
    name_en: body.name_en || '',
    name_uz: body.name_uz || '',
    name_ru: body.name_ru || ''
  }
  magazines.push(item)
  return [201, item]
})

// Update
mock.onPut(/\/list-of-magazine\/(\d+)$/).reply(config => {
  const idStr = config.url?.split('/').pop() || '0'
  const id = Number(idStr)
  const body = JSON.parse(config.data || '{}') as Partial<Magazine>
  const idx = magazines.findIndex(f => f.id === id)
  if (idx === -1) return [404, { message: 'Not Found' }]
  magazines[idx] = { ...magazines[idx], ...body, id }
  return [200, magazines[idx]]
})

// Delete
mock.onDelete(/\/list-of-magazine\/(\d+)$/).reply(config => {
  const idStr = config.url?.split('/').pop() || '0'
  const id = Number(idStr)
  magazines = magazines.filter(f => f.id !== id)
  return [204]
})
