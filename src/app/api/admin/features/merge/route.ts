import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    if (!session.user.role || !['admin', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { parentId, childId, mergedDescription } = body

    if (!parentId || !childId || !mergedDescription) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Fetch both features
    const [parentFeature, childFeature] = await Promise.all([
      prisma.featureRequest.findUnique({
        where: { id: parentId },
        include: { category: true }
      }),
      prisma.featureRequest.findUnique({
        where: { id: childId },
        include: { 
          comments: true,
          votes: true,
          category: true
        }
      })
    ])

    if (!parentFeature || !childFeature) {
      return NextResponse.json({ error: 'One or both features not found' }, { status: 404 })
    }

    // Validate merge rules
    const parentHasExternal = !!parentFeature.externalId
    const childHasExternal = !!childFeature.externalId

    if (parentHasExternal && childHasExternal) {
      return NextResponse.json({ 
        error: 'Cannot merge two features that are both linked to external systems' 
      }, { status: 400 })
    }

    // If child has external link but parent doesn't, swap them
    if (childHasExternal && !parentHasExternal) {
      return NextResponse.json({ 
        error: 'The feature with external link must be the parent' 
      }, { status: 400 })
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Move all comments from child to parent
      await tx.featureComment.updateMany({
        where: { featureId: childId },
        data: { featureId: parentId }
      })

      // Move votes from child to parent (handle duplicates)
      const childVotes = await tx.featureVote.findMany({
        where: { featureId: childId }
      })

      for (const vote of childVotes) {
        // Check if user already voted on parent
        const existingVote = await tx.featureVote.findUnique({
          where: {
            featureId_userId: {
              featureId: parentId,
              userId: vote.userId
            }
          }
        })

        if (existingVote) {
          // Update existing vote with the most recent one
          await tx.featureVote.update({
            where: {
              featureId_userId: {
                featureId: parentId,
                userId: vote.userId
              }
            },
            data: {
              voteType: vote.voteType,
              updatedAt: new Date()
            }
          })
          
          // Delete the child vote
          await tx.featureVote.delete({
            where: { id: vote.id }
          })
        } else {
          // Move vote to parent
          await tx.featureVote.update({
            where: { id: vote.id },
            data: { featureId: parentId }
          })
        }
      }

      // Update parent feature with merged description and updated counts
      const updatedParent = await tx.featureRequest.update({
        where: { id: parentId },
        data: {
          description: mergedDescription,
          lastActivityAt: new Date(),
          // Update vote count
          voteCount: {
            increment: childFeature.voteCount
          },
          // Update comment count  
          commentCount: {
            increment: childFeature.commentCount
          }
        }
      })

      // Mark child feature as merged
      await tx.featureRequest.update({
        where: { id: childId },
        data: {
          status: 'merged',
          mergedIntoId: parentId,
          lastActivityAt: new Date(),
          commentsLocked: true
        }
      })

      // Add merge record to parent's merge history
      await tx.featureMerge.create({
        data: {
          parentId: parentId,
          childId: childId,
          mergedBy: session.user.id!,
          mergedAt: new Date(),
          originalDescription: childFeature.description,
          mergedDescription: mergedDescription
        }
      })

      // Add internal note about the merge
      await tx.featureInternalNote.create({
        data: {
          featureId: parentId,
          content: `Feature merged with "${childFeature.title}" (${childFeature.slug}). All comments and votes have been transferred.`,
          createdBy: session.user.id!
        }
      })

      return updatedParent
    })

    return NextResponse.json({ 
      success: true, 
      parentFeature: result,
      message: 'Features merged successfully' 
    })

  } catch (error) {
    console.error('Error merging features:', error)
    return NextResponse.json(
      { error: 'Failed to merge features' },
      { status: 500 }
    )
  }
}