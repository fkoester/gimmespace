#! /bin/bash
set -e

function usage() {
  echo "Usage: $0 <dump_file> <target_dir>"
  echo -e "\n  dump_file: The dump file to restore, previously created with dump-instance.sh"
  echo -e "  target_dir: The instance directory to restore the dump into\n"
  echo -e "\n  CAUTION: This command will OVERWRITE all data of the instance in target_dir!\n"
}

if [[ "$1" == "-h" ]]; then
  usage
  exit 0
fi

if [[ "$#" -ne 2 ]]; then
  usage
  exit 1
fi

DUMP_FILE="$1"
TARGET_DIR="$2"

WORKDIR="/var/tmp/gimmespace-dump"

rm -rf "${WORKDIR}"
mkdir -p "${WORKDIR}"

# this fixes the input device is not a TTY .. see https://github.com/docker/compose/issues/5696
export COMPOSE_INTERACTIVE_NO_CLI=1

echo "==> Unpacking compressed tarball..."
tar -C "${WORKDIR}" -x -f "${DUMP_FILE}" --force-local

echo "==> Restoring..."

export $(cat .env | grep MYSQL_ROOT_PASSWORD | xargs)
docker-compose exec db mysql -p${MYSQL_ROOT_PASSWORD} -e "DROP DATABASE IF EXISTS \`gimmespace\`;"
docker-compose exec db mysql -p${MYSQL_ROOT_PASSWORD} -e "CREATE DATABASE \`gimmespace\`;"
docker-compose run --rm --volume "${WORKDIR}/gimmespace.sql:/tmp/gimmespace.sql" db sh -c "mysql --host=db -p${MYSQL_ROOT_PASSWORD} gimmespace < /tmp/gimmespace.sql"

docker-compose exec db mysql -p${MYSQL_ROOT_PASSWORD} -e "DROP DATABASE IF EXISTS \`sqitch\`;"

if [ -f "${WORKDIR}/sqitch.sql" ]; then
    echo "==> Restoring sqitch database..."
    docker-compose exec db mysql -p${MYSQL_ROOT_PASSWORD} -e "CREATE DATABASE \`sqitch\`;"
    docker-compose run --rm --volume "${WORKDIR}/sqitch.sql:/tmp/sqitch.sql" db sh -c "mysql --host=db -p${MYSQL_ROOT_PASSWORD} sqitch < /tmp/sqitch.sql"
fi

echo "==> Cleaning up..."
rm -rf "${WORKDIR}"

echo "==> Successfully restored dump from ${DUMP_FILE} in instance ${TARGET_DIR}!"
