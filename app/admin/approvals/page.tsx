"use client"

import Navbar from "@/components/navbar"
import { useDb, patchDb, uid } from "@/lib/local-db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

export default function ApprovalsPage() {
  const db = useDb()
  const submitted = db.payments.filter((p) => p.status === "submitted")
  const approved = db.payments.filter((p) => p.status === "approved")
  const rejected = db.payments.filter((p) => p.status === "rejected")

  const [rejectOpen, setRejectOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [targetId, setTargetId] = useState<string | undefined>(undefined)

  function openReject(id: string) {
    setTargetId(id)
    setReason("")
    setRejectOpen(true)
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-5xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Approvals</CardTitle>
            <CardDescription>Review submitted payments and approve or reject.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {submitted.length === 0 && <p>No pending submissions.</p>}
            {submitted.map((p) => {
              const student = db.students.find((s) => s.registerNo === p.studentRegisterNo)
              return (
                <div key={p.id} className="rounded border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {student?.name} ({p.studentRegisterNo})
                      </div>
                      <div className="text-sm text-muted-foreground">Total: ₹ {p.total.toFixed(2)}</div>
                      {p.upiTransactionId && <div className="text-sm">UPI Txn: {p.upiTransactionId}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        className="bg-primary text-primary-foreground"
                        onClick={() => {
                          patchDb((db) => {
                            const x = db.payments.find((x) => x.id === p.id)!
                            x.status = "approved"
                            x.decidedAt = new Date().toISOString()
                            x.decidedBy = "admin"

                            for (const line of x.allocations) {
                              let remaining = line.amount
                              for (const a of db.allocations.filter(
                                (a) => a.studentRegisterNo === x.studentRegisterNo && a.feeId === line.feeId,
                              )) {
                                if (remaining <= 0) break
                                const take = Math.min(a.amount, remaining)
                                a.amount -= take
                                remaining -= take
                              }
                              db.allocations = db.allocations.filter(
                                (a) =>
                                  !(
                                    a.studentRegisterNo === x.studentRegisterNo &&
                                    a.feeId === line.feeId &&
                                    a.amount <= 0
                                  ),
                              )
                            }

                            const receiptId = uid("rcpt")
                            db.receipts.push({
                              id: receiptId,
                              paymentId: p.id,
                              number: `PMC-${new Date().getFullYear()}-${String(db.receipts.length + 1).padStart(5, "0")}`,
                              issuedAt: new Date().toISOString(),
                            })
                          })
                        }}
                      >
                        Approve & Issue Receipt
                      </Button>
                      <Button variant="secondary" onClick={() => openReject(p.id)}>
                        Reject
                      </Button>
                    </div>
                  </div>
                  {p.screenshotDataUrl && (
                    <div className="mt-2">
                      <img
                        src={p.screenshotDataUrl || "/placeholder.svg"}
                        alt="Payment screenshot"
                        className="max-h-64 rounded border object-contain"
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Approved Payments</CardTitle>
            <CardDescription>All approved submissions.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {approved.length === 0 && <p>No approved items.</p>}
            {approved.map((p) => {
              const student = db.students.find((s) => s.registerNo === p.studentRegisterNo)
              return (
                <div key={p.id} className="rounded border p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {student?.name} ({p.studentRegisterNo})
                      </div>
                      <div>Total: ₹ {p.total.toFixed(2)}</div>
                    </div>
                    <div className="text-green-600">Approved</div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Rejected Payments</CardTitle>
            <CardDescription>All rejected submissions with reasons.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {rejected.length === 0 && <p>No rejected items.</p>}
            {rejected.map((p) => {
              const student = db.students.find((s) => s.registerNo === p.studentRegisterNo)
              return (
                <div key={p.id} className="rounded border p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {student?.name} ({p.studentRegisterNo})
                      </div>
                      <div>Total: ₹ {p.total.toFixed(2)}</div>
                    </div>
                    <div className="text-destructive">Rejected</div>
                  </div>
                  {p.rejectReason && <div className="mt-1 text-destructive">Reason: {p.rejectReason}</div>}
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Payment</DialogTitle>
            </DialogHeader>
            <div className="grid gap-2">
              <p className="text-sm text-muted-foreground">A reason is required and will be shown to the student.</p>
              <Textarea
                placeholder="Enter rejection reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
            <DialogFooter className="gap-2">
              <Button variant="secondary" onClick={() => setRejectOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!reason.trim() || !targetId) return
                  patchDb((db) => {
                    const x = db.payments.find((pp) => pp.id === targetId)
                    if (!x) return
                    x.status = "rejected"
                    x.decidedAt = new Date().toISOString()
                    x.decidedBy = "admin"
                    x.rejectReason = reason.trim()
                  })
                  setRejectOpen(false)
                  setTargetId(undefined)
                  setReason("")
                }}
              >
                Confirm Reject
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
    </main>
  )
}
