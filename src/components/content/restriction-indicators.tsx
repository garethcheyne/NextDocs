'use client'

import { Badge } from '@/components/ui/badge'
import { Shield, ShieldAlert, Users, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RestrictionBadgeProps {
  isRestricted: boolean
  roles: string[]
  className?: string
  variant?: 'page' | 'section' | 'list'
}

export function RestrictionBadge({
  isRestricted,
  roles,
  className,
  variant = 'section'
}: RestrictionBadgeProps) {
  if (!isRestricted || roles.length === 0) {
    return null
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'page':
        return 'text-sm px-3 py-1.5 mb-4'
      case 'list':
        return 'text-xs px-2 py-1'
      case 'section':
      default:
        return 'text-xs px-2 py-1'
    }
  }

  const getIcon = () => {
    switch (variant) {
      case 'page':
        return <ShieldAlert className="w-4 h-4 mr-1.5" />
      case 'section':
        return <Shield className="w-3 h-3 mr-1" />
      case 'list':
        return <Eye className="w-3 h-3 mr-1" />
      default:
        return <Shield className="w-3 h-3 mr-1" />
    }
  }

  return (
    <Badge
      variant="secondary"
      className={cn(
        'inline-flex items-center border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100',
        'dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
        getVariantStyles(),
        className
      )}
      title={`Restricted to: ${roles.join(', ')}`}
    >
      {getIcon()}
      {variant === 'page' ? 'Restricted Content' : 'Restricted'}
      {variant !== 'list' && (
        <span className="ml-1 text-xs opacity-75">
          ({roles.length} {roles.length === 1 ? 'role' : 'roles'})
        </span>
      )}
    </Badge>
  )
}

interface VariantBadgeProps {
  role: string
  hasAccess: boolean
  className?: string
}

export function VariantBadge({ role, hasAccess, className }: VariantBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center text-xs px-2 py-1 font-mono',
        hasAccess
          ? 'border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950/50 dark:text-green-300'
          : 'border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950/50 dark:text-red-300',
        className
      )}
      title={hasAccess ? `You can access this variant` : `Access denied for this role`}
    >
      <Users className="w-3 h-3 mr-1" />
      {role}
      {!hasAccess && <span className="ml-1 text-xs opacity-75">(blocked)</span>}
    </Badge>
  )
}

interface RestrictionSummaryProps {
  isRestricted: boolean
  documentRoles: string[]
  variants: Array<{ role: string; hasAccess: boolean }>
  className?: string
}

export function RestrictionSummary({
  isRestricted,
  documentRoles,
  variants,
  className
}: RestrictionSummaryProps) {
  const hasAnyRestrictions = isRestricted || variants.length > 0

  if (!hasAnyRestrictions) {
    return (
      <div className={cn('text-sm text-muted-foreground', className)}>
        <Users className="w-4 h-4 inline mr-1" />
        No access restrictions
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {isRestricted && (
        <div>
          <div className="text-sm font-medium text-foreground mb-1">
            Document Access:
          </div>
          <div className="flex flex-wrap gap-1">
            {documentRoles.map(role => (
              <Badge
                key={role}
                variant="secondary"
                className="text-xs font-mono border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
              >
                {role}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {variants.length > 0 && (
        <div>
          <div className="text-sm font-medium text-foreground mb-1">
            Content Variants:
          </div>
          <div className="flex flex-wrap gap-1">
            {variants.map(variant => (
              <VariantBadge
                key={variant.role}
                role={variant.role}
                hasAccess={variant.hasAccess}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}