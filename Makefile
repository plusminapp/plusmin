include .env
export

dev-pm-frontend-build: export VERSION=${PM_DEV_VERSION}
dev-pm-frontend-build: export PLATFORM=linux/amd64
dev-pm-frontend-build:
	./pm-frontend/docker-build.sh

dev-pm-backend-build: export VERSION=${PM_DEV_VERSION}
dev-pm-backend-build: export PLATFORM=linux/amd64
dev-pm-backend-build:
	./pm-backend/docker-build.sh

dev-pm-database-build: export VERSION=${PM_DEV_VERSION}
dev-pm-database-build: export PLATFORM=linux/amd64
dev-pm-database-build:
	./pm-database/docker-build.sh

dev-build-all: dev-pm-frontend-build dev-pm-backend-build dev-pm-database-build

up-all:
	docker network inspect npm_default >/dev/null 2>&1 || docker network create npm_default
	docker compose up -d

down-all:
	docker compose down

# Box
box-push:
	docker image push rimvanvliet/pm-frontend:${PM_DEV_VERSION}
	docker image push rimvanvliet/pm-backend:${PM_DEV_VERSION}
	docker image push rimvanvliet/pm-database:${PM_DEV_VERSION}

box-deploy-all:
	scp .env box:~/pm
	ssh box 'sudo su -c "cd ~/pm && ~/pm/pm_deploy.sh" - ruud'

box-deploy-frontend:
	scp .env box:~/pm
	ssh box 'sudo su -c "cd ~/pm && ~/pm/pm_deploy_frontend.sh" - ruud'

box-deploy-backend:
	scp .env box:~/pm
	ssh box 'sudo su -c "cd ~/pm && ~/pm/pm_deploy_backend.sh" - ruud'

box-frontend: dev-pm-frontend-build box-push box-deploy-frontend
box-backend: dev-pm-backend-build box-push box-deploy-backend

box-all: dev-build-all box-push box-deploy-all
