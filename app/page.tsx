import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { signOutToLogin } from "@/app/actions"
import { AppHeader } from "@/components/app-header"
import { Board } from "@/components/board"
import { AuthRequiredError } from "@/lib/access"
import { getBoardRepo, getGithubOrg } from "@/lib/config"
import { createUserOctokit } from "@/lib/github"
import { listBoardIssues } from "@/lib/issues"
import type { BoardIssue } from "@/lib/github"
import { isGitHubUnauthorized, isOrgMember } from "@/lib/org"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const session = await auth()
  if (!session?.accessToken) {
    redirect("/sign-in")
  }

  const octokit = createUserOctokit(session.accessToken)
  let issues: BoardIssue[]

  try {
    const member = await isOrgMember(octokit, getGithubOrg())
    if (!member) {
      redirect("/denied")
    }
    issues = await listBoardIssues(octokit, getBoardRepo())
  } catch (error) {
    if (error instanceof AuthRequiredError || isGitHubUnauthorized(error)) {
      await signOutToLogin()
    }
    throw error
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AppHeader user={session.user} />
      <Board initialIssues={issues} />
    </div>
  )
}
