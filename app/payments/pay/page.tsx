"use client"

import Navbar from "@/components/navbar"
import { useDb, patchDb, uid } from "@/lib/local-db"
import { currentUser } from "@/lib/local-db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useMemo, useState } from "react"
import { outstandingByFee } from "@/lib/fees"
import { sumAllocatedByFee, sumPaidByFee } from "@/lib/fees"
import { Checkbox } from "@/components/ui/checkbox"

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

  const frozenDept = student && (db.frozenDepartments || []).includes(student.department)
  const frozenStudent = student && (db.frozenStudents || []).includes(student.registerNo)
  const blocked = frozenDept || frozenStudent

  const outstanding = useMemo(() => (student ? outstandingByFee(db, student.registerNo) : {}), [db, student])
  const feeItems = Object.entries(outstanding)
    .map(([feeId, bal]) => {
      const f = db.fees.find((x) => x.id === feeId)
      return { feeId, name: f?.name || feeId, balance: bal }
    })
    .filter((x) => x.balance > 0)

  const [inputs, setInputs] = useState<Record<string, { selected: boolean; amount: string }>>({})
  const total = useMemo(() => {
    return feeItems.reduce((sum, it) => {
      const x = inputs[it.feeId]
      if (!x?.selected) return sum
      const val = Math.min(Number(x.amount || 0), it.balance)
      return sum + (isFinite(val) ? val : 0)
    }, 0)
  }, [inputs, feeItems])

  const [upiTxn, setUpiTxn] = useState("")
  const [file, setFile] = useState<File | undefined>()

  const totals = useMemo(() => {
    if (!student) return { totalFees: 0, alreadyPaid: 0 }
    const alloc = sumAllocatedByFee(db, student.registerNo)
    const paid = sumPaidByFee(db, student.registerNo)
    const totalFees = Object.values(alloc).reduce((a, b) => a + b, 0)
    const alreadyPaid = Object.values(paid).reduce((a, b) => a + b, 0)
    return { totalFees, alreadyPaid }
  }, [db, student])

  const remainingAfter = Math.max(0, totals.totalFees - (totals.alreadyPaid + total))

  const upiId = "aravindaravind@ptaxis"
  const tn = student?.registerNo ? `Fees ${student.registerNo}` : "Fees"
  const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    "PMC TECH",
  )}&am=${total.toFixed(2)}&tn=${encodeURIComponent(tn)}`

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

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="mx-auto grid max-w-6xl gap-6 p-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Outstanding Fees</CardTitle>
            <CardDescription>Select fee types and enter amount to pay.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {blocked && (
              <div className="rounded border border-destructive p-2 text-sm text-destructive">
                your account is freezed by admin
              </div>
            )}

            <div className="grid gap-1 rounded border p-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Total Fees</span>
                <span>₹ {totals.totalFees.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Already Paid</span>
                <span>₹ {totals.alreadyPaid.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Paying Now</span>
                <span>₹ {total.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between font-semibold">
                <span>Remaining After Payment</span>
                <span>₹ {remainingAfter.toFixed(2)}</span>
              </div>
            </div>

            <ul className="grid gap-2">
              {feeItems.map((it) => (
                <li key={it.feeId} className="grid items-center gap-2 md:grid-cols-[auto_1fr_auto] rounded border p-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={inputs[it.feeId]?.selected || false}
                      onCheckedChange={(v) =>
                        setInputs((prev) => ({
                          ...prev,
                          [it.feeId]: { selected: Boolean(v), amount: prev[it.feeId]?.amount || "" },
                        }))
                      }
                    />
                    <div>
                      <div className="font-medium">{it.name}</div>
                      <div className="text-xs text-muted-foreground">Balance: ₹ {it.balance.toFixed(2)}</div>
                    </div>
                  </div>
                  <div />
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Amount</Label>
                    <Input
                      type="number"
                      className="w-32"
                      value={inputs[it.feeId]?.amount || ""}
                      onChange={(e) =>
                        setInputs((prev) => ({
                          ...prev,
                          [it.feeId]: { selected: prev[it.feeId]?.selected ?? false, amount: e.target.value },
                        }))
                      }
                      placeholder="Enter amount"
                      disabled={!inputs[it.feeId]?.selected}
                    />
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-2 flex items-center justify-between border-t pt-2">
              <span className="font-semibold">Total to Pay</span>
              <span className="font-semibold">₹ {total.toFixed(2)}</span>
            </div>

            <div className="text-sm">
              Use this UPI ID to pay: <span className="font-medium">{upiId}</span>
            </div>

            <a className="mt-1 inline-block" href={upiLink}>
              <Button className="w-full">Open UPI App</Button>
            </a>

            <div className="mt-2 flex flex-col items-center">
              <img
                src="/images/qrcode.jpg"
                alt="Scan to pay via UPI"
                className="h-48 w-48 rounded border object-contain"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Scan this QR or tap "Open UPI App" to pay. Then submit proof for approval.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Submit Payment Proof</CardTitle>
            <CardDescription>Upload screenshot and UPI Transaction ID.</CardDescription>
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
              disabled={blocked || total <= 0}
              onClick={async () => {
                const screenshotDataUrl = await fileToDataUrl(file)
                const paymentId = uid("pay")
                const lines = feeItems
                  .map((it) => {
                    const x = inputs[it.feeId]
                    if (!x?.selected) return null
                    const val = Math.min(Number(x.amount || 0), it.balance)
                    if (!isFinite(val) || val <= 0) return null
                    return { feeId: it.feeId, amount: val }
                  })
                  .filter(Boolean) as Array<{ feeId: string; amount: number }>
                patchDb((db) => {
                  db.payments.push({
                    id: paymentId,
                    studentRegisterNo: student.registerNo,
                    allocations: lines,
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

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>My Payment Submissions</CardTitle>
            <CardDescription>Track approval status and reasons.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {db.payments
              .filter((p) => p.studentRegisterNo === student.registerNo)
              .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
              .map((p) => (
                <div key={p.id} className="rounded border p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div>Submitted: {new Date(p.createdAt).toLocaleString()}</div>
                      <div>Total: ₹ {p.total.toFixed(2)}</div>
                    </div>
                    <div className="font-medium">
                      Status:{" "}
                      <span
                        className={
                          p.status === "approved"
                            ? "text-green-600"
                            : p.status === "rejected"
                              ? "text-destructive"
                              : "text-muted-foreground"
                        }
                      >
                        {p.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  {p.status === "rejected" && p.rejectReason && (
                    <div className="mt-1 text-destructive">Reason: {p.rejectReason}</div>
                  )}
                </div>
              ))}
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
