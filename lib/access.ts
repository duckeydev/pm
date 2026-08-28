import { auth } from "@/auth"
import { getGithubOrg } from "@/lib/config"
import { createUserOctokit } from "@/lib/github"
import { assertOrgMember, OrgAccessError } from "@/lib/org"

export class AuthRequiredError extends Error {
  readonly status = 401

  constructor(message = "Sign in required") {
    super(message)
    this.name = "AuthRequiredError"
  }
}

export async function requireBoardAccess() {
  const session = await auth()
  if (!session?.accessToken) {
    throw new AuthRequiredError()
  }

  const octokit = createUserOctokit(session.accessToken)
  await assertOrgMember(octokit, getGithubOrg())
  return { session, octokit }
}

export { OrgAccessError }
