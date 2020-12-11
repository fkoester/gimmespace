-- Deploy gimmespace:2020-12-11-drop-VehicleStat-views to mysql

BEGIN;

DROP VIEW IF EXISTS VehicleStats2;
DROP VIEW IF EXISTS VehicleStats;

COMMIT;
