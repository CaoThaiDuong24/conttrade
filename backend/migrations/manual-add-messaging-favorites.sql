-- Manual Migration: Add Messaging, Favorites, Reviews Tables
-- Created: 2024
-- Purpose: Support direct marketplace transactions (Phase 1)

-- 1. Create conversations table (lowercase to match existing schema)
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT NOT NULL,
    listing_id TEXT NOT NULL,
    buyer_id TEXT NOT NULL,
    seller_id TEXT NOT NULL,
    last_message_at TIMESTAMP(3),
    buyer_unread INTEGER NOT NULL DEFAULT 0,
    seller_unread INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT conversations_pkey PRIMARY KEY (id)
);

-- 2. Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id TEXT NOT NULL,
    conversation_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    content TEXT NOT NULL,
    attachments JSONB,
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMP(3),
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT messages_pkey PRIMARY KEY (id)
);

-- 3. Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    listing_id TEXT NOT NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT favorites_pkey PRIMARY KEY (id)
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS conversations_listing_id_idx ON conversations(listing_id);
CREATE INDEX IF NOT EXISTS conversations_buyer_id_idx ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS conversations_seller_id_idx ON conversations(seller_id);

CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_is_read_idx ON messages(is_read);

CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON favorites(user_id);
CREATE INDEX IF NOT EXISTS favorites_listing_id_idx ON favorites(listing_id);

-- 5. Add unique constraint to favorites
CREATE UNIQUE INDEX IF NOT EXISTS favorites_user_id_listing_id_key ON favorites(user_id, listing_id);

-- 6. Add foreign keys
DO $$ 
BEGIN
    -- Conversations FKs
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'conversations_listing_id_fkey') THEN
        ALTER TABLE conversations ADD CONSTRAINT conversations_listing_id_fkey 
        FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'conversations_buyer_id_fkey') THEN
        ALTER TABLE conversations ADD CONSTRAINT conversations_buyer_id_fkey 
        FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'conversations_seller_id_fkey') THEN
        ALTER TABLE conversations ADD CONSTRAINT conversations_seller_id_fkey 
        FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Messages FKs
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'messages_conversation_id_fkey') THEN
        ALTER TABLE messages ADD CONSTRAINT messages_conversation_id_fkey 
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'messages_sender_id_fkey') THEN
        ALTER TABLE messages ADD CONSTRAINT messages_sender_id_fkey 
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Favorites FKs
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'favorites_user_id_fkey') THEN
        ALTER TABLE favorites ADD CONSTRAINT favorites_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'favorites_listing_id_fkey') THEN
        ALTER TABLE favorites ADD CONSTRAINT favorites_listing_id_fkey 
        FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 7. Verify tables created
SELECT 'conversations' AS table_name, COUNT(*) AS row_count FROM conversations
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'favorites', COUNT(*) FROM favorites;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Migration completed successfully!';
    RAISE NOTICE '   - Created 3 tables: conversations, messages, favorites';
    RAISE NOTICE '   - Added 7 foreign keys';
    RAISE NOTICE '   - Created 9 indexes';
END $$;
