#!/usr/bin/env node
/**
 * Create the board status:* and agent:* labels on the GitHub repo if missing.
 * Does not delete GitHub's default labels.
 *
 * Uses `gh` when available (preferred). Falls back to GITHUB_TOKEN + GitHub API.
 */
import { spawnSync } from "node:child_process"

const REPO = process.env.GITHUB_BOARD_REPO || "netgoat-xyz/pm"

const LABELS = [
  ["status:backlog", "8b949e", "Board column: Backlog"],
  ["status:in-progress", "1f6feb", "Board column: In progress"],
  ["status:review", "8957e5", "Board column: Review"],
  ["status:done", "238636", "Board column: Done"],
  ["agent:swe", "0ea5e9", "Owner: software engineering agent"],
  ["agent:qa", "f97316", "Owner: QA agent"],
  ["agent:research", "6366f1", "Owner: research agent"],
  ["agent:design", "d946ef", "Owner: design agent"],
]

function run(command, args) {
  return spawnSync(command, args, { encoding: "utf8" })
}

function spawnFailure(result) {
  return (
    [result.error?.message, result.stdout, result.stderr]
      .filter(Boolean)
      .join("\n") || `exit ${result.status}`
  )
}

function ensureWithGh() {
  const probe = run("gh", ["--version"])
  if (probe.error || probe.status !== 0) {
    throw new Error(`gh is unavailable:\n${spawnFailure(probe)}`)
  }

  for (const [name, color, description] of LABELS) {
    const created = run("gh", [
      "label",
      "create",
      name,
      "--repo",
      REPO,
      "--color",
      color,
      "--description",
      description,
    ])
    if (created.status === 0) {
      console.log(`created ${name}`)
      continue
    }
    const combined = spawnFailure(created)
    if (/already exists/i.test(combined)) {
      console.log(`exists ${name}`)
      continue
    }
    throw new Error(`gh label create ${name} failed:\n${combined}`)
  }
}

async function ensureWithToken() {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    throw new Error("GITHUB_TOKEN is not set")
  }

  const apiRepo = REPO.split("/").map(encodeURIComponent).join("/")

  for (const [name, color, description] of LABELS) {
    const response = await fetch(
      `https://api.github.com/repos/${apiRepo}/labels`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "netgoat-pm-ensure-labels",
        },
        body: JSON.stringify({ name, color, description }),
      }
    )

    if (response.status === 201) {
      console.log(`created ${name}`)
      continue
    }

    if (response.status === 422) {
      console.log(`exists ${name}`)
      continue
    }

    throw new Error(
      `GitHub API create label ${name} failed: ${response.status} ${await response.text()}`
    )
  }
}

try {
  ensureWithGh()
} catch (error) {
  const reason = error instanceof Error ? error.message : String(error)
  console.warn(`gh path failed; falling back to GITHUB_TOKEN.\n${reason}`)
  await ensureWithToken()
}
