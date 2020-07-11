#!/bin/bash

# Import environment variables
printf "Loading environment variables from\n"

set -o allexport

printf "\t.env-${ENV}\n"
source ./.env-${ENV}

set +o allexport
# END IMPORT

export DEPLOYMENT=run-docker-services
export API_HOST_SCHEME=localhost # Allows WebApp to derive correct API url

# Calculate and set specific values to run with docker-compose with mapped ports

export WEBAPP_PORT=$(expr $PORT_RANGE_START + 61)
export DB_PORT=$(expr $PORT_RANGE_START + 21)
export DB_ADMIN_PORT=$(expr $PORT_RANGE_START + 22)
export DB_PORT_SERVICE=3306
export MONGO_DB_EXPOSED_PORT=$(expr $PORT_RANGE_START + 30)
export MONGO_EXPRESS_UI_EXPOSED_PORT=$(expr $PORT_RANGE_START + 31)

export API_MONGO_DB_PORT=$MONGO_EXPRESS_DB_PORT_SERVICE
export API_MONGO_HOST=mongo
export API_SERVER_PORT=3000                                  # Cannot be changed because docker-compose maps port 3000 to API-SERVER_PUBLIC_PORT
export API_SERVER_PUBLIC_PORT=$(expr $PORT_RANGE_START + 60) # Each customer has a specific port range
export API_DB_PORT=$DB_PORT

# UI env variables
export VUE_APP_API_URL=$API_SERVER_PROTOCOL://localhost:$API_SERVER_PUBLIC_PORT
