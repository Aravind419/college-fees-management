"use client"

import useSWR, { mutate } from "swr"
import type { Db, User } from "./types"

const KEY = "cfm-db-v1"

function emptyDb(): Db {
  return {
    users: [],
    students: [],
    fees: [
      { id: "fee_tuition", type: "tuition", name: "Tuition Fees", active: true, defaultAmount: 0 },
      { id: "fee_books", type: "books", name: "Book Fees", active: true, defaultAmount: 0 },
      { id: "fee_exam", type: "exam", name: "Exam Fees", active: true, defaultAmount: 0 },
      { id: "fee_bus", type: "bus", name: "Bus Fees", active: false, defaultAmount: 0 },
    ],
    allocations: [],
    payments: [],
    receipts: [],
    setupComplete: false,
    registrationOpen: true,
    registrationWindow: undefined,
    frozenDepartments: [],
    frozenStudents: [],
    upiConfig: { upiId: "aravindaravind@ptaxis", qrDataUrl: undefined },
  }
}

function readDb(): Db {
  if (typeof window === "undefined") return emptyDb()
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyDb()
    return JSON.parse(raw) as Db
  } catch {
    return emptyDb()
  }
}

function writeDb(db: Db) {
  localStorage.setItem(KEY, JSON.stringify(db))
  // notify SWR consumers
  mutate(KEY, db, false)
}

export function useDb() {
  const { data } = useSWR<Db>(KEY, async () => readDb(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })
  return data ?? emptyDb()
}

export function patchDb(patch: (db: Db) => void) {
  const db = readDb()
  patch(db)
  writeDb(db)
}

export function setCurrentUser(userId?: string) {
  patchDb((db) => {
    db.currentUserId = userId
  })
}

export function currentUser(): User | undefined {
  const db = readDb()
  return db.users.find((u) => u.id === db.currentUserId)
}

export function logout() {
  setCurrentUser(undefined)
}

// Utilities
export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

export function hash(pw: string) {
  // demo only
  return `h_${pw}`
}

// Cross-tab sync
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) mutate(KEY, readDb(), false)
  })
}

export function useLocalDb() {
  const db = useDb()
  return {
    db,
    patchDb,
    setCurrentUser,
    currentUser,
    logout,
    uid,
  }
}
