export const COLUMNS = ["backlog", "in-progress", "review", "done"] as const

export type ColumnId = (typeof COLUMNS)[number]

export const COLUMN_TITLES: Record<ColumnId, string> = {
  backlog: "Backlog",
  "in-progress": "In progress",
  review: "Review",
  done: "Done",
}

export const STATUS_LABELS = {
  backlog: "status:backlog",
  "in-progress": "status:in-progress",
  review: "status:review",
  done: "status:done",
} as const satisfies Record<ColumnId, `status:${string}`>

export type StatusLabel = (typeof STATUS_LABELS)[ColumnId]

export const OWNER_LABELS = [
  "agent:swe",
  "agent:qa",
  "agent:research",
  "agent:design",
] as const

export const BOARD_LABELS = [
  {
    name: STATUS_LABELS.backlog,
    color: "8b949e",
    description: "Board column: Backlog",
  },
  {
    name: STATUS_LABELS["in-progress"],
    color: "1f6feb",
    description: "Board column: In progress",
  },
  {
    name: STATUS_LABELS.review,
    color: "8957e5",
    description: "Board column: Review",
  },
  {
    name: STATUS_LABELS.done,
    color: "238636",
    description: "Board column: Done",
  },
  {
    name: "agent:swe",
    color: "0ea5e9",
    description: "Owner: software engineering agent",
  },
  {
    name: "agent:qa",
    color: "f97316",
    description: "Owner: QA agent",
  },
  {
    name: "agent:research",
    color: "6366f1",
    description: "Owner: research agent",
  },
  {
    name: "agent:design",
    color: "d946ef",
    description: "Owner: design agent",
  },
] as const

export type GithubLabelLike = string | { name?: string | null }

export function isColumnId(value: string): value is ColumnId {
  return (COLUMNS as readonly string[]).includes(value)
}

export function isStatusLabel(name: string): name is StatusLabel {
  return name.startsWith("status:")
}

export function labelNames(labels: readonly GithubLabelLike[]): string[] {
  return labels
    .map((label) => (typeof label === "string" ? label : label.name ?? ""))
    .filter((name): name is string => name.length > 0)
}

export function statusLabelsOnIssue(labels: readonly GithubLabelLike[]): string[] {
  return labelNames(labels).filter(isStatusLabel)
}

export function parseStatusLabel(name: string): ColumnId | null {
  for (const column of COLUMNS) {
    if (STATUS_LABELS[column] === name) return column
  }
  return null
}

/** Display mapping: issues with no status:* label belong in Backlog. */
export function columnForIssue(labels: readonly GithubLabelLike[]): ColumnId {
  const statuses = statusLabelsOnIssue(labels)
  if (statuses.length === 0) return "backlog"
  return parseStatusLabel(statuses[0]!) ?? "backlog"
}

/**
 * Collapse status:* labels to exactly one. Missing status maps to
 * status:backlog. Non-status labels are preserved in order.
 */
export function normalizeStatusLabels(labels: readonly string[]): string[] {
  const nonStatus = labels.filter((name) => !isStatusLabel(name))
  const statuses = labels.filter(isStatusLabel)
  const column =
    statuses.length === 0
      ? "backlog"
      : (parseStatusLabel(statuses[0]!) ?? "backlog")
  return [...nonStatus, STATUS_LABELS[column]]
}

export function hasExactlyOneStatusLabel(labels: readonly string[]): boolean {
  return statusLabelsOnIssue(labels).length === 1
}

/** Plan the GitHub label writes for a column move. */
export function planStatusMove(
  currentLabels: readonly GithubLabelLike[],
  destColumn: ColumnId
) {
  const destLabel: StatusLabel = STATUS_LABELS[destColumn]
  const toRemove = statusLabelsOnIssue(currentLabels)
  return {
    toRemove,
    toAdd: destLabel,
    nonStatus: labelNames(currentLabels).filter((name) => !isStatusLabel(name)),
  }
}
