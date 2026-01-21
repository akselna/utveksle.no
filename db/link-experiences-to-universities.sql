-- Script to link existing experiences and exchange plans to universities
-- This will update all records that don't have a university_id
-- by matching their university_name to the universities table

-- Link experiences to universities
UPDATE experiences e
SET university_id = u.id
FROM universities u
WHERE e.university_name = u.name
  AND e.university_id IS NULL;

-- Link exchange plans to universities
UPDATE exchange_plans ep
SET university_id = u.id
FROM universities u
WHERE ep.university_name = u.name
  AND ep.university_id IS NULL;

-- Show results for experiences
SELECT
  'Experiences' as table_name,
  COUNT(*) as total_records,
  COUNT(university_id) as linked_to_university,
  COUNT(*) - COUNT(university_id) as not_linked
FROM experiences
UNION ALL
-- Show results for exchange plans
SELECT
  'Exchange Plans' as table_name,
  COUNT(*) as total_records,
  COUNT(university_id) as linked_to_university,
  COUNT(*) - COUNT(university_id) as not_linked
FROM exchange_plans;
