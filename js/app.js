// FORGE · Main App — Real data, real users, real persistence
// Runs after db.js loads

var STATE = {
  user: null,
  profile: null,
  domains: [],
  missions: [],
  todayCheckin: null,
  currentPage: 'dashboard',
};

var PAGES = {
  dashboard: { title: 'Command Center' },
  missions:  { title: 'Daily Upgrade'  },
  lifemap:   { title: 'Life Map'       },
  analytics: { title: 'Analytics'      },
  earnings:  { title: 'Earnings'       },
  community: { title: 'Community'      },
  settings:  { title: 'Settings'       },
};

var LEVEL_NAMES = [
  'Beginner','Awakening','Forming','Consistent','Disciplined',
  'Focused','Sharp','Elite','Master','Legend','Apex'
];

// ── BOOT ─────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', async function() {
  var session = await FORGE_DB.Auth.requireAuth(); // redirects to auth.html if not logged in
  STATE.user = session.user;

  // Load all data in parallel
  var results = await Promise.all([
    FORGE_DB.Profile.get(STATE.user.id),
    FORGE_DB.Domains.getAll(STATE.user.id),
    FORGE_DB.Missions.getToday(STATE.user.id),
    FORGE_DB.CheckIn.getToday(STATE.user.id),
  ]);

  STATE.profile  = results[0];
  STATE.domains  = results[1] || [];
  STATE.missions = results[2] || [];
  STATE.todayCheckin = results[3];

  updateTopBar();
  renderPage('dashboard');
  hideLoading();
});

function hideLoading() {
  var el = document.getElementById('loadingScreen');
  if (el) el.classList.add('hidden');
}

function updateTopBar() {
  var p = STATE.profile;
  if (!p) return;
  var initials = (p.display_name || 'AK').slice(0,2).toUpperCase();
  var xp       = p.xp || 0;
  var level    = p.level || 1;
  var xpForNext = Math.pow(level, 2) * 100;
  var xpForCurr = Math.pow(level - 1, 2) * 100;
  var pct = xpForNext > xpForCurr ? Math.round(((xp - xpForCurr) / (xpForNext - xpForCurr)) * 100) : 100;
  var levelName = LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)];
  var today = new Date().toLocaleDateString('en-IN', { weekday:'long', month:'long', day:'numeric' });

  setEl('userAvatar',    initials);
  setEl('dropdownName',  p.display_name || 'Builder');
  setEl('levelBadge',    level);
  setEl('xpLabel',       'Level ' + level + ' · ' + levelName);
  setEl('xpCount',       xp.toLocaleString() + ' / ' + xpForNext.toLocaleString() + ' XP');
  setEl('streakBadge',   '🔥 ' + (p.streak || 0) + '-day streak');
  setEl('pageSub',       today);
  var fill = document.getElementById('xpFill');
  if (fill) fill.style.width = pct + '%';
}

// ── PAGE ROUTER ───────────────────────────────────────
function renderPage(page) {
  STATE.currentPage = page;
  setEl('pageTitle', PAGES[page] ? PAGES[page].title : page);

  document.querySelectorAll('.nav-icon[data-page]').forEach(function(n) {
    n.classList.toggle('active', n.dataset.page === page);
  });
  document.querySelectorAll('.mn-item[data-page]').forEach(function(n) {
    n.classList.toggle('active', n.dataset.page === page);
  });

  var content = document.getElementById('pageContent');
  if (!content) return;

  if (page === 'dashboard')  buildDashboard(content);
  else if (page === 'missions')   buildMissions(content);
  else if (page === 'lifemap')    buildLifeMap(content);
  else if (page === 'analytics')  buildAnalytics(content);
  else if (page === 'earnings')   buildEarnings(content);
  else if (page === 'community')  buildCommunity(content);
  else if (page === 'settings')   buildSettings(content);

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── DASHBOARD ────────────────────────────────────────
async function buildDashboard(el) {
  var p = STATE.profile || {};
  var missions = STATE.missions;
  var domains  = STATE.domains;
  var lifeScore = p.life_score || 0;
  var doneCount = missions.filter(function(m){ return m.done; }).length;
  var earnedXP  = missions.filter(function(m){ return m.done; }).reduce(function(s,m){ return s+m.xp_reward; },0);

  // Heatmap
  var heatData = await FORGE_DB.Heatmap.get(STATE.user.id);
  var heatHTML = buildHeatmap(heatData);

  // Domain bars
  var domainBarsHTML = domains.length > 0 ? domains.slice(0,5).map(function(d) {
    var colors = {mind:'#4a9eff',body:'#3de08a',money:'#c9a84c',skills:'#a374f0',style:'#ff7040',discipline:'#e84040',social:'#4a9eff',creativity:'#a374f0'};
    var c = colors[d.domain] || '#c9a84c';
    return '<div class="score-bar-item"><span class="score-bar-label" style="text-transform:capitalize;">'+d.domain+'</span>' +
      '<div class="score-bar-track"><div class="score-bar-fill" style="width:'+d.score+'%;background:'+c+';"></div></div>' +
      '<span class="score-bar-val">'+d.score+'</span></div>';
  }).join('') : '<div style="color:#3a3835;font-size:12px;">Set up your Life Map to see domain scores →</div>';

  // Missions preview
  var missionHTML = missions.length === 0
    ? '<div class="empty-state"><span>⚡</span>No missions yet. Go to Daily Upgrade to add some.</div>'
    : missions.slice(0,5).map(function(m) {
        return '<div class="mission-item '+(m.done?'done':'')+'" data-id="'+m.id+'" data-xp="'+m.xp_reward+'" onclick="toggleMission(this)">' +
          '<div class="mission-check">'+(m.done?'✓':'')+'</div>' +
          '<span style="font-size:16px;">'+(m.emoji||'⚡')+'</span>' +
          '<span class="mission-name">'+m.name+'</span>' +
          '<span class="mission-xp">+'+m.xp_reward+' XP</span></div>';
      }).join('');

  // Domain area cards
  var areaHTML = domains.length === 0
    ? '<div class="empty-state" style="grid-column:1/-1"><span>🗺️</span>Go to Life Map to set up your 8 life domains.</div>'
    : domains.map(function(d) {
        var emojis = {mind:'🧠',body:'💪',money:'💰',skills:'⚡',style:'👔',discipline:'🔥',social:'🌐',creativity:'🎬'};
        var colors = {mind:'#4a9eff',body:'#3de08a',money:'#c9a84c',skills:'#a374f0',style:'#ff7040',discipline:'#e84040',social:'#4a9eff',creativity:'#a374f0'};
        return '<div class="area-card" onclick="renderPage(\'lifemap\')">' +
          '<span class="area-pct">'+d.score+'%</span>' +
          '<div class="area-icon">'+(emojis[d.domain]||'⭐')+'</div>' +
          '<div class="area-name" style="text-transform:capitalize;">'+d.domain+'</div>' +
          '<div class="area-level">Lv '+d.level+' · '+d.title+'</div>' +
          '<div class="area-progress-track"><div class="area-progress-fill" style="width:'+d.score+'%;background:'+(colors[d.domain]||'#c9a84c')+';"></div></div>' +
        '</div>';
      }).join('');

  el.innerHTML =
    // Check-in bar
    '<div class="checkin-bar">' +
      '<div class="checkin-field"><div class="checkin-label">😴 Sleep (hrs)</div><input class="checkin-input" id="ciSleep" type="number" min="0" max="24" step="0.5" placeholder="7.0" value="'+(STATE.todayCheckin&&STATE.todayCheckin.sleep_hours||'')+'"></div>' +
      '<div class="checkin-field"><div class="checkin-label">💧 Water (L)</div><input class="checkin-input" id="ciWater" type="number" min="0" max="10" step="0.5" placeholder="2.0" value="'+(STATE.todayCheckin&&STATE.todayCheckin.water_litres||'')+'"></div>' +
      '<div class="checkin-field"><div class="checkin-label">😊 Mood (1-10)</div><input class="checkin-input" id="ciMood" type="number" min="1" max="10" placeholder="8" value="'+(STATE.todayCheckin&&STATE.todayCheckin.mood||'')+'"></div>' +
      '<div class="checkin-field"><div class="checkin-label">🧠 Focus (1-10)</div><input class="checkin-input" id="ciFocus" type="number" min="0" max="10" step="0.1" placeholder="8.0" value="'+(STATE.todayCheckin&&STATE.todayCheckin.focus_score||'')+'"></div>' +
      '<div class="checkin-field"><div class="checkin-label">📱 Screen (hrs)</div><input class="checkin-input" id="ciScreen" type="number" min="0" max="24" step="0.5" placeholder="2.0" value="'+(STATE.todayCheckin&&STATE.todayCheckin.screen_hours||'')+'"></div>' +
      '<button class="checkin-save" onclick="saveCheckin()">Save Day ✓</button>' +
    '</div>' +
    // Life score + quick stats
    '<div class="life-score-row">' +
      '<div class="life-score-card">' +
        '<div class="score-label">LIFE SCORE</div>' +
        '<div class="score-number" id="scoreNum">'+lifeScore+'<span>/100</span></div>' +
        '<div class="score-change">'+doneCount+' missions done today · '+earnedXP+' XP earned</div>' +
        '<div class="score-bars">'+domainBarsHTML+'</div>' +
      '</div>' +
      '<div class="quick-stats">' +
        mkStat('🏋️', doneCount+'/'+missions.length, 'Missions today','','delta-neu') +
        mkStat('💰', 'Rs.'+(p.total_earned||0).toLocaleString(), 'Total earned','','delta-up') +
        mkStat('😴', (STATE.todayCheckin&&STATE.todayCheckin.sleep_hours||'—')+'h', 'Sleep last night','','delta-neu') +
        mkStat('📱', (STATE.todayCheckin&&STATE.todayCheckin.screen_hours||'—')+'h', 'Screen time','','delta-neu') +
        mkStat('😊', (STATE.todayCheckin&&STATE.todayCheckin.mood||'—')+'/10', 'Mood today','','delta-neu') +
        mkStat('🧠', (STATE.todayCheckin&&STATE.todayCheckin.focus_score||'—'), 'Focus score','','delta-neu') +
      '</div>' +
    '</div>' +
    // Missions + heatmap
    '<div class="grid-2">' +
      '<div class="card"><div class="card-title">Daily Missions</div>' +
      '<div class="card-sub">'+doneCount+' done · tap to complete</div>' +
      missionHTML +
      '<div style="margin-top:12px;font-size:12px;color:#c9a84c;cursor:pointer;" onclick="renderPage(\'missions\')">Manage all missions →</div></div>' +
      '<div class="card"><div class="card-title">Consistency Heatmap</div>' +
      '<div class="card-sub">Your activity — last 90 days</div>' +
      heatHTML + '</div>' +
    '</div>' +
    // Life areas
    '<div class="section-label">Life Map · Domains</div>' +
    '<div class="life-areas">'+areaHTML+'</div>';

  animateScore(lifeScore);
}

// ── MISSIONS ────────────────────────────────────────
async function buildMissions(el) {
  STATE.missions = await FORGE_DB.Missions.getToday(STATE.user.id);
  var missions = STATE.missions;
  var doneCount = missions.filter(function(m){ return m.done; }).length;
  var earnedXP  = missions.filter(function(m){ return m.done; }).reduce(function(s,m){ return s+m.xp_reward; },0);

  var rows = missions.length === 0
    ? '<div class="empty-state"><span>⚡</span>Add your first mission below to get started.</div>'
    : missions.map(function(m) {
        return '<div class="mission-item '+(m.done?'done':'')+'" data-id="'+m.id+'" data-xp="'+m.xp_reward+'" onclick="toggleMission(this)" style="margin-bottom:8px;">' +
          '<div class="mission-check">'+(m.done?'✓':'')+'</div>' +
          '<span style="font-size:18px;">'+(m.emoji||'⚡')+'</span>' +
          '<div style="flex:1;"><div class="mission-name">'+m.name+'</div>' +
          '<div style="font-size:10px;color:#3a3835;margin-top:2px;text-transform:capitalize;">'+m.category+' · +'+m.xp_reward+' XP</div></div>' +
          '<span class="delete-btn" onclick="event.stopPropagation();deleteMission(\''+m.id+'\')">✕</span>' +
        '</div>';
      }).join('');

  el.innerHTML =
    '<div class="card" style="margin-bottom:16px;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">' +
        '<div><div class="card-title">Today\'s Missions</div>' +
        '<div class="card-sub">'+doneCount+' / '+missions.length+' done · '+earnedXP+' XP earned</div></div>' +
        '<button onclick="toggleAddForm()" style="padding:8px 14px;background:rgba(201,168,76,0.1);border:1px solid rgba(201,168,76,0.25);border-radius:8px;font-size:12px;color:#c9a84c;cursor:pointer;font-family:Syne,sans-serif;">+ Add Mission</button>' +
      '</div>' +
      '<div class="add-mission-form" id="addMissionForm">' +
        '<div class="add-row">' +
          '<input class="add-input" id="newMissionName" placeholder="Mission name e.g. Read 30 min">' +
          '<input class="add-input" id="newMissionEmoji" placeholder="Emoji" style="width:70px;flex:none;">' +
          '<select class="add-select" id="newMissionCat"><option value="mind">Mind</option><option value="body">Body</option><option value="discipline">Discipline</option><option value="skills">Skills</option><option value="money">Money</option></select>' +
          '<input class="add-input" id="newMissionXP" placeholder="XP" type="number" value="50" style="width:70px;flex:none;">' +
          '<button class="add-btn" onclick="addMission()">Add</button>' +
        '</div>' +
      '</div>' +
      rows +
    '</div>';
}

// ── LIFE MAP ─────────────────────────────────────────
async function buildLifeMap(el) {
  var domainDefs = [
    {key:'mind',      emoji:'🧠', color:'#4a9eff'},
    {key:'body',      emoji:'💪', color:'#3de08a'},
    {key:'money',     emoji:'💰', color:'#c9a84c'},
    {key:'skills',    emoji:'⚡', color:'#a374f0'},
    {key:'style',     emoji:'👔', color:'#ff7040'},
    {key:'discipline',emoji:'🔥', color:'#e84040'},
    {key:'social',    emoji:'🌐', color:'#4a9eff'},
    {key:'creativity',emoji:'🎬', color:'#a374f0'},
  ];

  var scoreMap = {};
  STATE.domains.forEach(function(d){ scoreMap[d.domain] = d; });

  var avg = STATE.domains.length > 0
    ? Math.round(STATE.domains.reduce(function(s,d){ return s+d.score; },0) / STATE.domains.length)
    : 0;

  var sliders = domainDefs.map(function(d) {
    var current = scoreMap[d.key] ? scoreMap[d.key].score : 50;
    return '<div class="domain-slider-row">' +
      '<span style="font-size:20px;">'+d.emoji+'</span>' +
      '<span style="font-size:12px;width:80px;color:#7a7672;text-transform:capitalize;">'+d.key+'</span>' +
      '<input type="range" min="0" max="100" value="'+current+'" step="1"' +
        ' style="accent-color:'+d.color+';" data-domain="'+d.key+'"' +
        ' oninput="this.nextElementSibling.textContent=this.value">' +
      '<span style="font-size:12px;color:#c9a84c;width:28px;text-align:right;">'+current+'</span>' +
    '</div>';
  }).join('');

  var cards = domainDefs.map(function(d) {
    var dm = scoreMap[d.key] || {score:50,level:1,title:'Starting'};
    return '<div class="area-card" style="cursor:default;">' +
      '<span class="area-pct">'+dm.score+'%</span>' +
      '<div class="area-icon">'+d.emoji+'</div>' +
      '<div class="area-name" style="text-transform:capitalize;">'+d.key+'</div>' +
      '<div class="area-level">Lv '+dm.level+' · '+dm.title+'</div>' +
      '<div class="area-progress-track"><div class="area-progress-fill" style="width:'+dm.score+'%;background:'+d.color+';"></div></div>' +
    '</div>';
  }).join('');

  el.innerHTML =
    '<div class="card" style="margin-bottom:16px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;">' +
      '<svg width="64" height="64" viewBox="0 0 64 64">' +
        '<circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="5"/>' +
        '<circle cx="32" cy="32" r="26" fill="none" stroke="#c9a84c" stroke-width="5" stroke-linecap="round"' +
          ' stroke-dasharray="163.4" stroke-dashoffset="'+(163.4-(163.4*avg/100))+'"' +
          ' transform="rotate(-90 32 32)"/>' +
        '<text x="32" y="37" text-anchor="middle" fill="#c9a84c" font-family="sans-serif" font-size="13" font-weight="800">'+avg+'</text>' +
      '</svg>' +
      '<div style="flex:1;">' +
        '<div style="font-family:Syne,sans-serif;font-size:15px;font-weight:700;">Overall Life Score</div>' +
        '<div style="font-size:11px;color:#3a3835;margin-top:2px;">Drag sliders to update your scores</div>' +
      '</div>' +
      '<button onclick="saveDomains()" style="padding:10px 20px;background:#c9a84c;border:none;border-radius:10px;font-family:Syne,sans-serif;font-size:13px;font-weight:700;color:#000;cursor:pointer;">Save All →</button>' +
    '</div>' +
    '<div class="card" style="margin-bottom:16px;">' +
      '<div class="card-title" style="margin-bottom:16px;">Update Your Domain Scores</div>' +
      sliders +
    '</div>' +
    '<div class="life-areas">'+cards+'</div>';
}

async function saveDomains() {
  var sliders = document.querySelectorAll('input[type=range][data-domain]');
  var saves = [];
  sliders.forEach(function(sl) {
    saves.push(FORGE_DB.Domains.update(STATE.user.id, sl.dataset.domain, sl.value));
  });
  await Promise.all(saves);
  STATE.domains = await FORGE_DB.Domains.getAll(STATE.user.id);
  STATE.profile = await FORGE_DB.Profile.get(STATE.user.id);
  updateTopBar();
  renderPage('lifemap');
  showToast('Domain scores saved ✓');
}

// ── ANALYTICS ────────────────────────────────────────
async function buildAnalytics(el) {
  var history = await FORGE_DB.CheckIn.getHistory(STATE.user.id, 7);
  var rate    = await FORGE_DB.Analytics.getMissionRate(STATE.user.id, 7);
  var weekXP  = await FORGE_DB.Analytics.getWeeklyXP(STATE.user.id);
  var totalXP = weekXP.reduce(function(s,x){ return s+x.amount; },0);
  var p = STATE.profile || {};

  // Sleep chart
  var days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var sleepData = [0,0,0,0,0,0,0];
  history.forEach(function(h) {
    var d = new Date(h.date).getDay();
    var idx = d === 0 ? 6 : d - 1;
    sleepData[idx] = h.sleep_hours || 0;
  });
  var maxSleep = Math.max.apply(null, sleepData.concat([8]));
  var sleepBars = sleepData.map(function(v,i) {
    var h = Math.round((v/maxSleep)*90);
    return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">' +
      '<div style="font-size:10px;color:#3a3835;">'+(v||'—')+'</div>' +
      '<div style="width:100%;height:'+h+'px;background:'+(v<6?'#e84040':'#4a9eff')+';border-radius:3px 3px 0 0;min-height:4px;"></div>' +
      '<div style="font-size:9px;color:#3a3835;">'+days[i]+'</div>' +
    '</div>';
  }).join('');

  // Mood chart
  var moodData = [0,0,0,0,0,0,0];
  history.forEach(function(h) {
    var d = new Date(h.date).getDay();
    var idx = d === 0 ? 6 : d - 1;
    moodData[idx] = h.mood || 0;
  });
  var moodBars = moodData.map(function(v,i) {
    var h = Math.round((v/10)*90);
    var c = v >= 7 ? '#3de08a' : v >= 4 ? '#c9a84c' : '#e84040';
    return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">' +
      '<div style="font-size:10px;color:#3a3835;">'+(v||'—')+'</div>' +
      '<div style="width:100%;height:'+h+'px;background:'+c+';border-radius:3px 3px 0 0;min-height:4px;"></div>' +
      '<div style="font-size:9px;color:#3a3835;">'+days[i]+'</div>' +
    '</div>';
  }).join('');

  var dRows = STATE.domains.map(function(d) {
    var colors = {mind:'#4a9eff',body:'#3de08a',money:'#c9a84c',skills:'#a374f0',style:'#ff7040',discipline:'#e84040',social:'#4a9eff',creativity:'#a374f0'};
    return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:11px;">' +
      '<span style="font-size:14px;width:20px;">{mind:\'🧠\',body:\'💪\',money:\'💰\',skills:\'⚡\',style:\'👔\',discipline:\'🔥\',social:\'🌐\',creativity:\'🎬\'}[\''+d.domain+'\']||\'⭐\'</span>'.replace('{mind:\'🧠\',body:\'💪\',money:\'💰\',skills:\'⚡\',style:\'👔\',discipline:\'🔥\',social:\'🌐\',creativity:\'🎬\'}[\''+d.domain+'\']||\'⭐\'', ({mind:'🧠',body:'💪',money:'💰',skills:'⚡',style:'👔',discipline:'🔥',social:'🌐',creativity:'🎬'}[d.domain]||'⭐')) +
      '<span style="font-size:12px;width:76px;color:#7a7672;text-transform:capitalize;">'+d.domain+'</span>' +
      '<div style="flex:1;height:4px;background:#161616;border-radius:2px;overflow:hidden;">' +
        '<div style="width:'+d.score+'%;height:100%;background:'+(colors[d.domain]||'#c9a84c')+';border-radius:2px;"></div>' +
      '</div>' +
      '<span style="font-size:11px;color:#3a3835;width:28px;text-align:right;">'+d.score+'</span>' +
    '</div>';
  }).join('');

  el.innerHTML =
    '<div class="grid-2" style="margin-bottom:16px;">' +
      mkSumCard(p.life_score||0, 'Life Score', '#c9a84c') +
      mkSumCard(rate+'%', '7-day mission rate', '#3de08a') +
      mkSumCard(totalXP+' XP', 'Earned this week', '#c9a84c') +
      mkSumCard(p.streak||0, 'Current streak (days)', '#ff7040') +
    '</div>' +
    '<div class="grid-2">' +
      '<div class="card"><div class="card-title">Sleep This Week</div>' +
      '<div class="card-sub">Hours per night · red = under 6h</div>' +
      '<div style="display:flex;align-items:flex-end;gap:4px;height:100px;padding-top:8px;">'+sleepBars+'</div></div>' +
      '<div class="card"><div class="card-title">Mood This Week</div>' +
      '<div class="card-sub">Your daily mood score · 1–10</div>' +
      '<div style="display:flex;align-items:flex-end;gap:4px;height:100px;padding-top:8px;">'+moodBars+'</div></div>' +
    '</div>' +
    '<div class="card" style="margin-top:16px;"><div class="card-title">Domain Breakdown</div>' +
    '<div class="card-sub">Your current scores across all life areas</div>' +
    (dRows || '<div class="empty-state"><span>🗺️</span>Set up your Life Map first.</div>') + '</div>';
}

// ── EARNINGS ─────────────────────────────────────────
async function buildEarnings(el) {
  var weekEarnings = await FORGE_DB.Earnings.getWeek(STATE.user.id);
  var weekTotal = weekEarnings.reduce(function(s,e){ return s + parseFloat(e.amount); }, 0);
  var allTotal  = await FORGE_DB.Earnings.getTotal(STATE.user.id);

  var rows = weekEarnings.length === 0
    ? '<div class="empty-state"><span>💰</span>No earnings logged yet this week.<br>Every rupee counts — log it.</div>'
    : weekEarnings.map(function(e) {
        return '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:#161616;border-radius:10px;margin-bottom:8px;">' +
          '<div><div style="font-size:13px;font-weight:500;">'+e.source+'</div>' +
          '<div style="font-size:11px;color:#3a3835;">'+e.description+' · '+e.earned_on+'</div></div>' +
          '<div style="font-family:Syne,sans-serif;font-size:16px;font-weight:700;color:#3de08a;">+Rs.'+parseFloat(e.amount).toLocaleString()+'</div>' +
        '</div>';
      }).join('');

  el.innerHTML =
    '<div class="grid-2" style="margin-bottom:16px;">' +
      mkSumCard('Rs.'+weekTotal.toLocaleString(), 'Earned this week', '#3de08a') +
      mkSumCard('Rs.'+allTotal.toLocaleString(), 'All-time earnings', '#c9a84c') +
    '</div>' +
    '<div class="earning-form">' +
      '<div class="card-title" style="margin-bottom:14px;">Log New Earning</div>' +
      '<div class="add-row">' +
        '<input class="add-input" id="earnAmount" type="number" placeholder="Amount (Rs.)" min="0">' +
        '<input class="add-input" id="earnSource" placeholder="Source e.g. Freelance, Teaching">' +
        '<input class="add-input" id="earnDesc"   placeholder="Description (optional)">' +
        '<button class="add-btn" onclick="addEarning()">Log It</button>' +
      '</div>' +
    '</div>' +
    '<div class="card"><div class="card-title">This Week</div>' +
    '<div class="card-sub">Recent earnings</div>' +
    rows + '</div>';
}

async function addEarning() {
  var amount = parseFloat(document.getElementById('earnAmount').value);
  var source = document.getElementById('earnSource').value.trim();
  var desc   = document.getElementById('earnDesc').value.trim();
  if (!amount || !source) { showToast('Enter amount and source.'); return; }
  await FORGE_DB.Earnings.add(STATE.user.id, amount, source, desc);
  // Update total in profile
  var allTotal = await FORGE_DB.Earnings.getTotal(STATE.user.id);
  await FORGE_DB.Profile.update(STATE.user.id, { total_earned: allTotal });
  STATE.profile = await FORGE_DB.Profile.get(STATE.user.id);
  updateTopBar();
  renderPage('earnings');
  showToast('Earning logged ✓');
}

// ── COMMUNITY ────────────────────────────────────────
async function buildCommunity(el) {
  var posts = await FORGE_DB.Community.getPosts(20);
  var anonOn = true;

  var postRows = posts.length === 0
    ? '<div class="empty-state"><span>👥</span>No posts yet. Be the first.</div>'
    : posts.map(function(p) {
        var handle = p.is_anonymous ? '@anonymous' : '@'+(p.profiles&&p.profiles.username||'unknown');
        var lvl    = p.profiles && p.profiles.level ? 'Lv '+p.profiles.level : '';
        var ago    = timeAgo(p.created_at);
        return '<div class="card" style="margin-bottom:10px;">' +
          '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">' +
            '<div style="width:34px;height:34px;border-radius:50%;background:#161616;display:flex;align-items:center;justify-content:center;font-size:15px;">👤</div>' +
            '<div><div style="font-size:12px;font-weight:500;">'+handle+(lvl?' · '+lvl:'')+'</div>' +
            '<div style="font-size:10px;color:#3a3835;">'+ago+'</div></div>' +
          '</div>' +
          '<div style="font-size:13px;color:#7a7672;line-height:1.75;margin-bottom:10px;">'+p.content+'</div>' +
          '<div style="font-size:12px;color:#3a3835;">🔥 '+p.likes_count+' reactions</div>' +
        '</div>';
      }).join('');

  el.innerHTML =
    '<div class="card" style="margin-bottom:16px;">' +
      '<div class="card-title" style="margin-bottom:12px;">Share Your Progress</div>' +
      '<textarea id="postContent" placeholder="What did you build today? Share your win, your struggle, your streak..." style="width:100%;background:#161616;border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px 14px;font-size:13px;color:#f0ede8;font-family:DM Sans,sans-serif;outline:none;resize:vertical;min-height:80px;line-height:1.6;"></textarea>' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px;">' +
        '<div class="post-anon-toggle" onclick="this.querySelector(\'.toggle-box\').classList.toggle(\'on\')">' +
          '<div class="toggle-box on" id="anonToggle"><div class="toggle-ball"></div></div>' +
          '<span>Post anonymously</span>' +
        '</div>' +
        '<button onclick="submitPost()" style="padding:10px 20px;background:#c9a84c;border:none;border-radius:9px;font-family:Syne,sans-serif;font-size:13px;font-weight:700;color:#000;cursor:pointer;">Post</button>' +
      '</div>' +
    '</div>' +
    postRows;
}

async function submitPost() {
  var content = document.getElementById('postContent') && document.getElementById('postContent').value.trim();
  if (!content) { showToast('Write something first.'); return; }
  var isAnon = document.getElementById('anonToggle') && document.getElementById('anonToggle').classList.contains('on');
  await FORGE_DB.Community.post(STATE.user.id, content, isAnon);
  renderPage('community');
  showToast('Posted ✓');
}

// ── SETTINGS ─────────────────────────────────────────
function buildSettings(el) {
  var p = STATE.profile || {};
  el.innerHTML =
    '<div class="card" style="margin-bottom:16px;">' +
      '<div class="card-title" style="margin-bottom:16px;">Your Profile</div>' +
      '<div class="field" style="margin-bottom:12px;"><label style="font-size:12px;color:#7a7672;display:block;margin-bottom:6px;">Display Name</label>' +
      '<input id="settingName" class="add-input" style="width:100%;" value="'+(p.display_name||'')+'"></div>' +
      '<div class="field" style="margin-bottom:16px;"><label style="font-size:12px;color:#7a7672;display:block;margin-bottom:6px;">Identity Type</label>' +
      '<select id="settingIdentity" class="add-select" style="width:100%;">' +
        ['Athlete','Creator','Intellectual','Entrepreneur','Thinker','Operator'].map(function(t) {
          return '<option value="'+t+'" '+(p.identity_type===t?'selected':'')+'>'+t+'</option>';
        }).join('') +
      '</select></div>' +
      '<button onclick="saveSettings()" style="padding:12px 24px;background:#c9a84c;border:none;border-radius:10px;font-family:Syne,sans-serif;font-weight:700;font-size:13px;color:#000;cursor:pointer;">Save Changes</button>' +
    '</div>' +
    '<div class="card">' +
      '<div class="card-title" style="margin-bottom:12px;">Account</div>' +
      '<div class="umd-item" style="background:#161616;border-radius:10px;margin-bottom:8px;cursor:default;">📧 '+STATE.user.email+'</div>' +
      '<button onclick="FORGE_DB.Auth.signOut()" style="width:100%;padding:12px;background:rgba(232,64,64,0.08);border:1px solid rgba(232,64,64,0.2);border-radius:10px;color:#e84040;font-size:13px;cursor:pointer;font-family:DM Sans,sans-serif;">Sign Out</button>' +
    '</div>';
}

async function saveSettings() {
  var name     = document.getElementById('settingName').value.trim();
  var identity = document.getElementById('settingIdentity').value;
  if (!name) { showToast('Enter a display name.'); return; }
  STATE.profile = await FORGE_DB.Profile.update(STATE.user.id, { display_name: name, identity_type: identity });
  updateTopBar();
  showToast('Settings saved ✓');
}

// ── MISSION HANDLERS ─────────────────────────────────
async function toggleMission(el) {
  var id  = el.dataset.id;
  var xp  = parseInt(el.dataset.xp) || 50;
  var done = el.classList.contains('done');
  el.style.opacity = '0.5';
  if (done) {
    await FORGE_DB.Missions.uncomplete(STATE.user.id, id, xp);
  } else {
    await FORGE_DB.Missions.complete(STATE.user.id, id, xp);
  }
  // Refresh
  STATE.missions = await FORGE_DB.Missions.getToday(STATE.user.id);
  STATE.profile  = await FORGE_DB.Profile.get(STATE.user.id);
  updateTopBar();
  renderPage(STATE.currentPage);
}

function toggleAddForm() {
  var f = document.getElementById('addMissionForm');
  if (f) f.classList.toggle('open');
}

async function addMission() {
  var name  = document.getElementById('newMissionName') && document.getElementById('newMissionName').value.trim();
  var emoji = document.getElementById('newMissionEmoji') && document.getElementById('newMissionEmoji').value.trim();
  var cat   = document.getElementById('newMissionCat') && document.getElementById('newMissionCat').value;
  var xp    = parseInt(document.getElementById('newMissionXP') && document.getElementById('newMissionXP').value) || 50;
  if (!name) { showToast('Enter a mission name.'); return; }
  await FORGE_DB.Missions.add(STATE.user.id, name, cat, emoji||'⚡', xp, 'Medium');
  STATE.missions = await FORGE_DB.Missions.getToday(STATE.user.id);
  renderPage('missions');
  showToast('Mission added ✓');
}

async function deleteMission(id) {
  if (!confirm('Delete this mission?')) return;
  await FORGE_DB.Missions.delete(id);
  STATE.missions = await FORGE_DB.Missions.getToday(STATE.user.id);
  renderPage('missions');
}

// ── CHECK-IN ─────────────────────────────────────────
async function saveCheckin() {
  var fields = {
    sleep_hours:  parseFloat(document.getElementById('ciSleep').value)  || null,
    water_litres: parseFloat(document.getElementById('ciWater').value)  || null,
    mood:         parseInt(document.getElementById('ciMood').value)     || null,
    focus_score:  parseFloat(document.getElementById('ciFocus').value)  || null,
    screen_hours: parseFloat(document.getElementById('ciScreen').value) || null,
  };
  STATE.todayCheckin = await FORGE_DB.CheckIn.save(STATE.user.id, fields);
  showToast('Day logged ✓');
}

// ── HELPERS ───────────────────────────────────────────
function buildHeatmap(data) {
  var cells = '';
  for (var i = 89; i >= 0; i--) {
    var d = new Date(Date.now() - i * 86400000);
    var key = d.toISOString().split('T')[0];
    var count = data[key] || 0;
    var level = count === 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : count <= 6 ? 3 : 4;
    cells += '<div class="hm-cell hm-'+level+'" title="'+key+': '+count+' missions"></div>';
  }
  return '<div class="heatmap-grid">'+cells+'</div>' +
    '<div style="display:flex;justify-content:space-between;margin-top:8px;">' +
      '<span style="font-size:9px;color:#3a3835;">90 days ago</span>' +
      '<span style="font-size:9px;color:#3a3835;">Today</span>' +
    '</div>';
}


function domainEmoji(domain) {
  var map = {mind:'🧠',body:'💪',money:'💰',skills:'⚡',style:'👔',discipline:'🔥',social:'🌐',creativity:'🎬'};
  return map[domain] || '⭐';
}

function mkStat(emoji, val, label, delta, cls) {
  return '<div class="stat-card">' +
    '<span class="stat-card-icon">'+emoji+'</span>' +
    '<div class="stat-card-value">'+val+'</div>' +
    '<div class="stat-card-label">'+label+'</div></div>';
}

function mkSumCard(val, label, color) {
  return '<div class="card" style="text-align:center;">' +
    '<div style="font-family:Syne,sans-serif;font-size:26px;font-weight:800;color:'+color+';">'+val+'</div>' +
    '<div style="font-size:12px;color:#3a3835;margin-top:6px;">'+label+'</div></div>';
}

function animateScore(target) {
  var el = document.getElementById('scoreNum');
  if (!el) return;
  var n = 0;
  var timer = setInterval(function() {
    n += 1;
    if (n >= target) { n = target; clearInterval(timer); }
    el.innerHTML = n + '<span>/100</span>';
  }, 20);
}

function setEl(id, val) {
  var el = document.getElementById(id);
  if (el) el.textContent = val;
}

function showToast(msg) {
  var t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#c9a84c;color:#000;padding:10px 20px;border-radius:20px;font-size:13px;font-weight:600;font-family:Syne,sans-serif;z-index:9999;animation:fadeUp 0.3s ease;';
  document.body.appendChild(t);
  setTimeout(function(){ t.remove(); }, 2500);
}

function timeAgo(iso) {
  var diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60)   return 'just now';
  if (diff < 3600) return Math.floor(diff/60)+'m ago';
  if (diff < 86400) return Math.floor(diff/3600)+'h ago';
  return Math.floor(diff/86400)+'d ago';
}

// ── NAV WIRING ────────────────────────────────────────
document.querySelectorAll('.nav-icon[data-page]').forEach(function(icon) {
  icon.addEventListener('click', function() { renderPage(icon.dataset.page); });
});
document.querySelectorAll('.mn-item[data-page]').forEach(function(item) {
  item.addEventListener('click', function() { renderPage(item.dataset.page); });
});
