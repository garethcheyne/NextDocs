import { Badge } from '@/components/ui/badge'
import { Shield, Eye, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RestrictionIndicatorProps {
  isRestricted: boolean
  restrictedRoles: string[]
  hasVariantRestrictions: boolean
  restrictedVariants?: Array<{ role: string; hasAccess: boolean }>
  className?: string
}

export function RestrictionIndicator({
  isRestricted,
  restrictedRoles,
  hasVariantRestrictions,
  restrictedVariants = [],
  className
}: RestrictionIndicatorProps) {
  const hasAnyRestrictions = isRestricted || hasVariantRestrictions

  if (!hasAnyRestrictions) {
    return null
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {isRestricted && (
        <Badge
          variant="secondary"
          className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800"
        >
          <Shield className="w-3 h-3 mr-1" />
          Restricted Document
        </Badge>
      )}

      {hasVariantRestrictions && (
        <Badge
          variant="secondary"
          className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800"
        >
          <Eye className="w-3 h-3 mr-1" />
          Has Role Variants
        </Badge>
      )}

      {isRestricted && restrictedRoles.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="w-3 h-3" />
          <span>Access: {restrictedRoles.join(', ')}</span>
        </div>
      )}

      {restrictedVariants.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {restrictedVariants.map((variant, index) => (
            <Badge
              key={index}
              variant="outline"
              className={cn(
                'text-xs',
                variant.hasAccess
                  ? 'bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-700'
                  : 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-700'
              )}
            >
              {variant.role} {variant.hasAccess ? '✓' : '✗'}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

interface SectionVariantIndicatorProps {
  role: string
  hasAccess: boolean
  className?: string
}

export function SectionVariantIndicator({ role, hasAccess, className }: SectionVariantIndicatorProps) {
  return (
    <div className={cn('inline-flex items-center gap-1 mb-2', className)}>
      <Badge
        variant="outline"
        className={cn(
          'text-xs font-mono',
          hasAccess
            ? 'bg-green-50 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-700'
            : 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-700'
        )}
      >
        <Eye className="w-3 h-3 mr-1" />
        Role: {role} {hasAccess ? '(Visible)' : '(Hidden)'}
      </Badge>
    </div>
  )
}