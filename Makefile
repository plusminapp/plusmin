include .env
export

dev-pm-backend-build: export VERSION=${PM_DEV_VERSION}
dev-pm-backend-build: export PLATFORM=linux/amd64
dev-pm-backend-build:
	./pm-backend/docker-build.sh

dev-pm-database-build: export VERSION=${PM_DEV_VERSION}
dev-pm-database-build: export PLATFORM=linux/amd64
dev-pm-database-build:
	./pm-database/docker-build.sh

dev-build-all: dev-pm-backend-build dev-pm-database-build

up-all:
	docker compose up -d

down-all:
	docker compose down

