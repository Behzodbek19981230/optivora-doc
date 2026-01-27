export type TaskType = {
  id: number
  status: 'new' | string
  company: number
  company_detail: CompanyDetailType
  created_by_detail: UserDetailType
  type: 'task' | string
  name: string
  task_form: number
  task_form_detail: TaskFormDetailType
  sending_org: string
  input_doc_number: string
  output_doc_number: string
  start_date: string // YYYY-MM-DD
  end_date: string // YYYY-MM-DD
  priority: 'orgently' | 'normal' | string
  respon_person: number | null
  department: number
  department_detail: DepartmentDetailType
  signed_by: number
  signed_by_detail: UserDetailType
  note: string
  created_time: string // ISO
  updated_time: string // ISO
  created_by: number
  updated_by: number | null
  list_of_magazine: number
  list_of_magazine_detail: MagazineDetailType
  signed_date: string // YYYY-MM-DD
  respon_person_detail: UserDetailType | null
}

export type CompanyDetailType = {
  id: number
  code: string
  name: string
  is_active: boolean
  phone: string
  region: number
  district: number
  address: string
  created_time: string
  created_by: number
  logo: string
}

export type TaskFormDetailType = {
  id: number
  name: string
  name_en: string
  name_uz: string
  name_ru: string
}

export type DepartmentDetailType = {
  id: number
  name: string
  name_en: string
  name_uz: string
  name_ru: string
}

export type UserDetailType = {
  id: number
  username: string
  fullname: string
  date_of_birthday: string
  gender: 'male' | 'female' | string
  phone_number: string
}

export type MagazineDetailType = {
  id: number
  name: string
  name_en: string
  name_uz: string
  name_ru: string
}

export type TaskPartType = {
  id: number
  task: number
  task_detail: TaskType
  title: string
  department: number
  department_detail: DepartmentDetailType
  assignee: number
  assignee_detail: UserDetailType
  start_date: string // YYYY-MM-DD
  end_date: string // YYYY-MM-DD
  status: string
  note: string
  created_time: string // ISO
  updated_time: string // ISO
  created_by: number
  updated_by: number
  show_date?: string // YYYY-MM-DD
  is_read_file?: boolean
}
export type TaskEventType = {
  id: number
  task: number
  task_detail?: TaskType
  part?: number
  part_detail?: TaskPartType
  actor?: number
  actor_detail?: UserDetailType
  event_type: string
  message?: string
  from_status?: string | null
  to_status?: string | null
  extra?: any
  created_time?: string
  updated_time?: string
}
