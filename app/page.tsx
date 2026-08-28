import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { AppHeader } from "@/components/app-header"
import { Board } from "@/components/board"
import { getBoardRepo, getGithubOrg } from "@/lib/config"
import { createUserOctokit } from "@/lib/github"
import { listBoardIssues } from "@/lib/issues"
import { isOrgMember } from "@/lib/org"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const session = await auth()
  if (!session?.accessToken) {
    redirect("/sign-in")
  }

  const octokit = createUserOctokit(session.accessToken)
  const member = await isOrgMember(octokit, getGithubOrg())
  if (!member) {
    redirect("/denied")
  }

  const issues = await listBoardIssues(octokit, getBoardRepo())

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AppHeader user={session.user} />
      <Board initialIssues={issues} />
    </div>
  )
}
