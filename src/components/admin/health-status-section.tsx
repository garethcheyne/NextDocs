'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RefreshCw, Database, Zap, HardDrive, GitBranch, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'
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
        return Zap
      case 'backup service':
        return HardDrive
      case 'sync service':
        return GitBranch
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {healthStatus.map((service) => {
          const ServiceIcon = getServiceIcon(service.service)
          const StatusIcon = getStatusIcon(service.status)
          
          return (
            <div 
              key={service.service} 
              className={`relative p-6 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                service.status === 'UP' 
                  ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-emerald-500/5 shadow-lg shadow-emerald-500/10' 
                  : service.status === 'WARNING'
                  ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-amber-500/5 shadow-lg shadow-amber-500/10'
                  : 'border-red-500/30 bg-gradient-to-br from-red-500/20 via-red-500/10 to-red-500/5 shadow-lg shadow-red-500/10'
              }`}
            >
              {/* Service Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    service.status === 'UP' 
                      ? 'bg-emerald-500/20' 
                      : service.status === 'WARNING'
                      ? 'bg-amber-500/20'
                      : 'bg-red-500/20'
                  }`}>
                    <ServiceIcon className={`w-4 h-4 ${
                      service.status === 'UP' 
                        ? 'text-emerald-400' 
                        : service.status === 'WARNING'
                        ? 'text-amber-400'
                        : 'text-red-400'
                    }`} />
                  </div>
                  <h4 className="font-semibold text-sm text-gray-100">{service.service}</h4>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  service.status === 'UP' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : service.status === 'WARNING'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  <StatusIcon className="w-3 h-3" />
                  {service.status}
                </div>
              </div>

              {/* Service Message */}
              <p className="text-sm text-gray-300 mb-3 leading-relaxed">{service.message}</p>

              {/* Service Details */}
              {service.details && Object.keys(service.details).length > 0 && (
                <div className="space-y-2">
                  <div className="h-px bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 opacity-30"></div>
                  <div className="space-y-1">
                    {Object.entries(service.details).slice(0, 3).map(([key, value]) => {
                      const displayValue = String(value)
                      const truncatedValue = displayValue.length > 40 ? displayValue.substring(0, 40) + '...' : displayValue
                      
                      return (
                        <div key={key} className="flex justify-between items-center text-xs">
                          <span className="text-gray-400 capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="text-gray-300 font-mono bg-gray-800/50 px-2 py-1 rounded">
                            {truncatedValue}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Status Indicator Dot */}
              <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${
                service.status === 'UP' 
                  ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' 
                  : service.status === 'WARNING'
                  ? 'bg-amber-400 shadow-lg shadow-amber-400/50'
                  : 'bg-red-400 shadow-lg shadow-red-400/50'
              } ${service.status === 'UP' ? 'animate-pulse' : ''}`} />
            </div>
          )
        })}
      </div>
      <div className="mt-6 flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          Last updated: {lastUpdated.toLocaleString()}
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={refreshHealthStatus}
          disabled={isRefreshing}
          className="h-8 px-4 border-gray-600 hover:border-gray-500 hover:bg-gray-700/50"
        >
          <RefreshCw className={`w-3 h-3 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
        </Button>
      </div>
    </>
  )
}