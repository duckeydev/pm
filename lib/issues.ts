import type { Octokit } from "@octokit/rest"

import type { BoardIssue, GithubRestClient } from "@/lib/github"
import {
  columnForIssue,
  isColumnId,
  labelNames,
  planStatusMove,
  type ColumnId,
} from "@/lib/labels"

export { isColumnId }

function asLabel(label: string | { name?: string | null; color?: string | null }) {
  if (typeof label === "string") return { name: label, color: null }
  return { name: label.name ?? "", color: label.color ?? null }
}

export function toBoardIssue(issue: {
  number: number
  title: string
  html_url: string
  labels?: Array<string | { name?: string | null; color?: string | null }>
  assignees?: Array<{ login: string; avatar_url: string } | null> | null
  user?: { login: string; avatar_url: string } | null
  pull_request?: unknown
}): BoardIssue {
  const labels = (issue.labels ?? [])
    .map(asLabel)
    .filter((label) => label.name.length > 0)

  return {
    number: issue.number,
    title: issue.title,
    htmlUrl: issue.html_url,
    labels,
    assignees: (issue.assignees ?? [])
      .filter((assignee): assignee is { login: string; avatar_url: string } =>
        Boolean(assignee?.login)
      )
      .map((assignee) => ({
        login: assignee.login,
        avatarUrl: assignee.avatar_url,
      })),
    statusLabels: labelNames(labels).filter((name) => name.startsWith("status:")),
  }
}

export async function listBoardIssues(
  octokit: Octokit,
  repo: { owner: string; repo: string }
): Promise<BoardIssue[]> {
  const issues = await octokit.paginate(octokit.rest.issues.listForRepo, {
    owner: repo.owner,
    repo: repo.repo,
    state: "all",
    per_page: 100,
  })

  return issues
    .filter((issue) => !issue.pull_request)
    .map(toBoardIssue)
}

export type MoveIssueResult = {
  issueNumber: number
  column: ColumnId
  removed: string[]
  added: string
  remainingNonStatus: string[]
}

/**
 * Move an issue by swapping its status:* label on GitHub.
 * 1. Remove every existing status:* label.
 * 2. Add exactly the destination column's status:* label.
 * 3. Leave non-status labels untouched.
 */
export async function moveIssueStatus(
  octokit: GithubRestClient,
  params: {
    owner: string
    repo: string
    issueNumber: number
    destColumn: ColumnId
  }
): Promise<MoveIssueResult> {
  const { data } = await octokit.rest.issues.get({
    owner: params.owner,
    repo: params.repo,
    issue_number: params.issueNumber,
  })

  const plan = planStatusMove(data.labels, params.destColumn)

  for (const name of plan.toRemove) {
    await octokit.rest.issues.removeLabel({
      owner: params.owner,
      repo: params.repo,
      issue_number: params.issueNumber,
      name,
    })
  }

  await octokit.rest.issues.addLabels({
    owner: params.owner,
    repo: params.repo,
    issue_number: params.issueNumber,
    labels: [plan.toAdd],
  })

  return {
    issueNumber: params.issueNumber,
    column: params.destColumn,
    removed: plan.toRemove,
    added: plan.toAdd,
    remainingNonStatus: plan.nonStatus,
  }
}

export function groupIssuesByColumn(issues: BoardIssue[]) {
  const grouped: Record<ColumnId, BoardIssue[]> = {
    backlog: [],
    "in-progress": [],
    review: [],
    done: [],
  }

  for (const issue of issues) {
    grouped[columnForIssue(issue.labels)].push(issue)
  }

  return grouped
}
