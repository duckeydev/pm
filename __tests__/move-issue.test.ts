import { describe, expect, it, vi } from "vitest"

import type { GithubRestClient } from "@/lib/github"
import { moveIssueStatus } from "@/lib/issues"

function issueClient(labels: Array<string | { name: string }>): {
  octokit: GithubRestClient
  get: ReturnType<typeof vi.fn>
  removeLabel: ReturnType<typeof vi.fn>
  addLabels: ReturnType<typeof vi.fn>
} {
  const get = vi.fn().mockResolvedValue({ data: { labels } })
  const removeLabel = vi.fn().mockResolvedValue({})
  const addLabels = vi.fn().mockResolvedValue({})

  return {
    get,
    removeLabel,
    addLabels,
    octokit: {
      rest: {
        issues: { get, removeLabel, addLabels },
        orgs: {
          getMembershipForAuthenticatedUser: vi.fn(),
        },
      },
    },
  }
}

describe("moving a card swaps the GitHub status:* label", () => {
  it("removes every status:* label and adds exactly the destination label", async () => {
    const { octokit, get, removeLabel, addLabels } = issueClient([
      { name: "status:backlog" },
      { name: "agent:swe" },
      { name: "bug" },
    ])

    const result = await moveIssueStatus(octokit, {
      owner: "netgoat-xyz",
      repo: "pm",
      issueNumber: 12,
      destColumn: "review",
    })

    expect(get).toHaveBeenCalledWith({
      owner: "netgoat-xyz",
      repo: "pm",
      issue_number: 12,
    })
    expect(removeLabel).toHaveBeenCalledTimes(1)
    expect(removeLabel).toHaveBeenCalledWith({
      owner: "netgoat-xyz",
      repo: "pm",
      issue_number: 12,
      name: "status:backlog",
    })
    expect(addLabels).toHaveBeenCalledTimes(1)
    expect(addLabels).toHaveBeenCalledWith({
      owner: "netgoat-xyz",
      repo: "pm",
      issue_number: 12,
      labels: ["status:review"],
    })
    expect(result).toMatchObject({
      added: "status:review",
      removed: ["status:backlog"],
      remainingNonStatus: ["agent:swe", "bug"],
    })
  })

  it("clears duplicate status:* labels instead of stacking them", async () => {
    const { octokit, removeLabel, addLabels } = issueClient([
      "status:backlog",
      "status:in-progress",
      "agent:qa",
    ])

    const result = await moveIssueStatus(octokit, {
      owner: "netgoat-xyz",
      repo: "pm",
      issueNumber: 4,
      destColumn: "done",
    })

    expect(removeLabel.mock.calls.map((call) => call[0].name).sort()).toEqual([
      "status:backlog",
      "status:in-progress",
    ])
    expect(addLabels).toHaveBeenCalledWith({
      owner: "netgoat-xyz",
      repo: "pm",
      issue_number: 4,
      labels: ["status:done"],
    })
    expect(result.remainingNonStatus).toEqual(["agent:qa"])
  })

  it("stamps status:backlog on first touch when the issue had no status:* label", async () => {
    const { octokit, removeLabel, addLabels } = issueClient(["agent:design"])

    await moveIssueStatus(octokit, {
      owner: "netgoat-xyz",
      repo: "pm",
      issueNumber: 1,
      destColumn: "backlog",
    })

    expect(removeLabel).not.toHaveBeenCalled()
    expect(addLabels).toHaveBeenCalledWith({
      owner: "netgoat-xyz",
      repo: "pm",
      issue_number: 1,
      labels: ["status:backlog"],
    })
  })
})
