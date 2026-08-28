import { Octokit } from "@octokit/rest"

import type { GithubLabelLike } from "@/lib/labels"

export type { GithubLabelLike }

export type GithubIssueLabel = {
  name: string
  color?: string | null
}

export type GithubIssueAssignee = {
  login: string
  avatarUrl: string
}

export type BoardIssue = {
  number: number
  title: string
  htmlUrl: string
  labels: GithubIssueLabel[]
  assignees: GithubIssueAssignee[]
  statusLabels: string[]
}

/**
 * Narrow Octokit REST surface used by board auth and issue moves.
 * Tests mock this boundary instead of a local card store.
 */
export type GithubRestClient = {
  rest: {
    issues: {
      get: (params: {
        owner: string
        repo: string
        issue_number: number
      }) => Promise<{ data: { labels: GithubLabelLike[] } }>
      removeLabel: (params: {
        owner: string
        repo: string
        issue_number: number
        name: string
      }) => Promise<unknown>
      addLabels: (params: {
        owner: string
        repo: string
        issue_number: number
        labels: string[]
      }) => Promise<unknown>
    }
    orgs: {
      getMembershipForAuthenticatedUser: (params: { org: string }) => Promise<{
        data: { state: string }
      }>
    }
  }
}

export function createUserOctokit(accessToken: string) {
  return new Octokit({ auth: accessToken })
}

/** Fallback for CI / label bootstrap only — not the board mutation path. */
export function createBootstrapOctokit() {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    throw new Error("GITHUB_TOKEN is required for label bootstrap")
  }
  return new Octokit({ auth: token })
}
