#!/bin/bash

# Get commandline parameters
OPS=${1:-up}              # up or down
SERVICE_SET=${2:-db}      # db or all
INTERACTIVE=${3:-no}      # no for not-interactive / i for interactive

IMAGE_PREFIX="imonet"

if [ $OPS == 'help' ]; then
   echo 'usage: docker-mapped.sh OPS(up|down) SERVICE_SET(all|db) INTERACTIVE(i|no)'
   exit 0
fi
# Assert SERVICE_SET is all or db
if [ $SERVICE_SET == 'all' ]; then
   SERVICES="db adminer api web"
elif [ $SERVICE_SET == 'web' ]; then
   SERVICES="web-prepared"   
elif [ $SERVICE_SET == 'db' ]; then
   SERVICES="db adminer"
else
   echo SERVICE_SET ${SERVICE_SET} not defined
   echo 'usage: docker-mapped.sh OPS(up|down) SERVICE_SET(all|db)'
   exit 0
fi


# Import environments
printf "Loading environment variables from\n"

set -o allexport

printf "\t.env\n"
source ./.env

set +o allexport
# END IMPORT

export ENV=prod
export NODE_ENV=production

export DEPLOYMENT=docker-mapped
export API_HOST_SCHEME=localhost # Allows WebApp to derive correct API url

# Calculate and set specific values to run with docker-compose with mapped ports
export API_SERVER_PORT=3000                                   # Cannot be changed because docker-compose maps port 3000 to API-SERVER_PUBLIC_PORT
export API_SERVER_PUBLIC_PORT=`expr $PORT_RANGE_START + 60`   # Each customer has a specific port range
export API_DB_PORT=$DB_PORT

export WEBAPP_PORT=`expr $PORT_RANGE_START + 20`
export DB_PORT=`expr $PORT_RANGE_START + 21`
export DB_ADMIN_PORT=`expr $PORT_RANGE_START + 22`
export DB_PORT_SERVICE=3306
# UI env variables
export VUE_APP_API_URL=$API_SERVER_PROTOCOL://localhost:$API_SERVER_PUBLIC_PORT

# ---------------------------------------------------------------------------------------------------
# up/down for dev environment
# ---------------------------------------------------------------------------------------------------
if [ $OPS == 'up' ]; then
   echo ------------------------------------------------------------------------------------------
   echo Starting imonet stack for environment=${ENV} in mapped-docker mode

   if [ $SERVICE_SET == 'all' ]; then
    echo webapp: $API_SERVER_PROTOCOL://localhost:$WEBAPP_PORT
    echo api: $API_SERVER_PROTOCOL://localhost:$API_SERVER_PUBLIC_PORT
   fi
   echo db running at $DB_PORT
   echo db admin: $API_SERVER_PROTOCOL://localhost:$DB_ADMIN_PORT
   echo ------------------------------------------------------------------------------------------
  
   if [ $INTERACTIVE == 'i' ]; then
    INTERACTIVE_FLAG='' # '-d' for background
   else
       INTERACTIVE_FLAG='-d' # '-d' for background
   fi

   # Start stack
   docker-compose \
      -f docker-compose-prod.yml \
      --project-name "${IMAGE_PREFIX}-${ENV}" \
      --project-directory . \
      $OPS  $INTERACTIVE_FLAG $SERVICES

 else
      echo
      echo Stopping imonet stack for environment=${ENV}
      echo
      docker-compose \
      -f docker-compose-prod.yml \
      --project-name "${IMAGE_PREFIX}-${ENV}" \
      --project-directory . \
      down
 fi
