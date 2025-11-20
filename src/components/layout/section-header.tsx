import { LucideIcon } from 'lucide-react'

interface SectionHeaderProps {
    icon: LucideIcon
    title: string
    subtitle: string
}

export function SectionHeader({ icon: Icon, title, subtitle }: SectionHeaderProps) {
    return (
        <div className="bg-gradient-to-r from-brand-orange/10 to-orange-500/10 border-b">
            <div className="max-w-7xl mx-auto px-12 py-12">
                <div className="flex items-start justify-between">
                    <div className="space-y-4 max-w-2xl">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-lg bg-brand-orange/20">
                                <Icon className="w-8 h-8 text-brand-orange" />
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
                        </div>
                        <p className="text-lg text-muted-foreground">
                            {subtitle}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
