"use client"

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
        <button
          type="button"
          onClick={reset}
          className="text-sm text-foreground underline-offset-4 hover:underline"
        >
          Try again
        </button>
      </div>
    </main>
  )
}
