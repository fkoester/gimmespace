#! /usr/bin/env python

import configparser
import hashlib
import os.path
import smtplib
import subprocess
import sys
from datetime import datetime
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr
from operator import attrgetter
from os import walk
from string import Template

import PIL.ExifTags
import PIL.Image
import pytz
from GPSPhoto import gpsphoto
from PyInquirer import prompt
from sqlalchemy import and_, or_
from tabulate import tabulate
from xdg.BaseDirectory import xdg_config_home

from models import (Car, CarBrand, CarColor, Incident, Location, Photo,
                    Session, ViolationType)

config_path = os.path.join(xdg_config_home, 'gimmespace', 'config.ini')
config = configparser.ConfigParser()
config.read(config_path)
photos_dir = config['MAIN']['photos_dir']

session = Session()

timezone = pytz.timezone(config['MAIN']['timezone'])


def manage_car_brands_menu():
    choice = prompt({
        'type': 'list',
        'name': 'item',
        'message': 'Manage Car Brands menu',
        'choices': ['List Car Brands', 'Add new Car Brand', 'back', 'Main Menu']
    })['item']
    if choice == 'List Car Brands':
        print(tabulate([[b.name, len(b.cars)] for b in session.query(CarBrand)],
                       headers=['Name', '# Cars']))
        manage_car_brands_menu()

    if choice == 'Add new Car Brand':
        questions = [{
            'type': 'input',
            'name': 'name',
            'message': 'Name',
        }]
        answers = prompt(questions)
        car_brand = CarBrand(**answers)
        session.add(car_brand)
        session.commit()
        print('Car brand "{}" added.'.format(car_brand.name))
        manage_car_brands_menu()

    if choice == 'back':
        manage_cars_menu()

    if choice == 'Main Menu':
        main_menu()


def manage_car_colors_menu():
    choice = prompt({
        'type': 'list',
        'name': 'item',
        'message': 'Manage Car Colors menu',
        'choices': ['List Car Colors', 'Add new Car Color', 'back', 'Main Menu']
    })['item']
    if choice == 'List Car Colors':
        print(tabulate([[c.name, len(c.cars)] for c in session.query(CarColor)],
                       headers=['Name', '# Cars']))
        manage_car_colors_menu()

    if choice == 'Add new Car Color':
        questions = [{
            'type': 'input',
            'name': 'name',
            'message': 'Name',
        }]
        answers = prompt(questions)
        car_brand = CarColor(**answers)
        session.add(car_brand)
        session.commit()
        print('Car color "{}" added.'.format(car_brand.name))
        manage_car_colors_menu()

    if choice == 'back':
        manage_cars_menu()

    if choice == 'Main Menu':
        main_menu()


def add_car_menu(incident=None, license_plate=None):
    if not license_plate:
        license_plate = prompt({
            'type': 'input',
            'name': 'license_plate',
            'message': 'License Plate',
        })['license_plate']

    car = session.query(Car).filter_by(license_plate=license_plate).one_or_none()
    if car:
        print('Car with license plate already exists')
        return

    car_brands = session.query(CarBrand)
    car_brand = None

    if car_brands.first():
        car_brand_name = prompt({
            'type': 'list',
            'name': 'car_brand',
            'message': 'Car Brand',
            'choices': [b.name for b in
                        sorted(car_brands, key=attrgetter('name'))] + ['[Enter new]'],
        })['car_brand']
        if car_brand_name != '[Enter new]':
            car_brand = session.query(CarBrand).filter_by(name=car_brand_name).one_or_none()

    if not car_brand:
        car_brand_name = prompt({
            'type': 'input',
            'name': 'car_brand',
            'message': 'Car Brand',
        })['car_brand']
        car_brand = CarBrand(name=car_brand_name)
        session.commit()

    car_colors = session.query(CarColor)
    car_color = None
    if car_colors.first():
        car_color_name = prompt({
            'type': 'list',
            'name': 'car_color',
            'message': 'Car Color',
            'choices': [c.name for c in
                        sorted(car_colors, key=attrgetter('name'))] + ['[Enter new]'],
        })['car_color']
        if car_color_name != '[Enter new]':
            car_color = session.query(CarColor).filter_by(name=car_color_name).one_or_none()

    if not car_color:
        car_color_name = prompt({
            'type': 'input',
            'name': 'car_color',
            'message': 'Car Color',
        })['car_color']
        car_color = CarColor(name=car_color_name)
        session.commit()

    car = Car(license_plate=license_plate,
              brand=car_brand,
              color=car_color)
    session.add(car)

    if incident:
        incident.car = car

    session.commit()


def manage_cars_menu():
    choice = prompt({
        'type': 'list',
        'name': 'item',
        'message': 'Manage Cars menu',
        'choices': [{
            'name': 'List Cars',
            'value': 'list_cars',
        }, {
            'name': 'Add new Car',
            'value': 'add_car',
        }, {
            'name': 'Edit Car',
            'value': 'edit_car',
        }, {
            'name': 'Manage Car Brands',
            'value': 'manage_car_brands',
        }, {
            'name': 'Manage Car Colors',
            'value': 'manage_car_colors',
        }, {
            'name': 'Back',
            'value': 'back'
        }]
    })['item']
    if choice == 'list_cars':
        print(tabulate([[c.license_plate, c.brand.name, c.color.name, len(c.incidents)]
                        for c in session.query(Car)],
                       headers=['License Plate', 'Brand', 'Color', '# Incidents']))
        manage_cars_menu()

    if choice == 'add_car':
        add_car_menu()
        manage_cars_menu()

    if choice == 'edit_car':
        car = prompt({
            'type': 'list',
            'name': 'car',
            'message': 'Car',
            'choices': [{
                'name': c.license_plate,
                'value': c,
            } for c in session.query(Car)]
        })['car']
        choice = prompt({
            'type': 'list',
            'name': 'item',
            'message': 'Edit {}'.format(car.license_plate),
            'choices': [{
                'name': 'Color: {}'.format(car.color and car.color.name or '<None>'),
                'value': 'color',
            }, {
                'name': 'Brand: {}'.format(car.brand and car.brand.name or '<None>'),
                'value': 'brand',
            }]
        })['item']
        if choice == 'color':
            car_colors = session.query(CarColor)
            car_color = None
            car_color_name = prompt({
                'type': 'list',
                'name': 'car_color',
                'message': 'Car Color',
                'choices': [c.name for c in car_colors] + ['[Enter new]'],
            })['car_color']
            if car_color_name != '[Enter new]':
                car_color = session.query(CarColor).filter_by(name=car_color_name).one_or_none()

            if not car_color:
                car_color_name = prompt({
                    'type': 'input',
                    'name': 'car_color',
                    'message': 'Car Color',
                })['car_color']
                car_color = CarColor(name=car_color_name)
                session.commit()

            car.color = car_color
        elif choice == 'brand':
            car_brands = session.query(CarBrand)
            car_brand = None
            car_brand_name = prompt({
                'type': 'list',
                'name': 'car_brand',
                'message': 'Car Brand',
                'choices': [b.name for b in car_brands] + ['[Enter new]'],
            })['car_brand']
            if car_brand_name != '[Enter new]':
                car_brand = session.query(CarBrand).filter_by(name=car_brand_name).one_or_none()

            if not car_brand:
                car_brand_name = prompt({
                    'type': 'input',
                    'name': 'car_brand',
                    'message': 'Car Brand',
                })['car_brand']
                car_brand = CarBrand(name=car_brand_name)
                session.commit()

            car.brand = car_brand

        session.commit()

        manage_cars_menu()

    if choice == 'manage_car_brands':
        manage_car_brands_menu()

    if choice == 'manage_car_colors':
        manage_car_colors_menu()

    if choice == 'back':
        main_menu()


def manage_violation_types_menu():
    choice = prompt({
        'type': 'list',
        'name': 'item',
        'message': 'Manage Violation Types menu',
        'choices': [{
            'name': 'List Violation Types',
            'value': 'list'
        }, {
            'name': 'Add new Violation Ttype',
            'value': 'add',
        }, {
            'name': 'Edit Violation Type',
            'value': 'edit'
        }, {
            'name': 'Back',
            'value': 'back',
        }]
    })['item']
    if choice == 'list':
        print(tabulate([[v.short_name, len(v.incidents)] for v in session.query(ViolationType)],
                       headers=['Name', '# Incidents']))
        manage_violation_types_menu()

    if choice == 'add':
        questions = [{
            'type': 'input',
            'name': 'short_name',
            'message': 'Short Name',
        }, {
            'type': 'input',
            'name': 'full_name',
            'message': 'Full Name',
        }]
        answers = prompt(questions)
        violation_type = ViolationType(**answers)
        session.add(violation_type)
        session.commit()
        manage_violation_types_menu()

    if choice == 'edit':
        violation_type = prompt({
            'type': 'list',
            'name': 'violation_type',
            'message': 'Violation Type',
            'choices': [{
                'name': v.short_name or '',
                'value': v,
            } for v in session.query(ViolationType)]
        })['violation_type']
        questions = [{
            'type': 'input',
            'name': 'short_name',
            'message': 'Short Name',
            'default': violation_type.short_name or '',
        }, {
            'type': 'input',
            'name': 'full_name',
            'message': 'Full Name',
            'default': violation_type.full_name or '',
        }]
        answers = prompt(questions)
        violation_type.short_name = answers['short_name']
        violation_type.full_name = answers['full_name']
        session.commit()

        manage_violation_types_menu()

    if choice == 'back':
        main_menu()


def add_location_menu(incident=None):
    if incident:
        latitude = incident.photos[0].latitude
        longitude = incident.photos[0].longitude
        subprocess.run(['xdg-open',
                        'https://epsg.io/map#srs=4326&x={lon}&y={lat}&z=19&layer=osm'.format(
                            lat=latitude, lon=longitude)])
        geolocation_default = '{},{}'.format(latitude, longitude)
    else:
        subprocess.run(['xdg-open',
                        'https://epsg.io/map#srs=4326&x={lon}&y={lat}&z=14&layer=osm'.format(
                            lat=50.0058, lon=8.2505)])
        geolocation_default = ''

    questions = [{
        'type': 'input',
        'name': 'geolocation',
        'message': 'Geolocation (lat,lon)',
        'default': geolocation_default,
    }, {
        'type': 'input',
        'name': 'postcode',
        'message': 'Postcode',
    }, {
        'type': 'input',
        'name': 'street',
        'message': 'Street',
    }, {
        'type': 'input',
        'name': 'housenumber',
        'message': 'Housenumber',
    }, {
        'type': 'input',
        'name': 'name',
        'message': 'Name',
    }, {
        'type': 'input',
        'name': 'description',
        'message': 'Description',
    }]
    answers = prompt(questions)
    location = Location(postcode=answers['postcode'],
                        street=answers['street'],
                        housenumber=answers['housenumber'],
                        name=answers['name'],
                        description=answers['description'],
                        latitude=answers['geolocation'].split(',')[0],
                        longitude=answers['geolocation'].split(',')[1])
    session.add(location)
    if incident:
        incident.location = location
        session.commit()


def manage_locations_menu():
    choice = prompt({
        'type': 'list',
        'name': 'item',
        'message': 'Manage Locations menu',
        'choices': [{
            'name': 'List Locations',
            'value': 'list',
        }, {
            'name': 'Add new Location',
            'value': 'add',
        }, {
            'name': 'Edit Location',
            'value': 'edit',
        }, {
            'name': 'Back',
            'value': 'back'
        }]
    })['item']
    if choice == 'list':
        print(tabulate([[l.latitude, l.longitude, l.name, l.street, l.housenumber, len(l.incidents)]
                        for l in session.query(Location)],
                       headers=['Lat', 'Lon', 'Name', 'Street', 'Nr', '# Incidents']))
        manage_locations_menu()
    if choice == 'add':
        add_location_menu()
        manage_locations_menu()

    if choice == 'edit':
        location = prompt({
            'type': 'list',
            'name': 'location',
            'message': 'Location',
            'choices': [{
                'name': l.name,
                'value': l,
            } for l in sorted(session.query(Location), key=attrgetter('name'))]
        })['location']
        questions = [{
            'type': 'input',
            'name': 'name',
            'message': 'Name',
            'default': location.name,
        }, {
            'type': 'input',
            'name': 'description',
            'message': 'Description',
            'default': location.description,
        }, {
            'type': 'input',
            'name': 'postcode',
            'message': 'Postcode',
            'default': location.postcode,
        }, {
            'type': 'input',
            'name': 'street',
            'message': 'Street',
            'default': location.street,
        }, {
            'type': 'input',
            'name': 'housenumber',
            'message': 'Housenumber',
            'default': location.housenumber,
        }]
        answers = prompt(questions)
        location.name = answers['name']
        location.description = answers['description']
        location.postcode = answers['postcode']
        location.street = answers['street']
        location.housenumber = answers['housenumber']
        session.commit()

        manage_locations_menu()

    if choice == 'back':
        main_menu()


def incident_report(incident):
    email_config = config['EMAIL']
    authority_config = config['AUTHORITY']
    sender_config = config['SENDER']

    with open(email_config['template_file']) as template_file:
        template = Template(template_file.read())
        return template.substitute({
            'violation_type': ', '.join(v.full_name for v in incident.violations),
            'incident_comment': '\n{}\n'.format(incident.comment) if incident.comment else '',
            'incident_datetime': incident.time.astimezone(timezone).strftime('%d.%m.%Y %H:%M'),
            'street': incident.location.street,
            'housenumber': incident.location.housenumber,
            'postcode': incident.location.postcode,
            'city': authority_config['city'],
            'location_description': '\n{}\n'.format(incident.location.description)
                                    if incident.location.description else '',
            'car_brand': incident.car.brand.name,
            'car_color': incident.car.color.name,
            'car_license_plate': incident.car.license_plate,
            'sender_name': sender_config['name'],
            'sender_address1': sender_config['address1'],
            'sender_address2': sender_config['address2'],
            'sender_phone': sender_config['phone'],
        })


def incident_report_preview(incident):
    print(incident_report(incident))


def report_incident(incident):
    reports_dir = config['MAIN']['reports_dir']
    email_config = config['EMAIL']
    sender_config = config['SENDER']
    authority_config = config['AUTHORITY']

    now = datetime.now(timezone)
    reports_path = os.path.join(reports_dir, '{:04d}'.format(now.year), '{:02d}'.format(now.month),
                                '{:08d}'.format(incident.id))

    os.makedirs(reports_path, exist_ok=True)

    msg = incident_report(incident)

    with open(os.path.join(reports_path, 'message.txt'), 'w') as message_file:
        message_file.write(msg)

    scale_image = email_config.getfloat('scale_image')
    for photo in incident.photos:
        in_file_path = os.path.join(photo.dirpath, photo.filename)
        out_file_path = os.path.join(reports_path, photo.filename)
        img = PIL.Image.open(in_file_path)

        if 'vlcsnap' not in photo.filename:
            size = img.size
            new_size = (int(size[0] * scale_image), int(size[1] * scale_image))
            img = img.resize(new_size, resample=PIL.Image.LANCZOS)

        img.save(out_file_path, 'JPEG')

    mailer = smtplib.SMTP_SSL(email_config['host'], port=email_config.getint('port'))
    mailer.login(email_config['username'], email_config['password'])
    msg_root = MIMEMultipart()
    msg_root['Subject'] = authority_config['subject']
    msg_root['From'] = formataddr((sender_config['name'], sender_config['email']))
    msg_root['To'] = formataddr((authority_config['name'], authority_config['email']))
    msg_root['User-Agent'] = 'gimmespace'

    msg_alternative = MIMEMultipart('alternative')
    msg_root.attach(msg_alternative)
    msg_alternative.attach(MIMEText(msg))

    for photo in incident.photos:
        file_path = os.path.join(reports_path, photo.filename)
        prt = MIMEBase('application', 'octet-stream')
        prt.set_payload(open(file_path, 'rb').read())
        encoders.encode_base64(prt)
        name_parts = os.path.splitext(photo.filename)
        basename_hash = hashlib.md5(name_parts[0].encode('utf-8')).hexdigest()
        photo_email_filename = basename_hash + name_parts[1]
        prt.add_header('Content-Disposition', 'attachment; filename="{}"'.format(
            photo_email_filename))
        msg_root.attach(prt)

    mailer.sendmail(sender_config['email'], [authority_config['email'], sender_config['email']],
                    msg_root.as_string())

    incident.reported_at = datetime.now()
    session.commit()


def manage_photos_menu():
    photo = prompt({
            'type': 'list',
            'name': 'photo',
            'message': 'Photo',
            'choices': [{
                'name': '{}{}'.format(p.filename, p.ignore and ' (Ignored)' or ''),
                'value': p,
            } for p in sorted(session.query(Photo), key=attrgetter('timestamp'), reverse=True)]
        })['photo']
    photo.ignore = not photo.ignore
    session.commit()
    if photo.ignore:
        print('Photo is now ignored.')
    else:
        print('Photo is now unignored.')

    main_menu()


def manage_incidents_menu():
    incidents = session.query(Incident).order_by(Incident.time.desc())
    choice = prompt({
        'type': 'list',
        'name': 'item',
        'message': 'Manage Incidents menu',
        'choices': [{
            'name': 'List Incidents',
            'value': 'list_incidents',
        }, {
            'name': 'Report Incident',
            'value': 'report_incident',
        }, {
            'name': 'Edit Incident',
            'value': 'edit_incident',
        }, {
            'name': 'Back',
            'value': 'back'
        }]
    })['item']
    if choice == 'list_incidents':
        print(tabulate([[i.id, i.time and i.time.astimezone(timezone),
                         i.location and i.location.name,
                         i.car and i.car.license_plate,
                         len(i.violations),
                         len(i.photos),
                         i.reported_at and i.reported_at.astimezone(timezone) or 'No',
                         i.ignore and 'Yes' or 'No']
                        for i in incidents],
                       headers=['ID', 'Time', 'Location', 'Car', '# Violations', '# Photos',
                                'Reported', 'Ignore']))
        manage_incidents_menu()

    if choice == 'report_incident':
        incident = prompt({
            'type': 'list',
            'name': 'incident',
            'message': 'Incident',
            'choices': [{
                'name': '{} {} {}'.format(i.time and i.time.astimezone(timezone),
                                          i.location and i.location.name,
                                          i.car and i.car.license_plate),
                'value': i,
            } for i in incidents.filter(and_(Incident.reported_at.is_(None),
                                             or_(Incident.ignore.is_(False),
                                                 Incident.ignore.is_(None))))]
        })['incident']
        incident_report_preview(incident)
        open_incident_photos(incident)

        confirm = prompt({
            'type': 'confirm',
            'message': 'Do you want to report that incident?',
            'name': 'continue',
            'default': False,
        })['continue']

        if confirm:
            report_incident(incident)

        manage_incidents_menu()

    if choice == 'edit_incident':
        incident = prompt({
            'type': 'list',
            'name': 'incident',
            'message': 'Incident',
            'choices': [{
                'name': '{} {} {} {}'.format(i.time and i.time.astimezone(timezone),
                                             i.location and i.location.name,
                                             i.car and i.car.license_plate,
                                             i.ignore and '(Ignored)' or ''),
                'value': i,
            } for i in incidents.filter_by(reported_at=None)]
        })['incident']
        open_incident_photos(incident)
        incident_menu(incident)
        manage_incidents_menu()

    if choice == 'back':
        main_menu()


def incident_location_menu(incident):
    location = 'new'
    locations = session.query(Location)
    if locations.first():
        location = prompt({
            'type': 'list',
            'name': 'location',
            'message': 'Location',
            'choices': [{
                'name': l.name,
                'value': l,
            } for l in sorted(locations, key=attrgetter('name'))] + [{
                'name': '[Enter new]',
                'value': 'new',
            }],
        })['location']

    if location == 'new':
        add_location_menu(incident)
        incident_menu(incident)
    else:
        incident.location = location
        session.commit()
        incident_menu(incident)


def incident_car_menu(incident):
    license_plate = prompt({
        'type': 'input',
        'name': 'license_plate',
        'message': 'License Plate',
    })['license_plate']

    car = session.query(Car).filter_by(license_plate=license_plate).one_or_none()

    if car:
        print('Found car: {} {}'.format(car.brand.name, car.color.name))
        incident.car = car
    else:
        add_car_menu(incident=incident, license_plate=license_plate)

    session.commit()
    incident_menu(incident)


def incident_violation_type_menu(incident):
    violation_type = None
    violation_types = session.query(ViolationType)
    if violation_types.first():
        violation_type_short_name = prompt({
            'type': 'list',
            'name': 'violation_type',
            'message': 'Violation Type',
            'choices': [v.short_name for v in
                        sorted(violation_types, key=attrgetter('short_name'))] + ['[Enter new]'],
        })['violation_type']
        if violation_type_short_name != '[Enter new]':
            violation_type = session.query(ViolationType).filter_by(
                short_name=violation_type_short_name).one_or_none()

    if not violation_type:
        questions = [{
            'type': 'input',
            'name': 'short_name',
            'message': 'Short Name',
        }, {
            'type': 'input',
            'name': 'full_name',
            'message': 'Full Name',
        }]
        answers = prompt(questions)
        violation_type = ViolationType(**answers)
        session.add(violation_type)

    if violation_type in incident.violations:
        incident.violations.remove(violation_type)
    else:
        incident.violations.append(violation_type)
    session.commit()
    incident_menu(incident)


def incident_menu(incident):
    violation_type_label = '<None>'
    if len(incident.violations) == 1:
        violation_type_label = incident.violations[0].short_name
    elif len(incident.violations) > 1:
        violation_type_label = ', '.join([v.short_name for v in incident.violations])

    choice = prompt({
        'type': 'list',
        'name': 'item',
        'message': 'Incident Menu',
        'choices': [{
            'name': 'Location: {}'.format(
                incident.location and incident.location.name or '<None>'),
            'value': 'location',
        }, {
            'name': 'Car: {}'.format(incident.car and ', '.join([incident.car.license_plate,
                                                                 incident.car.brand.name,
                                                                 incident.car.color.name])
                                     or '<None>'),
            'value': 'car',
        }, {
            'name': 'Violation Type: {}'.format(violation_type_label),
            'value': 'violation_type',
        }, {
            'name': 'Photos: {}'.format(len(incident.photos) or 'None'),
            'value': 'photos',
        }, {
            'name': 'Ignore: {}'.format('Yes' if incident.ignore else 'No'),
            'value': 'ignore',
        }, {
            'name': 'Next',
            'value': 'next',
        }, {
            'name': 'Report',
            'value': 'report',
        }, {
            'name': 'Delete',
            'value': 'delete',
        }, {
            'name': 'Main Menu',
            'value': 'main_menu',
        }]
    })['item']
    if choice == 'location':
        incident_location_menu(incident)
    if choice == 'car':
        incident_car_menu(incident)
    if choice == 'violation_type':
        incident_violation_type_menu(incident)
    if choice == 'photos':
        incident_photos_menu(incident)
    if choice == 'ignore':
        incident.ignore = not incident.ignore
        session.commit()
    if choice == 'report':
        report_incident(incident)
        manage_incidents_menu()
    if choice == 'delete':
        session.delete(incident)
        session.commit()
    if choice == 'main_menu':
        main_menu()


def incident_photos_menu(incident):
    photo = prompt({
        'type': 'list',
        'name': 'photo',
        'message': 'Remove photo',
        'choices': [{
            'name': '{}'.format(p.filename),
            'value': p,
        } for p in incident.photos] + [{
            'name': 'Cancel',
            'value': 'cancel',
        }]
    })['photo']

    if photo != 'cancel':
        incident.photos.remove(photo)
        session.commit()


def photo_menu(photo):
    previous_incidents = (session.query(Incident)
                          .order_by(Incident.time.desc()))
    choices = [{
        'name': 'Create new Incident',
        'value': 'new_incident',
    }]
    if previous_incidents.first():
        choices.append({
            'name': 'Add to previous Incident',
            'value': 'previous_incident',
        })

    choices += [{
        'name': 'Ignore',
        'value': 'ignore',
    }, {
        'name': 'Main Menu',
        'value': 'main_menu',
    }, {
        'name': 'Quit',
        'value': 'quit',
    }]

    choice = prompt({
        'type': 'list',
        'name': 'item',
        'message': 'Photo {}; {}'.format(photo.filename, photo.timestamp.astimezone(timezone)),
        'choices': choices,
    })['item']
    if choice == 'new_incident':
        incident = Incident(time=photo.timestamp)
        incident.photos.append(photo)
        session.add(incident)
        session.commit()
        incident_menu(incident)
    elif choice == 'previous_incident':
        incident = prompt({
            'type': 'list',
            'name': 'incident',
            'message': 'Previous Incidents',
            'choices': [{
                'name': '{} {} {}'.format(i.time and i.time.astimezone(timezone),
                                          i.location and i.location.name,
                                          i.car and i.car.license_plate),
                'value': i,
            } for i in previous_incidents]
        })['incident']
        incident.photos.append(photo)
        session.commit()
    elif choice == 'ignore':
        photo.ignore = True
        session.commit()
    elif choice == 'main_menu':
        main_menu()
    elif choice == 'quit':
        sys.exit(0)


def unprocessed_photos():
    photos = []
    for (dirpath, dirnames, filenames) in walk(photos_dir):
        for filename in filenames:
            filepath = os.path.join(dirpath, filename)

            photo = session.query(Photo).filter_by(filename=filename).first()

            if photo and photo.incident:
                # print('Photo {} already assinged to incident, skipping...'.format(filename))
                continue

            if photo and photo.ignore:
                # print('Photo {} is being ignored. Skipping...'.format(filename))
                continue

            img = PIL.Image.open(filepath)
            exif = {
                PIL.ExifTags.TAGS[k]: v
                for k, v in img._getexif().items()
                if k in PIL.ExifTags.TAGS
            }

            gpsdata = gpsphoto.getGPSData(filepath)
            latitude = gpsdata.get('Latitude')
            longitude = gpsdata.get('Longitude')

            if not photo:
                timestamp = timezone.localize(datetime.strptime(exif['DateTimeOriginal'],
                                                                '%Y:%m:%d %H:%M:%S'))
                photo = Photo(filename=filename,
                              dirpath=dirpath,
                              timestamp=timestamp,
                              latitude=latitude,
                              longitude=longitude)
                session.add(photo)

            photos.append(photo)
            session.commit()

    return photos


def open_incident_photos(incident):
    for photo in incident.photos:
        subprocess.Popen(['geeqie', '--without-tools',
                          os.path.join(photo.dirpath, photo.filename)],
                         stdout=subprocess.DEVNULL,
                         stderr=subprocess.DEVNULL)


def import_photos():
    geeqie_process = None
    photos = sorted(unprocessed_photos(), key=attrgetter('timestamp'))

    for photo in photos:
        if geeqie_process:
            geeqie_process.kill()

        geeqie_process = subprocess.Popen(['geeqie', '--without-tools',
                                           os.path.join(photo.dirpath, photo.filename)],
                                          stdout=subprocess.DEVNULL,
                                          stderr=subprocess.DEVNULL)
        photo_menu(photo)

    main_menu()


def main_menu():
    choice = prompt({
        'type': 'list',
        'name': 'item',
        'message': 'Main menu',
        'choices': [
            'Import Photos',
            'Manage Photos',
            'Manage Locations',
            'Manage Cars',
            'Manage Violation Types',
            'Manage Incidents',
            'Quit',
        ]
    })['item']
    if choice == 'Import Photos':
        import_photos()
    if choice == 'Manage Photos':
        manage_photos_menu()
    if choice == 'Manage Locations':
        manage_locations_menu()
    if choice == 'Manage Cars':
        manage_cars_menu()
    if choice == 'Manage Violation Types':
        manage_violation_types_menu()
    if choice == 'Manage Incidents':
        manage_incidents_menu()
    if choice == 'Quit':
        sys.exit(0)


main_menu()
