#! /usr/bin/env python

import configparser
import os.path
import sys
from datetime import datetime, timedelta
from os import walk
import re
import json
from fractions import Fraction

from PIL import Image, ImageDraw, ImageFont
import pytz
from xdg.BaseDirectory import xdg_config_home
import piexif


config_path = os.path.join(xdg_config_home, 'gimmespace', 'config.ini')
config = configparser.ConfigParser()
config.read(config_path)
snapshots_dir = config['VIDEOS']['snapshots_dir']
video_metadata_dir = config['VIDEOS']['video_metadata_dir']
photos_dir = config['MAIN']['photos_dir']
watermark_font = config['VIDEOS']['watermark_font']
timezone = pytz.timezone(config['MAIN']['timezone'])


def to_deg(value, loc):
    """convert decimal coordinates into degrees, munutes and seconds tuple
    Keyword arguments: value is float gps-value, loc is direction list ["S", "N"] or ["W", "E"]
    return: tuple like (25, 13, 48.343 ,'N')
    """
    if value < 0:
        loc_value = loc[0]
    elif value > 0:
        loc_value = loc[1]
    else:
        loc_value = ""
    abs_value = abs(value)
    deg = int(abs_value)
    t1 = (abs_value-deg)*60
    min = int(t1)
    sec = round((t1 - min) * 60, 5)
    return (deg, min, sec, loc_value)


def change_to_rational(number):
    """convert a number to rantional
    Keyword arguments: number
    return: tuple like (1, 2), (numerator, denominator)
    """
    f = Fraction(str(number))
    return (f.numerator, f.denominator)


def trackpoint_datetime(trackpoint):
    unix_timestamp = int(trackpoint['utc'] / 1000000)
    return timezone.localize(datetime.fromtimestamp(unix_timestamp))


def find_closest_trackpoint(trackpoints, snapshot_datetime):
    closest_trackpoint = None
    closest_timedelta = None
    for trackpoint in trackpoints:
        trackpoint['datetime'] = trackpoint_datetime(trackpoint)
        trackpoint_delta = abs(snapshot_datetime - trackpoint['datetime'])
        if not closest_timedelta or trackpoint_delta < closest_timedelta:
            closest_trackpoint = trackpoint
            closest_timedelta = trackpoint_delta

    return closest_trackpoint


for (dirpath, dirnames, filenames) in walk(snapshots_dir):
    for filename in filenames:
        filepath = os.path.join(dirpath, filename)

        img = Image.open(filepath)
        m = re.search('^vlcsnap\-(.*?)\-(\d{2})_(\d{2})_(\d{2}).*$', filename)
        video_filename = m.group(1)
        offset_hours = int(m.group(2))
        offset_minutes = int(m.group(3))
        offset_seconds = int(m.group(4))

        json_filename = '{}.json'.format(os.path.splitext(video_filename)[0])
        json_filepath = os.path.join(video_metadata_dir, json_filename)

        with open(json_filepath) as json_data:
            trackpoints = json.load(json_data)['data']
            if not trackpoints:
                print('No trackpoints')
                sys.exit(1)

            start_datetime = trackpoint_datetime(trackpoints[0])
            snapshot_datetime = start_datetime + timedelta(hours=offset_hours,
                                                           minutes=offset_minutes,
                                                           seconds=offset_seconds)

            closest_trackpoint = find_closest_trackpoint(trackpoints, snapshot_datetime)
            lat = closest_trackpoint['lat']
            lon = closest_trackpoint['lon']
            lat_deg = to_deg(lat, ["S", "N"])
            lng_deg = to_deg(lon, ["W", "E"])

            exiv_lat = (change_to_rational(lat_deg[0]),
                        change_to_rational(lat_deg[1]),
                        change_to_rational(lat_deg[2]))
            exiv_lng = (change_to_rational(lng_deg[0]),
                        change_to_rational(lng_deg[1]),
                        change_to_rational(lng_deg[2]))

            exif_ifd = {
                piexif.ExifIFD.DateTimeOriginal:
                    snapshot_datetime.strftime('%Y:%m:%d %H:%M:%S'),
            }
            gps_ifd = {
                piexif.GPSIFD.GPSVersionID: (2, 0, 0, 0),
                piexif.GPSIFD.GPSDateStamp:
                    closest_trackpoint['datetime'].strftime('%Y:%m:%d %H:%M:%S'),
                piexif.GPSIFD.GPSLatitudeRef: lat_deg[3],
                piexif.GPSIFD.GPSLatitude: exiv_lat,
                piexif.GPSIFD.GPSLongitudeRef: lng_deg[3],
                piexif.GPSIFD.GPSLongitude: exiv_lng,
            }
            exif_dict = {"Exif": exif_ifd, "GPS": gps_ifd}
            exif_bytes = piexif.dump(exif_dict)
            img = img.rotate(180)

            width, height = img.size
            watermark_text = snapshot_datetime.strftime('%d.%m.%Y %H:%M:%S')
            draw = ImageDraw.Draw(img)

            font = ImageFont.truetype(watermark_font, 60)
            textwidth, textheight = draw.textsize(watermark_text, font)

            # calculate the x,y coordinates of the text
            margin = 5
            x = width - textwidth - margin
            y = height - textheight - margin

            # draw watermark in the bottom right corner
            draw.text((x, y), watermark_text, font=font)

            output_path = os.path.join(photos_dir,
                                       '{:02d}'.format(snapshot_datetime.year),
                                       '{:02d}'.format(snapshot_datetime.month),
                                       filename)
            if not os.path.isfile(output_path):
                img.save(output_path, 'jpeg', exif=exif_bytes)
