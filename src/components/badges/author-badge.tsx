import { getAuthorBySlug, getAuthorDocuments, getAuthorBlogPosts } from '@/lib/authors'
import { resolveAuthor } from '@/lib/utils/author-resolver'
import { AuthorHoverCard } from '@/components/cards/author-hover-card'
import { AuthorDisplay } from '@/components/ui/author-display'

interface AuthorBadgeProps {
    authorSlug: string | null
    className?: string
}

export async function AuthorBadge({ authorSlug, className }: AuthorBadgeProps) {
    if (!authorSlug) {
        return null
    }

    // Check if authorSlug is an email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const isEmail = emailRegex.test(authorSlug)

    // If it's an email, resolve directly without looking up Author table
    if (isEmail) {
        const resolvedAuthor = await resolveAuthor(authorSlug)
        return (
            <div className={className}>
                <AuthorDisplay author={resolvedAuthor} />
            </div>
        )
    }

    // First get full author data (which may have an email)
    const authorData = await getAuthorBySlug(authorSlug)
    
    // Use author's email if available (more consistent), otherwise use slug
    const lookupKey = authorData?.email || authorSlug
    
    // Resolve author using email to check if they're a system user
    const resolvedAuthor = await resolveAuthor(lookupKey)
    
    if (!resolvedAuthor) {
        return null
    }

    // If we have full author data, get their content for the hover card
    if (authorData) {
        const [documents, blogPosts] = await Promise.all([
            getAuthorDocuments(authorSlug),
            getAuthorBlogPosts(authorSlug),
        ])
        
        const authorContent = { documents, blogPosts }

        // Merge system user image with author data for hover card
        const mergedAuthorData = {
            ...authorData,
            // Prefer system user's image if available
            avatar: resolvedAuthor.image || authorData.avatar
        }

        return (
            <div className={className}>
                <AuthorHoverCard author={mergedAuthorData} content={authorContent}>
                    <div className="cursor-pointer hover:text-brand-orange transition-colors">
                        <AuthorDisplay author={resolvedAuthor} />
                    </div>
                </AuthorHoverCard>
            </div>
        )
    }

    // Fallback to simple display without hover card
    return (
        <div className={className}>
            <AuthorDisplay author={resolvedAuthor} />
        </div>
    )
}
