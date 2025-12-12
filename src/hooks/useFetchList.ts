import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiResponse, DataService } from 'src/configs/dataService'

type ListParams = {
  page?: number
  perPage?: number
  search?: string
  [key: string]: string | number | boolean | undefined
}

type UseFetchListResult<T> = {
  data: T[]
  total: number
  loading: boolean
  error: unknown
  mutate: () => void
}

export const useFetchList = <T = any>(path: string, params: ListParams = {}): UseFetchListResult<T> => {
  const queryClient = useQueryClient()

  const queryKey = ['list', path, params]

  // Remove undefined values to satisfy DataService.get typing
  const safeParams: Record<string, string | number | boolean> = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined)
  ) as Record<string, string | number | boolean>

  const { data, isLoading, error } = useQuery<{ items: T[]; total: number }>({
    queryKey,
    queryFn: async () => {
      const res = await DataService.get(path, safeParams)
      // Support either { data, meta } shape or plain array
      const payload = res.data as {
        results?: T[]
        pagination: { currentPage: number; lastPage: number; perPage: number; total: number }
      }
      const items: T[] = Array.isArray(payload) ? payload : payload?.results ?? []
      const total: number = Array.isArray(payload) ? items.length : payload?.pagination?.total ?? items.length
      return { items, total }
    },
    staleTime: 30_000
  })

  const mutate = () => {
    queryClient.invalidateQueries({ queryKey })
  }

  return {
    data: data?.items ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    error,
    mutate
  }
}
