#!/bin/bash

# stg: staging

FILENAME=~/pm/backup/pm-backup-`date +%Y%m%d"-"%H%M%S`.sql

docker exec -t pm-database pg_dump -c -U pm pm > $FILENAME
