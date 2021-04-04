-- Deploy gimmespace:2021-04-04-fix-photo-timestamps to mysql

BEGIN;

UPDATE Incident incident
       JOIN Photo photo ON (
         photo.incidentId = incident.incidentId
         AND photo.filename LIKE "vlcsnap-%"
         AND DATE(photo.timestamp) >= "2021-03-28"
         AND incident.seenAt = photo.timestamp
       )
   SET incident.seenAt = DATE_ADD(incident.seenAt, INTERVAL "57.50" MINUTE_SECOND);

UPDATE Photo photo
   SET photo.timestamp = DATE_ADD(photo.timestamp, INTERVAL "57.50" MINUTE_SECOND)
 WHERE (
   photo.filename LIKE "vlcsnap-%"
   AND DATE(photo.timestamp) >= "2021-03-28"
 );

COMMIT;
