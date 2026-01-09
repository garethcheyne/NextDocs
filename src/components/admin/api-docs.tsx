'use client'

import { useEffect, useState } from 'react'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FileText, Download, RefreshCw } from 'lucide-react'

interface APIDocsProps {
    isAdmin: boolean
}

export function APIDocs({ isAdmin }: APIDocsProps) {
    const [swaggerSpec, setSwaggerSpec] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const loadSwaggerSpec = async () => {
        try {
            setLoading(true)
            setError(null)

            // Try to load the generated swagger first, then fall back to static
            const endpoints = [
                '/docs/api/generated-swagger.json',
                '/docs/api/api-keys-swagger.yaml'
            ]

            let spec = null
            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(endpoint)
                    if (response.ok) {
                        const contentType = response.headers.get('content-type')
                        if (contentType?.includes('json')) {
                            spec = await response.json()
                        } else {
                            // Handle YAML
                            const text = await response.text()
                            const yaml = await import('yaml')
                            spec = yaml.parse(text)
                        }
                        break
                    }
                } catch (e) {
                    console.warn(`Failed to load ${endpoint}:`, e)
                    continue
                }
            }

            if (!spec) {
                throw new Error('Could not load API documentation')
            }

            setSwaggerSpec(spec)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load API documentation')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (isAdmin) {
            loadSwaggerSpec()
        }
    }, [isAdmin])

    if (!isAdmin) {
        return (
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        API Documentation
                    </CardTitle>
                    <CardDescription>
                        Access to API documentation is restricted to administrators.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Please contact your system administrator for API access documentation.
                    </p>
                </CardContent>
            </Card>
        )
    }

    if (loading) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Loading API Documentation...
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Loading Swagger documentation...</p>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <FileText className="w-5 h-5" />
                        Documentation Error
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-destructive mb-4">{error}</p>
                    <Button onClick={loadSwaggerSpec} variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                API Documentation
                                <Badge variant="secondary">Admin Only</Badge>
                            </CardTitle>
                            <CardDescription>
                                Comprehensive API documentation for NextDocs integration
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={loadSwaggerSpec}
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const dataStr = JSON.stringify(swaggerSpec, null, 2)
                                    const dataBlob = new Blob([dataStr], { type: 'application/json' })
                                    const url = URL.createObjectURL(dataBlob)
                                    const link = document.createElement('a')
                                    link.href = url
                                    link.download = 'nextdocs-api-spec.json'
                                    link.click()
                                }}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Spec
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Documentation Content */}
            <Tabs defaultValue="interactive" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="interactive">Interactive API Explorer</TabsTrigger>
                    <TabsTrigger value="markdown">Documentation</TabsTrigger>
                </TabsList>

                <TabsContent value="interactive" className="mt-6">
                    <Card >
                        <CardContent className="p-0">
                            {swaggerSpec && (
                                <SwaggerUI
                                    spec={swaggerSpec}
                                    tryItOutEnabled={true}
                                    displayRequestDuration={true}
                                    defaultModelsExpandDepth={2}
                                    defaultModelExpandDepth={2}
                                    docExpansion="list"
                                    filter={true}
                                    showExtensions={true}
                                    showCommonExtensions={true}
                                    deepLinking={true}
                                    displayOperationId={true}
                                    requestInterceptor={(request) => {
                                        // Add authentication headers if available
                                        const apiKey = localStorage.getItem('nextdocs-api-key')
                                        if (apiKey) {
                                            request.headers.Authorization = `Bearer ${apiKey}`
                                        }
                                        return request
                                    }}
                                />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="markdown" className="mt-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="prose prose-slate dark:prose-invert max-w-none">
                                <h2>API Keys Documentation</h2>
                                <p>
                                    The NextDocs API provides programmatic access to the platform's features
                                    through secure API key authentication.
                                </p>

                                <h3>Authentication</h3>
                                <p>
                                    API keys are 64-character hexadecimal strings that must be included in
                                    requests via the <code>Authorization</code> header:
                                </p>
                                <pre><code>Authorization: Bearer YOUR_API_KEY</code></pre>

                                <h3>Permissions</h3>
                                <ul>
                                    <li><strong>Read</strong>: Access to GET endpoints</li>
                                    <li><strong>Write</strong>: Access to all HTTP methods</li>
                                </ul>

                                <h3>Rate Limits</h3>
                                <p>
                                    API keys are subject to the same rate limits as authenticated user sessions.
                                    Monitor usage through the admin interface.
                                </p>

                                <h3>Best Practices</h3>
                                <ul>
                                    <li>Store API keys securely (environment variables, secrets management)</li>
                                    <li>Use read-only permissions when possible</li>
                                    <li>Rotate keys regularly</li>
                                    <li>Monitor usage and revoke unused keys</li>
                                    <li>Set appropriate expiration dates</li>
                                </ul>

                                <h3>Error Handling</h3>
                                <p>
                                    All API errors return standard HTTP status codes with JSON error messages:
                                </p>
                                <ul>
                                    <li><code>400</code>: Bad Request (validation errors)</li>
                                    <li><code>401</code>: Unauthorized (invalid/missing key)</li>
                                    <li><code>403</code>: Forbidden (insufficient permissions)</li>
                                    <li><code>404</code>: Not Found</li>
                                    <li><code>500</code>: Internal Server Error</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}