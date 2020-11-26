-- Deploy gimmespace:2020-11-23-vehicle-registration to mysql

BEGIN;

CREATE TABLE VehicleRegistration (
  countryCode VARCHAR(2) NOT NULL,
  vehicleRegistrationId VARCHAR(20) NOT NULL,
  firstSeenAt DATE NOT NULL,
  vehicleId INTEGER UNSIGNED NOT NULL,
  PRIMARY KEY (countryCode, vehicleRegistrationId, firstSeenAt, vehicleId)
);

DELETE FROM Vehicle WHERE vehicleRegistrationId = '';

ALTER TABLE Vehicle DROP PRIMARY KEY, ADD COLUMN vehicleId INTEGER UNSIGNED PRIMARY KEY AUTO_INCREMENT first;

INSERT INTO VehicleRegistration (
  countryCode,
  vehicleRegistrationId,
  firstSeenAt,
  vehicleId
)
SELECT
  CASE
    WHEN vehicleRegistrationId LIKE '[PL]%' THEN 'PL'
    WHEN vehicleRegistrationId LIKE '[I]%' THEN 'IT'
    WHEN  vehicleRegistrationId LIKE '[BG]%' THEN 'BG'
    WHEN  vehicleRegistrationId LIKE '[CH]%' THEN 'CH'
    ELSE 'DE'
  END,
  vehicleRegistrationId,
  CURRENT_DATE(),
  vehicleId
FROM Vehicle;

ALTER TABLE Vehicle DROP COLUMN vehicleRegistrationId;

UPDATE Incident incident
JOIN VehicleRegistration registration ON registration.vehicleRegistrationId = incident.vehicleId
SET incident.vehicleId = registration.vehicleId;

ALTER TABLE Incident MODIFY COLUMN vehicleId INTEGER UNSIGNED;

COMMIT;
