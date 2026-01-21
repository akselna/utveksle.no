-- Script to merge Italian university duplicates
-- This will move all unique data from duplicate universities to the correct ones
-- and delete duplicate courses before merging

BEGIN;

-- Strategy: Delete duplicate courses, then move remaining data, then delete universities

-- 1. Politecnico di Milano (44) <- Politecnico de Milano (301)
DELETE FROM courses
WHERE university_id = 301
  AND course_code IN (SELECT course_code FROM courses WHERE university_id = 44);
UPDATE courses SET university_id = 44 WHERE university_id = 301;
UPDATE exchange_agreements SET university_id = 44 WHERE university_id = 301;
UPDATE exchange_plans SET university_id = 44 WHERE university_id = 301;
UPDATE experiences SET university_id = 44 WHERE university_id = 301;

-- 2. Politecnico di Torino (63) <- Politec de Torino (300)
DELETE FROM courses
WHERE university_id = 300
  AND course_code IN (SELECT course_code FROM courses WHERE university_id = 63);
UPDATE courses SET university_id = 63 WHERE university_id = 300;
UPDATE exchange_agreements SET university_id = 63 WHERE university_id = 300;
UPDATE exchange_plans SET university_id = 63 WHERE university_id = 300;
UPDATE experiences SET university_id = 63 WHERE university_id = 300;

-- 3. Università degli Studi di Padova (67) <- Universita Degli Studi de Padova (298)
DELETE FROM courses
WHERE university_id = 298
  AND course_code IN (SELECT course_code FROM courses WHERE university_id = 67);
UPDATE courses SET university_id = 67 WHERE university_id = 298;
UPDATE exchange_agreements SET university_id = 67 WHERE university_id = 298;
UPDATE exchange_plans SET university_id = 67 WHERE university_id = 298;
UPDATE experiences SET university_id = 67 WHERE university_id = 298;

-- 4. Università degli Studi di Genova (66) <- Università degli studi di Genova (UniGe) (304)
DELETE FROM courses
WHERE university_id = 304
  AND course_code IN (SELECT course_code FROM courses WHERE university_id = 66);
UPDATE courses SET university_id = 66 WHERE university_id = 304;
UPDATE exchange_agreements SET university_id = 66 WHERE university_id = 304;
UPDATE exchange_plans SET university_id = 66 WHERE university_id = 304;
UPDATE experiences SET university_id = 66 WHERE university_id = 304;

-- 5. Università degli Studi di Firenze (65) <- Universita degli studi Firenze (305)
DELETE FROM courses
WHERE university_id = 305
  AND course_code IN (SELECT course_code FROM courses WHERE university_id = 65);
UPDATE courses SET university_id = 65 WHERE university_id = 305;
UPDATE exchange_agreements SET university_id = 65 WHERE university_id = 305;
UPDATE exchange_plans SET university_id = 65 WHERE university_id = 305;
UPDATE experiences SET university_id = 65 WHERE university_id = 305;

-- 6. Università di Pisa (69) <- Universita de Pisa (303)
DELETE FROM courses
WHERE university_id = 303
  AND course_code IN (SELECT course_code FROM courses WHERE university_id = 69);
UPDATE courses SET university_id = 69 WHERE university_id = 303;
UPDATE exchange_agreements SET university_id = 69 WHERE university_id = 303;
UPDATE exchange_plans SET university_id = 69 WHERE university_id = 303;
UPDATE experiences SET university_id = 69 WHERE university_id = 303;

-- 7. Università di Siena (70) <- Universita Di Siena (306)
DELETE FROM courses
WHERE university_id = 306
  AND course_code IN (SELECT course_code FROM courses WHERE university_id = 70);
UPDATE courses SET university_id = 70 WHERE university_id = 306;
UPDATE exchange_agreements SET university_id = 70 WHERE university_id = 306;
UPDATE exchange_plans SET university_id = 70 WHERE university_id = 306;
UPDATE experiences SET university_id = 70 WHERE university_id = 306;

-- 8. University of Rome Tor Vergata (72) <- Tor Vergata - University of Rome (302)
DELETE FROM courses
WHERE university_id = 302
  AND course_code IN (SELECT course_code FROM courses WHERE university_id = 72);
UPDATE courses SET university_id = 72 WHERE university_id = 302;
UPDATE exchange_agreements SET university_id = 72 WHERE university_id = 302;
UPDATE exchange_plans SET university_id = 72 WHERE university_id = 302;
UPDATE experiences SET university_id = 72 WHERE university_id = 302;

-- 9. Università di Bologna (68) <- The University of Bologna (297)
DELETE FROM courses
WHERE university_id = 297
  AND course_code IN (SELECT course_code FROM courses WHERE university_id = 68);
UPDATE courses SET university_id = 68 WHERE university_id = 297;
UPDATE exchange_agreements SET university_id = 68 WHERE university_id = 297;
UPDATE exchange_plans SET university_id = 68 WHERE university_id = 297;
UPDATE experiences SET university_id = 68 WHERE university_id = 297;

-- 10. Libera Università di Bolzano (62) <- Libero Universita di Bolzano (299)
DELETE FROM courses
WHERE university_id = 299
  AND course_code IN (SELECT course_code FROM courses WHERE university_id = 62);
UPDATE courses SET university_id = 62 WHERE university_id = 299;
UPDATE exchange_agreements SET university_id = 62 WHERE university_id = 299;
UPDATE exchange_plans SET university_id = 62 WHERE university_id = 299;
UPDATE experiences SET university_id = 62 WHERE university_id = 299;

-- Now delete the duplicate universities (they should have no references anymore)
DELETE FROM universities WHERE id IN (297, 298, 299, 300, 301, 302, 303, 304, 305, 306);

-- Also delete these other unused duplicates:
-- University of Bologna (45) - keep Università di Bologna (68)
-- University of Bergamo (71) - not used
DELETE FROM universities WHERE id IN (45, 71);

COMMIT;

-- Show summary of remaining Italian universities
SELECT
  u.id,
  u.name,
  u.city,
  COUNT(DISTINCT c.id) as courses,
  COUNT(DISTINCT ea.id) as agreements,
  COUNT(DISTINCT ep.id) as plans,
  COUNT(DISTINCT e.id) as experiences
FROM universities u
LEFT JOIN courses c ON c.university_id = u.id
LEFT JOIN exchange_agreements ea ON ea.university_id = u.id
LEFT JOIN exchange_plans ep ON ep.university_id = u.id
LEFT JOIN experiences e ON e.university_id = u.id
WHERE u.country = 'Italy'
GROUP BY u.id, u.name, u.city
ORDER BY u.city, u.name;
