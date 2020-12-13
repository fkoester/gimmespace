-- Deploy gimmespace:2020-12-13-valve-positions to mysql

BEGIN;

ALTER TABLE Incident ADD COLUMN valvePositionFrontLeft TINYINT UNSIGNED AFTER comment;
ALTER TABLE Incident ADD COLUMN valvePositionFrontRight TINYINT UNSIGNED AFTER valvePositionFrontLeft;
ALTER TABLE Incident ADD COLUMN valvePositionRearLeft TINYINT UNSIGNED AFTER valvePositionFrontRight;
ALTER TABLE Incident ADD COLUMN valvePositionRearRight TINYINT UNSIGNED AFTER valvePositionRearLeft;

COMMIT;
