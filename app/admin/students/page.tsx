"use client"

import Navbar from "@/components/navbar"
import { useDb } from "@/lib/local-db"
import { totalOutstanding } from "@/lib/fees"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button" // import Button component
import * as XLSX from "xlsx"

type Comparator = "lt" | "eq" | "gt"

export default function AdminStudentsPage() {
  const db = useDb()
  const [department, setDepartment] = useState("all")
  const [paidFilter, setPaidFilter] = useState<"all" | "paid" | "unpaid">("all")
  const [cmp, setCmp] = useState<Comparator>("eq")
  const [amount, setAmount] = useState<string>("")

  const departments = useMemo(
    () => Array.from(new Set(db.students.map((s) => s.department))).filter(Boolean),
    [db.students],
  )

  const rows = useMemo(() => {
    return db.students
      .map((s) => {
        const outstanding = totalOutstanding(db, s.registerNo)
        const paid = db.payments
          .filter((p) => p.studentRegisterNo === s.registerNo && p.status === "approved")
          .reduce((a, p) => a + p.total, 0)
        return {
          id: s.id,
          name: s.name,
          registerNo: s.registerNo,
          department: s.department,
          phone: s.phone || "", // include phone
          paid,
          outstanding,
        }
      })
      .filter((r) => (department !== "all" ? r.department === department : true))
      .filter((r) => {
        if (paidFilter === "paid") return r.outstanding === 0
        if (paidFilter === "unpaid") return r.outstanding > 0
        return true
      })
      .filter((r) => {
        const val = Number(amount || "")
        if (!val && val !== 0) return true
        if (cmp === "lt") return r.outstanding < val
        if (cmp === "gt") return r.outstanding > val
        return r.outstanding === val
      })
  }, [db, department, paidFilter, cmp, amount])

  function downloadStudentsCSV() {
    const header = ["Name", "Register No", "Department", "Phone", "Paid", "Outstanding"]
    const body = rows.map((r) => [
      r.name,
      r.registerNo,
      r.department,
      r.phone,
      r.paid.toFixed(2),
      r.outstanding.toFixed(2),
    ])
    const csv = [header, ...body].map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = "students.csv"
    a.click()
    URL.revokeObjectURL(a.href)
  }

  function downloadStudentsExcel() {
    const data = rows.map((r) => ({
      Name: r.name,
      RegisterNo: r.registerNo,
      Department: r.department,
      Phone: r.phone,
      Paid: r.paid,
      Outstanding: r.outstanding,
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Students")
    XLSX.writeFile(wb, "students.xlsx")
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-6xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>Filter by department, paid status, or fees range.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={downloadStudentsCSV}>
                Download CSV
              </Button>
              <Button variant="secondary" onClick={downloadStudentsExcel}>
                Download Excel
              </Button>
              <Button onClick={() => window.print()}>Print (PDF)</Button>
            </div>

            <div className="grid gap-2 md:grid-cols-4">
              <div>
                <Select value={department} onValueChange={setDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="All departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={paidFilter} onValueChange={(v) => setPaidFilter(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Select value={cmp} onValueChange={(v) => setCmp(v as Comparator)}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lt">Below</SelectItem>
                    <SelectItem value="eq">Equal</SelectItem>
                    <SelectItem value="gt">Above</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
            </div>

            <div className="grid gap-2">
              {rows.map((r) => (
                <div key={r.id} className="grid grid-cols-6 items-center rounded border p-2 text-sm">
                  <div className="font-medium">{r.name}</div>
                  <div>{r.registerNo}</div>
                  <div>{r.department}</div>
                  <div>{r.phone}</div> {/* phone column */}
                  <div>Paid: ₹ {r.paid.toFixed(2)}</div>
                  <div>Outstanding: ₹ {r.outstanding.toFixed(2)}</div>
                </div>
              ))}
              {rows.length === 0 && <p>No students match the filters.</p>}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
