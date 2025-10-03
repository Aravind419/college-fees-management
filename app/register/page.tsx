"use client"

import Navbar from "@/components/navbar"
import RegisterForm from "@/components/auth/register-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function RegisterPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-lg p-6">
        <Card>
          <CardHeader>
            <CardTitle>Student Registration</CardTitle>
            <CardDescription>Register using your Register Number and academic details.</CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
