export type EmployeesResponseType = {
  company_id: number
  year: number
  month: number | null
  employees_total: number
  employees: EmployeeType[]
}

export type EmployeeType = {
  id: number
  fullname: string
  username: string
  avatar: string | null
  email: string
  phone_number: string
  stats: EmployeeStatsType
}

export type EmployeeStatsType = {
  total: number
  done: number
  in_progress: number
  overdue: number
}
