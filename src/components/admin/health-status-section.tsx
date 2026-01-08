'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RefreshCw, Database, Zap, HardDrive, GitBranch, CheckCircle, AlertTriangle, XCircle, Server, Cpu } from 'lucide-react'
import { toast } from 'sonner'

interface HealthCheckResult {
  service: string
  status: 'UP' | 'DOWN' | 'WARNING'
  message: string
  details?: any
  timestamp: string
}

interface HealthStatusProps {
  initialHealthStatus: HealthCheckResult[]
}

export function HealthStatusSection({ initialHealthStatus }: HealthStatusProps) {
  const [healthStatus, setHealthStatus] = useState(initialHealthStatus)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const refreshHealthStatus = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/admin/health-status')
      const data = await response.json()

      if (response.ok && data.success) {
        setHealthStatus(data.services)
        setLastUpdated(new Date())
        toast.success('Health status updated successfully')
      } else {
        toast.error(data.error || 'Failed to refresh health status')
      }
    } catch (error) {
      toast.error('Failed to refresh health status')
      console.error('Health status refresh error:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const getServiceIcon = (serviceName: string) => {
    switch (serviceName.toLowerCase()) {
      case 'database':
        return Database
      case 'redis':
      case 'redis cache':
        return Zap
      case 'backup service':
        return HardDrive
      case 'sync service':
        return GitBranch
      case 'system resources':
        return Server
      case 'application':
        return Cpu
      default:
        return CheckCircle
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'UP':
        return CheckCircle
      case 'WARNING':
        return AlertTriangle
      case 'DOWN':
        return XCircle
      default:
        return CheckCircle
    }
  }

  return (
    <>
      {/* Main Services - Database & Redis in 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {healthStatus.filter(s => ['Database', 'Redis Cache', 'Redis'].includes(s.service)).map((service) => {
          const ServiceIcon = getServiceIcon(service.service)
          const StatusIcon = getStatusIcon(service.status)

          return (
            <div
              key={service.service}
              className={`relative p-5 rounded-lg border transition-all duration-200 ${service.status === 'UP'
                ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent'
                : service.status === 'WARNING'
                  ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent'
                  : 'border-red-500/30 bg-gradient-to-br from-red-500/10 to-transparent'
                }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-lg ${service.status === 'UP'
                    ? 'bg-emerald-500/20'
                    : service.status === 'WARNING'
                      ? 'bg-amber-500/20'
                      : 'bg-red-500/20'
                    }`}>
                    <ServiceIcon className={`w-5 h-5 ${service.status === 'UP'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : service.status === 'WARNING'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-red-600 dark:text-red-400'
                      }`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-base">{service.service}</h4>
                    <p className="text-sm mt-0.5">{service.message}</p>
                  </div>
                </div>

                
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${service.status === 'UP'
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                  : service.status === 'WARNING'
                    ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                    : 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30'
                  }`}>
                  <StatusIcon className="w-3 h-3" />
                  {service.status}
                </div>


              </div>

              {service.details && Object.keys(service.details).length > 0 && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                  {Object.entries(service.details).slice(0, 6).map(([key, value]) => {
                    const displayValue = String(value)
                    const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

                    return (
                      <div key={key} className="flex flex-col">
                        <span className="text-xs">{label}</span>
                        <span className="text-sm font-semibold mt-0.5">
                          {displayValue}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Other Services - 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {healthStatus.filter(s => !['Database', 'Redis Cache', 'Redis'].includes(s.service)).map((service) => {
          const ServiceIcon = getServiceIcon(service.service)
          const StatusIcon = getStatusIcon(service.status)

          return (
            <div
              key={service.service}
              className={`relative p-4 rounded-lg border transition-all duration-200 ${service.status === 'UP'
                ? 'border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent'
                : service.status === 'WARNING'
                  ? 'border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent'
                  : 'border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent'
                }`}
            >
              {/* Status badge at top right */}
              <div className={`absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${service.status === 'UP'
                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                : service.status === 'WARNING'
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                  : 'bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30'
                }`}>
                <StatusIcon className="w-2.5 h-2.5" />
                {service.status}
              </div>

              <div className="flex items-center gap-2 mb-3 pr-16">
                <div className={`p-2 rounded-lg ${service.status === 'UP'
                  ? 'bg-emerald-500/20'
                  : service.status === 'WARNING'
                    ? 'bg-amber-500/20'
                    : 'bg-red-500/20'
                  }`}>
                  <ServiceIcon className={`w-4 h-4 ${service.status === 'UP'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : service.status === 'WARNING'
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-red-600 dark:text-red-400'
                    }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{service.service}</h4>
                </div>
              </div>

              <p className="text-xs mb-3">{service.message}</p>

              {service.details && Object.keys(service.details).length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                  {Object.entries(service.details).slice(0, 4).map(([key, value]) => {
                    const displayValue = String(value)
                    const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

                    // Special handling for memory usage with progress bar
                    if (key === 'memory_usage' && service.details.memory_percent) {
                      const percent = parseFloat(service.details.memory_percent)
                      return (
                        <div key={key} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs">{label}</span>
                            <span className="text-xs font-semibold">
                              {displayValue}
                            </span>
                          </div>
                          <div className="w-full rounded-full h-1 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${percent > 90 ? 'bg-red-500' : percent > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                              style={{ width: `${Math.min(percent, 100)}%` }}
                            />
                          </div>
                        </div>
                      )
                    }

                    // Skip memory_percent as it's shown in the progress bar
                    if (key === 'memory_percent') {
                      return null
                    }

                    return (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-xs truncate mr-2">{label}</span>
                        <span className="text-xs font-semibold text-right">
                          {displayValue}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>


      <Card className="mt-6">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse"></div>
            Last updated: {lastUpdated.toLocaleString()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshHealthStatus}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-3 h-3 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
          </Button>
        </CardContent>
      </Card>

    </>
  )
}