include .env
export

# dev
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

dev-copy-database:
	./docker-cp.sh database
dev-copy-frontend:
	./docker-cp.sh frontend DEV
dev-copy-backend:
	./docker-cp.sh backend DEV
dev-copy-all: dev-copy-database dev-copy-frontend dev-copy-backend

dev-deploy-frontend:
	scp .env box:~/pm
	ssh box 'sudo su -c "cd ~/pm && ~/pm/pm_deploy_frontend.sh" - ruud'
dev-deploy-backend:
	scp .env box:~/pm
	ssh box 'sudo su -c "cd ~/pm && ~/pm/pm_deploy_backend.sh" - ruud'
dev-deploy-all:
	scp .env box:~/pm
	ssh box 'sudo su -c "cd ~/pm && ~/pm/pm_deploy.sh DEV" - ruud'

dev-frontend: dev-pm-frontend-build box-copy-frontend box-deploy-frontend
dev-backend: dev-pm-backend-build box-copy-backend box-deploy-backend
dev-all: dev-build-all box-copy box-deploy-all
