// ============================================
// FORGE · Supabase Client
// js/supabase.js — include before dashboard.js
// ============================================

// 1. Install: add this to your HTML <head>
//    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
//
// 2. Replace the values below with your actual keys from:
//    supabase.com → Your Project → Settings → API

const SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_PUBLIC_KEY';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// AUTH
// ============================================

const Auth = {
  async signUp(email, password, username, displayName) {
    const { data, error } = await db.auth.signUp({
      email, password,
      options: { data: { username, display_name: displayName } }
    });
    if (error) throw error;
    return data;
  },

  async signIn(email, password) {
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await db.auth.signOut();
    if (error) throw error;
    window.location.href = 'index.html';
  },

  async getUser() {
    const { data: { user } } = await db.auth.getUser();
    return user;
  },

  onAuthChange(callback) {
    return db.auth.onAuthStateChange(callback);
  }
};

// ============================================
// PROFILE
// ============================================

const Profile = {
  async get(userId) {
    const { data, error } = await db
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async update(userId, updates) {
    const { data, error } = await db
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async addXP(userId, amount, reason) {
    // Log the transaction
    await db.from('xp_transactions').insert({ user_id: userId, amount, reason });
    // Update profile XP and recalculate level
    const { data: profile } = await db
      .from('profiles').select('xp').eq('id', userId).single();
    const newXP = (profile?.xp || 0) + amount;
    const newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;
    return Profile.update(userId, { xp: newXP, level: newLevel });
  }
};

// ============================================
// DOMAIN SCORES
// ============================================

const Domains = {
  async getAll(userId) {
    const { data, error } = await db
      .from('domain_scores')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  },

  async update(userId, domain, score) {
    const level = Math.floor(score / 10) + 1;
    const titles = {
      mind: ['Unaware','Awakening','Curious','Thinker','Analyst','Scholar','Sage','Intellect','Philosopher','Elite','Master'],
      body: ['Sedentary','Starting','Active','Consistent','Athlete','Strong','Iron','Elite','Champion','Beast','Apex'],
      money: ['Broke','Learning','Earning','Growing','Hustler','Builder','Investor','Wealthy','Rich','Elite','Free'],
      skills: ['Novice','Learning','Practicing','Building','Skilled','Expert','Specialist','Master','Elite','World-Class','Legend'],
      style: ['Basic','Aware','Developing','Sharp','Stylish','Curated','Refined','Iconic','Signature','Elite','Timeless'],
      discipline: ['Scattered','Trying','Forming','Consistent','Disciplined','Iron','Stoic','Warrior','Elite','Apex','Legend'],
      social: ['Isolated','Opening','Connected','Social','Networked','Influential','Leader','Community','Mentor','Elite','Icon'],
      creativity: ['Consuming','Exploring','Creating','Builder','Artist','Creator','Visionary','Innovative','Master','Elite','Pioneer'],
    };
    const title = titles[domain]?.[Math.min(level, 10)] || 'Building';

    const { data, error } = await db
      .from('domain_scores')
      .upsert({ user_id: userId, domain, score, level, title, updated_at: new Date().toISOString() })
      .select().single();
    if (error) throw error;

    // Recalculate life score (average of all domains)
    const allDomains = await Domains.getAll(userId);
    const lifeScore = Math.round(allDomains.reduce((s, d) => s + d.score, 0) / allDomains.length);
    await Profile.update(userId, { life_score: lifeScore });
    return data;
  }
};

// ============================================
// MISSIONS
// ============================================

const Missions = {
  async getToday(userId) {
    const today = new Date().toISOString().split('T')[0];
    const { data: missions, error } = await db
      .from('missions')
      .select(`*, mission_logs(id, completed_on)`)
      .eq('user_id', userId);
    if (error) throw error;

    return missions.map(m => ({
      ...m,
      done: m.mission_logs.some(log => log.completed_on === today)
    }));
  },

  async complete(userId, missionId, xpReward) {
    const today = new Date().toISOString().split('T')[0];
    const { error } = await db.from('mission_logs').insert({
      user_id: userId, mission_id: missionId,
      completed_on: today, xp_earned: xpReward
    });
    if (error && error.code !== '23505') throw error; // ignore duplicate
    await Profile.addXP(userId, xpReward, 'mission_complete');
  },

  async uncomplete(userId, missionId) {
    const today = new Date().toISOString().split('T')[0];
    await db.from('mission_logs')
      .delete()
      .eq('user_id', userId)
      .eq('mission_id', missionId)
      .eq('completed_on', today);
  },

  async add(userId, name, category, emoji, xpReward, difficulty) {
    const { data, error } = await db.from('missions').insert({
      user_id: userId, name, category, emoji,
      xp_reward: xpReward, difficulty
    }).select().single();
    if (error) throw error;
    return data;
  }
};

// ============================================
// DAILY CHECK-IN
// ============================================

const CheckIn = {
  async getToday(userId) {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await db
      .from('daily_checkins')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();
    return data;
  },

  async save(userId, data) {
    const today = new Date().toISOString().split('T')[0];
    const { data: result, error } = await db
      .from('daily_checkins')
      .upsert({ user_id: userId, date: today, ...data })
      .select().single();
    if (error) throw error;
    return result;
  }
};

// ============================================
// EARNINGS
// ============================================

const Earnings = {
  async getWeek(userId) {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const { data, error } = await db
      .from('earnings')
      .select('*')
      .eq('user_id', userId)
      .gte('earned_on', weekAgo)
      .order('earned_on', { ascending: false });
    if (error) throw error;
    return data;
  },

  async add(userId, amount, source, description) {
    const { data, error } = await db.from('earnings')
      .insert({ user_id: userId, amount, source, description })
      .select().single();
    if (error) throw error;
    // Update money domain score when earnings increase
    const weekEarnings = await Earnings.getWeek(userId);
    const total = weekEarnings.reduce((s, e) => s + parseFloat(e.amount), 0);
    const newScore = Math.min(Math.round((total / 10000) * 100), 100);
    await Domains.update(userId, 'money', newScore);
    return data;
  }
};

// ============================================
// COMMUNITY
// ============================================

const Community = {
  async getPosts(limit = 20) {
    const { data, error } = await db
      .from('posts')
      .select(`*, profiles(username, level, identity_type)`)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  async createPost(userId, content, emoji, category, isAnonymous = true) {
    const { data, error } = await db.from('posts')
      .insert({ user_id: userId, content, emoji, category, is_anonymous: isAnonymous })
      .select().single();
    if (error) throw error;
    await Profile.addXP(userId, 20, 'community_post');
    return data;
  },

  async react(userId, postId, emoji = '🔥') {
    const { error } = await db.from('post_reactions')
      .upsert({ user_id: userId, post_id: postId, emoji });
    if (error) throw error;
    // Increment likes count
    await db.rpc('increment', { table: 'posts', id: postId, column: 'likes_count' });
  },

  // Real-time subscription to new posts
  subscribeToFeed(callback) {
    return db.channel('posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, callback)
      .subscribe();
  }
};

// ============================================
// SMART FEED
// ============================================

const Feed = {
  async get(categories = [], limit = 10) {
    let query = db.from('feed_content').select('*').eq('is_published', true);
    if (categories.length > 0) query = query.in('category', categories);
    const { data, error } = await query.order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return data;
  }
};

// ============================================
// ANALYTICS
// ============================================

const Analytics = {
  async getWeeklyMissions(userId) {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const { data } = await db
      .from('mission_logs')
      .select('completed_on, xp_earned')
      .eq('user_id', userId)
      .gte('completed_on', weekAgo);
    return data;
  },

  async getCheckinHistory(userId, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const { data } = await db
      .from('daily_checkins')
      .select('*')
      .eq('user_id', userId)
      .gte('date', since)
      .order('date', { ascending: true });
    return data;
  },

  async getXPHistory(userId, days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await db
      .from('xp_transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', since)
      .order('created_at', { ascending: true });
    return data;
  }
};

// ============================================
// EXPORT (for use in other files)
// ============================================

window.FORGE = { Auth, Profile, Domains, Missions, CheckIn, Earnings, Community, Feed, Analytics, db };

// ============================================
// INIT — check auth on every page load
// ============================================

(async () => {
  const user = await Auth.getUser();
  const path = window.location.pathname;
  const isPublicPage = path.endsWith('index.html') || path.endsWith('onboarding.html') || path === '/';

  if (!user && !isPublicPage) {
    window.location.href = 'onboarding.html';
  }
})();
