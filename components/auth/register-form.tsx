"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { patchDb, uid, hash, setCurrentUser } from "@/lib/local-db"

export default function RegisterForm() {
  const [name, setName] = useState("")
  const [registerNo, setRegisterNo] = useState("")
  const [department, setDepartment] = useState("")
  const [year, setYear] = useState("")
  const [batch, setBatch] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label>Register Number</Label>
        <Input value={registerNo} onChange={(e) => setRegisterNo(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label>Department</Label>
        <Input value={department} onChange={(e) => setDepartment(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label>Year</Label>
        <Input value={year} onChange={(e) => setYear(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label>Batch</Label>
        <Input value={batch} onChange={(e) => setBatch(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label>Email</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label>Phone</Label>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label>Password</Label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <Button
        className="bg-accent text-accent-foreground"
        onClick={() => {
          if (!name || !registerNo || !department || !year || !batch || !email || !password) {
            alert("Please fill all required fields.")
            return
          }
          const studentId = uid("student")
          const userId = uid("user")
          patchDb((db) => {
            // prevent duplicates
            if (db.students.find((s) => s.registerNo === registerNo)) {
              throw new Error("Register Number already exists")
            }
            db.students.push({
              id: studentId,
              name,
              registerNo,
              department,
              year,
              batch,
              email,
              phone,
              auditTrail: [{ at: new Date().toISOString(), by: email, action: "self-register" }],
            })
            db.users.push({
              id: userId,
              email,
              passwordHash: hash(password),
              role: "student",
              studentRegNo: registerNo,
              createdAt: new Date().toISOString(),
            })
            db.currentUserId = userId
          })
          setCurrentUser(userId)
          window.location.href = "/dashboard"
        }}
      >
        Create Student Account
      </Button>
    </div>
  )
}
