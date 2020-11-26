-- Deploy gimmespace:view_ViolationTypeExtra to mysql

BEGIN;

DROP VIEW IF EXISTS ViolationTypeExtra;
CREATE VIEW ViolationTypeExtra AS
  SELECT
    violationType.violationTypeId,
    violationType.shortName,
    violationType.fullName,
    violationFine.validFrom,
    violationFine.amount,
    violationFine.tbnr
    FROM ViolationType violationType
           LEFT JOIN ViolationFine violationFine ON violationFine.violationTypeId = violationType.violationTypeId;


COMMIT;
