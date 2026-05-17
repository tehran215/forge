-- ============================================
-- FORGE · Supabase Database Schema
-- Run this in Supabase SQL Editor
-- batttehran.com
-- ============================================

-- USERS PROFILE (extends Supabase auth.users)
CREATE TABLE profiles (
  id            UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username      TEXT UNIQUE NOT NULL,
  display_name  TEXT,
  age           INTEGER,
  avatar_url    TEXT,
  identity_type TEXT,          -- 'Athlete', 'Creator', 'Intellectual', etc.
  level         INTEGER DEFAULT 1,
  xp            INTEGER DEFAULT 0,
  streak        INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active   DATE,
  life_score    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- USER INTERESTS
CREATE TABLE user_interests (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  interest   TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DOMAIN SCORES (Mind, Body, Money, Skills, Style, Discipline, Social, Creativity)
CREATE TABLE domain_scores (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  domain     TEXT NOT NULL,  -- 'mind', 'body', 'money', 'skills', 'style', 'discipline', 'social', 'creativity'
  score      INTEGER DEFAULT 50 CHECK (score >= 0 AND score <= 100),
  level      INTEGER DEFAULT 1,
  title      TEXT,           -- 'Thinker', 'Athlete', etc.
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, domain)
);

-- DAILY MISSIONS
CREATE TABLE missions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,  -- 'body', 'mind', 'money', 'skills', 'discipline'
  emoji       TEXT,
  xp_reward   INTEGER DEFAULT 50,
  difficulty  TEXT DEFAULT 'Medium', -- 'Easy', 'Medium', 'Hard'
  is_default  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- DAILY MISSION LOG (which missions completed each day)
CREATE TABLE mission_logs (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
  mission_id   UUID REFERENCES missions(id) ON DELETE CASCADE,
  completed_on DATE DEFAULT CURRENT_DATE,
  xp_earned    INTEGER,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, mission_id, completed_on)
);

-- DAILY CHECK-INS (mood, sleep, focus, screen time, etc.)
CREATE TABLE daily_checkins (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date         DATE DEFAULT CURRENT_DATE UNIQUE,
  mood         INTEGER CHECK (mood >= 1 AND mood <= 10),
  focus_score  NUMERIC(3,1) CHECK (focus_score >= 0 AND focus_score <= 10),
  sleep_hours  NUMERIC(3,1),
  water_litres NUMERIC(3,1),
  screen_hours NUMERIC(3,1),
  gym_done     BOOLEAN DEFAULT FALSE,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- HABIT TRACKING (streak per habit)
CREATE TABLE habits (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  emoji        TEXT,
  category     TEXT,
  color        TEXT DEFAULT '#c9a84c',
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_days   INTEGER DEFAULT 0,
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- HABIT LOG (each day a habit was completed)
CREATE TABLE habit_logs (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  habit_id   UUID REFERENCES habits(id) ON DELETE CASCADE,
  done_on    DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, done_on)
);

-- EARNINGS TRACKER
CREATE TABLE earnings (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount      NUMERIC(10,2) NOT NULL,
  source      TEXT,           -- 'freelance', 'teaching', 'content', etc.
  description TEXT,
  earned_on   DATE DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- COMMUNITY POSTS
CREATE TABLE posts (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  emoji       TEXT,
  category    TEXT,           -- 'progress', 'question', 'win', 'routine'
  is_anonymous BOOLEAN DEFAULT TRUE,
  likes_count INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- POST REACTIONS
CREATE TABLE post_reactions (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id    UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  emoji      TEXT DEFAULT '🔥',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- SMART FEED CONTENT
CREATE TABLE feed_content (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title        TEXT NOT NULL,
  body         TEXT,
  emoji        TEXT,
  category     TEXT NOT NULL,  -- 'fitness', 'mindset', 'money', 'fashion', 'cinema', 'productivity'
  read_time    INTEGER,         -- in minutes
  source_url   TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- XP TRANSACTIONS (audit trail)
CREATE TABLE xp_transactions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  amount      INTEGER NOT NULL,
  reason      TEXT,            -- 'mission_complete', 'streak_bonus', 'level_up'
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ROW LEVEL SECURITY (users only see own data)
-- ============================================

ALTER TABLE profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests   ENABLE ROW LEVEL SECURITY;
ALTER TABLE domain_scores    ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_checkins   ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits           ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs       ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions   ENABLE ROW LEVEL SECURITY;

-- Profiles: users see and edit only their own
CREATE POLICY "Own profile" ON profiles FOR ALL USING (auth.uid() = id);

-- Interests
CREATE POLICY "Own interests" ON user_interests FOR ALL USING (auth.uid() = user_id);

-- Domain scores
CREATE POLICY "Own domains" ON domain_scores FOR ALL USING (auth.uid() = user_id);

-- Missions
CREATE POLICY "Own missions" ON missions FOR ALL USING (auth.uid() = user_id);

-- Mission logs
CREATE POLICY "Own mission logs" ON mission_logs FOR ALL USING (auth.uid() = user_id);

-- Daily checkins
CREATE POLICY "Own checkins" ON daily_checkins FOR ALL USING (auth.uid() = user_id);

-- Habits
CREATE POLICY "Own habits" ON habits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Own habit logs" ON habit_logs FOR ALL USING (auth.uid() = user_id);

-- Earnings
CREATE POLICY "Own earnings" ON earnings FOR ALL USING (auth.uid() = user_id);

-- XP
CREATE POLICY "Own xp" ON xp_transactions FOR ALL USING (auth.uid() = user_id);

-- Posts: anyone in community can read, owner can edit/delete
CREATE POLICY "Posts read all" ON posts FOR SELECT USING (TRUE);
CREATE POLICY "Posts own write" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Posts own update" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Posts own delete" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Reactions: anyone can react
CREATE POLICY "Reactions read" ON post_reactions FOR SELECT USING (TRUE);
CREATE POLICY "Reactions write" ON post_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Reactions delete" ON post_reactions FOR DELETE USING (auth.uid() = user_id);

-- Feed: public read
CREATE POLICY "Feed public" ON feed_content FOR SELECT USING (is_published = TRUE);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Builder')
  );
  -- Insert default domain scores
  INSERT INTO domain_scores (user_id, domain, score, level, title) VALUES
    (NEW.id, 'mind', 50, 1, 'Awakening'),
    (NEW.id, 'body', 50, 1, 'Beginner'),
    (NEW.id, 'money', 30, 1, 'Starting'),
    (NEW.id, 'skills', 50, 1, 'Learning'),
    (NEW.id, 'style', 50, 1, 'Developing'),
    (NEW.id, 'discipline', 40, 1, 'Building'),
    (NEW.id, 'social', 50, 1, 'Connected'),
    (NEW.id, 'creativity', 50, 1, 'Exploring');
  -- Insert default missions
  INSERT INTO missions (user_id, name, category, emoji, xp_reward, difficulty, is_default) VALUES
    (NEW.id, 'Morning workout', 'body', '🏋️', 80, 'Easy', TRUE),
    (NEW.id, 'Read 30 minutes', 'mind', '📖', 50, 'Easy', TRUE),
    (NEW.id, 'Drink 2L water', 'body', '💧', 40, 'Easy', TRUE),
    (NEW.id, 'No junk food', 'body', '🥗', 60, 'Medium', TRUE),
    (NEW.id, 'Study 2+ hours', 'mind', '🧠', 100, 'Hard', TRUE),
    (NEW.id, 'Cold shower', 'discipline', '🚿', 30, 'Medium', TRUE),
    (NEW.id, 'Write in journal', 'mind', '✍️', 50, 'Easy', TRUE),
    (NEW.id, '1 hour skill building', 'skills', '⚡', 80, 'Medium', TRUE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- XP Level calculator
CREATE OR REPLACE FUNCTION get_level_from_xp(xp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN FLOOR(SQRT(xp::FLOAT / 100)) + 1;
END;
$$ LANGUAGE plpgsql;

-- Update streak when mission completed
CREATE OR REPLACE FUNCTION update_streak_on_checkin()
RETURNS TRIGGER AS $$
DECLARE
  last_date DATE;
  current_streak INTEGER;
BEGIN
  SELECT last_active, streak INTO last_date, current_streak
  FROM profiles WHERE id = NEW.user_id;

  IF last_date = CURRENT_DATE - 1 THEN
    UPDATE profiles SET streak = streak + 1, last_active = CURRENT_DATE WHERE id = NEW.user_id;
  ELSIF last_date < CURRENT_DATE - 1 OR last_date IS NULL THEN
    UPDATE profiles SET streak = 1, last_active = CURRENT_DATE WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add default feed content
INSERT INTO feed_content (title, body, emoji, category, read_time, is_published) VALUES
  ('Why Discipline > Motivation', 'Motivation is a feeling. Discipline is a decision. One fades — one compounds.', '💪', 'mindset', 4, TRUE),
  ('Capsule Wardrobe for Builders', 'You don''t need 50 outfits. You need 10 that work perfectly every time.', '👔', 'fashion', 6, TRUE),
  ('How to Build a Second Brain', 'The system that lets you capture, organise and actually use what you consume.', '🧠', 'productivity', 8, TRUE),
  ('Your First ₹10K Online', 'The realistic roadmap for students who want to start earning real money.', '💰', 'money', 10, TRUE),
  ('Photography as a Discipline Practice', 'Why picking up a camera daily builds focus better than meditation apps.', '📸', 'creativity', 5, TRUE),
  ('What Cricket Teaches About Pressure', 'The mental game of the crease — and how it applies to real life.', '🏏', 'mindset', 7, TRUE);
