"use client"

import { useMemo, useState, useTransition } from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { toast } from "sonner"

import type { BoardIssue } from "@/lib/github"
import { groupIssuesByColumn } from "@/lib/issues"
import { COLUMNS, COLUMN_TITLES, isColumnId, type ColumnId } from "@/lib/labels"
import { BoardColumn, IssueCard } from "@/components/issue-card"

async function requestMove(issueNumber: number, column: ColumnId) {
  const response = await fetch(`/api/issues/${issueNumber}/move`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ column }),
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: string }
      | null
    throw new Error(payload?.error || "GitHub did not accept the label swap")
  }
}

export function Board({ initialIssues }: { initialIssues: BoardIssue[] }) {
  const [issues, setIssues] = useState(initialIssues)
  const [activeNumber, setActiveNumber] = useState<number | null>(null)
  const [, startTransition] = useTransition()

  const grouped = useMemo(() => groupIssuesByColumn(issues), [issues])
  const activeIssue = issues.find((issue) => issue.number === activeNumber) ?? null

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  )

  function applyColumn(issueNumber: number, column: ColumnId) {
    const statusName = `status:${column}`
    setIssues((current) =>
      current.map((issue) =>
        issue.number === issueNumber
          ? {
              ...issue,
              statusLabels: [statusName],
              labels: [
                ...issue.labels.filter((label) => !label.name.startsWith("status:")),
                { name: statusName },
              ],
            }
          : issue
      )
    )
  }

  function moveIssue(issueNumber: number, column: ColumnId) {
    const snapshot = issues.find((issue) => issue.number === issueNumber)
    if (!snapshot) return
    applyColumn(issueNumber, column)
    startTransition(async () => {
      try {
        await requestMove(issueNumber, column)
        toast.success(`Moved #${issueNumber} to ${COLUMN_TITLES[column]}`)
      } catch (error) {
        setIssues((current) =>
          current.map((issue) =>
            issue.number === issueNumber ? snapshot : issue
          )
        )
        toast.error(
          error instanceof Error ? error.message : "Could not move issue"
        )
      }
    })
  }

  function onDragStart(event: DragStartEvent) {
    const id = Number(event.active.id)
    if (Number.isFinite(id)) setActiveNumber(id)
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveNumber(null)
    const dest = event.over?.id
    if (typeof dest !== "string" || !isColumnId(dest)) return
    const issueNumber = Number(event.active.id)
    if (!Number.isFinite(issueNumber)) return
    const current = issues.find((issue) => issue.number === issueNumber)
    if (!current) return
    const alreadyInDest = grouped[dest].some(
      (issue) => issue.number === issueNumber
    )
    if (alreadyInDest && current.statusLabels.length === 1) {
      return
    }
    moveIssue(issueNumber, dest)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragCancel={() => setActiveNumber(null)}
      onDragEnd={onDragEnd}
    >
      <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto p-4">
        {COLUMNS.map((column) => (
          <BoardColumn
            key={column}
            column={column}
            issues={grouped[column]}
            onMove={moveIssue}
          />
        ))}
      </div>
      <DragOverlay>
        {activeIssue ? <IssueCard issue={activeIssue} overlay /> : null}
      </DragOverlay>
    </DndContext>
  )
}
