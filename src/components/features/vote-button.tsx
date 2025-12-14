'use client'

import { useState, useTransition } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ArrowBigUp, ArrowBigDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type VoteType = 'upvote' | 'downvote' | null

interface VoteButtonProps {
    featureId: string
    initialVote: VoteType
    initialUpvotes: number
    initialDownvotes: number
    compact?: boolean
}

export function VoteButton({ featureId, initialVote, initialUpvotes, initialDownvotes, compact = false }: VoteButtonProps) {
    const { data: session } = useSession()
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const [userVote, setUserVote] = useState<VoteType>(initialVote)
    const [upvotes, setUpvotes] = useState(initialUpvotes)
    const [downvotes, setDownvotes] = useState(initialDownvotes)
    const [error, setError] = useState<string | null>(null)

    const handleVote = async (voteType: VoteType) => {
        if (!session?.user) {
            router.push('/login')
            return
        }

        setError(null)

        // Optimistic update
        const previousVote = userVote
        const previousUpvotes = upvotes
        const previousDownvotes = downvotes

        // Calculate new counts
        let newUpvotes = upvotes
        let newDownvotes = downvotes

        if (previousVote === 'upvote') {
            newUpvotes--
        } else if (previousVote === 'downvote') {
            newDownvotes--
        }

        if (voteType === 'upvote' && previousVote !== 'upvote') {
            newUpvotes++
            setUserVote('upvote')
        } else if (voteType === 'downvote' && previousVote !== 'downvote') {
            newDownvotes++
            setUserVote('downvote')
        } else {
            setUserVote(null)
        }

        setUpvotes(newUpvotes)
        setDownvotes(newDownvotes)

        // Submit to API
        try {
            const numericVoteType = voteType === 'upvote' ? 1 : voteType === 'downvote' ? -1 : null

            const response = await fetch(`/api/features/${featureId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ voteType: numericVoteType }),
            })

            if (!response.ok) {
                throw new Error('Failed to submit vote')
            }

            const data = await response.json()

            // Update with actual counts from server
            if (data.counts) {
                setUpvotes(data.counts.upvotes)
                setDownvotes(data.counts.downvotes)
            }

            // Revalidate to ensure consistency
            startTransition(() => {
                router.refresh()
            })
        } catch (err) {
            // Revert optimistic update on error
            setUserVote(previousVote)
            setUpvotes(previousUpvotes)
            setDownvotes(previousDownvotes)
            setError(err instanceof Error ? err.message : 'Failed to submit vote')
            console.error('Vote error:', err)
        }
    }

    const score = upvotes - downvotes
    const scoreColor = score > 0 ? 'text-green-500' : score < 0 ? 'text-red-500' : 'text-muted-foreground'

    return (
        <div className={compact ? "flex flex-col items-center gap-1" : "w-full max-w-xs lg:max-w-none"}>
            {/* Compact Layout for Feature Cards */}
            {compact && (
                <>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote('upvote')}
                        disabled={isPending}
                        className={cn(
                            'h-6 w-8 p-0 transition-all',
                            userVote === 'upvote'
                                ? 'text-green-600 bg-green-100 dark:bg-green-900/30'
                                : 'hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20'
                        )}
                    >
                        <ArrowBigUp className={cn('w-4 h-4', userVote === 'upvote' && 'fill-current')} />
                    </Button>

                    <div className="text-center py-1">
                        <div className={cn('text-lg font-bold leading-none', scoreColor)}>
                            {score}
                        </div>
                        <div className="text-xs text-muted-foreground leading-none mt-0.5">
                            Score
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote('downvote')}
                        disabled={isPending}
                        className={cn(
                            'h-6 w-8 p-0 transition-all',
                            userVote === 'downvote'
                                ? 'text-red-600 bg-red-100 dark:bg-red-900/30'
                                : 'hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20'
                        )}
                    >
                        <ArrowBigDown className={cn('w-4 h-4', userVote === 'downvote' && 'fill-current')} />
                    </Button>

                    {error && (
                        <p className="text-xs text-red-600 dark:text-red-400 text-center mt-1">{error}</p>
                    )}
                </>
            )}

            {/* Mobile Layout (< lg) - Only show if not compact */}
            {!compact && (
                <div className="lg:hidden">
                    <div className="flex items-center justify-center gap-4 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-transparent">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVote('upvote')}
                            disabled={isPending}
                            className={cn(
                                'flex items-center gap-1 px-3 py-2 transition-all',
                                userVote === 'upvote'
                                    ? 'bg-green-500/20 text-green-600 border-green-500 shadow-sm'
                                    : 'hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/30'
                            )}
                            title="I like this feature idea"
                        >
                            <ArrowBigUp className={cn('w-4 h-4', userVote === 'upvote' && 'fill-current')} />
                            <span className="font-bold">{upvotes}</span>
                        </Button>

                        <div className="text-center px-2">
                            <div className={cn('text-2xl font-bold', scoreColor)}>
                                {score > 0 ? '+' : ''}{score}
                            </div>
                            <p className="text-xs text-muted-foreground">Score</p>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVote('downvote')}
                            disabled={isPending}
                            className={cn(
                                'flex items-center gap-1 px-3 py-2 transition-all',
                                userVote === 'downvote'
                                    ? 'bg-red-500/20 text-red-600 border-red-500 shadow-sm'
                                    : 'hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
                            )}
                            title="I don't think this is needed"
                        >
                            <ArrowBigDown className={cn('w-4 h-4', userVote === 'downvote' && 'fill-current')} />
                            <span className="font-bold">{downvotes}</span>
                        </Button>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 dark:text-red-400 text-center mt-2">{error}</p>
                    )}
                </div>
            )}

            {/* Desktop Layout (>= lg) - Only show if not compact */}
            {!compact && (
                <div className="hidden lg:flex flex-col items-center gap-4 p-4 rounded-lg border-2 bg-gradient-to-br from-primary/5 to-transparent">
                    {/* Score Display */}
                    <div className="text-center">
                        <div className={cn('text-4xl font-bold mb-1', scoreColor)}>
                            {score > 0 ? '+' : ''}{score}
                        </div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Community Score
                        </p>
                    </div>

                    {/* Vote Buttons */}
                    <div className="flex gap-3 w-full">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => handleVote('upvote')}
                            disabled={isPending}
                            className={cn(
                                'flex-1 h-14 gap-2 font-semibold text-base transition-all',
                                userVote === 'upvote'
                                    ? 'bg-green-500/20 text-green-600 border-green-500 dark:bg-green-900/50 dark:text-green-400 dark:border-green-400 shadow-lg shadow-green-500/20'
                                    : 'border-2 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950/30'
                            )}
                            title="I like this feature idea"
                        >
                            <ArrowBigUp className={cn('w-5 h-5', userVote === 'upvote' && 'fill-current')} />
                            <span className="text-lg font-bold">{upvotes}</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => handleVote('downvote')}
                            disabled={isPending}
                            className={cn(
                                'flex-1 h-14 gap-2 font-semibold text-base transition-all',
                                userVote === 'downvote'
                                    ? 'bg-red-500/20 text-red-600 border-red-500 dark:bg-red-900/50 dark:text-red-400 dark:border-red-400 shadow-lg shadow-red-500/20'
                                    : 'border-2 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
                            )}
                            title="I don't think this is needed"
                        >
                            <ArrowBigDown className={cn('w-5 h-5', userVote === 'downvote' && 'fill-current')} />
                            <span className="text-lg font-bold">{downvotes}</span>
                        </Button>
                    </div>

                    {/* Vote Details */}
                    <div className="text-xs text-muted-foreground text-center">
                        {userVote === 'upvote' && '✓ You support this'}
                        {userVote === 'downvote' && '✓ You don\'t support this'}
                        {!userVote && 'Cast your vote'}
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
                    )}
                </div>
            )}
        </div>
    )
}
