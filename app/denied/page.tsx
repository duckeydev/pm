import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { SignOutButton } from "@/components/sign-out-button"
import { getGithubOrg } from "@/lib/config"

export const dynamic = "force-dynamic"

export default async function DeniedPage() {
  const session = await auth()
  if (!session) {
    redirect("/sign-in")
  }

  const org = getGithubOrg()
  const identity = session.user.login || session.user.email || "this GitHub account"

  return (
    <main className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-6 text-card-foreground">
        <div className="space-y-2">
          <h1 className="text-lg font-medium tracking-tight">Access denied</h1>
          <p className="text-sm text-muted-foreground">
            You are signed in as <span className="text-foreground">{identity}</span>,
            but you are not an active member of the{" "}
            <span className="text-foreground">{org}</span> GitHub org. The board
            stays gated to that org — ask an admin for an invite, then sign in
            again.
          </p>
        </div>
        <SignOutButton />
      </div>
    </main>
  )
}
