"use client"

import { signOutToLogin } from "@/app/actions"
import { Button } from "@/components/ui/button"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-md space-y-3 rounded-xl border border-border bg-card p-6">
        <h1 className="text-lg font-medium text-foreground">Something went wrong</h1>
        <p className="text-sm text-muted-foreground">
          {error.message || "The board could not load GitHub issues."}
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="text-sm text-foreground underline-offset-4 hover:underline"
          >
            Try again
          </button>
          <form action={signOutToLogin}>
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}
