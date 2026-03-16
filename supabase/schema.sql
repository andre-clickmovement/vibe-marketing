-- LevReg Marketing Skills - Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension (usually enabled by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════
-- Brand Profiles Table
-- Stores the user's brand configuration and foundation data
-- ═══════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS brand_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  -- Foundation fields
  voice_profile TEXT,
  positioning TEXT,
  great_hooks TEXT,

  -- Additional brand context
  audience TEXT,
  competitors TEXT,
  creative_kit TEXT,
  stack TEXT,
  keyword_plan TEXT,

  -- Arrays stored as JSONB
  assets JSONB DEFAULT '[]'::jsonb,
  learnings JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure one profile per user
  UNIQUE(user_id)
);

-- ═══════════════════════════════════════════════════
-- Chat Sessions Table
-- Stores conversation history for each skill
-- ═══════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  skill_id TEXT NOT NULL,

  -- Messages stored as JSONB array
  -- Format: [{ role: 'user' | 'assistant', content: string }]
  messages JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_skill
  ON chat_sessions(user_id, skill_id);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated
  ON chat_sessions(updated_at DESC);

-- ═══════════════════════════════════════════════════
-- Row Level Security (RLS) Policies
-- Ensures users can only access their own data
-- ═══════════════════════════════════════════════════

-- Enable RLS on tables
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Brand Profiles Policies
CREATE POLICY "Users can view their own brand profile"
  ON brand_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own brand profile"
  ON brand_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brand profile"
  ON brand_profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own brand profile"
  ON brand_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Chat Sessions Policies
CREATE POLICY "Users can view their own chat sessions"
  ON chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat sessions"
  ON chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions"
  ON chat_sessions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions"
  ON chat_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════
-- Updated At Trigger
-- Automatically updates the updated_at timestamp
-- ═══════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to brand_profiles
DROP TRIGGER IF EXISTS update_brand_profiles_updated_at ON brand_profiles;
CREATE TRIGGER update_brand_profiles_updated_at
  BEFORE UPDATE ON brand_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to chat_sessions
DROP TRIGGER IF EXISTS update_chat_sessions_updated_at ON chat_sessions;
CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════
-- Optional: Assets Table (if you want normalized storage)
-- Uncomment if you prefer separate asset tracking
-- ═══════════════════════════════════════════════════
/*
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

  type TEXT NOT NULL,
  name TEXT,
  content TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own assets"
  ON assets FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
*/
