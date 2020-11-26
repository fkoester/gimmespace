-- Deploy gimmespace:2020-11-23-rename-tables to mysql

BEGIN;

RENAME TABLE carbrands TO VehicleBrand;
RENAME TABLE carcolors TO VehicleColor;
RENAME TABLE cars TO Vehicle;
RENAME TABLE incidents TO Incident;
RENAME TABLE locations TO Location;
RENAME TABLE photos TO Photo;
RENAME TABLE violation_types TO ViolationType;
RENAME TABLE violation_types_incidents TO ViolationTypeIncident;

ALTER TABLE Photo DROP CONSTRAINT Photo_ibfk_1;
ALTER TABLE Photo CHANGE COLUMN incident_id incidentId INTEGER UNSIGNED;
ALTER TABLE Photo CHANGE COLUMN `ignore` ignorePhoto BOOLEAN NOT NULL;

ALTER TABLE ViolationTypeIncident DROP CONSTRAINT ViolationTypeIncident_ibfk_1;
ALTER TABLE ViolationTypeIncident DROP CONSTRAINT ViolationTypeIncident_ibfk_2;
ALTER TABLE ViolationTypeIncident CHANGE COLUMN violation_type_id violationTypeId INTEGER UNSIGNED NOT NULL;
ALTER TABLE ViolationTypeIncident CHANGE COLUMN incident_id incidentId INTEGER UNSIGNED NOT NULL;


UPDATE Incident SET `ignore` = 0 WHERE `ignore` IS NULL;
ALTER TABLE Incident DROP CONSTRAINT Incident_ibfk_1;
ALTER TABLE Incident DROP CONSTRAINT Incident_ibfk_2;
ALTER TABLE Incident CHANGE COLUMN `id` incidentId INTEGER UNSIGNED NOT NULL;
ALTER TABLE Incident CHANGE COLUMN car_id vehicleId VARCHAR(10);
ALTER TABLE Incident CHANGE COLUMN location_id locationId INTEGER UNSIGNED;
ALTER TABLE Incident CHANGE COLUMN `time` seenAt DATETIME;
ALTER TABLE Incident CHANGE COLUMN reported_at reportedAt DATETIME;
ALTER TABLE Incident CHANGE COLUMN `ignore` ignoreIncident BOOLEAN NOT NULL;

ALTER TABLE Location CHANGE COLUMN `id` locationId INTEGER UNSIGNED NOT NULL;
ALTER TABLE Location CHANGE COLUMN `name` displayName VARCHAR(100) NOT NULL;

ALTER TABLE Vehicle DROP CONSTRAINT Vehicle_ibfk_1;
ALTER TABLE Vehicle DROP CONSTRAINT Vehicle_ibfk_2;
ALTER TABLE Vehicle CHANGE COLUMN license_plate vehicleRegistrationId VARCHAR(10) NOT NULL;
ALTER TABLE Vehicle CHANGE COLUMN brand_id vehicleBrandId VARCHAR(20) NOT NULL;
ALTER TABLE Vehicle CHANGE COLUMN color_id vehicleColorId VARCHAR(20) NOT NULL;

ALTER TABLE VehicleBrand CHANGE COLUMN name vehicleBrandId VARCHAR(20) NOT NULL;

ALTER TABLE VehicleColor CHANGE COLUMN name vehicleColorId VARCHAR(20) NOT NULL;

ALTER TABLE ViolationType CHANGE COLUMN `id` violationTypeId INTEGER UNSIGNED NOT NULL;
ALTER TABLE ViolationType CHANGE COLUMN short_name shortName VARCHAR(100) NOT NULL;
ALTER TABLE ViolationType CHANGE COLUMN full_name fullName TEXT NOT NULL;

DROP TABLE alembic_version;

COMMIT;
