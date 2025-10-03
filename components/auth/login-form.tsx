"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { patchDb, setCurrentUser, useDb, hash } from "@/lib/local-db"
import type { Role } from "@/lib/types"

export default function LoginForm() {
  const db = useDb()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<Role>("student")

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label>Email</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label>Password</Label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label>Role</Label>
        <Select value={role} onValueChange={(v: Role) => setRole(v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="office">Office</SelectItem>
            <SelectItem value="principal">Principal</SelectItem>
            <SelectItem value="hod">HOD</SelectItem>
            <SelectItem value="faculty">Faculty</SelectItem>
            <SelectItem value="student">Student</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button
        onClick={() => {
          const user = db.users.find((u) => u.email === email && u.role === role && u.passwordHash === hash(password))
          if (!user) {
            alert("Invalid credentials or role")
            return
          }
          patchDb((db) => {
            db.currentUserId = user.id
          })
          setCurrentUser(user.id)
          window.location.href = "/dashboard"
        }}
      >
        Login
      </Button>
    </div>
  )
}
