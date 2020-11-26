-- Deploy gimmespace:2020-11-29-incident-default to mysql

BEGIN;

ALTER TABLE Incident MODIFY COLUMN ignoreIncident BOOLEAN NOT NULL DEFAULT FALSE;

COMMIT;
