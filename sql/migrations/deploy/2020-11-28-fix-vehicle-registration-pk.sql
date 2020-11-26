-- Deploy gimmespace:2020-11-28-fix-vehicle-registration-pk to mysql

BEGIN;

ALTER TABLE VehicleRegistration DROP PRIMARY KEY;
ALTER TABLE VehicleRegistration ADD CONSTRAINT PRIMARY KEY (countryCode, vehicleRegistrationId, firstSeenAt);

COMMIT;
