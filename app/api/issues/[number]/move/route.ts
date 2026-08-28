import { NextResponse } from "next/server"

import { AuthRequiredError, OrgAccessError, requireBoardAccess } from "@/lib/access"
import { getBoardRepo } from "@/lib/config"
import { isColumnId, moveIssueStatus } from "@/lib/issues"

export const runtime = "nodejs"

export async function POST(
  request: Request,
  context: { params: Promise<{ number: string }> }
) {
  try {
    const { octokit } = await requireBoardAccess()
    const { number } = await context.params
    const issueNumber = Number(number)

    if (!Number.isInteger(issueNumber) || issueNumber < 1) {
      return NextResponse.json({ error: "Invalid issue number" }, { status: 400 })
    }

    const body = (await request.json()) as { column?: string }
    if (!body.column || !isColumnId(body.column)) {
      return NextResponse.json({ error: "Invalid column" }, { status: 400 })
    }

    const repo = getBoardRepo()
    const result = await moveIssueStatus(octokit, {
      owner: repo.owner,
      repo: repo.repo,
      issueNumber,
      destColumn: body.column,
    })

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (error instanceof OrgAccessError) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    const status =
      typeof error === "object" && error && "status" in error
        ? Number((error as { status?: number }).status)
        : undefined

    console.error("Failed to move issue", error)
    return NextResponse.json(
      { error: "Failed to update GitHub issue labels" },
      { status: status && status >= 400 && status < 600 ? status : 500 }
    )
  }
}
