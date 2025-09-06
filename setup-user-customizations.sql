-- Setup user customizations table for personalize items
-- This table stores what users have purchased and can use

-- Create user_customizations table
CREATE TABLE IF NOT EXISTS user_customizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    item_type TEXT NOT NULL,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, item_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_customizations_user_id ON user_customizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_customizations_item_type ON user_customizations(item_type);
CREATE INDEX IF NOT EXISTS idx_user_customizations_active ON user_customizations(is_active);

-- Enable RLS
ALTER TABLE user_customizations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own customizations" ON user_customizations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customizations" ON user_customizations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customizations" ON user_customizations
    FOR UPDATE USING (auth.uid() = user_id);

-- Add some sample data for testing (optional)
-- INSERT INTO user_customizations (user_id, item_id, item_name, item_type) 
-- VALUES ('user-uuid-here', 'gold-name', 'Golden Username', 'name-effect');

-- Create equipped_items table to track what users have equipped
CREATE TABLE IF NOT EXISTS equipped_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    equipped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_equipped BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, item_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_equipped_items_user_id ON equipped_items(user_id);
CREATE INDEX IF NOT EXISTS idx_equipped_items_equipped ON equipped_items(is_equipped);

-- Enable RLS
ALTER TABLE equipped_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own equipped items" ON equipped_items
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own equipped items" ON equipped_items
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own equipped items" ON equipped_items
    FOR UPDATE USING (auth.uid() = user_id);
