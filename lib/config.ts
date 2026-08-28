export const DEFAULT_GITHUB_ORG = "netgoat-xyz"
export const DEFAULT_BOARD_REPO = "netgoat-xyz/pm"

export function getGithubOrg() {
  return process.env.GITHUB_ORG?.trim() || DEFAULT_GITHUB_ORG
}

export function parseBoardRepo(raw: string) {
  const value = raw.trim()
  const parts = value.split("/")
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error(
      `Invalid GITHUB_BOARD_REPO: ${raw}. Expected exactly owner/repo.`
    )
  }
  const [owner, repo] = parts
  return { owner, repo, fullName: `${owner}/${repo}` }
}

export function getBoardRepo() {
  return parseBoardRepo(process.env.GITHUB_BOARD_REPO?.trim() || DEFAULT_BOARD_REPO)
}
