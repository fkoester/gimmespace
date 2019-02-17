#! /bin/bash
set -e

INPUT_FILE="${1}"
filename="${INPUT_FILE%.*}"
BIN_FILE="${filename}.bin"
# GPX_FILE="${filename}.gpx"
JSON_FILE="${filename}.json"
# CSV_FILE="${filename}.csv"

DIR=$(pwd)

ffmpeg -y -i ${1} -codec copy -map 0:2 -f rawvideo ${BIN_FILE}
# docker run --rm -it --volume ${DIR}:/work/ maestroalubia/gopro gopro2gpx -i "/work/${BIN_FILE}" -o "/work/${GPX_FILE}" -f 0 -a 100000
docker run --rm -it --volume ${DIR}:/work/ maestroalubia/gopro gopro2json -i "/work/${BIN_FILE}" -o "/work/${JSON_FILE}"
# docker run --rm -it --volume ${DIR}:/work/ maestroalubia/gopro gpmd2csv -i "/work/${BIN_FILE}" -o "/work/${CSV_FILE}"

rm -f ${BIN_FILE}
