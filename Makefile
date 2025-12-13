# =========================
# GLOBAL CONFIG
# =========================
APP_NAME=nestjs-backend
NODE_ENV ?= development
ENV ?= dev

BRANCH ?= main
REMOTE ?= origin

ANSIBLE_DIR=ansible
INVENTORY=$(ANSIBLE_DIR)/inventory/$(ENV).ini

DOCKER_COMPOSE=docker-compose

# =========================
# HELP
# =========================
help:
	@echo ""
	@echo "Available commands:"
	@echo "------------------"
	@echo "Git:"
	@echo "  make checkout BRANCH=feature-x"
	@echo "  make pull BRANCH=main"
	@echo "  make push BRANCH=main"
	@echo "  make commit MSG=\"message\""
	@echo ""
	@echo "Local Dev:"
	@echo "  make install"
	@echo "  make dev"
	@echo "  make build"
	@echo "  make start"
	@echo "  make lint"
	@echo "  make test"
	@echo ""
	@echo "Prisma:"
	@echo "  make prisma-generate"
	@echo "  make migrate"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-up"
	@echo "  make docker-down"
	@echo "  make docker-build"
	@echo ""
	@echo "Deploy (Ansible):"
	@echo "  make setup ENV=prod"
	@echo "  make deploy ENV=prod"
	@echo ""

# =========================
# GIT
# =========================
checkout:
	git fetch $(REMOTE)
	git checkout $(BRANCH)

pull:
	git pull $(REMOTE) $(BRANCH)

push:
	git push $(REMOTE) $(BRANCH)

status:
	git status

commit:
	@if [ -z "$(MSG)" ]; then \
		echo "❌ Commit message required: MSG=\"your message\""; \
		exit 1; \
	fi
	git add .
	git commit -m "$(MSG)"
	git push $(REMOTE) $(BRANCH)

current:
	git branch --show-current

# =========================
# LOCAL DEVELOPMENT
# =========================
install:
	npm install

dev:
	npm run start:dev

build:
	npm run build

start:
	npm run start:prod

lint:
	npm run lint

test:
	npm run test

# =========================
# PRISMA
# =========================
prisma-generate:
	npx prisma generate

migrate:
	npx prisma migrate deploy

seed:
	npx prisma db seed

# =========================
# DOCKER
# =========================
docker-build:
	$(DOCKER_COMPOSE) build

docker-up:
	$(DOCKER_COMPOSE) up -d

docker-down:
	$(DOCKER_COMPOSE) down

docker-logs:
	$(DOCKER_COMPOSE) logs -f api

# =========================
# ANSIBLE (DEPLOY)
# =========================
ansible-check:
	ansible --version

setup:
	ansible-playbook \
		-i $(INVENTORY) \
		$(ANSIBLE_DIR)/playbooks/setup.yml

deploy:
	ansible-playbook \
		-i $(INVENTORY) \
		$(ANSIBLE_DIR)/playbooks/deploy.yml

rollback:
	ansible-playbook \
		-i $(INVENTORY) \
		$(ANSIBLE_DIR)/playbooks/rollback.yml

# =========================
# CI
# =========================
ci:
	make install
	make lint
	make test
	make build
