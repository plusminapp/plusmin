include .env
export

dev-gidh-database-build: export VERSION=${GIDH_DEV_VERSION}
dev-gidh-database-build: export PLATFORM=linux/amd64
dev-gidh-database-build:
	./gidh-database/docker-build.sh

up-all:
	docker compose up -d

down-all:
	docker compose down

