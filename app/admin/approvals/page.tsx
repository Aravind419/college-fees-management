"use client"

import Navbar from "@/components/navbar"
import { useDb, patchDb, uid } from "@/lib/local-db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ApprovalsPage() {
  const db = useDb()
  const submitted = db.payments.filter((p) => p.status === "submitted")

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
                      <Button
                        variant="secondary"
                        onClick={() => {
                          patchDb((db) => {
                            const x = db.payments.find((x) => x.id === p.id)!
                            x.status = "rejected"
                            x.decidedAt = new Date().toISOString()
                            x.decidedBy = "admin"
                          })
                        }}
                      >
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
      </section>
    </main>
  )
}
