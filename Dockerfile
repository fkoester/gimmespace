FROM golang:latest

RUN go get -u github.com/JuanIrache/gopro-utils/bin/gopro2gpx
RUN go get -u github.com/JuanIrache/gopro-utils/bin/gopro2json
RUN go get -u github.com/JuanIrache/gopro-utils/bin/gpmd2csv

CMD gopro2gpx
