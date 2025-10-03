"use client"

import { useState } from "react"
import Navbar from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { patchDb, setCurrentUser, uid, hash, useDb } from "@/lib/local-db"

export default function SetupPage() {
  const db = useDb()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  if (db.setupComplete && db.users.length > 0) {
    if (typeof window !== "undefined") window.location.href = "/dashboard"
    return null
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-lg p-6">
        <Card>
          <CardHeader>
            <CardTitle>First-time Admin Setup</CardTitle>
            <CardDescription>Create the initial Admin account. No defaults are used.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pw">Password</Label>
              <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button
              className="bg-primary text-primary-foreground"
              onClick={() => {
                if (!email || !password) return
                const id = uid("user")
                patchDb((db) => {
                  db.users.push({
                    id,
                    email,
                    passwordHash: hash(password),
                    role: "admin",
                    createdAt: new Date().toISOString(),
                  })
                  db.setupComplete = true
                  db.currentUserId = id
                })
                setCurrentUser(id)
                window.location.href = "/dashboard"
              }}
            >
              Create Admin
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
