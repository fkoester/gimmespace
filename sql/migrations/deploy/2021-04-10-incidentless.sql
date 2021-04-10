-- Deploy gimmespace:2021-04-10-incidentless to mysql

BEGIN;

ALTER TABLE Photo ADD COLUMN locationId INT UNSIGNED AFTER geolocation;
ALTER TABLE Photo ADD COLUMN vehicleId INT UNSIGNED AFTER locationId;

UPDATE Photo photo
       JOIN Incident incident ON incident.incidentId = photo.incidentId
   SET photo.locationId = incident.locationId,
       photo.vehicleId = incident.vehicleId;


COMMIT;
