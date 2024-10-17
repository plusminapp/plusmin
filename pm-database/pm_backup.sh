
#!/bin/bash

FILENAME=/home/gidh/backup/gidh-backup`date +%Y%m%d"-"%H%M%S`.sql

docker exec -t gidh-database pg_dumpall -c -U gidh > $FILENAME
