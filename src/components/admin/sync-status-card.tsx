'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { RefreshCw, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface SyncStatusProps {
  initialStatus?: {
    conflicts: number
    syncEnabled: number
    lastSync: string | null
  }
}

export function SyncStatusCard({ initialStatus }: SyncStatusProps) {
  const [status, setStatus] = useState(initialStatus)
  const [syncing, setSyncing] = useState(false)

  const triggerSync = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/admin/sync/two-way', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Sync failed')
      }

      const data = await response.json()
      
      toast.success(`Sync complete: ${data.stats.updated} updated, ${data.stats.conflicts} conflicts`)

      // Refresh status
      const statusResponse = await fetch('/api/admin/sync/two-way')
      if (statusResponse.ok) {
        const newStatus = await statusResponse.json()
        setStatus(newStatus)
      }
    } catch (error) {
      toast.error('Failed to sync')
      console.error('Sync error:', error)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Two-Way Sync Status</CardTitle>
            <CardDescription>
              Automatic sync between The Hive and external systems
            </CardDescription>
          </div>
          <Button
            onClick={triggerSync}
            disabled={syncing}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Now'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {status && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Synced Features</p>
                <p className="text-2xl font-bold">{status.syncEnabled}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Conflicts</p>
                <p className="text-2xl font-bold text-destructive">{status.conflicts}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Last Sync</p>
                <p className="text-sm font-medium">
                  {status.lastSync ? (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(status.lastSync).toLocaleString()}
                    </span>
                  ) : (
                    'Never'
                  )}
                </p>
              </div>
            </div>

            {status.conflicts > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Sync Conflicts Detected</AlertTitle>
                <AlertDescription>
                  {status.conflicts} feature{status.conflicts !== 1 ? 's have' : ' has'} conflicting changes in both The Hive and the external system.
                  Please review and resolve manually.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                Automatic sync every 15 minutes
              </Badge>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
