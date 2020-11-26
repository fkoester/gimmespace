-- Deploy gimmespace:2020-11-23-foreign-keys to mysql

BEGIN;

ALTER TABLE Vehicle ADD CONSTRAINT FOREIGN KEY (vehicleBrandId) REFERENCES VehicleBrand(vehicleBrandId);
ALTER TABLE Vehicle ADD CONSTRAINT FOREIGN KEY (vehicleColorId) REFERENCES VehicleColor(vehicleColorId);

ALTER TABLE VehicleRegistration ADD CONSTRAINT FOREIGN KEY (vehicleId) REFERENCES Vehicle(vehicleId);

ALTER TABLE Incident ADD CONSTRAINT FOREIGN KEY (vehicleId) REFERENCES Vehicle(vehicleId);
ALTER TABLE Incident ADD CONSTRAINT FOREIGN KEY (locationId) REFERENCES Location(locationId);

ALTER TABLE Photo ADD CONSTRAINT FOREIGN KEY (incidentId) REFERENCES Incident(incidentId);

ALTER TABLE ViolationTypeIncident ADD CONSTRAINT FOREIGN KEY (violationTypeId) REFERENCES ViolationType(violationTypeId);
ALTER TABLE ViolationTypeIncident ADD CONSTRAINT FOREIGN KEY (incidentId) REFERENCES Incident(incidentId);

ALTER TABLE ViolationFine ADD CONSTRAINT FOREIGN KEY (violationTypeId) REFERENCES ViolationType(violationTypeId);

COMMIT;
