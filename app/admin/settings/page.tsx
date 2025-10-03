"use client"

import Navbar from "@/components/navbar"
import { useDb, patchDb } from "@/lib/local-db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function SettingsPage() {
  const db = useDb()
  const [dept, setDept] = useState("")
  const [reg, setReg] = useState("")

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-4xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>Admin Settings</CardTitle>
            <CardDescription>Registration window and freeze rules.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-2 md:grid-cols-3 items-center">
              <div className="flex items-center gap-2">
                <Label>Student Registration Open</Label>
                <Switch
                  checked={!!db.registrationOpen}
                  onCheckedChange={(v) => patchDb((db) => void (db.registrationOpen = v))}
                />
              </div>
              <div className="grid gap-1">
                <Label>From</Label>
                <Input
                  type="datetime-local"
                  value={db.registrationWindow?.from || ""}
                  onChange={(e) =>
                    patchDb((db) => {
                      db.registrationWindow = db.registrationWindow || {}
                      db.registrationWindow.from = e.target.value
                    })
                  }
                />
              </div>
              <div className="grid gap-1">
                <Label>To</Label>
                <Input
                  type="datetime-local"
                  value={db.registrationWindow?.to || ""}
                  onChange={(e) =>
                    patchDb((db) => {
                      db.registrationWindow = db.registrationWindow || {}
                      db.registrationWindow.to = e.target.value
                    })
                  }
                />
              </div>
            </div>

            <div className="rounded border p-3 grid gap-2 md:grid-cols-2">
              <div className="grid gap-1">
                <Label>Freeze Department</Label>
                <Input value={dept} onChange={(e) => setDept(e.target.value)} placeholder="Department name" />
                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      patchDb((db) => {
                        db.frozenDepartments = db.frozenDepartments || []
                        if (!db.frozenDepartments.includes(dept)) db.frozenDepartments.push(dept)
                      })
                    }
                  >
                    Freeze Dept
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      patchDb((db) => {
                        db.frozenDepartments = (db.frozenDepartments || []).filter((d) => d !== dept)
                      })
                    }
                  >
                    Unfreeze Dept
                  </Button>
                </div>
              </div>
              <div className="grid gap-1">
                <Label>Freeze Student (Register No)</Label>
                <Input value={reg} onChange={(e) => setReg(e.target.value)} placeholder="Register No" />
                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      patchDb((db) => {
                        db.frozenStudents = db.frozenStudents || []
                        if (!db.frozenStudents.includes(reg)) db.frozenStudents.push(reg)
                      })
                    }
                  >
                    Freeze Student
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      patchDb((db) => {
                        db.frozenStudents = (db.frozenStudents || []).filter((r) => r !== reg)
                      })
                    }
                  >
                    Unfreeze Student
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
