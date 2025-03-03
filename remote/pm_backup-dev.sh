#!/bin/bash

# dev: dev

FILENAME=~/pm/backup-dev/pm-backup-dev-`date +%Y%m%d"-"%H%M%S`.sql

docker exec -t pm-database-dev pg_dump -c -U pm pm > $FILENAME
