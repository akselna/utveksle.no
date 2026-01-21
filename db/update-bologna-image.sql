-- Update Bologna university image to match the one used on the homepage
-- This image is from Unsplash and shows Bologna's historic architecture

UPDATE universities 
SET image_url = 'https://images.unsplash.com/photo-1635469019177-7264fc1e013c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' 
WHERE name IN (
  'Università degli Studi di Bologna',
  'Università di Bologna',
  'University of Bologna',
  'The University of Bologna'
);

