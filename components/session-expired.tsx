"use client"

import { useEffect, useRef } from "react"

import { signOutToLogin } from "@/app/actions"
import { Button } from "@/components/ui/button"

export function SessionExpired() {
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    formRef.current?.requestSubmit()
  }, [])

  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4 rounded-xl border border-border bg-card p-6 text-card-foreground">
        <div className="space-y-1">
          <h1 className="text-lg font-medium tracking-tight">Session expired</h1>
          <p className="text-sm text-muted-foreground">
            Your GitHub access token is no longer valid. Sign in again to
            continue.
          </p>
        </div>
        <form ref={formRef} action={signOutToLogin}>
          <Button type="submit">Continue to sign in</Button>
        </form>
      </div>
    </main>
  )
}
