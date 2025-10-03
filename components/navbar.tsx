"use client"

import Link from "next/link"
import { useDb, currentUser, logout } from "@/lib/local-db"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  const db = useDb()
  const user = currentUser()

  return (
    <header className="w-full border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-primary" aria-hidden />
          <span className="text-lg font-semibold text-pretty">PMC TECH Fees</span>
        </Link>

        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm">
                Signed in as: {user.email} ({user.role})
              </span>
              <Link href="/dashboard">
                <Button variant="default">Dashboard</Button>
              </Link>
              <Button
                variant="secondary"
                onClick={() => {
                  logout()
                  window.location.href = "/"
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button>Login</Button>
              </Link>
              <Link href="/register">
                <Button variant="secondary">Student Sign Up</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
