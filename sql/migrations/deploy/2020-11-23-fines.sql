-- Deploy gimmespace:2020-11-23-fines to mysql

BEGIN;

CREATE TABLE ViolationFine (
  violationTypeId INTEGER UNSIGNED NOT NULL,
  validFrom DATE NOT NULL,
  amount DECIMAL(7, 2) UNSIGNED NOT NULL,
  PRIMARY KEY (violationTypeId, validFrom)
);

COMMIT;
