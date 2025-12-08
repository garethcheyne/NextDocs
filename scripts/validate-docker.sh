#!/bin/bash
# Docker Setup Validation Script
# Checks if all required files and configurations are present

set -e

COLOR_RESET='\033[0m'
COLOR_GREEN='\033[32m'
COLOR_RED='\033[31m'
COLOR_YELLOW='\033[33m'
COLOR_BLUE='\033[34m'

errors=0
warnings=0

echo "╔════════════════════════════════════════════════════════╗"
echo "║     NextDocs Docker Setup Validation                   ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Function to check file
check_file() {
    if [ -f "$1" ]; then
        echo -e "✓ ${COLOR_GREEN}$1${COLOR_RESET}"
    else
        echo -e "✗ ${COLOR_RED}$1 (missing)${COLOR_RESET}"
        ((errors++))
    fi
}

# Function to check executable
check_executable() {
    if [ -x "$1" ]; then
        echo -e "✓ ${COLOR_GREEN}$1 (executable)${COLOR_RESET}"
    else
        echo -e "⚠ ${COLOR_YELLOW}$1 (not executable)${COLOR_RESET}"
        ((warnings++))
    fi
}

# Function to check directory
check_dir() {
    if [ -d "$1" ]; then
        echo -e "✓ ${COLOR_GREEN}$1${COLOR_RESET}"
    else
        echo -e "⚠ ${COLOR_YELLOW}$1 (will be created on first run)${COLOR_RESET}"
        ((warnings++))
    fi
}

echo -e "${COLOR_BLUE}Checking Docker Compose Files...${COLOR_RESET}"
check_file "docker-compose.prod.yml"
check_file "docker-compose.dev.yml"
check_file "Dockerfile"
check_file "Dockerfile.dev"
check_file ".dockerignore"
echo ""

echo -e "${COLOR_BLUE}Checking Scripts...${COLOR_RESET}"
check_executable "scripts/backup-db.sh"
check_executable "scripts/restore-db.sh"
check_executable "scripts/backup-cron.sh"
check_executable "scripts/postgres-init.sh"
check_executable "scripts/setup-docker.sh"
check_executable "scripts/docker-entrypoint.sh"
echo ""

echo -e "${COLOR_BLUE}Checking Configuration Files...${COLOR_RESET}"
check_file "next.config.ts"
check_file "package.json"
check_file "prisma/schema.prisma"
check_file "Makefile"
echo ""

echo -e "${COLOR_BLUE}Checking Environment...${COLOR_RESET}"
if [ -f ".env" ]; then
    echo -e "✓ ${COLOR_GREEN}.env (exists)${COLOR_RESET}"
    
    # Check required variables
    required_vars=("POSTGRES_PASSWORD" "REDIS_PASSWORD" "NEXTAUTH_SECRET" "ENCRYPTION_KEY")
    for var in "${required_vars[@]}"; do
        if grep -q "^${var}=" .env; then
            value=$(grep "^${var}=" .env | cut -d '=' -f2)
            if [[ "$value" == *"CHANGE"* ]] || [[ "$value" == *"your_"* ]]; then
                echo -e "  ⚠ ${COLOR_YELLOW}${var} needs to be updated${COLOR_RESET}"
                ((warnings++))
            else
                echo -e "  ✓ ${COLOR_GREEN}${var} (configured)${COLOR_RESET}"
            fi
        else
            echo -e "  ✗ ${COLOR_RED}${var} (missing)${COLOR_RESET}"
            ((errors++))
        fi
    done
else
    echo -e "⚠ ${COLOR_YELLOW}.env (not found - run scripts/setup-docker.sh)${COLOR_RESET}"
    ((warnings++))
fi
echo ""

echo -e "${COLOR_BLUE}Checking Directories...${COLOR_RESET}"
check_dir "backups"
check_dir "src"
check_dir "public"
check_dir "prisma"
echo ""

echo -e "${COLOR_BLUE}Checking Next.js Configuration...${COLOR_RESET}"
if grep -q "output.*standalone" next.config.ts; then
    echo -e "✓ ${COLOR_GREEN}Next.js standalone mode enabled${COLOR_RESET}"
else
    echo -e "✗ ${COLOR_RED}Next.js standalone mode not configured${COLOR_RESET}"
    ((errors++))
fi
echo ""

echo -e "${COLOR_BLUE}Checking Docker...${COLOR_RESET}"
if command -v docker &> /dev/null; then
    echo -e "✓ ${COLOR_GREEN}Docker installed${COLOR_RESET}"
    docker --version
else
    echo -e "✗ ${COLOR_RED}Docker not found${COLOR_RESET}"
    ((errors++))
fi

if command -v docker-compose &> /dev/null || docker compose version &> /dev/null; then
    echo -e "✓ ${COLOR_GREEN}Docker Compose installed${COLOR_RESET}"
    docker-compose --version 2>/dev/null || docker compose version
else
    echo -e "✗ ${COLOR_RED}Docker Compose not found${COLOR_RESET}"
    ((errors++))
fi
echo ""

echo -e "${COLOR_BLUE}Checking Make...${COLOR_RESET}"
if command -v make &> /dev/null; then
    echo -e "✓ ${COLOR_GREEN}Make installed${COLOR_RESET}"
    echo -e "  Run ${COLOR_BLUE}make help${COLOR_RESET} to see all commands"
else
    echo -e "⚠ ${COLOR_YELLOW}Make not found (optional - can use npm scripts)${COLOR_RESET}"
    ((warnings++))
fi
echo ""

echo "════════════════════════════════════════════════════════"
if [ $errors -eq 0 ]; then
    echo -e "${COLOR_GREEN}✓ Validation passed!${COLOR_RESET}"
    if [ $warnings -gt 0 ]; then
        echo -e "${COLOR_YELLOW}  $warnings warning(s) - see above${COLOR_RESET}"
    fi
    echo ""
    echo "Next steps:"
    if [ ! -f ".env" ]; then
        echo "  1. Run: bash scripts/setup-docker.sh"
    fi
    echo "  2. Start production: make prod-up"
    echo "  3. View logs: make prod-logs"
    echo "  4. Check health: make health"
    exit 0
else
    echo -e "${COLOR_RED}✗ Validation failed with $errors error(s)${COLOR_RESET}"
    if [ $warnings -gt 0 ]; then
        echo -e "${COLOR_YELLOW}  $warnings warning(s)${COLOR_RESET}"
    fi
    echo ""
    echo "Please fix the errors above before proceeding."
    exit 1
fi
