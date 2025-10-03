"use client"

import { useState } from "react"
import { useDb, patchDb } from "@/lib/local-db"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { currentUser } from "@/lib/local-db"

function fileToDataUrl(file?: File): Promise<string | undefined> {
  if (!file) return Promise.resolve(undefined)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function ProfileForm() {
  const db = useDb()
  const user = currentUser()
  const student = db.students.find((s) => s.registerNo === user?.studentRegNo)

  const [state, setState] = useState({
    name: student?.name ?? "",
    department: student?.department ?? "",
    branch: student?.branch ?? "",
    year: student?.year ?? "",
    batch: student?.batch ?? "",
    umis: student?.umis ?? "",
    phone: student?.phone ?? "",
    email: student?.email ?? user?.email ?? "",

    fatherName: student?.fatherName ?? "",
    fatherOccupation: student?.fatherOccupation ?? "",
    fatherPhone: student?.fatherPhone ?? "",
    motherName: student?.motherName ?? "",
    motherOccupation: student?.motherOccupation ?? "",
    motherPhone: student?.motherPhone ?? "",
    guardianName: student?.guardianName ?? "",
    guardianOccupation: student?.guardianOccupation ?? "",
    guardianPhone: student?.guardianPhone ?? "",
    emergencyPreference: (student?.emergencyPreference ?? "father") as "father" | "mother" | "guardian",
  })

  const [files, setFiles] = useState<Record<string, File | undefined>>({})

  if (!student) return <p>Student record not found.</p>

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label>Name</Label>
          <Input value={state.name} onChange={(e) => setState({ ...state, name: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Department</Label>
          <Input value={state.department} onChange={(e) => setState({ ...state, department: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Branch</Label>
          <Input value={state.branch} onChange={(e) => setState({ ...state, branch: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Year</Label>
          <Input value={state.year} onChange={(e) => setState({ ...state, year: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Batch</Label>
          <Input value={state.batch} onChange={(e) => setState({ ...state, batch: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>UMIS Number</Label>
          <Input value={state.umis} onChange={(e) => setState({ ...state, umis: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Phone</Label>
          <Input value={state.phone} onChange={(e) => setState({ ...state, phone: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Email</Label>
          <Input type="email" value={state.email} onChange={(e) => setState({ ...state, email: e.target.value })} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label>Father's Name</Label>
          <Input value={state.fatherName} onChange={(e) => setState({ ...state, fatherName: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Father's Occupation</Label>
          <Input
            value={state.fatherOccupation}
            onChange={(e) => setState({ ...state, fatherOccupation: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label>Father's Phone</Label>
          <Input value={state.fatherPhone} onChange={(e) => setState({ ...state, fatherPhone: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Mother's Name</Label>
          <Input value={state.motherName} onChange={(e) => setState({ ...state, motherName: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Mother's Occupation</Label>
          <Input
            value={state.motherOccupation}
            onChange={(e) => setState({ ...state, motherOccupation: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label>Mother's Phone</Label>
          <Input value={state.motherPhone} onChange={(e) => setState({ ...state, motherPhone: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Guardian Name (optional)</Label>
          <Input value={state.guardianName} onChange={(e) => setState({ ...state, guardianName: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <Label>Guardian Occupation</Label>
          <Input
            value={state.guardianOccupation}
            onChange={(e) => setState({ ...state, guardianOccupation: e.target.value })}
          />
        </div>
        <div className="grid gap-2">
          <Label>Guardian Phone</Label>
          <Input value={state.guardianPhone} onChange={(e) => setState({ ...state, guardianPhone: e.target.value })} />
        </div>
      </section>

      <section className="grid gap-3">
        <Label>Upload Certificates (images/PDF as images)</Label>
        <div className="grid gap-2 md:grid-cols-2">
          <Input type="file" accept="image/*" onChange={(e) => setFiles({ ...files, tc12: e.target.files?.[0] })} />
          <Input type="file" accept="image/*" onChange={(e) => setFiles({ ...files, birth: e.target.files?.[0] })} />
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setFiles({ ...files, firstGraduate: e.target.files?.[0] })}
          />
          <Input type="file" accept="image/*" onChange={(e) => setFiles({ ...files, mark10: e.target.files?.[0] })} />
          <Input type="file" accept="image/*" onChange={(e) => setFiles({ ...files, mark12: e.target.files?.[0] })} />
        </div>
      </section>

      <div>
        <Button
          onClick={async () => {
            const tc12 = await fileToDataUrl(files.tc12)
            const birth = await fileToDataUrl(files.birth)
            const firstGraduate = await fileToDataUrl(files.firstGraduate)
            const mark10 = await fileToDataUrl(files.mark10)
            const mark12 = await fileToDataUrl(files.mark12)

            patchDb((db) => {
              const s = db.students.find((x) => x.id === student.id)
              if (!s) return
              Object.assign(s, state)
              s.docs = { tc12, birth, firstGraduate, mark10, mark12 }
              s.profileCompleted = true
              s.auditTrail = s.auditTrail ?? []
              s.auditTrail.push({ at: new Date().toISOString(), by: state.email, action: "profile-update" })
            })
            alert("Profile saved.")
          }}
        >
          Save Profile
        </Button>
      </div>
    </div>
  )
}
