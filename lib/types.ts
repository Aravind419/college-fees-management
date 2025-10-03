export type Role = "admin" | "office" | "principal" | "hod" | "faculty" | "student"

export interface User {
  id: string
  email: string
  passwordHash: string // demo only: plain hash-less string for local demo
  role: Role
  studentRegNo?: string
  createdAt: string
}

export type FeeType = "tuition" | "books" | "exam" | "bus"

export interface FeeDefinition {
  id: string
  type: FeeType
  name: string
  active: boolean
  defaultAmount: number
}

export interface Student {
  id: string
  name: string
  registerNo: string
  department: string
  branch?: string
  year: string
  batch: string
  umis?: string
  phone?: string
  email?: string

  // Family
  fatherName?: string
  fatherOccupation?: string
  fatherPhone?: string
  motherName?: string
  motherOccupation?: string
  motherPhone?: string
  guardianName?: string
  guardianOccupation?: string
  guardianPhone?: string
  emergencyPreference?: "father" | "mother" | "guardian"

  // Documents (base64)
  docs?: {
    tc12?: string
    birth?: string
    firstGraduate?: string
    mark10?: string
    mark12?: string
  }

  profileCompleted?: boolean
  auditTrail?: Array<{ at: string; by: string; action: string }>
}

export interface FeeAllocation {
  id: string
  studentRegisterNo: string
  feeId: string
  amount: number
  discount?: number
}

export type PaymentStatus = "draft" | "submitted" | "approved" | "rejected"
export interface PaymentSubmission {
  id: string
  studentRegisterNo: string
  allocations: Array<{ feeId: string; amount: number }>
  total: number
  upiTransactionId?: string
  screenshotDataUrl?: string
  status: PaymentStatus
  createdAt: string
  decidedAt?: string
  decidedBy?: string
}

export interface Receipt {
  id: string
  paymentId: string
  number: string
  issuedAt: string
}

export interface Db {
  users: User[]
  students: Student[]
  fees: FeeDefinition[]
  allocations: FeeAllocation[]
  payments: PaymentSubmission[]
  receipts: Receipt[]
  currentUserId?: string
  setupComplete?: boolean
}
