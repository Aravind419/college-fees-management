"use client"

import Navbar from "@/components/navbar"
import { useDb, patchDb, uid } from "@/lib/local-db"
import { currentUser } from "@/lib/local-db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useMemo, useState } from "react"
import QR from "@/components/payments/qr"

function fileToDataUrl(file?: File): Promise<string | undefined> {
  if (!file) return Promise.resolve(undefined)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function PayPage() {
  const db = useDb()
  const user = currentUser()
  const student = db.students.find((s) => s.registerNo === user?.studentRegNo)
  const allocations = db.allocations.filter((a) => a.studentRegisterNo === student?.registerNo)
  const total = useMemo(() => allocations.reduce((acc, a) => acc + a.amount, 0), [allocations])

  const [upiTxn, setUpiTxn] = useState("")
  const [file, setFile] = useState<File | undefined>()

  if (!student) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <section className="mx-auto max-w-4xl p-6">
          <Card>
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>Student not found.</CardContent>
          </Card>
        </section>
      </main>
    )
  }

  const upiLink = `upi://pay?pa=pmctech@upi&pn=PMC%20TECH&am=${total.toFixed(2)}&tn=${encodeURIComponent(
    `Fees ${student.registerNo}`,
  )}`

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="mx-auto grid max-w-5xl gap-6 p-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>My Fees</CardTitle>
            <CardDescription>Allocated fees and total payable.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <ul className="grid gap-2">
              {allocations.map((a) => {
                const f = db.fees.find((x) => x.id === a.feeId)
                return (
                  <li key={a.id} className="flex items-center justify-between rounded border p-2">
                    <span>{f?.name}</span>
                    <span>₹ {a.amount.toFixed(2)}</span>
                  </li>
                )
              })}
            </ul>
            <div className="mt-2 flex items-center justify-between border-t pt-2">
              <span className="font-semibold">Total</span>
              <span className="font-semibold">₹ {total.toFixed(2)}</span>
            </div>
            <a className="mt-2 underline" href={upiLink}>
              Open UPI App
            </a>
            <QR text={upiLink} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submit Payment Proof</CardTitle>
            <CardDescription>If auto-confirmation fails, upload a screenshot and UPI Transaction ID.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-2">
              <Label>UPI Transaction ID</Label>
              <Input value={upiTxn} onChange={(e) => setUpiTxn(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Payment Screenshot</Label>
              <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0])} />
            </div>
            <Button
              onClick={async () => {
                const screenshotDataUrl = await fileToDataUrl(file)
                const paymentId = uid("pay")
                patchDb((db) => {
                  const items = allocations.map((a) => ({ feeId: a.feeId, amount: a.amount }))
                  db.payments.push({
                    id: paymentId,
                    studentRegisterNo: student.registerNo,
                    allocations: items,
                    total,
                    upiTransactionId: upiTxn || undefined,
                    screenshotDataUrl,
                    status: "submitted",
                    createdAt: new Date().toISOString(),
                  })
                })
                alert("Payment submitted for approval.")
              }}
            >
              Submit for Approval
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
