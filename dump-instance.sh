#! /bin/bash
set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

SOURCE_DIR="${SCRIPT_DIR}"
TARGET_DIR="${SCRIPT_DIR}/backups"

WORKDIR="/var/tmp/gimmespace-dump"

TIMESTAMP=$(date +"%Y-%m-%d-%H:%M:%S")
TARGET_FILE="${TARGET_DIR}/gimmespace-dump-${TIMESTAMP}.tar.xz"

rm -rf "${WORKDIR}"
mkdir -p "${WORKDIR}"
chmod -R a+rwx "${WORKDIR}"

# this fixes the input device is not a TTY .. see https://github.com/docker/compose/issues/5696
export COMPOSE_INTERACTIVE_NO_CLI=1

export $(cat .env | grep MYSQL_ROOT_PASSWORD | xargs)
docker-compose exec db mysqldump -p${MYSQL_ROOT_PASSWORD} --routines gimmespace > "${WORKDIR}/gimmespace.sql" || (cat "${WORKDIR}/gimmespace.sql"; exit 1)
docker-compose exec db mysqldump -p${MYSQL_ROOT_PASSWORD} --routines sqitch > "${WORKDIR}/sqitch.sql" || (cat "${WORKDIR}/sqitch.sql"; exit 1)

echo "==> Creating compressed tarball of files..."
tar -c -J -C "${WORKDIR}" -f "${TARGET_FILE}" .

echo "==> Cleaning up..."
rm -rf "${WORKDIR}"

echo "==> Successfully created dump in ${TARGET_FILE}"
