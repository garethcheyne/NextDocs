-- Check current users and their providers
SELECT id, email, name, provider, password FROM "User" 
WHERE provider IS NOT NULL 
ORDER BY provider, email;