-- Deploy gimmespace:2021-04-11-Incident_seenUntil to mysql

BEGIN;

ALTER TABLE Incident ADD COLUMN seenUntil DATETIME AFTER seenAt;

UPDATE Incident incident
   SET incident.seenUntil = (
     SELECT MAX(photo.timestamp)
       FROM Photo photo
      WHERE photo.incidentId = incident.incidentId
   );

COMMIT;
