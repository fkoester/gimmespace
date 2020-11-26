-- Deploy gimmespace:2020-11-28-photo-geolocation to mysql

BEGIN;

ALTER TABLE Photo ADD COLUMN geolocation POINT AFTER latitude;
UPDATE Photo SET geolocation = (
  CASE
  WHEN longitude IS NULL THEN NULL
  ELSE POINT(longitude, latitude)
  END
);
ALTER TABLE Photo DROP COLUMN longitude;
ALTER TABLE Photo DROP COLUMN latitude;

COMMIT;
