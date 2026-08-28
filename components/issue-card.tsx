"use client"

import { useDraggable, useDroppable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { GripVerticalIcon, InboxIcon } from "lucide-react"

import type { BoardIssue } from "@/lib/github"
import {
  COLUMNS,
  COLUMN_TITLES,
  type ColumnId,
} from "@/lib/labels"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { cn } from "@/lib/utils"

function displayLabels(issue: BoardIssue) {
  return issue.labels.filter((label) => !label.name.startsWith("status:"))
}

function initials(login: string) {
  return login.slice(0, 2).toUpperCase()
}

export function IssueCard({
  issue,
  onMove,
  overlay = false,
}: {
  issue: BoardIssue
  onMove?: (column: ColumnId) => void
  overlay?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: String(issue.number),
      data: { issue },
      disabled: overlay || !onMove,
    })

  const labels = displayLabels(issue)
  const assignee = issue.assignees[0]

  return (
    <article
      ref={overlay ? undefined : setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        "rounded-lg border border-border bg-card p-3 text-card-foreground shadow-sm",
        isDragging && "opacity-40",
        overlay && "shadow-lg"
      )}
    >
      <div className="flex items-start gap-2">
        {!overlay && onMove ? (
          <button
            type="button"
            className="mt-0.5 cursor-grab touch-none text-muted-foreground hover:text-foreground"
            aria-label={`Drag issue #${issue.number}`}
            {...listeners}
            {...attributes}
          >
            <GripVerticalIcon className="size-4" />
          </button>
        ) : null}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <a
              href={issue.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              #{issue.number}
            </a>
            {onMove && !overlay ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex h-6 items-center rounded-md px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
                  Move
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {COLUMNS.map((column) => (
                    <DropdownMenuItem
                      key={column}
                      onClick={() => onMove(column)}
                    >
                      {COLUMN_TITLES[column]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
          <h3 className="text-sm font-medium leading-snug text-foreground">
            {issue.title}
          </h3>
          {labels.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {labels.map((label) => (
                <Badge key={label.name} variant="outline">
                  {label.name}
                </Badge>
              ))}
            </div>
          ) : null}
          {assignee ? (
            <div className="flex items-center gap-2">
              <Avatar size="sm">
                <AvatarImage src={assignee.avatarUrl} alt={assignee.login} />
                <AvatarFallback>{initials(assignee.login)}</AvatarFallback>
              </Avatar>
              <span className="truncate text-xs text-muted-foreground">
                {assignee.login}
              </span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Unassigned</p>
          )}
        </div>
      </div>
    </article>
  )
}

export function BoardColumn({
  column,
  issues,
  onMove,
}: {
  column: ColumnId
  issues: BoardIssue[]
  onMove: (issueNumber: number, column: ColumnId) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column })

  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex min-h-[24rem] min-w-[18rem] flex-1 flex-col rounded-xl border border-border bg-muted/30",
        isOver && "ring-2 ring-ring"
      )}
    >
      <header className="flex items-center justify-between px-3 py-2">
        <h2 className="text-sm font-medium text-foreground">
          {COLUMN_TITLES[column]}
        </h2>
        <Badge variant="secondary">{issues.length}</Badge>
      </header>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
        {issues.length === 0 ? (
          <Empty className="min-h-[12rem] border border-dashed border-border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <InboxIcon />
              </EmptyMedia>
              <EmptyTitle>No issues</EmptyTitle>
              <EmptyDescription>
                Drag a card here or use Move to set status:{column}.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          issues.map((issue) => (
            <IssueCard
              key={issue.number}
              issue={issue}
              onMove={(dest) => onMove(issue.number, dest)}
            />
          ))
        )}
      </div>
    </section>
  )
}
