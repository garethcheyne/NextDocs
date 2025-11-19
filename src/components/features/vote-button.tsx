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
}

export function VoteButton({ featureId, initialVote, initialUpvotes, initialDownvotes }: VoteButtonProps) {
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

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVote('upvote')}
                    disabled={isPending}
                    className={cn(
                        'gap-1.5',
                        userVote === 'upvote' && 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700'
                    )}
                >
                    <ArrowBigUp className={cn('w-4 h-4', userVote === 'upvote' && 'fill-current')} />
                    {upvotes}
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVote('downvote')}
                    disabled={isPending}
                    className={cn(
                        'gap-1.5',
                        userVote === 'downvote' && 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700'
                    )}
                >
                    <ArrowBigDown className={cn('w-4 h-4', userVote === 'downvote' && 'fill-current')} />
                    {downvotes}
                </Button>
            </div>
            {error && (
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
        </div>
    )
}
