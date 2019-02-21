#! /bin/bash
set -e

DIR="/run/media/fabian/gopro/Gopro"

pushd "${DIR}"

for i in *.MP4; do
    filename="${i%.*}"
    BIN_FILE="${filename}.bin"
    JSON_FILE="${filename}.json"

    if [ ! -f ${JSON_FILE} ]; then
        echo "${i} not yet processed"
        ffmpeg -y -i ${i} -codec copy -map 0:2 -f rawvideo ${BIN_FILE}
        docker run --rm -it --volume ${DIR}:/work/ maestroalubia/gopro gopro2json -i "/work/${BIN_FILE}" -o "/work/${JSON_FILE}"
        rm -f ${BIN_FILE}
    fi
done

popd

# CSV_FILE="${filename}.csv"
# GPX_FILE="${filename}.gpx"
# docker run --rm -it --volume ${DIR}:/work/ maestroalubia/gopro gopro2gpx -i "/work/${BIN_FILE}" -o "/work/${GPX_FILE}" -f 0 -a 100000
# docker run --rm -it --volume ${DIR}:/work/ maestroalubia/gopro gopro2json -i "/work/${BIN_FILE}" -o "/work/${JSON_FILE}"
# docker run --rm -it --volume ${DIR}:/work/ maestroalubia/gopro gpmd2csv -i "/work/${BIN_FILE}" -o "/work/${CSV_FILE}"

