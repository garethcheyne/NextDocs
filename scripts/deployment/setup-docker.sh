#!/bin/bash
# First-time setup script for NextDocs Docker deployment

set -e

COLOR_RESET='\033[0m'
COLOR_BOLD='\033[1m'
COLOR_GREEN='\033[32m'
COLOR_YELLOW='\033[33m'
COLOR_BLUE='\033[34m'
COLOR_RED='\033[31m'

echo -e "${COLOR_BOLD}╔════════════════════════════════════════════════════════╗${COLOR_RESET}"
echo -e "${COLOR_BOLD}║     NextDocs Docker Environment Setup Wizard          ║${COLOR_RESET}"
echo -e "${COLOR_BOLD}╚════════════════════════════════════════════════════════╝${COLOR_RESET}"
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo -e "${COLOR_YELLOW}⚠️  .env file already exists!${COLOR_RESET}"
    read -p "Do you want to overwrite it? (yes/no): " overwrite
    if [ "$overwrite" != "yes" ]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

# Function to generate random string
generate_random() {
    openssl rand -hex "$1" 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w "$1" | head -n 1
}

# Function to generate secure password
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

echo -e "${COLOR_BLUE}Step 1/6: Environment Type${COLOR_RESET}"
echo "Choose environment type:"
echo "  1) Production"
echo "  2) Development"
read -p "Enter choice [1]: " env_choice
env_choice=${env_choice:-1}

if [ "$env_choice" = "1" ]; then
    ENV_TYPE="production"
    COMPOSE_FILE="docker-compose.prod.yml"
    APP_PORT="9981"
    POSTGRES_PORT="5434"
    REDIS_PORT="6381"
else
    ENV_TYPE="development"
    COMPOSE_FILE="docker-compose.dev.yml"
    APP_PORT="9980"
    POSTGRES_PORT="5433"
    REDIS_PORT="6380"
fi

echo -e "${COLOR_GREEN}✓ Selected: $ENV_TYPE${COLOR_RESET}"
echo ""

echo -e "${COLOR_BLUE}Step 2/6: Generate Secure Passwords${COLOR_RESET}"
POSTGRES_PASSWORD=$(generate_password)
REDIS_PASSWORD=$(generate_password)
NEXTAUTH_SECRET=$(generate_password)
ENCRYPTION_KEY=$(generate_random 32)

echo -e "${COLOR_GREEN}✓ Passwords generated${COLOR_RESET}"
echo ""

echo -e "${COLOR_BLUE}Step 3/6: Application URL${COLOR_RESET}"
if [ "$ENV_TYPE" = "production" ]; then
    read -p "Enter production URL [https://docs.harveynorman.com]: " NEXTAUTH_URL
    NEXTAUTH_URL=${NEXTAUTH_URL:-https://docs.harveynorman.com}
else
    NEXTAUTH_URL="http://localhost:$APP_PORT"
fi
echo -e "${COLOR_GREEN}✓ URL: $NEXTAUTH_URL${COLOR_RESET}"
echo ""

echo -e "${COLOR_BLUE}Step 4/6: Azure AD Configuration${COLOR_RESET}"
read -p "Do you have Azure AD credentials? (yes/no) [no]: " has_azure
has_azure=${has_azure:-no}

if [ "$has_azure" = "yes" ]; then
    read -p "Azure AD Client ID: " AZURE_AD_CLIENT_ID
    read -p "Azure AD Client Secret: " AZURE_AD_CLIENT_SECRET
    read -p "Azure AD Tenant ID: " AZURE_AD_TENANT_ID
else
    AZURE_AD_CLIENT_ID=""
    AZURE_AD_CLIENT_SECRET=""
    AZURE_AD_TENANT_ID=""
fi
echo -e "${COLOR_GREEN}✓ Azure AD configured${COLOR_RESET}"
echo ""

echo -e "${COLOR_BLUE}Step 5/6: Creating .env file${COLOR_RESET}"

# Create .env file
cat > .env << EOF
# NextDocs Environment Configuration
# Generated on $(date)
# Environment: $ENV_TYPE

# Database
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_USER=postgres
POSTGRES_DB=nextdocs
DATABASE_URL=postgresql://postgres:$POSTGRES_PASSWORD@postgres:5432/nextdocs

# Redis
REDIS_PASSWORD=$REDIS_PASSWORD
REDIS_URL=redis://:$REDIS_PASSWORD@redis:6379

# NextAuth
NEXTAUTH_URL=$NEXTAUTH_URL
NEXTAUTH_SECRET=$NEXTAUTH_SECRET

# Encryption
ENCRYPTION_KEY=$ENCRYPTION_KEY

# Azure AD
AZURE_AD_CLIENT_ID=$AZURE_AD_CLIENT_ID
AZURE_AD_CLIENT_SECRET=$AZURE_AD_CLIENT_SECRET
AZURE_AD_TENANT_ID=$AZURE_AD_TENANT_ID

# Application Settings
NODE_ENV=$ENV_TYPE
PORT=$APP_PORT

# Logging
LOG_LEVEL=info

# Feature Flags
ENABLE_SEARCH=true
ENABLE_BLOG=true
ENABLE_API_DOCS=true
ENABLE_MERMAID=true
ENABLE_DRAFT_FILTER=true

# Backup
BACKUP_RETENTION_DAYS=7
EOF

echo -e "${COLOR_GREEN}✓ .env file created${COLOR_RESET}"
echo ""

echo -e "${COLOR_BLUE}Step 6/6: Creating directories${COLOR_RESET}"
mkdir -p backups
chmod +x scripts/*.sh 2>/dev/null || true
echo -e "${COLOR_GREEN}✓ Directories created${COLOR_RESET}"
echo ""

echo -e "${COLOR_BOLD}${COLOR_GREEN}╔════════════════════════════════════════════════════════╗${COLOR_RESET}"
echo -e "${COLOR_BOLD}${COLOR_GREEN}║  ✓ Setup Complete!                                     ║${COLOR_RESET}"
echo -e "${COLOR_BOLD}${COLOR_GREEN}╚════════════════════════════════════════════════════════╝${COLOR_RESET}"
echo ""
echo -e "${COLOR_BOLD}Your credentials:${COLOR_RESET}"
echo -e "  PostgreSQL Password: ${COLOR_YELLOW}$POSTGRES_PASSWORD${COLOR_RESET}"
echo -e "  Redis Password:      ${COLOR_YELLOW}$REDIS_PASSWORD${COLOR_RESET}"
echo ""
echo -e "${COLOR_BOLD}Important:${COLOR_RESET}"
echo -e "  • Credentials saved in ${COLOR_BLUE}.env${COLOR_RESET}"
echo -e "  • Keep this file secure and never commit it to version control"
echo -e "  • Backup your .env file in a secure location"
echo ""
echo -e "${COLOR_BOLD}Next steps:${COLOR_RESET}"

if [ "$ENV_TYPE" = "production" ]; then
    echo -e "  1. Review and edit .env if needed"
    echo -e "  2. Start production: ${COLOR_BLUE}make prod-up${COLOR_RESET} or ${COLOR_BLUE}npm run docker:prod${COLOR_RESET}"
    echo -e "  3. View logs: ${COLOR_BLUE}make prod-logs${COLOR_RESET}"
    echo -e "  4. Access app at: ${COLOR_GREEN}http://localhost:$APP_PORT${COLOR_RESET}"
else
    echo -e "  1. Review and edit .env if needed"
    echo -e "  2. Start development: ${COLOR_BLUE}make dev-up${COLOR_RESET} or ${COLOR_BLUE}npm run docker:dev${COLOR_RESET}"
    echo -e "  3. View logs: ${COLOR_BLUE}make dev-logs${COLOR_RESET}"
    echo -e "  4. Access app at: ${COLOR_GREEN}http://localhost:$APP_PORT${COLOR_RESET}"
fi
echo ""
echo -e "${COLOR_BOLD}Useful commands:${COLOR_RESET}"
echo -e "  • Backup database: ${COLOR_BLUE}make backup${COLOR_RESET}"
echo -e "  • Restore database: ${COLOR_BLUE}make restore${COLOR_RESET}"
echo -e "  • View all commands: ${COLOR_BLUE}make help${COLOR_RESET}"
echo ""
