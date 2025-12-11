// Helper to normalize Next.js router query params (string | string[] | undefined)
const normalizeId = (id: string | number | string[] | null | undefined) => {
  if (Array.isArray(id)) return id[0]
  if (id === null || id === undefined) return ''
  return String(id)
}

const endpoints = {
  login: '/auth/token',
  logout: '/auth/logout',
  me: '/user-view',
  companyProfile: '/api/v1/company-profile',
  companyProfileById: (id: string | number | string[] | null | undefined) =>
    `/api/v1/company-profile/${normalizeId(id)}`,
  companyProfileFields: '/api/v1/company-profile/fields',
  country: '/api/v1/country',
  district: '/api/v1/district',
  districtById: (id: string | number | string[] | null | undefined) => `/api/v1/district/${normalizeId(id)}`,
  region: '/api/v1/region',
  regionById: (id: string | number | string[] | null | undefined) => `/api/v1/region/${normalizeId(id)}`,

  countryById: (id: string | number | string[] | null | undefined) => `/api/v1/country/${normalizeId(id)}`,
  countryFields: '/api/v1/country/fields',

  // CMS resources
  industries: '/api/v1/industry',
  industryById: (id: string | number | string[] | null | undefined) => `/api/v1/industry/${normalizeId(id)}`,
  industryFields: '/api/v1/industry/fields',

  user: '/api/v1/user',
  userById: (id: number) => `/api/v1/user/${id}`,

  equipmentCategories: '/equipment-category',
  equipmentCategoryById: (id: string | number | string[] | null | undefined) =>
    `/equipment-category/${normalizeId(id)}`,

  services: '/service',
  serviceById: (id: string | number | string[] | null | undefined) => `/service/${normalizeId(id)}`,

  partners: '/partner',
  partnerById: (id: string | number | string[] | null | undefined) => `/partner/${normalizeId(id)}`,

  projects: '/project',
  projectById: (id: string | number | string[] | null | undefined) => `/project/${normalizeId(id)}`,
  projectDeliverables: '/project-deliverable',
  projectDeliverableById: (id: string | number | string[] | null | undefined) =>
    `/project-deliverable/${normalizeId(id)}`,
  projectImages: '/project-image',
  projectImageById: (id: string | number | string[] | null | undefined) => `/project-image/${normalizeId(id)}`,

  stats: '/stats',
  statById: (id: string | number | string[] | null | undefined) => `/stats/${normalizeId(id)}`,

  faqs: '/faq',
  faqById: (id: string | number | string[] | null | undefined) => `/faq/${normalizeId(id)}`,

  inquiries: '/inquiry',
  inquiryById: (id: string | number | string[] | null | undefined) => `/inquiry/${normalizeId(id)}`,

  downloads: '/download',
  downloadById: (id: string | number | string[] | null | undefined) => `/download/${normalizeId(id)}`,

  news: '/news-post',
  newsById: (id: string | number | string[] | null | undefined) => `/news-post/${normalizeId(id)}`,

  testimonials: '/testimonial',
  testimonialById: (id: string | number | string[] | null | undefined) => `/testimonial/${normalizeId(id)}`,

  ourWork: '/our-work',
  ourWorkById: (id: string | number | string[] | null | undefined) => `/our-work/${normalizeId(id)}`,

  // Missing keys referenced in code
  applicationApprovedByID: (id: string | number | string[] | null | undefined) =>
    `/application-approved/${normalizeId(id)}`,
  limitData: '/limit-data'
}

export default endpoints
