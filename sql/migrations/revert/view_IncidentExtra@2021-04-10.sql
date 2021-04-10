-- Deploy gimmespace:view_IncidentExtra to mysql

BEGIN;

DROP VIEW IF EXISTS IncidentExtra;
CREATE VIEW IncidentExtra AS
  SELECT
    incident.incidentId,
    vehicle.vehicleId,
    vehicle.vehicleBrandId,
    vehicle.vehicleColorId,
    vehicleRegistration.countryCode,
    vehicleRegistration.vehicleRegistrationId,
    location.locationId,
    location.geolocation,
    location.postcode,
    location.street,
    location.housenumber,
    location.displayName,
    location.description,
    incident.seenAt,
    incident.reportedAt,
    incident.comment,
    incident.valvePositionFrontLeft,
    incident.valvePositionFrontRight,
    incident.valvePositionRearLeft,
    incident.valvePositionRearRight,
    incident.ignoreIncident,
    violationType.violationTypeId,
    violationType.shortName,
    violationType.fullName
    FROM Incident incident
           JOIN Vehicle vehicle ON vehicle.vehicleId = incident.vehicleId
           JOIN VehicleRegistration vehicleRegistration ON vehicleRegistration.vehicleId = incident.vehicleId
           JOIN Location location ON location.locationId = incident.locationId
           JOIN ViolationTypeIncident violationTypeIncident ON violationTypeIncident.incidentId = incident.incidentId
           JOIN ViolationType violationType ON violationType.violationTypeId = violationTypeIncident.violationTypeId;

COMMIT;
