-- Deploy gimmespace:2020-11-26_violation_type_fines to mysql

BEGIN;

ALTER TABLE ViolationFine ADD COLUMN tbnr INTEGER UNSIGNED;

INSERT INTO ViolationFine (
  violationTypeId,
  validFrom,
  amount,
  tbnr
) VALUES (
  1,
  '2017-11-01',
  20,
  112402
), (
  1,
  '2020-04-28',
  55,
  112454
), (
  2,
  '2017-11-01',
  10,
  112372
), (
  3,
  '2019-01-01',
  40,
  NULL
), (
  4,
  '2017-11-01',
  15,
  142104
), (
  5,
  '2017-11-01',
  15,
  112263
), (
  6,
  '2017-11-01',
  25,
  141313
), (
  6,
  '2020-04-28',
  40,
  141313
), (
  7,
  '2017-11-01',
  25,
  141245
), (
  8,
  '2017-11-01',
  25,
  141293
), (
  8,
  '2020-04-28',
  40,
  141293
), (
  9,
  '2017-11-01',
  25,
  141323
), (
  9,
  '2020-04-28',
  40,
  141323
), (
  10,
  '2017-11-01',
  30,
  141101
), (
  10,
  '2020-04-28',
  80,
  141778
), (
  11,
  '2017-11-01',
  15,
  141312
), (
  11,
  '2020-04-28',
  25,
  141312
), (
  12,
  '2017-11-01',
  10,
  142103
), (
  13,
  '2017-11-01',
  20,
  141100
), (
  13,
  '2020-04-28',
  55,
  141174
), (
  14,
  '2017-11-01',
  15,
  141292
), (
  14,
  '2020-04-28',
  25,
  141292
), (
  15,
  '2017-11-01',
  15,
  141001
), (
  15,
  '2020-04-28',
  50,
  141070
), (
  16,
  '2020-04-28',
  55,
  142284
), (
  17,
  '2017-11-01',
  35,
  141050
), (
  17,
  '2020-04-28',
  55,
  141056
), (
  18,
  '2017-11-01',
  20,
  112412
), (
  18,
  '2020-04-28',
  55,
  112464
), (
  19,
  '2017-11-01',
  15,
  112263
), (
  20,
  '2017-11-01',
  30,
  141101
), (
  20,
  '2020-04-28',
  70,
  141775
), (
  21,
  '2017-11-01',
  15,
  112062
), (
  22,
  '2017-11-01',
  30,
  112403
), (
  22,
  '2020-04-28',
  70,
  112655
), (
  23,
  '2017-11-01',
  10,
  112262
), (
  24,
  '2017-11-01',
  15,
  141322
), (
  24,
  '2020-04-28',
  25,
  141322
), (
  25,
  '2017-11-01',
  15,
  141202
), (
  26,
  '2017-11-01',
  20,
  142106
), (
  27,
  '2017-11-01',
  30,
  112404
), (
  27,
  '2020-04-28',
  70,
  112656
), (
  28,
  '2017-11-01',
  30,
  105112
), (
  29,
  '2017-11-01',
  10,
  141402
), (
  29,
  '2020-04-28',
  55,
  141402
), (
  30,
  '2017-11-01',
  120,
  105607
);

COMMIT;