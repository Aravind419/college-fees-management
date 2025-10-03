"use client"

import Navbar from "@/components/navbar"
import { useDb } from "@/lib/local-db"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { currentUser } from "@/lib/local-db"

export default function ReceiptsPage() {
  const db = useDb()
  const user = currentUser()
  const student = db.students.find((s) => s.registerNo === user?.studentRegNo)
  const payments = db.payments.filter((p) => p.studentRegisterNo === student?.registerNo && p.status === "approved")
  const receipts = db.receipts.filter((r) => payments.some((p) => p.id === r.paymentId))

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-5xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>My Receipts</CardTitle>
            <CardDescription>Download or print digital receipts.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {receipts.length === 0 && <p>No receipts yet.</p>}
            {receipts.map((r) => {
              const p = payments.find((x) => x.id === r.paymentId)!
              return (
                <div key={r.id} className="rounded border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Receipt #{r.number}</div>
                      <div className="text-sm text-muted-foreground">
                        Issued: {new Date(r.issuedAt).toLocaleString()}
                      </div>
                      <div className="text-sm">Amount: ₹ {p.total.toFixed(2)}</div>
                    </div>
                    <Button onClick={() => window.print()}>Print</Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
