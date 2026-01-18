import { LucideIcon } from 'lucide-react'

interface SectionHeaderProps {
    icon: LucideIcon
    title: string
    subtitle: string
}

export function SectionHeader({ icon: Icon, title, subtitle }: SectionHeaderProps) {
    return (
        <div className="bg-gradient-to-r from-brand-orange/10 to-orange-500/10 border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6 sm:py-8 lg:py-12">
                <div className="flex items-start justify-between">
                    <div className="space-y-3 sm:space-y-4 max-w-2xl">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="p-2 sm:p-3 rounded-lg bg-brand-orange/20">
                                <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-brand-orange" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">{title}</h1>
                        </div>
                        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
                            {subtitle}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
