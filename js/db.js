// FORGE · Real Database Layer
// All reads/writes go through here
// Uses Supabase under the hood

var SUPABASE_URL = 'https://ofalzlcnvovpdunoziob.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mYWx6bGNudm92cGR1bm96aW9iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NDI5NTIsImV4cCI6MjA5NTExODk1Mn0.jRSTxxi_kIVKUKtNUSb-dYRGRRrFOvIafUky1dv1AQE';
var _sb = null;

function getDB() {
  if (!_sb) _sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  return _sb;
}

// ── AUTH ─────────────────────────────────────────────
var Auth = {
  getUser: async function() {
    var r = await getDB().auth.getUser();
    return r.data.user;
  },
  getSession: async function() {
    var r = await getDB().auth.getSession();
    return r.data.session;
  },
  signOut: async function() {
    await getDB().auth.signOut();
    window.location.href = 'auth.html';
  },
  requireAuth: async function() {
    var session = await Auth.getSession();
    if (!session) window.location.href = 'auth.html';
    return session;
  }
};

// ── PROFILE ───────────────────────────────────────────
var Profile = {
  get: async function(uid) {
    var r = await getDB().from('profiles').select('*').eq('id', uid).single();
    return r.data;
  },
  update: async function(uid, updates) {
    var r = await getDB().from('profiles').update(updates).eq('id', uid).select().single();
    return r.data;
  },
  addXP: async function(uid, amount, reason) {
    // Log transaction
    await getDB().from('xp_transactions').insert({ user_id: uid, amount: amount, reason: reason });
    // Get current XP
    var r = await getDB().from('profiles').select('xp').eq('id', uid).single();
    var currentXP = (r.data && r.data.xp) ? r.data.xp : 0;
    var newXP = currentXP + amount;
    var newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;
    return Profile.update(uid, { xp: newXP, level: newLevel });
  }
};

// ── DOMAINS ───────────────────────────────────────────
var Domains = {
  getAll: async function(uid) {
    var r = await getDB().from('domain_scores').select('*').eq('user_id', uid).order('domain');
    return r.data || [];
  },
  update: async function(uid, domain, score) {
    score = Math.min(100, Math.max(0, parseInt(score)));
    var level = Math.floor(score / 10) + 1;
    var titleMap = {
      mind:       ['Unaware','Awakening','Curious','Thinker','Analyst','Scholar','Sage','Intellect','Philosopher','Elite','Master'],
      body:       ['Sedentary','Starting','Active','Consistent','Athlete','Strong','Iron','Elite','Champion','Beast','Apex'],
      money:      ['Broke','Learning','Earning','Growing','Hustler','Builder','Investor','Wealthy','Rich','Elite','Free'],
      skills:     ['Novice','Learning','Practicing','Building','Skilled','Expert','Specialist','Master','Elite','World-Class','Legend'],
      style:      ['Basic','Aware','Developing','Sharp','Stylish','Curated','Refined','Iconic','Signature','Elite','Timeless'],
      discipline: ['Scattered','Trying','Forming','Consistent','Disciplined','Iron','Stoic','Warrior','Elite','Apex','Legend'],
      social:     ['Isolated','Opening','Connected','Social','Networked','Influential','Leader','Community','Mentor','Elite','Icon'],
      creativity: ['Consuming','Exploring','Creating','Builder','Artist','Creator','Visionary','Innovative','Master','Elite','Pioneer'],
    };
    var titles = titleMap[domain] || ['Beginner','Developing','Good','Great','Expert','Master','Elite','Legend','Apex','Ultimate','God'];
    var title = titles[Math.min(level, titles.length - 1)];
    var r = await getDB().from('domain_scores').upsert({
      user_id: uid, domain: domain,
      score: score, level: level, title: title,
      updated_at: new Date().toISOString()
    }).select().single();
    // Recalculate life score
    var all = await Domains.getAll(uid);
    if (all && all.length > 0) {
      var avg = Math.round(all.reduce(function(s, d) { return s + d.score; }, 0) / all.length);
      await Profile.update(uid, { life_score: avg });
    }
    return r.data;
  }
};

// ── MISSIONS ──────────────────────────────────────────
var Missions = {
  getToday: async function(uid) {
    var today = new Date().toISOString().split('T')[0];
    var r = await getDB().from('missions').select('*').eq('user_id', uid).order('created_at');
    if (!r.data) return [];
    var logs = await getDB().from('mission_logs').select('mission_id').eq('user_id', uid).eq('completed_on', today);
    var doneIds = new Set((logs.data || []).map(function(l) { return l.mission_id; }));
    return r.data.map(function(m) {
      return Object.assign({}, m, { done: doneIds.has(m.id) });
    });
  },
  complete: async function(uid, missionId, xp) {
    var today = new Date().toISOString().split('T')[0];
    await getDB().from('mission_logs').upsert({ user_id: uid, mission_id: missionId, completed_on: today, xp_earned: xp });
    await Profile.addXP(uid, xp, 'mission_complete');
    await Streaks.update(uid);
  },
  uncomplete: async function(uid, missionId, xp) {
    var today = new Date().toISOString().split('T')[0];
    await getDB().from('mission_logs').delete().eq('user_id', uid).eq('mission_id', missionId).eq('completed_on', today);
    // Remove XP
    var r = await getDB().from('profiles').select('xp').eq('id', uid).single();
    var newXP = Math.max(0, ((r.data && r.data.xp) || 0) - xp);
    var newLevel = Math.floor(Math.sqrt(newXP / 100)) + 1;
    await Profile.update(uid, { xp: newXP, level: newLevel });
  },
  add: async function(uid, name, category, emoji, xp, difficulty) {
    var r = await getDB().from('missions').insert({
      user_id: uid, name: name, category: category,
      emoji: emoji, xp_reward: xp, difficulty: difficulty
    }).select().single();
    return r.data;
  },
  delete: async function(missionId) {
    await getDB().from('missions').delete().eq('id', missionId);
  }
};

// ── STREAKS ───────────────────────────────────────────
var Streaks = {
  update: async function(uid) {
    var today = new Date().toISOString().split('T')[0];
    var yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    var r = await getDB().from('profiles').select('streak, longest_streak, last_active').eq('id', uid).single();
    if (!r.data) return;
    var p = r.data;
    var lastActive = p.last_active;
    var streak = p.streak || 0;
    var longest = p.longest_streak || 0;
    if (lastActive === today) return; // already updated today
    if (lastActive === yesterday) {
      streak = streak + 1;
    } else {
      streak = 1; // reset
    }
    longest = Math.max(longest, streak);
    await Profile.update(uid, { streak: streak, longest_streak: longest, last_active: today });
  }
};

// ── CHECKINS ──────────────────────────────────────────
var CheckIn = {
  getToday: async function(uid) {
    var today = new Date().toISOString().split('T')[0];
    var r = await getDB().from('daily_checkins').select('*').eq('user_id', uid).eq('date', today).single();
    return r.data;
  },
  getHistory: async function(uid, days) {
    days = days || 30;
    var since = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
    var r = await getDB().from('daily_checkins').select('*').eq('user_id', uid).gte('date', since).order('date');
    return r.data || [];
  },
  save: async function(uid, fields) {
    var today = new Date().toISOString().split('T')[0];
    var r = await getDB().from('daily_checkins').upsert(
      Object.assign({ user_id: uid, date: today }, fields)
    ).select().single();
    return r.data;
  }
};

// ── EARNINGS ──────────────────────────────────────────
var Earnings = {
  getWeek: async function(uid) {
    var since = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    var r = await getDB().from('earnings').select('*').eq('user_id', uid).gte('earned_on', since).order('earned_on', {ascending:false});
    return r.data || [];
  },
  getTotal: async function(uid) {
    var r = await getDB().from('earnings').select('amount').eq('user_id', uid);
    if (!r.data) return 0;
    return r.data.reduce(function(s, e) { return s + parseFloat(e.amount); }, 0);
  },
  add: async function(uid, amount, source, description) {
    var r = await getDB().from('earnings').insert({
      user_id: uid, amount: amount, source: source, description: description
    }).select().single();
    return r.data;
  }
};

// ── HEATMAP ───────────────────────────────────────────
var Heatmap = {
  get: async function(uid) {
    var since = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0];
    var r = await getDB().from('mission_logs').select('completed_on').eq('user_id', uid).gte('completed_on', since);
    if (!r.data) return {};
    var map = {};
    r.data.forEach(function(row) {
      map[row.completed_on] = (map[row.completed_on] || 0) + 1;
    });
    return map;
  }
};

// ── COMMUNITY ─────────────────────────────────────────
var Community = {
  getPosts: async function(limit) {
    limit = limit || 20;
    var r = await getDB().from('posts').select('*, profiles(username, level, identity_type)').order('created_at', {ascending:false}).limit(limit);
    return r.data || [];
  },
  post: async function(uid, content, isAnon) {
    var r = await getDB().from('posts').insert({
      user_id: uid, content: content, is_anonymous: isAnon !== false
    }).select().single();
    await Profile.addXP(uid, 10, 'community_post');
    return r.data;
  },
  react: async function(uid, postId) {
    var existing = await getDB().from('post_reactions').select('id').eq('user_id', uid).eq('post_id', postId).single();
    if (existing.data) {
      // Unlike
      await getDB().from('post_reactions').delete().eq('id', existing.data.id);
      await getDB().from('posts').update({ likes_count: getDB().raw('likes_count - 1') }).eq('id', postId);
    } else {
      // Like
      await getDB().from('post_reactions').insert({ user_id: uid, post_id: postId });
      await getDB().rpc('increment_likes', { post_id: postId });
    }
  }
};

// ── ANALYTICS ─────────────────────────────────────────
var Analytics = {
  getWeeklyXP: async function(uid) {
    var since = new Date(Date.now() - 7 * 86400000).toISOString();
    var r = await getDB().from('xp_transactions').select('amount, created_at').eq('user_id', uid).gte('created_at', since);
    return r.data || [];
  },
  getMissionRate: async function(uid, days) {
    days = days || 7;
    var since = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
    var logs = await getDB().from('mission_logs').select('completed_on').eq('user_id', uid).gte('completed_on', since);
    var missions = await getDB().from('missions').select('id').eq('user_id', uid);
    var total = (missions.data || []).length * days;
    var done  = (logs.data || []).length;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }
};

window.FORGE_DB = { Auth, Profile, Domains, Missions, Streaks, CheckIn, Earnings, Heatmap, Community, Analytics, getDB };
