#!/bin/bash

# Get commandline parameters
ENV=${1:-dev}        # dev / prod
SERVICE_SET=${2:-db} # db or all
INTERACTIVE=${3:-no} # no for not-interactive / i for interactive
IMAGE_PREFIX="imonet"

if [ $ENV == 'help' ]; then
   echo 'usage: run-docker-services.sh ENV(dev|prod) SERVICE_SET(all|db) INTERACTIVE(i|no)'
   exit 0
fi

# Assert SERVICE_SET is all or db
if [ $SERVICE_SET == 'all' ]; then
   SERVICES="db mongo mongo-express api web"
elif [ $SERVICE_SET == 'db' ]; then
   SERVICES="db adminer mongo mongo-express"
elif [ $SERVICE_SET == 'mongo' ]; then
   SERVICES="mongo mongo-express"
elif [ $SERVICE_SET == 'web-built' ]; then
   SERVICES="web-built"
elif [ $SERVICE_SET == 'build-web' ]; then
   SERVICES="build"
else
   echo SERVICE_SET ${SERVICE_SET} not defined
   echo 'usage: run-docker-services.sh ENV(dev|prod) OPS(up|down) SERVICE_SET(all|db|web-built)'
   exit 0
fi

export ENV
if [ $ENV == 'dev' ]; then
   export NODE_ENV=development
else
   export NODE_ENV=production
fi

source ./source-base-env.sh

export API_MONGO_DB_PORT=27017
echo API_MONGO_DB_PORT=$API_MONGO_DB_PORT
# UI env variables
export VUE_APP_API_URL=$API_SERVER_PROTOCOL://localhost:$API_SERVER_PUBLIC_PORT

echo ------------------------------------------------------------------------------------------
echo Starting imonet stack for environment=${ENV} in mapped-docker mode

if [[ $SERVICES == *"api"* ]]; then
   echo "API:                       $API_SERVER_PROTOCOL://localhost:$API_SERVER_PUBLIC_PORT"
fi

if [[ $SERVICES == *"web"* ]]; then
   echo "WEB:                       $API_SERVER_PROTOCOL://localhost:$WEBAPP_PORT"
fi

if [[ $SERVICES == *"build"* ]]; then
   echo built web service will start
fi

if [[ $SERVICES == *"db"* ]]; then
   echo "MySql exposed at PORT:     $DB_PORT"
fi

if [[ $SERVICES == *"adminer"* ]]; then
   echo "DB admin:                  $API_SERVER_PROTOCOL://localhost:$DB_ADMIN_PORT"
fi

if [[ $SERVICES == *"mongo"* ]]; then
   echo "mongodb exposed at PORT:   $MONGO_DB_EXPOSED_PORT"
   echo "mongo-express:             $API_SERVER_PROTOCOL://localhost:$MONGO_EXPRESS_UI_EXPOSED_PORT"
fi

echo ------------------------------------------------------------------------------------------

if [ $INTERACTIVE == 'i' ]; then
   INTERACTIVE_FLAG='' # '-d' for background
else
   INTERACTIVE_FLAG='-d' # '-d' for background
fi

# Start stack
docker-compose \
   -f docker-compose-with-port-mappings.yml \
   --project-name "${IMAGE_PREFIX}-${ENV}" \
   --project-directory . \
   up $INTERACTIVE_FLAG $SERVICES
