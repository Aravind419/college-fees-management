"use client"

import { useState } from "react"
import { useDb, patchDb, uid } from "@/lib/local-db"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { currentUser } from "@/lib/local-db"

type Section = "details" | "parents" | "certificates"

function fileToDataUrl(file?: File): Promise<string | undefined> {
  if (!file) return Promise.resolve(undefined)
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function ProfileForm({ section = "details" }: { section?: Section }) {
  const db = useDb()
  const user = currentUser()
  const student = db.students.find((s) => s.registerNo === user?.studentRegNo)

  const frozenDept = student && (db.frozenDepartments || []).includes(student.department)
  const frozenStudent = student && (db.frozenStudents || []).includes(student.registerNo)
  const blocked = Boolean(frozenDept || frozenStudent)

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
  const [photo, setPhoto] = useState<File | undefined>()
  const [customCerts, setCustomCerts] = useState<Array<{ id: string; name: string; file?: File }>>([
    // empty seed row
  ])

  if (!student) return <p>Student record not found.</p>

  return (
    <div className="grid gap-6">
      {blocked && (
        <div className="rounded border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          your account is freezed by admin
        </div>
      )}
      <fieldset disabled={blocked} className="grid gap-6">
        {section === "details" && (
          <section className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>Profile Photo</Label>
              <Input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0])} />
              {student.photoDataUrl && (
                <img
                  src={student.photoDataUrl || "/placeholder.svg"}
                  alt="Profile"
                  className="h-24 w-24 rounded-full object-cover border"
                />
              )}
            </div>
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
        )}

        {section === "parents" && (
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
              <Input
                value={state.guardianName}
                onChange={(e) => setState({ ...state, guardianName: e.target.value })}
              />
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
              <Input
                value={state.guardianPhone}
                onChange={(e) => setState({ ...state, guardianPhone: e.target.value })}
              />
            </div>
          </section>
        )}

        {section === "certificates" && (
          <section className="grid gap-4">
            <div className="grid gap-3">
              <Label>Upload Certificates (images/PDF as images)</Label>
              <div className="grid gap-2 md:grid-cols-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFiles({ ...files, tc12: e.target.files?.[0] })}
                />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFiles({ ...files, birth: e.target.files?.[0] })}
                />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFiles({ ...files, firstGraduate: e.target.files?.[0] })}
                />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFiles({ ...files, mark10: e.target.files?.[0] })}
                />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFiles({ ...files, mark12: e.target.files?.[0] })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Add Custom Certificates</Label>
              {customCerts.length === 0 && (
                <Button
                  variant="secondary"
                  onClick={() => setCustomCerts((arr) => [...arr, { id: uid("cc"), name: "" }])}
                >
                  Add Certificate
                </Button>
              )}
              {customCerts.map((row, idx) => (
                <div key={row.id} className="grid gap-2 md:grid-cols-[1fr_auto] items-center">
                  <Input
                    placeholder="Certificate name (e.g., NCC, Sports, Extra-Curricular)"
                    value={row.name}
                    onChange={(e) =>
                      setCustomCerts((arr) => arr.map((r) => (r.id === row.id ? { ...r, name: e.target.value } : r)))
                    }
                  />
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setCustomCerts((arr) =>
                        arr.map((r) => (r.id === row.id ? { ...r, file: e.target.files?.[0] } : r)),
                      )
                    }
                  />
                </div>
              ))}
              {customCerts.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setCustomCerts((arr) => [...arr, { id: uid("cc"), name: "" }])}
                  >
                    Add More
                  </Button>
                  <Button variant="secondary" onClick={() => setCustomCerts([])}>
                    Clear
                  </Button>
                </div>
              )}

              {student.customCertificates && student.customCertificates.length > 0 && (
                <div className="mt-2 grid gap-2">
                  <div className="text-sm font-medium">Existing Custom Certificates</div>
                  <div className="grid gap-2 md:grid-cols-3">
                    {student.customCertificates.map((c) => (
                      <div key={c.id} className="rounded border p-2 text-sm">
                        <div className="font-medium">{c.name}</div>
                        {c.dataUrl && (
                          <img
                            src={c.dataUrl || "/placeholder.svg"}
                            alt={c.name}
                            className="mt-2 h-32 w-full rounded border object-contain"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <div>
          <Button
            onClick={async () => {
              const tc12 = await fileToDataUrl(files.tc12)
              const birth = await fileToDataUrl(files.birth)
              const firstGraduate = await fileToDataUrl(files.firstGraduate)
              const mark10 = await fileToDataUrl(files.mark10)
              const mark12 = await fileToDataUrl(files.mark12)
              const photoDataUrl = await fileToDataUrl(photo)

              const ccWithData = await Promise.all(
                customCerts
                  .filter((c) => c.name.trim().length > 0)
                  .map(async (c) => ({
                    id: c.id,
                    name: c.name.trim(),
                    dataUrl: await fileToDataUrl(c.file),
                  })),
              )

              patchDb((db) => {
                const s = db.students.find((x) => x.id === student.id)
                if (!s) return
                Object.assign(s, state)
                s.docs = { tc12, birth, firstGraduate, mark10, mark12 }
                if (photoDataUrl) s.photoDataUrl = photoDataUrl
                s.profileCompleted = true
                s.auditTrail = s.auditTrail ?? []
                s.auditTrail.push({ at: new Date().toISOString(), by: state.email, action: "profile-update" })

                s.customCertificates = s.customCertificates ?? []
                for (const c of ccWithData) {
                  const i = s.customCertificates.findIndex((x) => x.id === c.id)
                  if (i >= 0) s.customCertificates[i] = c
                  else s.customCertificates.push(c)
                }
              })
              alert("Profile saved.")
            }}
          >
            Save Profile
          </Button>
        </div>
      </fieldset>
    </div>
  )
}
