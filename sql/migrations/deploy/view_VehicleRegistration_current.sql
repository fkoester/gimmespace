-- Deploy gimmespace:view_VehicleRegistration_current to mysql

BEGIN;

DROP VIEW IF EXISTS VehicleRegistration_current;
CREATE VIEW VehicleRegistration_current AS
  SELECT
    vehicleRegistration.countryCode,
    vehicleRegistration.vehicleRegistrationId,
    vehicleRegistration.firstSeenAt,
    vehicleRegistration.vehicleId
    FROM VehicleRegistration vehicleRegistration
   WHERE NOT EXISTS (
     SELECT 1
       FROM VehicleRegistration vehicleRegistration2
      WHERE (
        vehicleRegistration2.vehicleId = vehicleRegistration.vehicleId
        AND vehicleRegistration2.firstSeenAt > vehicleRegistration.firstSeenAt
      )
   );

COMMIT;
