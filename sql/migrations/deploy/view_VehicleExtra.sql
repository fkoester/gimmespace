-- Deploy gimmespace:view_VehicleExtra to mysql

BEGIN;

DROP VIEW IF EXISTS VehicleExtra;
CREATE VIEW VehicleExtra AS
  SELECT
    vehicle.vehicleId,
    vehicleRegistration.countryCode,
    vehicleRegistration.vehicleRegistrationId,
    CONCAT(vehicleRegistration.countryCode, ' ', vehicleRegistration.vehicleRegistrationId) AS licensePlate,
    vehicleRegistration.firstSeenAt,
    vehicleBrand.vehicleBrandId,
    vehicleColor.vehicleColorId
    FROM Vehicle vehicle
           JOIN VehicleRegistration vehicleRegistration ON vehicleRegistration.vehicleId = vehicle.vehicleId
           JOIN VehicleBrand vehicleBrand ON vehicleBrand.vehicleBrandId = vehicle.vehicleBrandId
           JOIN VehicleColor vehicleColor ON vehicleColor.vehicleColorId = vehicle.vehicleColorId;


COMMIT;
