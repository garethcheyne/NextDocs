import Link from 'next/link'

interface MentionProps {
  userId: string
  displayName: string
  className?: string
}

/**
 * Component to render user mentions in markdown
 * Format: @[Display Name](user:userId)
 */
export function Mention({ userId, displayName, className = '' }: MentionProps) {
  return (
    <Link
      href={`/users/${userId}`}
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors font-medium no-underline ${className}`}
    >
      <span>@{displayName}</span>
    </Link>
  )
}

/**
 * Parse mention markdown format and convert to rendered mentions
 * Format: @[Display Name](user:userId)
 */
export function parseMentions(content: string): { text: string; mentions: Array<{ userId: string; displayName: string }> } {
  const mentions: Array<{ userId: string; displayName: string }> = []
  const mentionRegex = /@\[([^\]]+)\]\(user:([^)]+)\)/g
  
  let match
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push({
      displayName: match[1],
      userId: match[2],
    })
  }

  return { text: content, mentions }
}

/**
 * Convert mention format to Azure DevOps mention format
 * From: @[Display Name](user:userId)
 * To: <a href="#" data-vss-mention="version:2.0,{userId}">@Display Name</a>
 */
export function mentionsToDevOps(content: string, userEmailMap: Map<string, string>): string {
  return content.replace(
    /@\[([^\]]+)\]\(user:([^)]+)\)/g,
    (match, displayName, userId) => {
      const email = userEmailMap.get(userId)
      if (email) {
        // Azure DevOps uses email in the mention data attribute
        return `<a href="#" data-vss-mention="version:2.0,${email}">@${displayName}</a>`
      }
      // Fallback to plain text if no email found
      return `@${displayName}`
    }
  )
}

/**
 * Convert Azure DevOps mention format to our format
 * From: <a href="#" data-vss-mention="version:2.0,{email}">@Display Name</a>
 * To: @[Display Name](user:userId)
 */
export async function mentionsFromDevOps(htmlContent: string): Promise<string> {
  const mentionRegex = /<a[^>]+data-vss-mention="version:2\.0,([^"]+)"[^>]*>@([^<]+)<\/a>/g
  
  let result = htmlContent
  const matches = [...htmlContent.matchAll(mentionRegex)]
  
  for (const match of matches) {
    const email = match[1]
    const displayName = match[2]
    
    // Look up user by email to get userId
    try {
      const response = await fetch(`/api/users/by-email?email=${encodeURIComponent(email)}`)
      if (response.ok) {
        const { user } = await response.json()
        if (user) {
          result = result.replace(match[0], `@[${displayName}](user:${user.id})`)
          continue
        }
      }
    } catch (error) {
      console.error('Failed to lookup user for mention:', error)
    }
    
    // Fallback to plain text
    result = result.replace(match[0], `@${displayName}`)
  }
  
  return result
}

/**
 * Extract all mentioned user IDs from content
 */
export function extractMentionedUserIds(content: string): string[] {
  const mentionRegex = /@\[([^\]]+)\]\(user:([^)]+)\)/g
  const userIds: string[] = []
  
  let match
  while ((match = mentionRegex.exec(content)) !== null) {
    userIds.push(match[2])
  }
  
  return userIds
}
