export const DEFAULT_GITHUB_ORG = "netgoat-xyz"
export const DEFAULT_BOARD_REPO = "netgoat-xyz/pm"

export function getGithubOrg() {
  return process.env.GITHUB_ORG?.trim() || DEFAULT_GITHUB_ORG
}

export function getBoardRepo() {
  const raw = process.env.GITHUB_BOARD_REPO?.trim() || DEFAULT_BOARD_REPO
  const [owner, repo] = raw.split("/")
  if (!owner || !repo) {
    throw new Error(`Invalid GITHUB_BOARD_REPO: ${raw}`)
  }
  return { owner, repo, fullName: `${owner}/${repo}` }
}
