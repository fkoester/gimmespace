-- Deploy gimmespace:2020-11-28-photo-default to mysql

BEGIN;

ALTER TABLE Photo MODIFY COLUMN ignorePhoto BOOLEAN NOT NULL DEFAULT FALSE;

COMMIT;
