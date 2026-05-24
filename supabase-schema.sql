-- ============================================
-- FORGE · Clean Schema — Run this in Supabase SQL Editor
-- Copy ALL of this, paste it, click Run
-- ============================================

-- Step 1: Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id              UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username        TEXT,
  display_name    TEXT,
  identity_type   TEXT DEFAULT 'Operator',
  level           INTEGER DEFAULT 1,
  xp              INTEGER DEFAULT 0,
  streak          INTEGER DEFAULT 0,
  longest_streak  INTEGER DEFAULT 0,
  last_active     DATE,
  life_score      INTEGER DEFAULT 0,
  total_earned    NUMERIC(12,2) DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create domain scores table
CREATE TABLE IF NOT EXISTS domain_scores (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  domain      TEXT NOT NULL,
  score       INTEGER DEFAULT 50,
  level       INTEGER DEFAULT 1,
  title       TEXT DEFAULT 'Starting',
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, domain)
);

-- Step 3: Create missions table
CREATE TABLE IF NOT EXISTS missions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  category    TEXT DEFAULT 'mind',
  emoji       TEXT DEFAULT '⚡',
  xp_reward   INTEGER DEFAULT 50,
  difficulty  TEXT DEFAULT 'Medium',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Create mission logs
CREATE TABLE IF NOT EXISTS mission_logs (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mission_id    UUID REFERENCES missions(id) ON DELETE CASCADE,
  completed_on  DATE DEFAULT CURRENT_DATE,
  xp_earned     INTEGER DEFAULT 50,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, mission_id, completed_on)
);

-- Step 5: Create daily checkins
CREATE TABLE IF NOT EXISTS daily_checkins (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date          DATE DEFAULT CURRENT_DATE,
  mood          INTEGER,
  focus_score   NUMERIC(3,1),
  sleep_hours   NUMERIC(3,1),
  water_litres  NUMERIC(3,1),
  screen_hours  NUMERIC(3,1),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Step 6: Create earnings table
CREATE TABLE IF NOT EXISTS earnings (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount      NUMERIC(10,2) NOT NULL,
  source      TEXT DEFAULT 'Other',
  description TEXT,
  earned_on   DATE DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Step 7: Create XP transactions
CREATE TABLE IF NOT EXISTS xp_transactions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount      INTEGER NOT NULL,
  reason      TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Step 8: Create posts
CREATE TABLE IF NOT EXISTS posts (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content       TEXT NOT NULL,
  is_anonymous  BOOLEAN DEFAULT TRUE,
  likes_count   INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Step 9: Create post reactions
CREATE TABLE IF NOT EXISTS post_reactions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id     UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_scores   ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins  ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions  ENABLE ROW LEVEL SECURITY;

-- Profiles: own row only
CREATE POLICY "profiles_own" ON profiles FOR ALL USING (auth.uid() = id);

-- Domain scores: own rows only
CREATE POLICY "domains_own" ON domain_scores FOR ALL USING (auth.uid() = user_id);

-- Missions: own rows only
CREATE POLICY "missions_own" ON missions FOR ALL USING (auth.uid() = user_id);

-- Mission logs: own rows only
CREATE POLICY "mission_logs_own" ON mission_logs FOR ALL USING (auth.uid() = user_id);

-- Checkins: own rows only
CREATE POLICY "checkins_own" ON daily_checkins FOR ALL USING (auth.uid() = user_id);

-- Earnings: own rows only
CREATE POLICY "earnings_own" ON earnings FOR ALL USING (auth.uid() = user_id);

-- XP: own rows only
CREATE POLICY "xp_own" ON xp_transactions FOR ALL USING (auth.uid() = user_id);

-- Posts: everyone can read, own rows for write
CREATE POLICY "posts_read"   ON posts FOR SELECT USING (TRUE);
CREATE POLICY "posts_insert" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_delete" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Reactions: everyone can read, own for write
CREATE POLICY "reactions_read"   ON post_reactions FOR SELECT USING (TRUE);
CREATE POLICY "reactions_insert" ON post_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reactions_delete" ON post_reactions FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, display_name, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Builder'),
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8))
  );

  -- Create default domain scores
  INSERT INTO public.domain_scores (user_id, domain, score, level, title) VALUES
    (NEW.id, 'mind',       50, 1, 'Awakening'),
    (NEW.id, 'body',       50, 1, 'Starting'),
    (NEW.id, 'money',      30, 1, 'Learning'),
    (NEW.id, 'skills',     50, 1, 'Novice'),
    (NEW.id, 'style',      50, 1, 'Basic'),
    (NEW.id, 'discipline', 40, 1, 'Trying'),
    (NEW.id, 'social',     50, 1, 'Opening'),
    (NEW.id, 'creativity', 50, 1, 'Exploring');

  -- Create default missions
  INSERT INTO public.missions (user_id, name, category, emoji, xp_reward, difficulty) VALUES
    (NEW.id, 'Morning workout',    'body',       '🏋️', 80,  'Easy'),
    (NEW.id, 'Read 30 minutes',    'mind',       '📖', 50,  'Easy'),
    (NEW.id, 'Drink 2L water',     'body',       '💧', 40,  'Easy'),
    (NEW.id, 'No junk food',       'body',       '🥗', 60,  'Medium'),
    (NEW.id, 'Study 2+ hours',     'mind',       '🧠', 100, 'Hard'),
    (NEW.id, 'Cold shower',        'discipline', '🚿', 30,  'Medium'),
    (NEW.id, 'Write in journal',   'mind',       '✍️', 50,  'Easy'),
    (NEW.id, '1h skill building',  'skills',     '⚡', 80,  'Medium');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- INCREMENT LIKES FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION increment_likes(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts SET likes_count = likes_count + 1 WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- DONE. You should see "Success" above.
-- ============================================
