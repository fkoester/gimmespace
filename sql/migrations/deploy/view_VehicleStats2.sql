-- Deploy gimmespace:view_VehicleStats2 to mysql

BEGIN;

DROP VIEW IF EXISTS VehicleStats2;
CREATE VIEW VehicleStats2 AS
  SELECT
    stats.*,
    DATEDIFF(stats.lastSeenAt, stats.firstSeenAt) AS days,
    stats.amountTotal / DATEDIFF(stats.lastSeenAt, stats.firstSeenAt) * 30 AS finesPerMonth
    FROM VehicleStats stats;

COMMIT;
