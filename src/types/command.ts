import { CompanyType } from './company'

export type CommandType = {
  id?: number
  command_number: string
  basis: string
  basis_en: string
  basis_uz: string
  basis_ru: string
  comment: string
  comment_en: string
  comment_uz: string
  comment_ru: string
  company?: number
  company_detail?: CompanyType | null
  created_time?: string
}
