import mock from './mock'

type DocForm = {
  id: number
  name: string
  name_en: string
  name_uz: string
  name_ru: string
}

let forms: DocForm[] = [
  { id: 1, name: 'Contract', name_en: 'Contract', name_uz: 'Shartnoma', name_ru: 'Контракт' },
  { id: 2, name: 'Invoice', name_en: 'Invoice', name_uz: 'Hisob-faktura', name_ru: 'Счет-фактура' },
  { id: 3, name: 'Letter', name_en: 'Letter', name_uz: 'Xat', name_ru: 'Письмо' }
]

const paginate = (items: DocForm[], page = 1, perPage = 10) => {
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
mock.onGet('/document-form/').reply(config => {
  const params = config.params || {}
  const page = Number(params.page || 1)
  const perPage = Number(params.perPage || 10)
  return [200, paginate(forms, page, perPage)]
})

// Detail
mock.onGet(/\/document-form\/(\d+)$/).reply(config => {
  const idStr = config.url?.split('/').pop() || '0'
  const id = Number(idStr)
  const item = forms.find(f => f.id === id)
  return item ? [200, item] : [404, { message: 'Not Found' }]
})

// Create
mock.onPost('/document-form/').reply(config => {
  const body = JSON.parse(config.data || '{}') as Partial<DocForm>
  const id = Math.max(0, ...forms.map(f => f.id)) + 1
  const item: DocForm = {
    id,
    name: body.name || '',
    name_en: body.name_en || '',
    name_uz: body.name_uz || '',
    name_ru: body.name_ru || ''
  }
  forms.push(item)
  return [201, item]
})

// Update
mock.onPut(/\/document-form\/(\d+)$/).reply(config => {
  const idStr = config.url?.split('/').pop() || '0'
  const id = Number(idStr)
  const body = JSON.parse(config.data || '{}') as Partial<DocForm>
  const idx = forms.findIndex(f => f.id === id)
  if (idx === -1) return [404, { message: 'Not Found' }]
  forms[idx] = { ...forms[idx], ...body, id }
  return [200, forms[idx]]
})

// Delete
mock.onDelete(/\/document-form\/(\d+)$/).reply(config => {
  const idStr = config.url?.split('/').pop() || '0'
  const id = Number(idStr)
  forms = forms.filter(f => f.id !== id)
  return [204]
})
