import os

from sqlalchemy import (Boolean, Column, DateTime, Float, ForeignKey, Integer,
                        String, Table, create_engine)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from xdg.BaseDirectory import xdg_data_home

data_dir = os.path.join(xdg_data_home, 'gimmespace')
database_path = os.path.join(data_dir, 'database.sqlite')
os.makedirs(data_dir, exist_ok=True)
engine = create_engine('sqlite:///{}'.format(database_path))

Base = declarative_base()


class Location(Base):
    __tablename__ = 'locations'
    id = Column(Integer, primary_key=True)
    longitude = Column(Float)
    latitude = Column(Float)
    postcode = Column(String)
    street = Column(String)
    housenumber = Column(String)
    name = Column(String)
    description = Column(String)
    incidents = relationship('Incident', backref='location')


class Photo(Base):
    __tablename__ = 'photos'
    filename = Column(String, primary_key=True)
    dirpath = Column(String)
    timestamp = Column(DateTime)
    longitude = Column(Float)
    latitude = Column(Float)
    incident_id = Column(Integer, ForeignKey('incidents.id'))
    ignore = Column(Boolean, default=False)


class CarBrand(Base):
    __tablename__ = 'carbrands'
    name = Column(String, primary_key=True)
    cars = relationship('Car', backref='brand')


class CarColor(Base):
    __tablename__ = 'carcolors'
    name = Column(String, primary_key=True)
    cars = relationship('Car', backref='color')


class Car(Base):
    __tablename__ = 'cars'
    license_plate = Column(String, primary_key=True)
    incidents = relationship('Incident', backref='car')
    brand_id = Column(Integer, ForeignKey('carbrands.name'))
    color_id = Column(Integer, ForeignKey('carcolors.name'))


class ViolationType(Base):
    __tablename__ = 'violation_types'
    id = Column(Integer, primary_key=True)
    short_name = Column(String)
    full_name = Column(String)


class Incident(Base):
    __tablename__ = 'incidents'
    id = Column(Integer, primary_key=True)

    car_id = Column(Integer, ForeignKey('cars.license_plate'))
    location_id = Column(Integer, ForeignKey('locations.id'))
    time = Column(DateTime)
    photos = relationship('Photo', backref='incident')
    reported_at = Column(DateTime)
    ignore = Column(Boolean, default=False)
    comment = Column(String)
    violations = relationship('ViolationType',
                              secondary=Table('violation_types_incidents', Base.metadata,
                                              Column('violation_type_id',
                                                     ForeignKey('violation_types.id'),
                                                     primary_key=True),
                                              Column('incident_id',
                                                     ForeignKey('incidents.id'),
                                                     primary_key=True)),
                              backref='incidents')


Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
