// FORGE Dashboard — tehran215.github.io/forge
// Fixed version — all 6 pages working

const PAGES = {
  dashboard: { title: 'Command Center', sub: 'Your life. One screen.' },
  missions:  { title: 'Daily Upgrade', sub: 'Complete missions. Earn XP. Level up.' },
  lifemap:   { title: 'Life Map', sub: '8 domains. One complete identity.' },
  analytics: { title: 'Analytics', sub: 'Your growth, visualised.' },
  feed:      { title: 'Smart Feed', sub: 'Content that builds you up.' },
  community: { title: 'Private Circle', sub: 'Real growth, shared privately.' },
};

var missions = [
  { name: 'Morning workout',    cat: 'body',       xp: 80,  done: true,  emoji: '🏋️' },
  { name: 'Read 30 minutes',    cat: 'mind',       xp: 50,  done: true,  emoji: '📖' },
  { name: 'No junk food',       cat: 'body',       xp: 60,  done: true,  emoji: '🥗' },
  { name: 'Drink 2L water',     cat: 'body',       xp: 40,  done: true,  emoji: '💧' },
  { name: 'Study 4 hours deep', cat: 'mind',       xp: 100, done: true,  emoji: '🧠' },
  { name: 'Cold shower',        cat: 'discipline', xp: 30,  done: false, emoji: '🚿' },
  { name: 'Write in journal',   cat: 'mind',       xp: 50,  done: false, emoji: '✍️' },
  { name: '1h skill building',  cat: 'skills',     xp: 80,  done: false, emoji: '⚡' },
];

var domains = [
  { name: 'Mind',       emoji: '🧠', level: 8,  title: 'Thinker',   pct: 71, color: '#4a9eff' },
  { name: 'Body',       emoji: '💪', level: 10, title: 'Athlete',   pct: 82, color: '#3de08a' },
  { name: 'Money',      emoji: '💰', level: 5,  title: 'Hustler',   pct: 44, color: '#c9a84c' },
  { name: 'Skills',     emoji: '⚡', level: 7,  title: 'Builder',   pct: 68, color: '#a374f0' },
  { name: 'Style',      emoji: '👔', level: 9,  title: 'Sharp',     pct: 77, color: '#ff7040' },
  { name: 'Discipline', emoji: '🔥', level: 11, title: 'Iron',      pct: 89, color: '#e84040' },
  { name: 'Social',     emoji: '🌐', level: 6,  title: 'Connected', pct: 55, color: '#4a9eff' },
  { name: 'Creativity', emoji: '🎬', level: 7,  title: 'Creator',   pct: 63, color: '#a374f0' },
];

var feedItems = [
  { emoji: '💪', title: 'Why Discipline Beats Motivation Every Time', cat: 'Mindset',      time: '4 min' },
  { emoji: '👔', title: 'Capsule Wardrobe for Builders',              cat: 'Fashion',      time: '6 min' },
  { emoji: '🧠', title: 'How to Build a Second Brain',                cat: 'Productivity', time: '8 min' },
  { emoji: '💰', title: 'Your First Rs.10K Online — A Real Roadmap',  cat: 'Money',        time: '10 min' },
  { emoji: '📸', title: 'Photography as a Discipline Practice',       cat: 'Creativity',   time: '5 min' },
  { emoji: '🏏', title: 'What Cricket Teaches About Pressure',        cat: 'Mindset',      time: '7 min' },
  { emoji: '📖', title: '5 Books That Changed How I Think',           cat: 'Mind',         time: '5 min' },
  { emoji: '🔥', title: 'The Morning Routine That Actually Works',    cat: 'Discipline',   time: '6 min' },
];

var communityPosts = [
  { handle: 'ghost_builder', time: '2h ago', emoji: '🔥', likes: 47, content: 'Hit my 30-day gym streak today. The dashboard making it visible changed everything.' },
  { handle: 'silent_grind',  time: '5h ago', emoji: '💰', likes: 31, content: 'Finished my first freelance project. Rs.8,000 in. Small but real. Money domain finally moving.' },
  { handle: 'anon_creator',  time: '8h ago', emoji: '📸', likes: 58, content: '3-hour photography walk today. Focus score hit 9.4 after. This is the practice.' },
  { handle: 'iron_mind_17',  time: '1d ago', emoji: '📖', likes: 92, content: 'Atomic Habits changed how I think about the mission system here. Small reps beat big motivation.' },
];

var domainInsights = [
  'Your reading streak is your strongest mental habit. 12 days in a row.',
  '6 of 7 gym days this week. This is your best month ever.',
  'Income growing but slowly. Add one more stream this month.',
  'Photography is your fastest growing skill. Double down on it.',
  'Outfits are consistent. Time to develop a true signature look.',
  'Top 5% for consistency across all users. Your strongest domain.',
  'One real conversation a day would move this score fast.',
  'Photography is pulling this score up. Content creation is your next unlock.',
];

// ── MAIN RENDER ──────────────────────────────────────

function renderPage(page) {
  var titleEl = document.getElementById('pageTitle');
  var subEl   = document.getElementById('pageSub');
  var content = document.getElementById('pageContent');
  if (!content) return;

  if (titleEl) titleEl.textContent = PAGES[page].title;
  if (subEl)   subEl.textContent   = PAGES[page].sub;

  // Sidebar active
  document.querySelectorAll('.nav-icon[data-page]').forEach(function(n) {
    n.classList.toggle('active', n.dataset.page === page);
  });
  // Mobile nav active
  document.querySelectorAll('.mn-item[data-page]').forEach(function(n) {
    n.classList.toggle('active', n.dataset.page === page);
  });

  if (page === 'dashboard')  content.innerHTML = buildDashboard();
  if (page === 'missions')   content.innerHTML = buildMissions();
  if (page === 'lifemap')    content.innerHTML = buildLifeMap();
  if (page === 'analytics')  content.innerHTML = buildAnalytics();
  if (page === 'feed')       content.innerHTML = buildFeed();
  if (page === 'community')  content.innerHTML = buildCommunity();

  attachHandlers(page);
  if (page === 'dashboard') animateScore();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function attachHandlers(page) {
  // Mission toggles
  document.querySelectorAll('[data-midx]').forEach(function(el) {
    el.addEventListener('click', function() {
      var i = parseInt(el.getAttribute('data-midx'));
      missions[i].done = !missions[i].done;
      renderPage(page);
    });
  });

  // Domain cards on life map
  document.querySelectorAll('[data-didx]').forEach(function(el) {
    el.addEventListener('click', function() {
      var i = parseInt(el.getAttribute('data-didx'));
      showDomainDetail(i);
    });
  });

  // Community post button
  var postBtn = document.getElementById('postBtn');
  if (postBtn) {
    postBtn.addEventListener('click', function() {
      var input = document.getElementById('postInput');
      if (!input || !input.value.trim()) return;
      communityPosts.unshift({
        handle: 'you', time: 'just now', emoji: '⚡',
        likes: 0, content: input.value.trim()
      });
      renderPage('community');
    });
  }
}

// ── DASHBOARD ────────────────────────────────────────

function buildDashboard() {
  var heatData = [0,0,1,0,2,1,3,2,1,0,2,3,4,2,1,0,1,2,3,2,4,3,2,1,0,2,3,4,3,2,
                  1,2,3,2,1,3,4,3,2,1,2,3,2,4,3,2,1,2,3,4,3,2,1,2,3,4,3,2,1,2,
                  4,3,4,3,2,1,2,3,4,3,2,4,3,4,3,2,4,3,4,4,3,4,3,4,4,3,4,4,4,4];
  var hm = heatData.map(function(v){ return '<div class="hm-cell hm-'+v+'"></div>'; }).join('');

  var doneCount = missions.filter(function(m){ return m.done; }).length;
  var earnedXP  = missions.filter(function(m){ return m.done; }).reduce(function(s,m){ return s+m.xp; }, 0);

  var mRows = missions.slice(0,5).map(function(m, i) {
    return '<div class="mission-item ' + (m.done?'done':'') + '" data-midx="'+i+'">' +
      '<div class="mission-check">'+(m.done?'✓':'')+'</div>' +
      '<span style="font-size:16px;">'+m.emoji+'</span>' +
      '<span class="mission-name">'+m.name+'</span>' +
      '<span class="mission-xp">+'+m.xp+' XP</span>' +
    '</div>';
  }).join('');

  var aCards = domains.map(function(d) {
    return '<div class="area-card" onclick="renderPage(\'lifemap\')">' +
      '<span class="area-pct">'+d.pct+'%</span>' +
      '<div class="area-icon">'+d.emoji+'</div>' +
      '<div class="area-name">'+d.name+'</div>' +
      '<div class="area-level">Lv '+d.level+' · '+d.title+'</div>' +
      '<div class="area-progress-track"><div class="area-progress-fill" style="width:'+d.pct+'%;background:'+d.color+';"></div></div>' +
    '</div>';
  }).join('');

  var fRows = feedItems.slice(0,3).map(function(f) {
    return '<div class="mission-item" onclick="renderPage(\'feed\')" style="cursor:pointer;">' +
      '<span style="font-size:18px;">'+f.emoji+'</span>' +
      '<div style="flex:1;"><div style="font-size:12px;font-weight:500;">'+f.title+'</div>' +
      '<div style="font-size:10px;color:#3a3835;margin-top:2px;">'+f.time+' read · '+f.cat+'</div></div>' +
    '</div>';
  }).join('');

  return (
    '<div class="life-score-row">' +
      '<div class="life-score-card">' +
        '<div class="score-label">LIFE SCORE</div>' +
        '<div class="score-number" id="scoreNum">0<span>/100</span></div>' +
        '<div class="score-change">&#x2191; +4.2 this week</div>' +
        '<div class="score-bars">' +
          mkBar('Body','82','#3de08a') + mkBar('Mind','71','#4a9eff') +
          mkBar('Money','44','#c9a84c') + mkBar('Skills','68','#a374f0') + mkBar('Style','77','#ff7040') +
        '</div>' +
      '</div>' +
      '<div class="quick-stats">' +
        mkStat('🏋️','6/7','Gym this week','&#x2191; 8%','delta-up') +
        mkStat('📖','4.2h','Study today','&#x2191; 2h','delta-up') +
        mkStat('🌙','6.5h','Sleep last night','&#x2193; 1h','delta-down') +
        mkStat('📱','2.8h','Screen time','+34m','delta-down') +
        mkStat('💰','Rs.2,400','Earned this week','&#x2191; 12%','delta-up') +
        mkStat('🧠','8.1','Focus score','same','delta-neu') +
      '</div>' +
    '</div>' +
    '<div class="grid-2">' +
      '<div class="card">' +
        '<div class="card-title">Daily Missions</div>' +
        '<div class="card-sub">'+doneCount+' of 8 done &middot; '+earnedXP+' XP earned</div>' +
        mRows +
        '<div style="margin-top:12px;font-size:12px;color:#c9a84c;cursor:pointer;" onclick="renderPage(\'missions\')">See all missions &#x2192;</div>' +
      '</div>' +
      '<div class="card">' +
        '<div class="card-title">Consistency Heatmap</div>' +
        '<div class="card-sub">Last 90 days of activity</div>' +
        '<div class="heatmap-grid">'+hm+'</div>' +
        '<div style="display:flex;justify-content:space-between;margin-top:8px;">' +
          '<span style="font-size:9px;color:#3a3835;text-transform:uppercase;">3 months ago</span>' +
          '<span style="font-size:9px;color:#3a3835;text-transform:uppercase;">Today</span>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="section-label">Life Map &middot; 8 Domains</div>' +
    '<div class="life-areas">'+aCards+'</div>' +
    '<div class="grid-2" style="margin-top:16px;">' +
      '<div class="card">' +
        '<div class="card-title">AI Insights</div>' +
        '<div class="card-sub">Patterns from your last 7 days</div>' +
        mkInsight('#3de08a','Gym days improve your focus by 31%. Best study sessions happen on training days.') +
        mkInsight('#e84040','You wasted 14 hours this week — mostly scrolling after 11 PM. Set a cutoff.') +
        mkInsight('#a374f0','Photography spiked your creativity score by 18 points this week.') +
        mkInsight('#4a9eff','Sleep below 7 hours tanks your mood. Last night cost you minus 8 points.') +
      '</div>' +
      '<div class="card">' +
        '<div class="card-title">Smart Feed</div>' +
        '<div class="card-sub">Curated for your interests</div>' +
        fRows +
        '<div style="margin-top:12px;font-size:12px;color:#c9a84c;cursor:pointer;" onclick="renderPage(\'feed\')">See full feed &#x2192;</div>' +
      '</div>' +
    '</div>'
  );
}

// ── MISSIONS ─────────────────────────────────────────

function buildMissions() {
  var doneCount = missions.filter(function(m){ return m.done; }).length;
  var earnedXP  = missions.filter(function(m){ return m.done; }).reduce(function(s,m){ return s+m.xp; }, 0);

  var rows = missions.map(function(m, i) {
    return '<div class="mission-item '+(m.done?'done':'')+'" data-midx="'+i+'" style="margin-bottom:8px;">' +
      '<div class="mission-check">'+(m.done?'✓':'')+'</div>' +
      '<span style="font-size:18px;">'+m.emoji+'</span>' +
      '<div style="flex:1;">' +
        '<div class="mission-name">'+m.name+'</div>' +
        '<div style="font-size:10px;color:#3a3835;margin-top:2px;text-transform:capitalize;">'+m.cat+'</div>' +
      '</div>' +
      '<span class="mission-xp">+'+m.xp+' XP</span>' +
    '</div>';
  }).join('');

  return (
    '<div class="card" style="margin-bottom:16px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">' +
        '<div><div class="card-title">Today\'s Missions</div>' +
        '<div class="card-sub">Tap to complete &middot; XP updates instantly</div></div>' +
        '<div style="text-align:right;">' +
          '<div style="font-family:Syne,sans-serif;font-size:22px;font-weight:700;color:#c9a84c;">'+earnedXP+' XP</div>' +
          '<div style="font-size:11px;color:#3a3835;">'+doneCount+' / 8 done</div>' +
        '</div>' +
      '</div>' +
      rows +
    '</div>' +
    '<div class="grid-2">' +
      '<div class="card">' +
        '<div class="card-title">Bonus Challenges</div>' +
        '<div class="card-sub">Complete for extra XP this week</div>' +
        mkBonus('🏆','7-Day Gym Streak','Train every day this week','+500 XP',86,'#c9a84c','6 of 7 days') +
        mkBonus('📖','Read 100 Pages','This week reading goal','+300 XP',60,'#4a9eff','60 of 100 pages') +
        mkBonus('📵','No Phone Till Noon','Protect your peak hours','+200 XP',43,'#a374f0','3 of 7 days') +
      '</div>' +
      '<div class="card">' +
        '<div class="card-title">This Week History</div>' +
        '<div class="card-sub">Your daily mission rate</div>' +
        mkWeekRow('Monday','7/8','🔥') +
        mkWeekRow('Tuesday','6/8','✅') +
        mkWeekRow('Wednesday','8/8','⭐') +
        mkWeekRow('Thursday','5/8','✅') +
        mkWeekRow('Today',doneCount+'/8','🎯') +
      '</div>' +
    '</div>'
  );
}

// ── LIFE MAP ─────────────────────────────────────────

function buildLifeMap() {
  var avg = Math.round(domains.reduce(function(s,d){ return s+d.pct; },0) / domains.length);
  var offset = 163.4 - (163.4 * avg / 100);

  var cards = domains.map(function(d, i) {
    return '<div class="area-card" data-didx="'+i+'" style="cursor:pointer;">' +
      '<span class="area-pct">'+d.pct+'%</span>' +
      '<div class="area-icon">'+d.emoji+'</div>' +
      '<div class="area-name">'+d.name+'</div>' +
      '<div class="area-level">Lv '+d.level+' &middot; '+d.title+'</div>' +
      '<div class="area-progress-track"><div class="area-progress-fill" style="width:'+d.pct+'%;background:'+d.color+';"></div></div>' +
    '</div>';
  }).join('');

  return (
    '<div class="card" style="margin-bottom:16px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;">' +
      '<svg width="64" height="64" viewBox="0 0 64 64">' +
        '<circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="5"/>' +
        '<circle cx="32" cy="32" r="26" fill="none" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"' +
          ' stroke-dasharray="163.4" stroke-dashoffset="'+offset+'" transform="rotate(-90 32 32)"/>' +
        '<text x="32" y="37" text-anchor="middle" fill="#c9a84c" font-family="sans-serif" font-size="14" font-weight="800">'+avg+'</text>' +
      '</svg>' +
      '<div>' +
        '<div style="font-family:Syne,sans-serif;font-size:15px;font-weight:700;">Overall Life Score</div>' +
        '<div style="font-size:11px;color:#3a3835;margin-top:2px;">Across all 8 domains</div>' +
        '<div style="font-size:11px;color:#3de08a;margin-top:8px;background:rgba(61,224,138,0.08);display:inline-block;padding:3px 10px;border-radius:10px;">+4.2 this week &middot; Top 12%</div>' +
      '</div>' +
    '</div>' +
    '<div class="life-areas" id="domainGrid">'+cards+'</div>' +
    '<div class="card" id="domainDetail" style="margin-top:16px;">' +
      '<div style="font-size:13px;color:#3a3835;">Tap any domain above to see your detailed breakdown</div>' +
    '</div>'
  );
}

function showDomainDetail(i) {
  var d = document.getElementById('domainDetail');
  if (!d) return;
  var dm = domains[i];
  var actions = ['Log a session','Set a new goal','Track your progress'];
  d.innerHTML =
    '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">' +
      '<span style="font-size:30px;">'+dm.emoji+'</span>' +
      '<div>' +
        '<div style="font-family:Syne,sans-serif;font-size:16px;font-weight:700;color:'+dm.color+';">'+dm.name+'</div>' +
        '<div style="font-size:11px;color:#3a3835;">Level '+dm.level+' &middot; '+dm.title+'</div>' +
      '</div>' +
      '<div style="margin-left:auto;font-family:Syne,sans-serif;font-size:36px;font-weight:800;color:'+dm.color+';">'+dm.pct+'<span style="font-size:14px;color:#3a3835;font-weight:400;">/100</span></div>' +
    '</div>' +
    '<div class="area-progress-track" style="height:6px;margin-bottom:16px;">' +
      '<div class="area-progress-fill" style="width:'+dm.pct+'%;background:'+dm.color+';"></div>' +
    '</div>' +
    '<div style="background:rgba(255,255,255,0.03);border-left:2px solid '+dm.color+';padding:12px 14px;border-radius:0 8px 8px 0;font-size:12px;color:#7a7672;line-height:1.7;margin-bottom:16px;">' +
      '<strong style="color:#f0ede8;">AI Insight:</strong> '+domainInsights[i] +
    '</div>' +
    '<div style="font-size:10px;color:#3a3835;letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">Quick Actions</div>' +
    actions.map(function(a) {
      return '<div class="mission-item" style="margin-bottom:6px;">' +
        '<span style="color:'+dm.color+';font-size:16px;">+</span>' +
        '<span style="font-size:12px;">'+a+' &mdash; '+dm.name+'</span>' +
      '</div>';
    }).join('');
}

// ── ANALYTICS ────────────────────────────────────────

function buildAnalytics() {
  var days   = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var scores = [62, 65, 68, 64, 74, 71, 74];
  var mx = Math.max.apply(null, scores);

  var bars = days.map(function(day, i) {
    var h = Math.round((scores[i]/mx)*100);
    var gold = i === 4;
    return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">' +
      '<div style="font-size:10px;color:#3a3835;">'+scores[i]+'</div>' +
      '<div style="width:100%;height:'+h+'px;background:'+(gold?'#c9a84c':'rgba(201,168,76,0.25)')+';border-radius:4px 4px 0 0;"></div>' +
      '<div style="font-size:10px;color:#3a3835;">'+day+'</div>' +
    '</div>';
  }).join('');

  var dRows = domains.map(function(d) {
    return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:11px;">' +
      '<span style="font-size:15px;">'+d.emoji+'</span>' +
      '<span style="font-size:12px;width:72px;color:#7a7672;">'+d.name+'</span>' +
      '<div style="flex:1;height:4px;background:#161616;border-radius:2px;overflow:hidden;">' +
        '<div style="width:'+d.pct+'%;height:100%;background:'+d.color+';border-radius:2px;"></div>' +
      '</div>' +
      '<span style="font-size:11px;color:#3a3835;width:28px;text-align:right;">'+d.pct+'</span>' +
    '</div>';
  }).join('');

  return (
    '<div class="grid-2" style="margin-bottom:16px;">' +
      mkSum('74',  'Life Score',       '+4.2 vs last week',  '#c9a84c', true) +
      mkSum('88%', 'Mission rate',     '+12% vs last week',  '#3de08a', true) +
      mkSum('6.5h','Avg sleep',        '-45min vs last week','#e84040', false) +
      mkSum('Rs.2,400','Earned','      +12% vs last week',   '#c9a84c', true) +
    '</div>' +
    '<div class="card" style="margin-bottom:16px;">' +
      '<div class="card-title">Life Score This Week</div>' +
      '<div class="card-sub">Daily overall score out of 100</div>' +
      '<div style="display:flex;align-items:flex-end;gap:6px;height:120px;padding-top:10px;">'+bars+'</div>' +
    '</div>' +
    '<div class="grid-2">' +
      '<div class="card">' +
        '<div class="card-title">Domain Breakdown</div>' +
        '<div class="card-sub">All 8 life areas this week</div>' +
        dRows +
      '</div>' +
      '<div class="card">' +
        '<div class="card-title">Time This Week</div>' +
        '<div class="card-sub">Where your hours went</div>' +
        mkTime('Study','28h','#4a9eff',0.85) +
        mkTime('Sleep','45h','#a374f0',0.70) +
        mkTime('Gym','6h','#3de08a',0.55) +
        mkTime('Skills','6.5h','#c9a84c',0.50) +
        mkTime('Screen','19h','#e84040',0.40) +
        mkTime('Wasted','14h','#444444',0.30) +
      '</div>' +
    '</div>'
  );
}

// ── FEED ─────────────────────────────────────────────

function buildFeed() {
  var cats = ['All','Mindset','Fashion','Money','Creativity','Discipline','Mind'];
  var tags = cats.map(function(c, i) {
    var active = i === 0;
    return '<div style="padding:6px 16px;border-radius:20px;font-size:12px;cursor:pointer;font-weight:500;border:1px solid '+(active?'rgba(201,168,76,0.4)':'rgba(255,255,255,0.07)')+';color:'+(active?'#c9a84c':'#3a3835')+';background:'+(active?'rgba(201,168,76,0.06)':'transparent')+';">'+c+'</div>';
  }).join('');

  var cards = feedItems.map(function(f) {
    return '<div class="card" style="display:flex;align-items:center;gap:14px;padding:16px 18px;cursor:pointer;margin-bottom:10px;transition:border-color 0.15s;" onmouseover="this.style.borderColor=\'rgba(255,255,255,0.13)\'" onmouseout="this.style.borderColor=\'rgba(255,255,255,0.06)\'">' +
      '<div style="width:44px;height:44px;background:#161616;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">'+f.emoji+'</div>' +
      '<div style="flex:1;">' +
        '<div style="font-size:13px;font-weight:500;color:#f0ede8;margin-bottom:4px;">'+f.title+'</div>' +
        '<div style="font-size:11px;color:#3a3835;">'+f.time+' read &middot; '+f.cat+'</div>' +
      '</div>' +
      '<div style="font-size:16px;color:#3a3835;">&#x2192;</div>' +
    '</div>';
  }).join('');

  return '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px;">'+tags+'</div>'+cards;
}

// ── COMMUNITY ────────────────────────────────────────

function buildCommunity() {
  var posts = communityPosts.map(function(p) {
    return '<div class="card" style="margin-bottom:10px;">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">' +
        '<div style="width:34px;height:34px;border-radius:50%;background:#161616;display:flex;align-items:center;justify-content:center;font-size:15px;">👤</div>' +
        '<div><div style="font-size:12px;font-weight:500;">@'+p.handle+'</div>' +
        '<div style="font-size:10px;color:#3a3835;">'+p.time+'</div></div>' +
      '</div>' +
      '<div style="font-size:13px;color:#7a7672;line-height:1.75;margin-bottom:12px;">'+p.content+'</div>' +
      '<div style="display:flex;gap:16px;">' +
        '<div style="font-size:12px;color:#3a3835;cursor:pointer;">'+p.emoji+' '+p.likes+' reactions</div>' +
        '<div style="font-size:12px;color:#3a3835;cursor:pointer;">&#x1F4AC; Reply</div>' +
      '</div>' +
    '</div>';
  }).join('');

  return (
    '<div class="card" style="margin-bottom:16px;padding:16px 18px;">' +
      '<div style="display:flex;align-items:center;gap:12px;">' +
        '<div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#c9a84c,#7a5c1a);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#000;flex-shrink:0;">AK</div>' +
        '<input id="postInput" placeholder="Share your progress anonymously..." style="flex:1;background:#161616;border:1px solid rgba(255,255,255,0.12);border-radius:10px;padding:10px 14px;font-size:13px;color:#f0ede8;font-family:DM Sans,sans-serif;outline:none;">' +
        '<div id="postBtn" style="padding:10px 18px;background:#c9a84c;border-radius:10px;font-size:12px;font-weight:600;color:#000;cursor:pointer;white-space:nowrap;font-family:Syne,sans-serif;flex-shrink:0;">Post</div>' +
      '</div>' +
    '</div>' +
    posts +
    '<div class="card" style="margin-top:10px;">' +
      '<div class="card-title" style="margin-bottom:12px;">Active Circles</div>' +
      mkCircle('💪','Gym Bros','128 members') +
      mkCircle('📖','Readers','84 members') +
      mkCircle('💰','Hustlers','67 members') +
      mkCircle('🎬','Creators','52 members') +
    '</div>'
  );
}

// ── SMALL HELPERS ─────────────────────────────────────

function mkBar(label, val, color) {
  return '<div class="score-bar-item"><span class="score-bar-label">'+label+'</span>' +
    '<div class="score-bar-track"><div class="score-bar-fill" style="width:'+val+'%;background:'+color+';"></div></div>' +
    '<span class="score-bar-val">'+val+'</span></div>';
}
function mkStat(emoji, val, label, delta, cls) {
  return '<div class="stat-card" onclick="renderPage(\'analytics\')">' +
    '<span class="stat-delta '+cls+'">'+delta+'</span>' +
    '<span class="stat-card-icon">'+emoji+'</span>' +
    '<div class="stat-card-value">'+val+'</div>' +
    '<div class="stat-card-label">'+label+'</div></div>';
}
function mkInsight(color, text) {
  return '<div class="insight-item"><div class="insight-dot" style="background:'+color+';"></div>' +
    '<div class="insight-text">'+text+'</div></div>';
}
function mkBonus(emoji, name, desc, xp, pct, color, progress) {
  return '<div style="background:#161616;border-radius:10px;padding:14px;margin-bottom:10px;">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
      '<span style="font-size:18px;">'+emoji+'</span>' +
      '<span style="font-size:10px;font-weight:600;background:rgba(201,168,76,0.1);color:#c9a84c;padding:2px 8px;border-radius:8px;">'+xp+'</span>' +
    '</div>' +
    '<div style="font-size:12px;font-weight:500;margin-bottom:3px;">'+name+'</div>' +
    '<div style="font-size:10px;color:#3a3835;margin-bottom:10px;">'+desc+'</div>' +
    '<div style="height:3px;background:#0e0e0e;border-radius:2px;overflow:hidden;">' +
      '<div style="width:'+pct+'%;height:100%;background:'+color+';border-radius:2px;"></div>' +
    '</div>' +
    '<div style="font-size:10px;color:#3a3835;margin-top:5px;">'+progress+'</div></div>';
}
function mkWeekRow(day, done, icon) {
  return '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:12px;">' +
    '<span style="color:#7a7672;">'+day+'</span><span>'+icon+' '+done+' missions</span></div>';
}
function mkSum(val, label, delta, color, up) {
  return '<div class="card" style="text-align:center;">' +
    '<div style="font-family:Syne,sans-serif;font-size:26px;font-weight:800;color:'+color+';">'+val+'</div>' +
    '<div style="font-size:12px;color:#3a3835;margin-top:4px;">'+label+'</div>' +
    '<div style="font-size:11px;margin-top:8px;color:'+(up?'#3de08a':'#e84040')+';background:'+(up?'rgba(61,224,138,0.08)':'rgba(232,64,64,0.08)')+';display:inline-block;padding:2px 10px;border-radius:10px;">'+delta+'</div></div>';
}
function mkTime(label, val, color, pct) {
  return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:11px;">' +
    '<span style="font-size:12px;width:56px;color:#7a7672;">'+label+'</span>' +
    '<div style="flex:1;height:4px;background:#161616;border-radius:2px;overflow:hidden;">' +
      '<div style="width:'+Math.round(pct*100)+'%;height:100%;background:'+color+';border-radius:2px;"></div>' +
    '</div>' +
    '<span style="font-size:11px;color:#3a3835;width:32px;text-align:right;">'+val+'</span></div>';
}
function mkCircle(emoji, name, members) {
  return '<div class="mission-item" style="margin-bottom:8px;">' +
    '<span style="font-size:18px;">'+emoji+'</span>' +
    '<div style="flex:1;"><div style="font-size:12px;font-weight:500;">'+name+'</div>' +
    '<div style="font-size:10px;color:#3a3835;margin-top:2px;">'+members+'</div></div>' +
    '<div style="font-size:11px;color:#c9a84c;cursor:pointer;font-weight:500;">Join</div></div>';
}

function animateScore() {
  var el = document.getElementById('scoreNum');
  if (!el) return;
  var n = 0;
  var t = setInterval(function() {
    n += 2;
    if (n >= 74) { n = 74; clearInterval(t); }
    el.innerHTML = n + '<span>/100</span>';
  }, 18);
}

// ── BOOT ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.nav-icon[data-page]').forEach(function(icon) {
    icon.addEventListener('click', function() { renderPage(icon.dataset.page); });
  });
  document.querySelectorAll('.mn-item[data-page]').forEach(function(item) {
    item.addEventListener('click', function() { renderPage(item.dataset.page); });
  });
  renderPage('dashboard');
});
