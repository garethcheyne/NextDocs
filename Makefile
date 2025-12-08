# NextDocs Docker Management
# Usage: make <target>
# Example: make prod-up, make dev-build, make backup

.PHONY: help dev-up dev-down dev-build dev-logs prod-up prod-down prod-build prod-rebuild-app prod-logs backup restore clean

# Default target
.DEFAULT_GOAL := help

# Environment files
ENV_FILE := .env
DEV_COMPOSE := docker-compose.dev.yml
PROD_COMPOSE := docker-compose.prod.yml

# Colors for output
COLOR_RESET := \033[0m
COLOR_BOLD := \033[1m
COLOR_GREEN := \033[32m
COLOR_YELLOW := \033[33m
COLOR_BLUE := \033[34m

##@ Help

help: ## Display this help message
	@echo "$(COLOR_BOLD)NextDocs Docker Management$(COLOR_RESET)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "Usage:\n  make $(COLOR_BLUE)<target>$(COLOR_RESET)\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(COLOR_BLUE)%-20s$(COLOR_RESET) %s\n", $$1, $$2 } /^##@/ { printf "\n$(COLOR_BOLD)%s$(COLOR_RESET)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Development

dev-up: ## Start development environment
	@echo "$(COLOR_GREEN)Starting development environment...$(COLOR_RESET)"
	docker-compose -f $(DEV_COMPOSE) up -d
	@echo "$(COLOR_GREEN)✓ Development environment is running$(COLOR_RESET)"
	@echo "  App:      http://localhost:9980"
	@echo "  Postgres: localhost:5433"
	@echo "  Redis:    localhost:6380"

dev-down: ## Stop development environment
	@echo "$(COLOR_YELLOW)Stopping development environment...$(COLOR_RESET)"
	docker-compose -f $(DEV_COMPOSE) down

dev-build: ## Build development images
	@echo "$(COLOR_GREEN)Building development images...$(COLOR_RESET)"
	docker-compose -f $(DEV_COMPOSE) build

dev-rebuild: ## Rebuild and restart development environment
	@echo "$(COLOR_GREEN)Rebuilding development environment...$(COLOR_RESET)"
	docker-compose -f $(DEV_COMPOSE) up -d --build

dev-logs: ## Follow development logs
	docker-compose -f $(DEV_COMPOSE) logs -f

dev-shell: ## Open shell in dev app container
	docker-compose -f $(DEV_COMPOSE) exec app sh

##@ Production

prod-up: ## Start production environment
	@echo "$(COLOR_GREEN)Starting production environment...$(COLOR_RESET)"
	docker-compose -f $(PROD_COMPOSE) up -d
	@echo "$(COLOR_GREEN)✓ Production environment is running$(COLOR_RESET)"
	@echo "  App:      http://localhost:9981"
	@echo "  Postgres: localhost:5434"
	@echo "  Redis:    localhost:6381"

prod-down: ## Stop production environment
	@echo "$(COLOR_YELLOW)Stopping production environment...$(COLOR_RESET)"
	docker-compose -f $(PROD_COMPOSE) down

prod-build: ## Build production images from scratch
	@echo "$(COLOR_GREEN)Building production images (full rebuild)...$(COLOR_RESET)"
	docker-compose -f $(PROD_COMPOSE) build --no-cache

prod-rebuild-app: ## Rebuild ONLY the app (fast rebuild)
	@echo "$(COLOR_GREEN)Rebuilding app only (using cache)...$(COLOR_RESET)"
	docker-compose -f $(PROD_COMPOSE) build app
	docker-compose -f $(PROD_COMPOSE) up -d app
	@echo "$(COLOR_GREEN)✓ App rebuilt and restarted$(COLOR_RESET)"

prod-restart-app: ## Restart app without rebuilding
	@echo "$(COLOR_GREEN)Restarting app...$(COLOR_RESET)"
	docker-compose -f $(PROD_COMPOSE) restart app

prod-logs: ## Follow production logs
	docker-compose -f $(PROD_COMPOSE) logs -f

prod-logs-app: ## Follow app logs only
	docker-compose -f $(PROD_COMPOSE) logs -f app

prod-shell: ## Open shell in production app container
	docker-compose -f $(PROD_COMPOSE) exec app sh

##@ Database

backup: ## Create manual database backup
	@echo "$(COLOR_GREEN)Creating database backup...$(COLOR_RESET)"
	bash scripts/backup-db.sh

backup-now: ## Trigger immediate backup from backup service
	@echo "$(COLOR_GREEN)Triggering backup service...$(COLOR_RESET)"
	docker exec nextdocs-backup-service /backup-cron.sh

restore: ## Restore database from backup (interactive)
	@echo "$(COLOR_YELLOW)Available backups:$(COLOR_RESET)"
	@ls -lh ./backups/backup-*.sql* 2>/dev/null | awk '{print "  " $$9, "(" $$5 ")"}'
	@echo ""
	@read -p "Enter backup filename: " backup_file; \
	bash scripts/restore-db.sh $$backup_file

db-migrate: ## Run database migrations
	docker-compose -f $(PROD_COMPOSE) exec app npx prisma migrate deploy

db-shell: ## Open PostgreSQL shell
	docker exec -it nextdocs-postgres-prod psql -U postgres -d nextdocs

##@ Cleanup

clean: ## Remove all containers, volumes, and images
	@echo "$(COLOR_YELLOW)⚠️  This will remove ALL containers, volumes, and images!$(COLOR_RESET)"
	@read -p "Are you sure? (yes/no): " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		docker-compose -f $(PROD_COMPOSE) down -v; \
		docker-compose -f $(DEV_COMPOSE) down -v; \
		docker system prune -af --volumes; \
		echo "$(COLOR_GREEN)✓ Cleanup complete$(COLOR_RESET)"; \
	else \
		echo "Cleanup cancelled."; \
	fi

clean-dev: ## Remove development containers and volumes
	@echo "$(COLOR_YELLOW)Removing development environment...$(COLOR_RESET)"
	docker-compose -f $(DEV_COMPOSE) down -v
	@echo "$(COLOR_GREEN)✓ Development environment removed$(COLOR_RESET)"

clean-prod: ## Remove production containers (keeps volumes)
	@echo "$(COLOR_YELLOW)Removing production containers...$(COLOR_RESET)"
	docker-compose -f $(PROD_COMPOSE) down
	@echo "$(COLOR_GREEN)✓ Production containers removed (volumes preserved)$(COLOR_RESET)"

##@ Monitoring

status: ## Show status of all containers
	@echo "$(COLOR_BOLD)Production:$(COLOR_RESET)"
	@docker-compose -f $(PROD_COMPOSE) ps
	@echo ""
	@echo "$(COLOR_BOLD)Development:$(COLOR_RESET)"
	@docker-compose -f $(DEV_COMPOSE) ps

health: ## Check health of all services
	@echo "$(COLOR_BOLD)Service Health Status:$(COLOR_RESET)"
	@docker ps --filter "name=nextdocs" --format "table {{.Names}}\t{{.Status}}"

stats: ## Show container resource usage
	docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

##@ Utilities

rebuild-all: prod-down prod-build prod-up ## Full production rebuild (down -> build -> up)

quick-deploy: prod-rebuild-app ## Quick deploy (rebuild app only)
	@echo "$(COLOR_GREEN)✓ Quick deployment complete!$(COLOR_RESET)"

switch-to-dev: prod-down dev-up ## Switch from production to development

switch-to-prod: dev-down prod-up ## Switch from development to production
