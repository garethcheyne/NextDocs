# API Documentation

Learn how to include OpenAPI/Swagger API documentation in your repository.

## What is API Documentation? :book-open:

API documentation provides interactive reference for your REST APIs. NextDocs supports:

- **OpenAPI 3.x** specifications
- **Swagger 2.0** specifications  
- Interactive API explorers
- Try-it-out functionality

## API Spec Location :folder:

Place your API specification files in the `/api-specs` folder. Each API can have its own subdirectory with an optional `index.md` for documentation:

```
your-repo/
├── docs/           # Regular documentation
├── blog/           # Blog posts
└── api-specs/      # API specifications
    ├── users-api/
    │   ├── index.md           # API overview/documentation
    │   └── users-api.yaml     # OpenAPI spec
    ├── orders-api/
    │   ├── index.md
    │   └── orders-api.yaml
    └── payments-api/
        ├── index.md
        └── payments-api.yaml
```

## Supported Formats :file-code:

### YAML Format (.yaml or .yml)

```yaml
openapi: 3.0.0
info:
  title: Users API
  version: 1.0.0
  description: User management API
  
servers:
  - url: https://api.example.com/v1
    description: Production server

paths:
  /users:
    get:
      summary: List all users
      tags:
        - Users
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          example: "usr_123"
        name:
          type: string
          example: "John Doe"
        email:
          type: string
          format: email
          example: "john@example.com"
```

### JSON Format (.json)

```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "Users API",
    "version": "1.0.0"
  },
  "paths": {
    "/users": {
      "get": {
        "summary": "List all users",
        "responses": {
          "200": {
            "description": "Successful response"
          }
        }
      }
    }
  }
}
```

## File Metadata :info:

You can add metadata in the `info` section:

```yaml
info:
  title: My API
  version: 2.1.0
  description: |
    Comprehensive API for managing resources.
    
    ## Authentication
    All requests require an API key in the Authorization header.
    
  contact:
    name: API Support
    email: api@example.com
    url: https://example.com/support
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT
```

## Organizing API Specs :folder-tree:

### Recommended: Subdirectories with Documentation

Organize each API in its own folder with an `index.md` for additional context:

```
api-specs/
├── authentication/
│   ├── index.md              # Getting started, auth flows
│   └── auth-api.yaml         # OpenAPI spec
├── users/
│   ├── index.md              # User management guide
│   └── users-api.yaml
└── orders/
    ├── index.md              # Order processing docs
    └── orders-api.yaml
```

**Benefits**:
- Provide context and examples alongside the spec
- Include authentication guides and tutorials
- Document common use cases and workflows

### Simple: Flat Structure

For simple APIs, you can use a flat structure:

```
api-specs/
├── authentication-api.yaml
├── users-api.yaml
└── orders-api.yaml
```

### By Version

Organize by API version:

```
api-specs/
├── v1/
│   ├── users/
│   │   ├── index.md
│   │   └── users-api.yaml
│   └── orders/
│       ├── index.md
│       └── orders-api.yaml
└── v2/
    ├── users/
    │   ├── index.md
    │   └── users-api.yaml
    └── orders/
        ├── index.md
        └── orders-api.yaml
```

## OpenAPI 3.x Features :sparkles:

### Authentication

Define security schemes:

```yaml
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    ApiKey:
      type: apiKey
      in: header
      name: X-API-Key

security:
  - BearerAuth: []
```

### Request Bodies

Define request payloads:

```yaml
paths:
  /users:
    post:
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - name
                - email
              properties:
                name:
                  type: string
                email:
                  type: string
                  format: email
```

### Response Examples

Provide example responses:

```yaml
responses:
  '200':
    description: Successful response
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/User'
        examples:
          basic:
            value:
              id: "usr_123"
              name: "John Doe"
              email: "john@example.com"
```

### Tags

Organize endpoints with tags:

```yaml
paths:
  /users:
    get:
      tags:
        - User Management
      summary: List users
        
  /users/{id}:
    get:
      tags:
        - User Management
      summary: Get user by ID
      
  /orders:
    get:
      tags:
        - Orders
      summary: List orders
```

## Best Practices :lightbulb:

### Clear Descriptions

```yaml
paths:
  /users:
    get:
      summary: List all users
      description: |
        Returns a paginated list of all users in the system.
        
        Use the `page` and `limit` query parameters to control pagination.
        Results are sorted by creation date (newest first) by default.
```

### Examples for Everything

```yaml
parameters:
  - name: limit
    in: query
    schema:
      type: integer
      default: 20
      minimum: 1
      maximum: 100
    example: 50
```

### Reusable Components

```yaml
components:
  parameters:
    PageParam:
      name: page
      in: query
      schema:
        type: integer
        minimum: 1
        default: 1
        
  responses:
    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
```

### Error Responses

Document all error cases:

```yaml
responses:
  '400':
    description: Bad request
  '401':
    description: Unauthorized
  '403':
    description: Forbidden
  '404':
    description: Not found
  '500':
    description: Server error
```

## Validation :check-circle:

Before committing, validate your OpenAPI specs:

### Online Validators
- [Swagger Editor](https://editor.swagger.io/)
- [OpenAPI.tools](https://openapi.tools/)

### CLI Tools

```bash
# Using swagger-cli
npx @apidevtools/swagger-cli validate api-specs/my-api.yaml

# Using openapi-generator
npx @openapitools/openapi-generator-cli validate -i api-specs/my-api.yaml
```

## Interactive Features :hand:

NextDocs will automatically provide:

- **API Explorer** - Browse endpoints by tag
- **Try It Out** - Test API calls directly
- **Schema Viewer** - Inspect data models
- **Code Samples** - See example requests

## Linking from Documentation :link:

Reference your APIs from regular docs:

```markdown
Check out our [User Management API](/api-specs/users-api) for details.

For authentication, see the [Auth API Reference](/api-specs/auth-api).
```

## Updating API Specs :refresh-cw:

1. **Edit** your YAML/JSON file
2. **Validate** the specification
3. **Commit** changes to your repository
4. **Push** to sync with NextDocs
5. **Verify** the API explorer updates

## Common Issues :alert-triangle:

### Invalid YAML Syntax
- Check indentation (use spaces, not tabs)
- Validate structure with a YAML linter
- Ensure quotes are properly closed

### Missing Required Fields
- `openapi` or `swagger` version
- `info.title` and `info.version`
- At least one `path` entry

### $ref Resolution Errors
- Check component names match exactly
- Ensure referenced schemas exist
- Use proper paths: `#/components/schemas/User`

## Example Structure :package:

Complete example repository:

```
your-repo/
├── docs/
│   ├── getting-started.md
│   └── api-overview.md
├── blog/
│   └── 2024-01-15-new-api.md
└── api-specs/
    ├── authentication.yaml
    ├── users.yaml
    ├── orders.yaml
    └── _meta.json (optional: for ordering)
```

## Related Topics :compass:

- [Markdown Guide](/guide/markdown) - Link to API docs
- [Publishing](/guide/publishing) - Sync your API specs
- [File Structure](/guide/structure) - Organize your repository
