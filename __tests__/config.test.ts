import { describe, expect, it } from "vitest"

import { parseBoardRepo } from "@/lib/config"

describe("GITHUB_BOARD_REPO", () => {
  it("accepts exactly owner/repo", () => {
    expect(parseBoardRepo("netgoat-xyz/pm")).toEqual({
      owner: "netgoat-xyz",
      repo: "pm",
      fullName: "netgoat-xyz/pm",
    })
  })

  it("rejects extra path segments", () => {
    expect(() => parseBoardRepo("netgoat-xyz/pm/extra")).toThrow(
      /exactly owner\/repo/
    )
  })
})
