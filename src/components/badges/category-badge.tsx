import { cn } from '@/lib/utils'

interface CategoryBadgeProps {
    category: {
        id: string
        name: string
        color?: string | null
        iconBase64?: string | null
    } | null | undefined
    className?: string
}// Function to determine if text should be black or white based on background color
function getContrastColor(hexColor: string): string {
    // Remove # if present
    const hex = hexColor.replace('#', '')

    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)

    // Calculate luminance using the relative luminance formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

    // Return black for light colors, white for dark colors
    return luminance > 0.5 ? '#000000' : '#ffffff'
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
    if (!category || typeof category !== 'object' || !category.name) {
        return null
    }

    const backgroundColor = category.color || '#1f2937'
    const textColor = getContrastColor(backgroundColor)

    return (
        <div className={cn('inline-block', className)}>
            {/* Outer wrapper to protect circle spacing */}
            <div className="relative inline-flex items-center ml-3">
                {/* Badge background - matching other badge heights (24px) */}
                <div
                    className="flex items-center rounded-md px-4 py-1 shadow-lg pl-6 h-6"
                    style={{
                        backgroundColor,
                        color: textColor
                    }}
                >
                    <span className="font-medium text-xs whitespace-nowrap ml-1">
                        {category.name}
                    </span>
                </div>

                {/* Circular icon that overlaps the badge - proportional to badge height */}
                <div
                    className="absolute -left-3 w-8 h-8 rounded-full border-2 bg-white shadow-md z-10 overflow-hidden"
                    style={{ borderColor: backgroundColor }}
                >
                    {category.iconBase64 ? (
                        <img
                            src={category.iconBase64.startsWith('data:') ? category.iconBase64 : `data:image/png;base64,${category.iconBase64}`}
                            alt=""
                            className="w-full h-full object-contain my-0"
                        />
                    ) : (
                        <div className="w-4 h-4 rounded-full bg-gray-300 m-1" />
                    )}
                </div>
            </div>
        </div>
    )
}
