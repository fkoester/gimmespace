-- Deploy gimmespace:view_VehicleStats to mysql

BEGIN;

DROP VIEW IF EXISTS VehicleStats;
CREATE VIEW VehicleStats AS
  SELECT
    vehicle.vehicleId,
    vehicleRegistration.vehicleRegistrationId,
    (
      SELECT COUNT(incidentId)
        FROM Incident
       WHERE vehicleId = vehicle.vehicleId
    ) AS incidentsCountTotal,
    (
      SELECT COUNT(incidentId)
        FROM Incident
       WHERE vehicleId = vehicle.vehicleId AND reportedAt IS NOT NULL
    ) AS incidentsCountReported,
    (
      SELECT SUM(violationFine.amount)
        FROM Incident incident
               JOIN ViolationTypeIncident violationTypeIncident ON violationTypeIncident.incidentId = incident.incidentId
               JOIN ViolationFine violationFine ON violationFine.violationTypeId = violationTypeIncident.violationTypeId AND violationFine.validFrom <> '2020-04-28'
       WHERE (
         incident.vehicleId = vehicle.vehicleId
         AND incident.reportedAt IS NOT NULL
       )
    ) AS amountTotal,
    (
      SELECT MIN(incident.seenAt)
        FROM Incident incident
       WHERE (
         incident.vehicleId = vehicle.vehicleId
         AND incident.reportedAt IS NOT NULL
       )
    ) AS firstSeenAt,
    (
      SELECT MAX(incident.seenAt)
        FROM Incident incident
       WHERE (
         incident.vehicleId = vehicle.vehicleId
         AND incident.reportedAt IS NOT NULL
       )
    ) AS lastSeenAt
    FROM Vehicle vehicle
           JOIN VehicleRegistration vehicleRegistration ON vehicleRegistration.vehicleId = vehicle.vehicleId
   ORDER BY incidentsCountReported DESC;

COMMIT;
