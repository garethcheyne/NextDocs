#!/usr/bin/env node

/**
 * Swagger Documentation Generator
 * 
 * This script automatically generates and updates OpenAPI/Swagger documentation
 * by scanning API routes and extracting endpoint information.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const API_ROUTES_DIR = path.join(__dirname, '..', 'src', 'app', 'api');
const DOCS_DIR = path.join(__dirname, '..', 'docs', 'api');
const OUTPUT_FILE = path.join(DOCS_DIR, 'generated-swagger.yaml');

// Ensure docs directory exists
if (!fs.existsSync(DOCS_DIR)) {
    fs.mkdirSync(DOCS_DIR, { recursive: true });
}

/**
 * Base OpenAPI specification structure
 */
const baseSpec = {
    openapi: '3.0.3',
    info: {
        title: 'NextDocs API',
        description: 'Auto-generated API documentation for NextDocs',
        version: '1.0.0',
        contact: {
            name: 'NextDocs Team'
        }
    },
    servers: [
        {
            url: '/api',
            description: 'API Server'
        }
    ],
    security: [
        { sessionAuth: [] },
        { apiKeyAuth: [] }
    ],
    components: {
        securitySchemes: {
            sessionAuth: {
                type: 'apiKey',
                in: 'cookie',
                name: 'authjs.session-token',
                description: 'NextAuth.js session cookie'
            },
            apiKeyAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'hex',
                description: 'API Key authentication (64-char hex string)'
            }
        },
        schemas: {
            ErrorResponse: {
                type: 'object',
                properties: {
                    error: {
                        type: 'string',
                        description: 'Error description'
                    }
                },
                required: ['error']
            },
            SuccessResponse: {
                type: 'object',
                properties: {
                    success: {
                        type: 'boolean',
                        example: true
                    }
                },
                required: ['success']
            }
        },
        responses: {
            BadRequest: {
                description: 'Bad request - validation error',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ErrorResponse' }
                    }
                }
            },
            Unauthorized: {
                description: 'Unauthorized - authentication required',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ErrorResponse' }
                    }
                }
            },
            NotFound: {
                description: 'Resource not found',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ErrorResponse' }
                    }
                }
            },
            InternalServerError: {
                description: 'Internal server error',
                content: {
                    'application/json': {
                        schema: { $ref: '#/components/schemas/ErrorResponse' }
                    }
                }
            }
        }
    },
    paths: {},
    tags: []
};

/**
 * Recursively find all route.ts files
 */
function findRouteFiles(dir, basePath = '') {
    const routes = [];
    
    if (!fs.existsSync(dir)) {
        return routes;
    }
    
    const items = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const item of items) {
        const fullPath = path.join(dir, item.name);
        
        if (item.isDirectory()) {
            // Handle dynamic routes [id], [slug], etc.
            let routePath = item.name;
            if (routePath.startsWith('[') && routePath.endsWith(']')) {
                const paramName = routePath.slice(1, -1);
                routePath = `{${paramName}}`;
            }
            
            routes.push(...findRouteFiles(fullPath, `${basePath}/${routePath}`));
        } else if (item.name === 'route.ts') {
            routes.push({
                filePath: fullPath,
                apiPath: basePath || '/'
            });
        }
    }
    
    return routes;
}

/**
 * Extract HTTP methods from route file
 */
function extractMethodsFromFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const methods = [];
        
        // Look for export async function METHOD patterns
        const methodRegex = /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)/g;
        let match;
        
        while ((match = methodRegex.exec(content)) !== null) {
            methods.push(match[1].toLowerCase());
        }
        
        return methods;
    } catch (error) {
        console.warn(`Could not read file ${filePath}:`, error.message);
        return [];
    }
}

/**
 * Generate path operation for a method
 */
function generateOperation(method, apiPath, filePath) {
    const operation = {
        tags: [getTagFromPath(apiPath)],
        summary: `${method.toUpperCase()} ${apiPath}`,
        description: `Auto-generated documentation for ${method.toUpperCase()} ${apiPath}`,
        responses: {
            '200': {
                description: 'Success',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                message: {
                                    type: 'string',
                                    example: 'Success'
                                }
                            }
                        }
                    }
                }
            },
            '400': { $ref: '#/components/responses/BadRequest' },
            '401': { $ref: '#/components/responses/Unauthorized' },
            '500': { $ref: '#/components/responses/InternalServerError' }
        }
    };
    
    // Add request body for POST, PUT, PATCH
    if (['post', 'put', 'patch'].includes(method)) {
        operation.requestBody = {
            required: true,
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            // Generic placeholder
                        }
                    }
                }
            }
        };
    }
    
    // Add path parameters
    const paramMatches = apiPath.match(/\{([^}]+)\}/g);
    if (paramMatches) {
        operation.parameters = paramMatches.map(param => {
            const paramName = param.slice(1, -1);
            return {
                name: paramName,
                in: 'path',
                required: true,
                schema: {
                    type: 'string'
                },
                description: `${paramName} parameter`
            };
        });
    }
    
    return operation;
}

/**
 * Get tag name from API path
 */
function getTagFromPath(apiPath) {
    const segments = apiPath.split('/').filter(Boolean);
    if (segments.length === 0) return 'Root';
    
    // Use the first non-parameter segment as tag
    for (const segment of segments) {
        if (!segment.startsWith('{')) {
            return segment.charAt(0).toUpperCase() + segment.slice(1);
        }
    }
    
    return 'API';
}

/**
 * Main generation function
 */
function generateSwaggerDocs() {
    console.log('🔍 Scanning API routes...');
    
    const routes = findRouteFiles(API_ROUTES_DIR);
    const spec = JSON.parse(JSON.stringify(baseSpec)); // Deep copy
    
    console.log(`📄 Found ${routes.length} route files`);
    
    const tags = new Set();
    
    for (const route of routes) {
        const methods = extractMethodsFromFile(route.filePath);
        
        if (methods.length === 0) continue;
        
        const apiPath = route.apiPath;
        console.log(`  📝 Processing ${apiPath} (${methods.join(', ')})`);
        
        if (!spec.paths[apiPath]) {
            spec.paths[apiPath] = {};
        }
        
        for (const method of methods) {
            spec.paths[apiPath][method] = generateOperation(method, apiPath, route.filePath);
            tags.add(getTagFromPath(apiPath));
        }
    }
    
    // Add tags to spec
    spec.tags = Array.from(tags).sort().map(tag => ({
        name: tag,
        description: `Operations for ${tag}`
    }));
    
    // Write the generated spec
    const yamlContent = yaml.dump(spec, { 
        indent: 2,
        lineWidth: -1,
        noRefs: true
    });
    
    fs.writeFileSync(OUTPUT_FILE, yamlContent, 'utf8');
    
    console.log(`✅ Generated Swagger documentation: ${OUTPUT_FILE}`);
    console.log(`📊 Documented ${Object.keys(spec.paths).length} paths with ${tags.size} tags`);
    
    // Also create a JSON version
    const jsonFile = OUTPUT_FILE.replace('.yaml', '.json');
    fs.writeFileSync(jsonFile, JSON.stringify(spec, null, 2), 'utf8');
    console.log(`✅ Generated JSON documentation: ${jsonFile}`);
}

/**
 * Update timestamp in existing files
 */
function updateTimestamp() {
    const timestamp = new Date().toISOString();
    
    // Update the base spec with current timestamp
    baseSpec.info.version = `1.0.0-${timestamp.split('T')[0].replace(/-/g, '')}`;
    baseSpec.info.description += `\n\nGenerated on: ${timestamp}`;
}

// Run the generator
if (require.main === module) {
    try {
        updateTimestamp();
        generateSwaggerDocs();
        console.log('🎉 Swagger documentation generation completed!');
    } catch (error) {
        console.error('❌ Error generating swagger docs:', error);
        process.exit(1);
    }
}

module.exports = { generateSwaggerDocs, findRouteFiles, extractMethodsFromFile };