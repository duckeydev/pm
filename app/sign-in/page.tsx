import { SignInButton } from "@/components/sign-in-button"

export default function SignInPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4 rounded-xl border border-border bg-card p-6 text-card-foreground">
        <div className="space-y-1">
          <h1 className="text-lg font-medium tracking-tight">NetGoat PM</h1>
          <p className="text-sm text-muted-foreground">
            Sign in with GitHub to open the shared issue board. Mutations run as
            your org membership.
          </p>
        </div>
        <SignInButton />
      </div>
    </main>
  )
}
