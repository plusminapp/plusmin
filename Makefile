include dev.env
include stg.env
export

# development dev
dev-pm-frontend-build: export VERSION=${PM_DEV_VERSION}
dev-pm-frontend-build: export PLATFORM=linux/amd64
dev-pm-frontend-build: export PORT=3035
dev-pm-frontend-build: export STAGE=dev
dev-pm-frontend-build:
	cp dev.env pm-frontend/dev.env
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

dev-copy-database:
	./docker-cp.sh database DEV
dev-copy-frontend:
	./docker-cp.sh frontend DEV
dev-copy-backend:
	./docker-cp.sh backend DEV
dev-copy-all: dev-copy-database dev-copy-frontend dev-copy-backend

dev-deploy-frontend:
	scp dev.env box:~/pm/.env
	ssh box 'sudo su -c "cd ~/pm && ~/pm/pm_deploy.sh dev pm-frontend-dev" - ruud'
dev-deploy-backend:
	scp dev.env box:~/pm/.env
	ssh box 'sudo su -c "cd ~/pm && ~/pm/pm_deploy.sh dev pm-backend-dev" - ruud'
dev-deploy-all:
	scp dev.env box:~/pm/.env
	ssh box 'sudo su -c "cd ~/pm && ~/pm/pm_deploy.sh dev" - ruud'

dev-frontend: dev-pm-frontend-build dev-copy-frontend dev-deploy-frontend
dev-backend: dev-pm-backend-build dev-copy-backend dev-deploy-backend
dev-all: dev-build-all dev-copy-all dev-deploy-all

# staging stg
stg-pm-frontend-build: export VERSION=${PM_STG_VERSION}
stg-pm-frontend-build: export PLATFORM=linux/amd64
stg-pm-frontend-build: export PORT=3030
stg-pm-frontend-build: export STAGE=stg
stg-pm-frontend-build:
	cp stg.env pm-frontend/stg.env
	./pm-frontend/docker-build.sh

stg-pm-backend-build: export VERSION=${PM_STG_VERSION}
stg-pm-backend-build: export PLATFORM=linux/amd64
stg-pm-backend-build:
	./pm-backend/docker-build.sh

stg-pm-database-build: export VERSION=${PM_STG_VERSION}
stg-pm-database-build: export PLATFORM=linux/amd64
stg-pm-database-build:
	./pm-database/docker-build.sh

stg-build-all: stg-pm-frontend-build stg-pm-backend-build stg-pm-database-build

stg-copy-database:
	./docker-cp.sh database STG
stg-copy-frontend:
	./docker-cp.sh frontend STG
stg-copy-backend:
	./docker-cp.sh backend STG
stg-copy-all: stg-copy-database stg-copy-frontend stg-copy-backend

stg-deploy-all:
	scp stg.env box:~/pm/.env
	ssh box 'sudo su -c "cd ~/pm && ~/pm/pm_deploy.sh stg" - ruud'

stg-all: stg-build-all stg-copy-all stg-deploy-all

# remote
.PHONY: remote
remote:
	scp remote/* box:~/pm/
