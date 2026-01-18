export interface LanguageBadge {
    color: string
    bg: string
    label: string
    icon?: string  // simple-icons slug
}

export const languageMap: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'jsx': 'javascript',
    'tsx': 'typescript',
    'sh': 'bash',
    'yml': 'yaml',
    'md': 'markdown',
    'cs': 'csharp',
    'c#': 'csharp',
    'py': 'python',
    'sql': 'sql',
    'tsql': 'sql',
    'plsql': 'sql',
    'mysql': 'sql',
    'postgres': 'sql',
    'postgresql': 'sql',
}

export const languageBadges: Record<string, LanguageBadge> = {
    'javascript': { 
        color: 'text-yellow-500 dark:text-yellow-400', 
        bg: 'bg-yellow-500/20 dark:bg-yellow-500/20', 
        label: 'JavaScript',
        icon: 'javascript'
    },
    'typescript': { 
        color: 'text-blue-500 dark:text-blue-400', 
        bg: 'bg-blue-500/20 dark:bg-blue-500/20', 
        label: 'TypeScript',
        icon: 'typescript'
    },
    'python': { 
        color: 'text-green-500 dark:text-green-400', 
        bg: 'bg-green-500/20 dark:bg-green-500/20', 
        label: 'Python',
        icon: 'python'
    },
    'csharp': { 
        color: 'text-purple-500 dark:text-purple-400', 
        bg: 'bg-purple-500/20 dark:bg-purple-500/20', 
        label: 'C#',
        icon: 'csharp'
    },
    'sql': { 
        color: 'text-orange-500 dark:text-orange-400', 
        bg: 'bg-orange-500/20 dark:bg-orange-500/20', 
        label: 'SQL',
        icon: 'mysql'
    },
    'bash': { 
        color: 'text-gray-300 dark:text-gray-400', 
        bg: 'bg-gray-500/20 dark:bg-gray-500/20', 
        label: 'Bash',
        icon: 'gnubash'
    },
    'json': { 
        color: 'text-emerald-500 dark:text-emerald-400', 
        bg: 'bg-emerald-500/20 dark:bg-emerald-500/20', 
        label: 'JSON',
        icon: 'json'
    },
    'yaml': { 
        color: 'text-red-500 dark:text-red-400', 
        bg: 'bg-red-500/20 dark:bg-red-500/20', 
        label: 'YAML',
        icon: 'yaml'
    },
    'xml': { 
        color: 'text-indigo-500 dark:text-indigo-400', 
        bg: 'bg-indigo-500/20 dark:bg-indigo-500/20', 
        label: 'XML'
    },
    'html': { 
        color: 'text-rose-500 dark:text-rose-400', 
        bg: 'bg-rose-500/20 dark:bg-rose-500/20', 
        label: 'HTML',
        icon: 'html5'
    },
    'css': { 
        color: 'text-cyan-500 dark:text-cyan-400', 
        bg: 'bg-cyan-500/20 dark:bg-cyan-500/20', 
        label: 'CSS',
        icon: 'css3'
    },
    'scss': { 
        color: 'text-pink-500 dark:text-pink-400', 
        bg: 'bg-pink-500/20 dark:bg-pink-500/20', 
        label: 'SCSS',
        icon: 'sass'
    },
    'markdown': { 
        color: 'text-slate-400 dark:text-slate-400', 
        bg: 'bg-slate-500/20 dark:bg-slate-500/20', 
        label: 'Markdown',
        icon: 'markdown'
    },
    'php': { 
        color: 'text-violet-500 dark:text-violet-400', 
        bg: 'bg-violet-500/20 dark:bg-violet-500/20', 
        label: 'PHP',
        icon: 'php'
    },
    'java': { 
        color: 'text-red-600 dark:text-red-400', 
        bg: 'bg-red-500/20 dark:bg-red-500/20', 
        label: 'Java',
        icon: 'openjdk'
    },
    'kotlin': { 
        color: 'text-purple-600 dark:text-purple-400', 
        bg: 'bg-purple-500/20 dark:bg-purple-500/20', 
        label: 'Kotlin',
        icon: 'kotlin'
    },
    'swift': { 
        color: 'text-orange-600 dark:text-orange-400', 
        bg: 'bg-orange-500/20 dark:bg-orange-500/20', 
        label: 'Swift',
        icon: 'swift'
    },
    'go': { 
        color: 'text-cyan-600 dark:text-cyan-400', 
        bg: 'bg-cyan-500/20 dark:bg-cyan-500/20', 
        label: 'Go',
        icon: 'go'
    },
    'rust': { 
        color: 'text-orange-700 dark:text-orange-400', 
        bg: 'bg-orange-500/20 dark:bg-orange-500/20', 
        label: 'Rust',
        icon: 'rust'
    },
    'ruby': { 
        color: 'text-red-500 dark:text-red-400', 
        bg: 'bg-red-500/20 dark:bg-red-500/20', 
        label: 'Ruby',
        icon: 'ruby'
    },
    'powershell': { 
        color: 'text-blue-600 dark:text-blue-400', 
        bg: 'bg-blue-500/20 dark:bg-blue-500/20', 
        label: 'PowerShell',
        icon: 'powershell'
    },
    'text': { 
        color: 'text-muted-foreground', 
        bg: 'bg-muted/30', 
        label: 'Text' 
    },
}

export function getLanguageBadge(language: string): LanguageBadge {
    const displayLanguage = languageMap[language?.toLowerCase()] || language?.toLowerCase() || 'text'
    return languageBadges[displayLanguage] || languageBadges['text']
}

interface LanguageBadgeDisplayProps {
    language: string
    isDark?: boolean
}

export function LanguageBadgeDisplay({ language, isDark = false }: LanguageBadgeDisplayProps) {
    const badge = getLanguageBadge(language)
    
    return (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 h-5 rounded-md text-xs font-bold tracking-wide uppercase ${badge.bg} ${badge.color} border border-current/20`}>
            {badge.icon && (
                <img 
                    src={`https://cdn.simpleicons.org/${badge.icon}?viewbox=auto&size=14`}
                    alt={badge.label}
                    className="w-3 h-3"
                    onError={(e) => {
                        // Hide image if it fails to load
                        e.currentTarget.style.display = 'none'
                    }}
                />
            )}
            {badge.label}
        </span>
    )
}
