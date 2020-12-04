-- Deploy gimmespace:2020-12-04-incident-ingore-detail to mysql

BEGIN;

ALTER TABLE Incident ADD COLUMN reportedViaPhone BOOLEAN NOT NULL DEFAULT 0 AFTER ignoreIncident;
ALTER TABLE Incident ADD COLUMN alreadyFined BOOLEAN NOT NULL DEFAULT 0 AFTER reportedViaPhone;

COMMIT;
