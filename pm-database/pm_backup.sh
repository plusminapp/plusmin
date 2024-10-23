
#!/bin/bash

FILENAME=/home/pm/backup/pm-backup`date +%Y%m%d"-"%H%M%S`.sql

docker exec -t pm-database pg_dumpall -c -U pm > $FILENAME
