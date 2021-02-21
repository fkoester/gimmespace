#! /bin/bash

NUM=${1}

DIR="/run/media/fabian/gopro/Gopro/snapshots/"
#DIR="/mnt/gopro-hdd/Gopro/snapshots/"

mogrify -rotate 180 ${DIR}/vlcsnap-GX0*1${NUM}.MP4*
