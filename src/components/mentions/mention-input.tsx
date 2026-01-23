'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { useDebounce } from '@/hooks/use-debounce'

interface User {
  id: string
  name: string | null
  email: string
  image?: string | null
}

interface MentionInputProps {
  value: string
  onChange: (value: string) => void
  onMention?: (userId: string, userName: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function MentionInput({
  value,
  onChange,
  onMention,
  placeholder,
  disabled,
  className,
}: MentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<User[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [mentionQuery, setMentionQuery] = useState('')
  const [cursorPosition, setCursorPosition] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  
  const debouncedQuery = useDebounce(mentionQuery, 300)

  // Fetch users when mention query changes
  useEffect(() => {
    if (!debouncedQuery) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const fetchUsers = async () => {
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(debouncedQuery)}&limit=10`)
        if (response.ok) {
          const data = await response.json()
          setSuggestions(data.users || [])
          setShowSuggestions(data.users?.length > 0)
          setSelectedIndex(0)
        }
      } catch (error) {
        console.error('Failed to fetch users:', error)
      }
    }

    fetchUsers()
  }, [debouncedQuery])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    const newCursorPosition = e.target.selectionStart || 0
    
    onChange(newValue)
    setCursorPosition(newCursorPosition)

    // Check if user is typing a mention
    const textBeforeCursor = newValue.substring(0, newCursorPosition)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)
    
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1])
    } else {
      setMentionQuery('')
      setShowSuggestions(false)
    }
  }

  const insertMention = (user: User) => {
    const textBeforeCursor = value.substring(0, cursorPosition)
    const textAfterCursor = value.substring(cursorPosition)
    
    // Find the @ symbol position
    const atPosition = textBeforeCursor.lastIndexOf('@')
    
    // Replace @query with mention
    const mentionText = `@[${user.name || user.email}](user:${user.id})`
    const newValue = 
      value.substring(0, atPosition) + 
      mentionText + 
      textAfterCursor

    onChange(newValue)
    setShowSuggestions(false)
    setMentionQuery('')
    
    // Move cursor after the mention
    const newCursorPos = atPosition + mentionText.length
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)

    onMention?.(user.id, user.name || user.email)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % suggestions.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length)
        break
      case 'Enter':
        if (showSuggestions) {
          e.preventDefault()
          insertMention(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        e.preventDefault()
        setShowSuggestions(false)
        setMentionQuery('')
        break
    }
  }

  // Scroll selected suggestion into view
  useEffect(() => {
    if (showSuggestions && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex] as HTMLElement
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex, showSuggestions])

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full max-w-xs bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
          style={{
            top: '100%',
            marginTop: '4px',
          }}
        >
          {suggestions.map((user, index) => (
            <button
              key={user.id}
              type="button"
              className={`w-full px-3 py-2 text-left hover:bg-accent transition-colors flex items-center gap-2 ${
                index === selectedIndex ? 'bg-accent' : ''
              }`}
              onClick={() => insertMention(user)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {user.image && (
                <img
                  src={user.image}
                  alt={user.name || user.email}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {user.name || user.email}
                </div>
                {user.name && (
                  <div className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
