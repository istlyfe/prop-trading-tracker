export type AccountStatus = "evaluation" | "funded" | "blown"

export interface StatusHistoryItem {
  status: AccountStatus
  date: string
  notes?: string
}

export interface Account {
  id: string
  firmName: string
  accountName?: string
  accountSize: number
  type: string
  status: AccountStatus
  createdAt: string
  updatedAt: string
  notes?: string
  statusHistory?: StatusHistoryItem[]
  statusNotes?: string // Used for status update notes
  statusDate?: string // Used for custom status change date
}

