-- Deploy gimmespace:view_PhotoExtra to mysql

BEGIN;

DROP VIEW IF EXISTS PhotoExtra;
CREATE VIEW PhotoExtra AS
  SELECT
    photo.filename,
    photo.dirpath,
    photo.timestamp,
    photo.geolocation,
    photo.ignorePhoto,
    incident.incidentId,
    incident.seenAt,
    incident.reportedAt,
    incident.comment,
    incident.valvePositionFrontLeft,
    incident.valvePositionFrontRight,
    incident.valvePositionRearLeft,
    incident.valvePositionRearRight,
    incident.ignoreIncident,
    incident.reportedViaPhone,
    incident.alreadyFined,
    vehicle.vehicleId,
    vehicle.vehicleBrandId,
    vehicle.vehicleColorId,
    vehicleRegistration.countryCode,
    vehicleRegistration.vehicleRegistrationId,
    vehicleRegistration.firstSeenAt,
    location.locationId,
    location.geolocation AS locationGeolocation,
    location.postcode,
    location.street,
    location.housenumber,
    location.displayName,
    location.description
    FROM Photo photo
           LEFT JOIN Incident incident ON incident.incidentId = photo.incidentId
           LEFT JOIN Vehicle vehicle ON vehicle.vehicleId = incident.vehicleId
           LEFT JOIN VehicleRegistration vehicleRegistration ON vehicleRegistration.vehicleId = vehicle.vehicleId
           LEFT JOIN Location location ON location.locationId = incident.locationId;


COMMIT;
