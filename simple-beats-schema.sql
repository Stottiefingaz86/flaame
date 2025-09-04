-- Simple query to see beats table structure
-- This will show us exactly what columns exist

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'beats'
ORDER BY ordinal_position;
