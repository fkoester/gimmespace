-- Deploy gimmespace:view_Evidence to mysql

BEGIN;

DROP VIEW IF EXISTS Evidence;
CREATE VIEW Evidence AS
  SELECT
    CONCAT(location.locationId, "_", vehicle.vehicleId) AS evidenceId,
    MIN(photo.timestamp) AS firstSeenAt,
    MAX(photo.timestamp) AS seenUntil,
    location.locationId,
    location.displayName AS locationDisplayName,
    vehicle.vehicleId,
    vehicleRegistration.vehicleRegistrationId,
    vehicle.vehicleBrandId,
    vehicle.vehicleColorId,
    GROUP_CONCAT(photo.filename SEPARATOR 0x1D) AS filenames
    FROM Photo photo
           JOIN Vehicle vehicle ON vehicle.vehicleId = photo.vehicleId
           JOIN Location location ON location.locationId = photo.locationId
           JOIN VehicleRegistration_current vehicleRegistration ON vehicleRegistration.vehicleId = vehicle.vehicleId
   WHERE (
     photo.vehicleId IS NOT NULL
     AND photo.locationId IS NOT NULL
     AND photo.incidentId IS NULL
   )
   GROUP BY vehicle.vehicleId, location.locationId
   ORDER BY vehicle.vehicleId, MIN(photo.timestamp);

COMMIT;
