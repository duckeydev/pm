import type { GithubRestClient } from "@/lib/github"

export class OrgAccessError extends Error {
  readonly status = 403

  constructor(message = "Not a member of the required GitHub org") {
    super(message)
    this.name = "OrgAccessError"
  }
}

export class GitHubAuthError extends Error {
  readonly status = 401

  constructor(message = "GitHub access token is no longer valid") {
    super(message)
    this.name = "GitHubAuthError"
  }
}

export function githubErrorStatus(error: unknown): number | undefined {
  if (typeof error === "object" && error && "status" in error) {
    const status = (error as { status?: unknown }).status
    return typeof status === "number" ? status : undefined
  }
  return undefined
}

export function isGitHubUnauthorized(error: unknown): boolean {
  return error instanceof GitHubAuthError || githubErrorStatus(error) === 401
}

export async function assertOrgMember(
  octokit: GithubRestClient,
  org: string
): Promise<void> {
  try {
    const { data } = await octokit.rest.orgs.getMembershipForAuthenticatedUser({
      org,
    })
    if (data.state !== "active") {
      throw new OrgAccessError(`GitHub org membership is ${data.state}`)
    }
  } catch (error) {
    if (error instanceof OrgAccessError) throw error
    const status = githubErrorStatus(error)
    if (status === 401) {
      throw new GitHubAuthError()
    }
    if (status === 404 || status === 403) {
      throw new OrgAccessError()
    }
    throw error
  }
}

export async function isOrgMember(
  octokit: GithubRestClient,
  org: string
): Promise<boolean> {
  try {
    await assertOrgMember(octokit, org)
    return true
  } catch (error) {
    if (error instanceof OrgAccessError) return false
    throw error
  }
}
