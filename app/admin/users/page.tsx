"use client"

import Navbar from "@/components/navbar"
import { useDb, patchDb, uid, hash } from "@/lib/local-db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function UsersPage() {
  const db = useDb()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"office" | "principal" | "hod" | "faculty">("office")

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-2xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Create credentials for staff roles.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-1">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <Label>Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="principal">Principal</SelectItem>
                  <SelectItem value="hod">HOD</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => {
                if (!email || !password) return
                patchDb((db) => {
                  db.users.push({
                    id: uid("usr"),
                    email,
                    passwordHash: hash(password),
                    role,
                    createdAt: new Date().toISOString(),
                  })
                })
                setEmail("")
                setPassword("")
                alert("User created.")
              }}
            >
              Create User
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
