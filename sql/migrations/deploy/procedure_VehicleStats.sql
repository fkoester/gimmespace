-- Deploy gimmespace:procedure_VehicleStats to mysql

BEGIN;

DROP PROCEDURE IF EXISTS VehicleStats;

DELIMITER |

  CREATE PROCEDURE VehicleStats(
    IN startDate DATE,
    IN endDate DATE
  )
  BEGIN
    CREATE TEMPORARY TABLE stats1 (
      vehicleId INT UNSIGNED NOT NULL,
      vehicleRegistrationId VARCHAR(20) NOT NULL,
      incidentsCountTotal INT UNSIGNED NOT NULL,
      incidentCountsReported INT UNSIGNED NOT NULL,
      amountTotal DECIMAL(7,2 ) UNSIGNED NOT NULL,
      firstSeenAt DATETIME NOT NULL,
      lastSeenAt DATETIME NOT NULL
    ) ENGINE=MEMORY;

INSERT INTO stats1
SELECT
  vehicle.vehicleId,
  vehicleRegistration.vehicleRegistrationId,
  (
    SELECT COUNT(incident.incidentId)
      FROM Incident incident
     WHERE (
       incident.vehicleId = vehicle.vehicleId
       AND incident.seenAt >= startDate
       AND incident.seenAt <= endDate
     )
  ) AS incidentsCountTotal,
  (
    SELECT COUNT(incident.incidentId)
      FROM Incident incident
     WHERE (
       incident.vehicleId = vehicle.vehicleId
       AND incident.reportedAt IS NOT NULL
       AND incident.seenAt >= startDate
       AND incident.seenAt <= endDate
     )
  ) AS incidentsCountReported,
  (
    SELECT SUM(violationFine.amount)
      FROM Incident incident
             JOIN ViolationTypeIncident violationTypeIncident ON violationTypeIncident.incidentId = incident.incidentId
             JOIN ViolationFine violationFine ON violationFine.violationTypeId = violationTypeIncident.violationTypeId AND violationFine.validFrom <> '2020-04-28'
     WHERE (
       incident.vehicleId = vehicle.vehicleId
       AND incident.reportedAt IS NOT NULL
       AND incident.seenAt >= startDate
       AND incident.seenAt <= endDate
     )
  ) AS amountTotal,
  (
    SELECT MIN(incident.seenAt)
      FROM Incident incident
     WHERE (
       incident.vehicleId = vehicle.vehicleId
       AND incident.reportedAt IS NOT NULL
       AND incident.seenAt >= startDate
       AND incident.seenAt <= endDate
     )
  ) AS firstSeenAt,
  (
    SELECT MAX(incident.seenAt)
      FROM Incident incident
     WHERE (
       incident.vehicleId = vehicle.vehicleId
       AND incident.reportedAt IS NOT NULL
       AND incident.seenAt >= startDate
       AND incident.seenAt <= endDate
     )
  ) AS lastSeenAt
  FROM Vehicle vehicle
         JOIN VehicleRegistration vehicleRegistration ON vehicleRegistration.vehicleId = vehicle.vehicleId
 ORDER BY amountTotal DESC
 LIMIT 30;

SELECT
  stats.*,
  DATEDIFF(IFNULL(endDate, CURRENT_DATE()), startDate) AS days,
  stats.amountTotal / DATEDIFF(IFNULL(endDate, CURRENT_DATE()), startDate) * 30 AS finesPerMonth
  FROM stats1 stats;

  END |

DELIMITER ;

COMMIT;
