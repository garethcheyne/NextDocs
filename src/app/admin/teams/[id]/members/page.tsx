'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Users, Trash2, Loader2, UserPlus, Bell, BellOff, ArrowLeft, Search, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { BreadcrumbNavigation } from '@/components/breadcrumb-navigation'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast, Toaster } from 'sonner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Member {
  id: string
  userId: string
  name: string | null
  email: string
  image: string | null
  userRole: string
  teamRole: string | null
  subscribeToReleases: boolean
  notifyEmail: boolean
  notifyInApp: boolean
  joinedAt: string
}

interface Team {
  id: string
  name: string
  slug: string
}

interface AvailableUser {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
}

export default function TeamMembersPage() {
  const router = useRouter()
  const params = useParams()
  const teamId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [team, setTeam] = useState<Team | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('member')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([])
  const [userSearchOpen, setUserSearchOpen] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(false)

  const fetchMembers = async () => {
    try {
      const [teamRes, membersRes] = await Promise.all([
        fetch(`/api/teams/${teamId}`),
        fetch(`/api/teams/${teamId}/members`),
      ])

      if (!teamRes.ok) {
        throw new Error('Team not found')
      }

      const teamData = await teamRes.json()
      const membersData = await membersRes.json()

      setTeam(teamData.team)
      setMembers(membersData.members || [])
    } catch (error) {
      console.error('Failed to fetch team members:', error)
      toast.error('Failed to load team members')
      router.push('/admin/teams')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAvailableUsers = async (search?: string) => {
    setLoadingUsers(true)
    try {
      const params = new URLSearchParams({
        excludeTeamId: teamId,
        ...(search && { search }),
      })
      const response = await fetch(`/api/admin/users?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAvailableUsers(data.users || [])
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [teamId])

  useEffect(() => {
    if (dialogOpen) {
      fetchAvailableUsers()
    }
  }, [dialogOpen, teamId])

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!userSearch) return availableUsers
    const lower = userSearch.toLowerCase()
    return availableUsers.filter(
      (u) =>
        u.name?.toLowerCase().includes(lower) ||
        u.email.toLowerCase().includes(lower)
    )
  }, [availableUsers, userSearch])

  const selectedUser = availableUsers.find((u) => u.id === selectedUserId)

  const handleAddMember = async () => {
    if (!selectedUserId) {
      toast.error('Please select a user')
      return
    }

    setIsAddingMember(true)

    try {
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUserId,
          role: newMemberRole,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add member')
      }

      toast.success('Member added successfully')
      setSelectedUserId('')
      setNewMemberRole('member')
      setUserSearch('')
      setDialogOpen(false)
      fetchMembers()
      // Refresh available users list
      fetchAvailableUsers()
    } catch (error) {
      console.error('Failed to add member:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add member')
    } finally {
      setIsAddingMember(false)
    }
  }

  const handleRemoveMember = async (userId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName || 'this member'} from the team?`)) {
      return
    }

    try {
      const response = await fetch(`/api/teams/${teamId}/members?userId=${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to remove member')
      }

      toast.success('Member removed successfully')
      setMembers(members.filter((m) => m.userId !== userId))
    } catch (error) {
      console.error('Failed to remove member:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to remove member')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!team) {
    return null
  }

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <BreadcrumbNavigation
          items={[
            { label: 'Admin', href: '/admin' },
            { label: 'Teams', href: '/admin/teams' },
            { label: team.name, href: `/admin/teams/${teamId}` },
            { label: 'Members', href: `/admin/teams/${teamId}/members` },
          ]}
        />
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Page Content */}
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Link href={`/admin/teams/${teamId}`}>
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-orange to-orange-500 bg-clip-text text-transparent">
                  {team.name} Members
                </h1>
                <p className="text-gray-400 mt-1">
                  {members.length} member{members.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-orange hover:bg-brand-orange/90">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogDescription>
                  Select a user to add to {team.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Select User</Label>
                  <Popover open={userSearchOpen} onOpenChange={setUserSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={userSearchOpen}
                        className="w-full justify-between"
                      >
                        {selectedUser ? (
                          <div className="flex items-center gap-2">
                            {selectedUser.image ? (
                              <img
                                src={selectedUser.image}
                                alt=""
                                className="w-5 h-5 rounded-full"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs">
                                {(selectedUser.name || selectedUser.email).charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span>{selectedUser.name || selectedUser.email}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Search for a user...</span>
                        )}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[350px] p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Search by name or email..."
                          value={userSearch}
                          onValueChange={setUserSearch}
                        />
                        <CommandList>
                          {loadingUsers ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                              <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                              Loading users...
                            </div>
                          ) : filteredUsers.length === 0 ? (
                            <CommandEmpty>No users found.</CommandEmpty>
                          ) : (
                            <CommandGroup>
                              {filteredUsers.map((user) => (
                                <CommandItem
                                  key={user.id}
                                  value={user.id}
                                  onSelect={() => {
                                    setSelectedUserId(user.id)
                                    setUserSearchOpen(false)
                                  }}
                                  className="flex items-center gap-3 py-2"
                                >
                                  {user.image ? (
                                    <img
                                      src={user.image}
                                      alt=""
                                      className="w-8 h-8 rounded-full"
                                    />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                      {(user.name || user.email).charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">
                                      {user.name || 'Unnamed User'}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {user.email}
                                    </p>
                                  </div>
                                  <Badge variant="outline" className="text-xs shrink-0">
                                    {user.role}
                                  </Badge>
                                  <Check
                                    className={cn(
                                      'h-4 w-4 shrink-0',
                                      selectedUserId === user.id ? 'opacity-100' : 'opacity-0'
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Team Role</Label>
                  <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => {
                  setDialogOpen(false)
                  setSelectedUserId('')
                  setUserSearch('')
                }}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddMember}
                  disabled={isAddingMember || !selectedUserId}
                  className="bg-brand-orange hover:bg-brand-orange/90"
                >
                  {isAddingMember ? 'Adding...' : 'Add Member'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Members List */}
        <Card className="bg-white/50 dark:bg-gray-900/40 border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>
              Users who are part of this team and their notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No members yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add members to this team to enable release notifications
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700/50"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={member.image || undefined} />
                        <AvatarFallback>
                          {(member.name || member.email).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">
                            {member.name || member.email}
                          </span>
                          {member.teamRole && member.teamRole !== 'member' && (
                            <Badge variant="outline" className="text-xs capitalize">
                              {member.teamRole}
                            </Badge>
                          )}
                          <Badge
                            variant={member.userRole === 'admin' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {member.userRole}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            {member.subscribeToReleases ? (
                              <Bell className="w-3 h-3 text-green-400" />
                            ) : (
                              <BellOff className="w-3 h-3 text-gray-500" />
                            )}
                            {member.subscribeToReleases ? 'Subscribed' : 'Not subscribed'}
                          </span>
                          <span>
                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      onClick={() => handleRemoveMember(member.userId, member.name || member.email)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </>
  )
}
