import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

// GET /api/admin/categories/[id]/custom-fields - Get available custom fields for work item type
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()

        if (!session?.user?.role || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await context.params
        const { searchParams } = new URL(request.url)
        const workItemType = searchParams.get('workItemType') || 'User Story'

        // Get category to check integration type
        const category = await prisma.featureCategory.findUnique({
            where: { id },
            select: {
                integrationType: true,
                devopsOrg: true,
                devopsProject: true,
            },
        })

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 })
        }

        // Only Azure DevOps supports custom fields via API
        if (category.integrationType !== 'azure-devops') {
            return NextResponse.json({ fields: [] })
        }

        // Define common Azure DevOps custom fields
        // In a production environment, you would fetch these from Azure DevOps API
        const customFieldsByType: Record<string, any[]> = {
            'User Story': [
                {
                    name: 'System.AcceptanceCriteria',
                    label: 'Acceptance Criteria',
                    type: 'multiline',
                    required: false,
                },
                {
                    name: 'Microsoft.VSTS.Common.Priority',
                    label: 'Priority',
                    type: 'select',
                    options: ['1', '2', '3', '4'],
                    defaultValue: '2',
                    required: false,
                },
                {
                    name: 'Microsoft.VSTS.Common.ValueArea',
                    label: 'Value Area',
                    type: 'select',
                    options: ['Architectural', 'Business'],
                    defaultValue: 'Business',
                    required: false,
                },
                {
                    name: 'Microsoft.VSTS.Scheduling.StoryPoints',
                    label: 'Story Points',
                    type: 'number',
                    required: false,
                },
            ],
            'Bug': [
                {
                    name: 'Microsoft.VSTS.TCM.ReproSteps',
                    label: 'Repro Steps',
                    type: 'multiline',
                    required: false,
                },
                {
                    name: 'Microsoft.VSTS.Common.Severity',
                    label: 'Severity',
                    type: 'select',
                    options: ['1 - Critical', '2 - High', '3 - Medium', '4 - Low'],
                    defaultValue: '3 - Medium',
                    required: false,
                },
                {
                    name: 'Microsoft.VSTS.Common.Priority',
                    label: 'Priority',
                    type: 'select',
                    options: ['1', '2', '3', '4'],
                    defaultValue: '2',
                    required: false,
                },
            ],
            'Feature': [
                {
                    name: 'Microsoft.VSTS.Common.BusinessValue',
                    label: 'Business Value',
                    type: 'number',
                    required: false,
                },
                {
                    name: 'Microsoft.VSTS.Common.ValueArea',
                    label: 'Value Area',
                    type: 'select',
                    options: ['Architectural', 'Business'],
                    defaultValue: 'Business',
                    required: false,
                },
                {
                    name: 'Microsoft.VSTS.Scheduling.TargetDate',
                    label: 'Target Date',
                    type: 'date',
                    required: false,
                },
            ],
            'Task': [
                {
                    name: 'Microsoft.VSTS.Common.Activity',
                    label: 'Activity',
                    type: 'select',
                    options: ['Deployment', 'Design', 'Development', 'Documentation', 'Requirements', 'Testing'],
                    required: false,
                },
                {
                    name: 'Microsoft.VSTS.Scheduling.RemainingWork',
                    label: 'Remaining Work (hours)',
                    type: 'number',
                    required: false,
                },
            ],
            'Epic': [
                {
                    name: 'Microsoft.VSTS.Common.BusinessValue',
                    label: 'Business Value',
                    type: 'number',
                    required: false,
                },
                {
                    name: 'Microsoft.VSTS.Scheduling.StartDate',
                    label: 'Start Date',
                    type: 'date',
                    required: false,
                },
                {
                    name: 'Microsoft.VSTS.Scheduling.TargetDate',
                    label: 'Target Date',
                    type: 'date',
                    required: false,
                },
            ],
        }

        const fields = customFieldsByType[workItemType] || []

        return NextResponse.json({ fields })
    } catch (error) {
        console.error('Failed to fetch custom fields:', error)
        return NextResponse.json(
            { error: 'Failed to fetch custom fields' },
            { status: 500 }
        )
    }
}
