#! /bin/bash

NUM=${1}

mogrify -rotate 180 /run/media/fabian/gopro/Gopro/snapshots/vlcsnap-GX0*0${NUM}.MP4*
