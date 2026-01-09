import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import { ReleasesClient } from '@/components/releases/releases-client'
import { ContentDetailLayout } from '@/components/layout/content-detail-layout'

export default async function ReleasesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const session = await auth()

  if (!session) {
    redirect('/login?callbackUrl=/releases')
  }

  const params = await searchParams

  // Fetch user's teams
  const userTeams = await prisma.userTeamMembership.findMany({
    where: { userId: session.user.id },
    select: { teamId: true },
  })

  const userTeamIds = userTeams.map(tm => tm.teamId)

  // Build where conditions
  const whereConditions: any = {}
  
  // Filter by user's teams if they have any
  if (userTeamIds.length > 0) {
    whereConditions.teams = {
      some: {
        id: { in: userTeamIds }
      }
    }
  }

  // Filter by category if provided
  if (params.category) {
    whereConditions.categoryId = params.category
  }

  // Fetch releases
  const releases = await prisma.release.findMany({
    where: whereConditions,
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
          iconBase64: true,
        }
      },
      teams: {
        select: {
          id: true,
          name: true,
          slug: true,
          color: true,
        }
      },
      featureRequests: {
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
        }
      }
    },
    orderBy: { publishedAt: 'desc' },
    take: 50,
  })

  // Fetch categories
  const categories = await prisma.featureCategory.findMany({
    where: { enabled: true },
    select: {
      id: true,
      name: true,
      slug: true,
      color: true,
      iconBase64: true,
    },
    orderBy: { order: 'asc' },
  })

  return (
    <ContentDetailLayout
      user={session.user}
      currentPath="/releases"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Release Notes', href: '/releases' },
      ]}
      showTOC={false}
      noPadding={true}
    >
      <ReleasesClient
        releases={releases}
        categories={categories}
        userTeamCount={userTeamIds.length}
        params={params}
      />
    </ContentDetailLayout>
  )
}
