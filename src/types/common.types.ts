export interface AuditFields {
  userCreate: string
  processCreate: string
  dateCreate: string
  userUpdate?: string
  processUpdate?: string
  dateUpdate?: string
  status: "A" | "I"
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  page?: number
  size?: number
  number?: number
  pageSize?: number
}

export interface ApiError {
  message: string
  status: number
  errors?: Record<string, string>
}
