"use client"

import Navbar from "@/components/navbar"
import { useDb, patchDb, uid } from "@/lib/local-db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function AllocateFeesPage() {
  const db = useDb()
  const [reg, setReg] = useState<string>("")
  const [feeId, setFeeId] = useState<string>("")
  const [amount, setAmount] = useState<string>("")

  const selectedStudent = db.students.find((s) => s.registerNo === reg)
  const allocations = db.allocations.filter((a) => a.studentRegisterNo === reg)

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-5xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>Allocate Fees</CardTitle>
            <CardDescription>Assign fees to students by Register Number.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2 md:grid-cols-3">
              <div className="grid gap-2">
                <Label>Register Number</Label>
                <Select value={reg} onValueChange={setReg}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {db.students.map((s) => (
                      <SelectItem key={s.id} value={s.registerNo}>
                        {s.registerNo} - {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Fee Type</Label>
                <Select value={feeId} onValueChange={setFeeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fee" />
                  </SelectTrigger>
                  <SelectContent>
                    {db.fees
                      .filter((f) => f.active)
                      .map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Override or leave 0"
                />
              </div>
            </div>
            <div>
              <Button
                onClick={() => {
                  if (!reg || !feeId) return
                  const fee = db.fees.find((f) => f.id === feeId)!
                  const amt = Number(amount || 0) || fee.defaultAmount
                  patchDb((db) => {
                    db.allocations.push({
                      id: uid("alloc"),
                      studentRegisterNo: reg,
                      feeId,
                      amount: amt,
                    })
                  })
                }}
              >
                Add Allocation
              </Button>
            </div>
            {selectedStudent && (
              <div className="mt-4">
                <h3 className="mb-2 text-lg font-semibold">
                  Allocations for {selectedStudent.name} ({selectedStudent.registerNo})
                </h3>
                <ul className="grid gap-2">
                  {allocations.map((a) => {
                    const f = db.fees.find((x) => x.id === a.feeId)
                    return (
                      <li key={a.id} className="flex items-center justify-between rounded border p-2">
                        <span>{f?.name}</span>
                        <span>₹ {a.amount.toFixed(2)}</span>
                        <Button
                          variant="secondary"
                          onClick={() =>
                            patchDb((db) => {
                              db.allocations = db.allocations.filter((x) => x.id !== a.id)
                            })
                          }
                        >
                          Remove
                        </Button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
