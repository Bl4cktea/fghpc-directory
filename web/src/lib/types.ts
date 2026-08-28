export interface DirectoryEntry {
  id: number
  category: "Individual" | "Office/Area" | string
  section: string
  fullName: string
  localNo: string
}

export interface DirectoryPayload {
  ok: boolean
  updatedAt: string
  count: number
  entries: DirectoryEntry[]
  error?: string
}
