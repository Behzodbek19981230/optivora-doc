export type Region = {
  id: number
  sv_regionId: string
  name: string
}

export type Districts = {
  id: number
  sv_districtId: string
  name: string
  region: Region
}
