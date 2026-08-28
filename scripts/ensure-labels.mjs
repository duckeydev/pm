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
  const result = spawnSync(command, args, { encoding: "utf8" })
  return result
}

function ensureWithGh() {
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
    const combined = `${created.stdout ?? ""}${created.stderr ?? ""}`
    if (/already exists/i.test(combined)) {
      console.log(`exists ${name}`)
      continue
    }
    throw new Error(`gh label create ${name} failed:\n${combined}`)
  }
}

ensureWithGh()
