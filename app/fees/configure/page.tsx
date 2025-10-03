"use client"

import Navbar from "@/components/navbar"
import { useDb, patchDb } from "@/lib/local-db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

export default function ConfigureFeesPage() {
  const db = useDb()

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-4xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>Configure Fees</CardTitle>
            <CardDescription>Activate fee types and set default amounts.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {db.fees.map((f) => (
              <div key={f.id} className="grid gap-2 md:grid-cols-[1fr_auto_auto] items-center">
                <div>
                  <Label className="text-base">{f.name}</Label>
                  <p className="text-xs text-muted-foreground">Type: {f.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`${f.id}_active`}>Active</Label>
                  <Switch
                    id={`${f.id}_active`}
                    checked={f.active}
                    onCheckedChange={(v) =>
                      patchDb((db) => {
                        const x = db.fees.find((x) => x.id === f.id)!
                        x.active = v
                      })
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    className="w-32"
                    value={f.defaultAmount}
                    onChange={(e) =>
                      patchDb((db) => {
                        const x = db.fees.find((x) => x.id === f.id)!
                        x.defaultAmount = Number(e.target.value || 0)
                      })
                    }
                  />
                </div>
              </div>
            ))}
            <div>
              <Button onClick={() => alert("Fees saved (locally).")}>Save</Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
