export function extractArray<T>(response: unknown): T[] {
  if (Array.isArray(response)) return response as T[]
  if (response && typeof response === 'object') {
    const obj = response as Record<string, unknown>
    if (Array.isArray(obj.content)) return obj.content as T[]
    if (Array.isArray(obj.data)) return obj.data as T[]
    if (Array.isArray(obj.items)) return obj.items as T[]
  }
  return []
}

export function limpiarFiltros<T extends Record<string, unknown>>(filtros: T): Partial<T> {
  const limpio: Partial<T> = {}
  for (const [key, value] of Object.entries(filtros)) {
    if (value !== undefined && value !== '' && value !== null) {
      if (typeof value === 'string' && value.trim() === '') continue
      limpio[key as keyof T] = (typeof value === 'string' ? value.trim() : value) as T[keyof T]
    }
  }
  return limpio
}

export function emptyPageResponse<T>(): { content: T[]; totalElements: number; totalPages: number; page: number; size: number } {
  return { content: [], totalElements: 0, totalPages: 0, page: 0, size: 12 }
}