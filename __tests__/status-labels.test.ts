import { describe, expect, it } from "vitest"

import {
  columnForIssue,
  hasExactlyOneStatusLabel,
  normalizeStatusLabels,
  parseStatusLabel,
  STATUS_LABELS,
  statusLabelsOnIssue,
} from "@/lib/labels"

describe("a card in one column has exactly one status:* label", () => {
  it("maps each status:* label to a single column", () => {
    expect(parseStatusLabel("status:backlog")).toBe("backlog")
    expect(parseStatusLabel("status:in-progress")).toBe("in-progress")
    expect(parseStatusLabel("status:review")).toBe("review")
    expect(parseStatusLabel("status:done")).toBe("done")
    expect(parseStatusLabel("agent:swe")).toBeNull()
  })

  it("treats a missing status:* label as Backlog for display", () => {
    expect(columnForIssue(["agent:swe", "bug"])).toBe("backlog")
    expect(statusLabelsOnIssue(["agent:swe", "bug"])).toEqual([])
  })

  it("normalizes missing or extra status:* labels to exactly one", () => {
    const unlabeled = normalizeStatusLabels(["agent:qa", "bug"])
    expect(statusLabelsOnIssue(unlabeled)).toEqual([STATUS_LABELS.backlog])
    expect(hasExactlyOneStatusLabel(unlabeled)).toBe(true)
    expect(unlabeled).toContain("agent:qa")
    expect(unlabeled).toContain("bug")

    const doubled = normalizeStatusLabels([
      "status:backlog",
      "status:done",
      "agent:swe",
    ])
    expect(statusLabelsOnIssue(doubled)).toEqual([STATUS_LABELS.backlog])
    expect(hasExactlyOneStatusLabel(doubled)).toBe(true)
    expect(doubled).toContain("agent:swe")
    expect(doubled.filter((name) => name.startsWith("status:")).length).toBe(1)
  })

  it("keeps a well-formed card at exactly one status:* label", () => {
    const labels = ["status:review", "agent:research"]
    expect(hasExactlyOneStatusLabel(labels)).toBe(true)
    expect(columnForIssue(labels)).toBe("review")
    expect(normalizeStatusLabels(labels)).toEqual([
      "agent:research",
      "status:review",
    ])
  })
})
