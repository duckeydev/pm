import { describe, expect, it, vi } from "vitest"

import type { GithubRestClient } from "@/lib/github"
import { assertOrgMember, isOrgMember, OrgAccessError } from "@/lib/org"

function membershipClient(
  impl: GithubRestClient["rest"]["orgs"]["getMembershipForAuthenticatedUser"]
): GithubRestClient {
  return {
    rest: {
      issues: {
        get: vi.fn(),
        removeLabel: vi.fn(),
        addLabels: vi.fn(),
      },
      orgs: {
        getMembershipForAuthenticatedUser: impl,
      },
    },
  }
}

describe("org auth gates the board", () => {
  it("rejects a non-member (404 from GitHub membership API)", async () => {
    const octokit = membershipClient(
      vi.fn().mockRejectedValue(Object.assign(new Error("Not Found"), { status: 404 }))
    )

    await expect(assertOrgMember(octokit, "netgoat-xyz")).rejects.toBeInstanceOf(
      OrgAccessError
    )
    await expect(isOrgMember(octokit, "netgoat-xyz")).resolves.toBe(false)
  })

  it("rejects a GitHub user who is not an active member", async () => {
    const octokit = membershipClient(
      vi.fn().mockResolvedValue({ data: { state: "pending" } })
    )

    await expect(assertOrgMember(octokit, "netgoat-xyz")).rejects.toBeInstanceOf(
      OrgAccessError
    )
    await expect(isOrgMember(octokit, "netgoat-xyz")).resolves.toBe(false)
  })

  it("allows an active org member", async () => {
    const getMembership = vi
      .fn()
      .mockResolvedValue({ data: { state: "active" } })
    const octokit = membershipClient(getMembership)

    await expect(assertOrgMember(octokit, "netgoat-xyz")).resolves.toBeUndefined()
    await expect(isOrgMember(octokit, "netgoat-xyz")).resolves.toBe(true)
    expect(getMembership).toHaveBeenCalledWith({ org: "netgoat-xyz" })
  })
})
