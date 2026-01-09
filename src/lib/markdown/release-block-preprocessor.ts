/**
 * Release Block Preprocessor
 *
 * Extracts :::release blocks from markdown content.
 *
 * Syntax:
 * :::release
 * teams: CRM, POS
 * version: 2024.01.15.1
 * ---
 * ### What's New
 * - Feature A
 * - Bug fix B
 * :::
 */

export interface ExtractedRelease {
  teams: string[]
  version: string
  content: string
  rawBlock: string
  startIndex: number
  endIndex: number
}

export interface PreprocessResult {
  processedContent: string
  releases: ExtractedRelease[]
}

/**
 * Validates version format: yyyy.mm.dd.sub
 */
export function isValidVersion(version: string): boolean {
  const versionRegex = /^\d{4}\.\d{2}\.\d{2}\.\d+$/
  return versionRegex.test(version)
}

/**
 * Parses the header section of a release block
 */
function parseReleaseHeader(header: string): { teams: string[]; version: string } | null {
  const lines = header.trim().split('\n')
  let teams: string[] = []
  let version = ''

  for (const line of lines) {
    const teamsMatch = line.match(/^teams:\s*(.+)/i)
    const versionMatch = line.match(/^version:\s*(.+)/i)

    if (teamsMatch) {
      teams = teamsMatch[1]
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
    }

    if (versionMatch) {
      version = versionMatch[1].trim()
    }
  }

  if (teams.length === 0 || !version) {
    return null
  }

  return { teams, version }
}

/**
 * Extracts all :::release blocks from markdown content
 * and replaces them with placeholders for later rendering
 */
export function extractReleaseBlocks(markdown: string): PreprocessResult {
  const releases: ExtractedRelease[] = []

  // Match :::release ... ::: blocks
  // The block format is:
  // :::release
  // teams: ...
  // version: ...
  // ---
  // content
  // :::
  const blockRegex = /:::release\s*\n([\s\S]*?):::/g

  let match
  let processedContent = markdown
  let offset = 0

  while ((match = blockRegex.exec(markdown)) !== null) {
    const fullMatch = match[0]
    const blockContent = match[1]

    // Split by --- separator
    const separatorIndex = blockContent.indexOf('---')

    if (separatorIndex === -1) {
      // No separator found, skip this block
      continue
    }

    const header = blockContent.substring(0, separatorIndex)
    const content = blockContent.substring(separatorIndex + 3).trim()

    const headerData = parseReleaseHeader(header)

    if (!headerData) {
      // Invalid header, skip this block
      continue
    }

    const releaseIndex = releases.length

    releases.push({
      teams: headerData.teams,
      version: headerData.version,
      content,
      rawBlock: fullMatch,
      startIndex: match.index - offset,
      endIndex: match.index + fullMatch.length - offset,
    })

    // Replace with a placeholder that can be detected during rendering
    const placeholder = `<!--RELEASE_BLOCK_${releaseIndex}-->`
    processedContent = processedContent.replace(fullMatch, placeholder)
    offset += fullMatch.length - placeholder.length
  }

  return { processedContent, releases }
}

/**
 * Checks if a string contains any release block placeholders
 */
export function hasReleasePlaceholders(content: string): boolean {
  return /<!--RELEASE_BLOCK_\d+-->/.test(content)
}

/**
 * Gets the index from a release placeholder
 */
export function getReleaseIndex(placeholder: string): number | null {
  const match = placeholder.match(/<!--RELEASE_BLOCK_(\d+)-->/)
  return match ? parseInt(match[1], 10) : null
}

/**
 * Splits content by release placeholders for rendering
 */
export function splitByReleasePlaceholders(content: string): Array<{ type: 'content' | 'release'; value: string | number }> {
  const parts: Array<{ type: 'content' | 'release'; value: string | number }> = []
  const regex = /<!--RELEASE_BLOCK_(\d+)-->/g

  let lastIndex = 0
  let match

  while ((match = regex.exec(content)) !== null) {
    // Add content before the placeholder
    if (match.index > lastIndex) {
      const text = content.substring(lastIndex, match.index)
      if (text.trim()) {
        parts.push({ type: 'content', value: text })
      }
    }

    // Add the release placeholder
    parts.push({ type: 'release', value: parseInt(match[1], 10) })

    lastIndex = match.index + match[0].length
  }

  // Add remaining content after the last placeholder
  if (lastIndex < content.length) {
    const text = content.substring(lastIndex)
    if (text.trim()) {
      parts.push({ type: 'content', value: text })
    }
  }

  return parts
}
