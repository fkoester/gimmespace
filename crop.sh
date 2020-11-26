#! /bin/bash

NUM=${1}

mogrify -crop 3400x1913+220+0 /run/media/fabian/gopro/Gopro/snapshots/vlcsnap-GX0*1${NUM}.MP4*
