import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'

interface AreaPathNode {
  id: string
  name: string
  path: string
  hasChildren: boolean
  children?: AreaPathNode[]
}

/**
 * Recursively flatten area path tree into list of paths
 */
function flattenAreaPaths(node: AreaPathNode, paths: string[] = []): string[] {
  paths.push(node.path)
  if (node.children && node.children.length > 0) {
    node.children.forEach(child => flattenAreaPaths(child, paths))
  }
  return paths
}

/**
 * GET /api/admin/devops/area-paths
 * Fetch valid area paths from Azure DevOps project
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const project = searchParams.get('project')

    if (!project) {
      return NextResponse.json({ error: 'Project parameter is required' }, { status: 400 })
    }

    const orgUrl = process.env.DEVOPS_ORG_URL
    const clientId = process.env.DEVOPS_CLIENT_ID
    const clientSecret = process.env.DEVOPS_CLIENT_SECRET
    const tenantId = process.env.DEVOPS_TENANT_ID

    if (!orgUrl || !clientId || !clientSecret || !tenantId) {
      return NextResponse.json(
        { error: 'Azure DevOps OAuth not configured' },
        { status: 500 }
      )
    }

    // Get OAuth access token
    const tokenResponse = await fetch(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          scope: '499b84ac-1321-427f-aa17-267ca6975798/.default',
          grant_type: 'client_credentials',
        }),
      }
    )

    if (!tokenResponse.ok) {
      console.error('Failed to get OAuth token:', await tokenResponse.text())
      return NextResponse.json(
        { error: 'Failed to authenticate with Azure DevOps' },
        { status: 500 }
      )
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Fetch area paths from Azure DevOps
    const areaPathsUrl = `${orgUrl}/${encodeURIComponent(project)}/_apis/wit/classificationnodes/areas?$depth=10&api-version=7.1`
    
    const response = await fetch(areaPathsUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Azure DevOps API error:', errorText)
      return NextResponse.json(
        { error: 'Failed to fetch area paths from Azure DevOps' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Flatten the tree structure into a list of paths
    const areaPaths = flattenAreaPaths(data)

    return NextResponse.json({
      success: true,
      areaPaths: areaPaths.sort(),
    })
  } catch (error) {
    console.error('Error fetching area paths:', error)
    return NextResponse.json(
      { error: 'Failed to fetch area paths' },
      { status: 500 }
    )
  }
}
