-- Deploy gimmespace:2020-11-25-location-geo to mysql

BEGIN;

ALTER TABLE Location ADD COLUMN geolocation POINT NOT NULL AFTER latitude;
UPDATE Location SET geolocation = POINT(longitude, latitude);
ALTER TABLE Location DROP COLUMN longitude;
ALTER TABLE Location DROP COLUMN latitude;

COMMIT;
