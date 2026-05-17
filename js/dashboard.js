const PAGES = {
  dashboard: { title: 'Command Center', sub: 'Friday, May 16 · Week 20 of 2026' },
  missions:  { title: 'Daily Upgrade', sub: 'Complete missions. Level up daily.' },
  lifemap:   { title: 'Life Map', sub: '8 domains. One complete human.' },
  analytics: { title: 'Analytics', sub: 'Your growth, visualised.' },
  feed:      { title: 'Smart Feed', sub: 'Content that makes you better.' },
  community: { title: 'Private Circle', sub: 'Real growth, shared anonymously.' },
};

const missions = [
  { name: 'Morning workout', cat: 'body', xp: 80, done: true, emoji: '🏋️' },
  { name: 'Read 30 minutes', cat: 'mind', xp: 50, done: true, emoji: '📖' },
  { name: 'No junk food', cat: 'body', xp: 60, done: true, emoji: '🥗' },
  { name: 'Drink 2L water', cat: 'body', xp: 40, done: true, emoji: '💧' },
  { name: 'Study 4 hours deep', cat: 'mind', xp: 100, done: true, emoji: '🧠' },
  { name: 'Cold shower', cat: 'discipline', xp: 30, done: false, emoji: '🚿' },
  { name: 'Write in journal', cat: 'mind', xp: 50, done: false, emoji: '✍️' },
  { name: '1 hour skill building', cat: 'skills', xp: 80, done: false, emoji: '⚡' },
];

const domains = [
  { name: 'Mind', emoji: '🧠', level: 8, title: 'Thinker', pct: 71, color: '#4a9eff' },
  { name: 'Body', emoji: '💪', level: 10, title: 'Athlete', pct: 82, color: '#3de08a' },
  { name: 'Money', emoji: '💰', level: 5, title: 'Hustler', pct: 44, color: '#c9a84c' },
  { name: 'Skills', emoji: '⚡', level: 7, title: 'Builder', pct: 68, color: '#a374f0' },
  { name: 'Style', emoji: '👔', level: 9, title: 'Sharp', pct: 77, color: '#ff7040' },
  { name: 'Discipline', emoji: '🔥', level: 11, title: 'Iron', pct: 89, color: '#e84040' },
  { name: 'Social', emoji: '🌐', level: 6, title: 'Connected', pct: 55, color: '#4a9eff' },
  { name: 'Creativity', emoji: '🎬', level: 7, title: 'Creator', pct: 63, color: '#a374f0' },
];

const feed = [
  { emoji: '💪', title: 'Why Discipline > Motivation', cat: 'Mindset', time: '4 min read' },
  { emoji: '👔', title: 'Capsule Wardrobe for Builders', cat: 'Fashion', time: '6 min read' },
  { emoji: '🧠', title: 'How to Build a Second Brain', cat: 'Productivity', time: '8 min read' },
  { emoji: '💰', title: 'Your First ₹10K Online — A Roadmap', cat: 'Money', time: '10 min read' },
  { emoji: '📸', title: 'Photography as a Discipline Practice', cat: 'Creativity', time: '5 min read' },
  { emoji: '🏏', title: 'What Cricket Teaches You About Pressure', cat: 'Mindset', time: '7 min read' },
];

let currentPage = 'dashboard';

function renderPage(page) {
  currentPage = page;
  document.getElementById('pageTitle').textContent = PAGES[page].title;
  document.getElementById('pageSub').textContent = PAGES[page].sub;
  document.querySelectorAll('.nav-icon').forEach(n => n.classList.remove('active'));
  document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
  const content = document.getElementById('pageContent');

  if (page === 'dashboard') content.innerHTML = renderDashboard();
  else if (page === 'missions') content.innerHTML = renderMissions();
  else if (page === 'lifemap') content.innerHTML = renderLifeMap();
  else if (page === 'analytics') content.innerHTML = renderAnalytics();
  else if (page === 'feed') content.innerHTML = renderFeed();
  else if (page === 'community') content.innerHTML = renderCommunity();

  attachHandlers(page);
  animateScore();
}

function renderDashboard() {
  const heatmapCells = [0,0,1,0,2,1,3,2,1,0,2,3,4,2,1,0,1,2,3,2,4,3,2,1,0,2,3,4,3,2,1,2,3,2,1,3,4,3,2,1,2,3,2,4,3,2,1,2,3,4,3,2,1,2,3,4,3,2,1,2,4,3,4,3,2,1,2,3,4,3,2,4,3,4,3,2,4,3,4,4,3,4,3,4,4,3,4,4,4,4]
    .map(v => `<div class="hm-cell hm-${v}"></div>`).join('');

  const domainCards = domains.map(d => `
    <div class="area-card" onclick="renderPage('lifemap')">
      <span class="area-pct">${d.pct}%</span>
      <div class="area-icon">${d.emoji}</div>
      <div class="area-name">${d.name}</div>
      <div class="area-level">Lv ${d.level} · ${d.title}</div>
      <div class="area-progress-track">
        <div class="area-progress-fill" style="width:${d.pct}%;background:${d.color};"></div>
      </div>
    </div>`).join('');

  const missionItems = missions.slice(0,5).map((m, i) => `
    <div class="mission-item ${m.done ? 'done' : ''}" data-mission="${i}">
      <div class="mission-check">${m.done ? '✓' : ''}</div>
      <span class="mission-name">${m.emoji} ${m.name}</span>
      <span class="mission-xp">+${m.xp} XP</span>
    </div>`).join('');

  return `
    <div class="life-score-row">
      <div class="life-score-card">
        <div class="score-label">Life Score</div>
        <div class="score-number" id="scoreNum">0<span>/100</span></div>
        <div class="score-change">↑ +4.2 this week</div>
        <div class="score-bars">
          ${[['Body','82','#3de08a'],['Mind','71','#4a9eff'],['Money','44','#c9a84c'],['Skills','68','#a374f0'],['Style','77','#ff7040']]
            .map(([l,v,c]) => `<div class="score-bar-item">
              <span class="score-bar-label">${l}</span>
              <div class="score-bar-track"><div class="score-bar-fill" style="width:${v}%;background:${c};"></div></div>
              <span class="score-bar-val">${v}</span>
            </div>`).join('')}
        </div>
      </div>
      <div class="quick-stats">
        ${[
          ['💪','6/7','Gym this week','↑ 8%','delta-up'],
          ['📖','4.2h','Study today','↑ 2h','delta-up'],
          ['🌙','6.5h','Sleep last night','↓ 1h','delta-down'],
          ['📱','2.8h','Screen time','+34m','delta-down'],
          ['💰','₹2,400','Earned this week','↑ 12%','delta-up'],
          ['🧠','8.1','Focus score','same','delta-neu'],
        ].map(([ico,val,lab,delta,cls]) => `
          <div class="stat-card" onclick="renderPage('analytics')">
            <span class="stat-delta ${cls}">${delta}</span>
            <span class="stat-card-icon">${ico}</span>
            <div class="stat-card-value">${val}</div>
            <div class="stat-card-label">${lab}</div>
          </div>`).join('')}
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-title">Daily Missions</div>
        <div class="card-sub">5 of 8 complete · 650 XP remaining</div>
        ${missionItems}
        <div style="margin-top:10px;font-size:12px;color:var(--gold);cursor:pointer;" onclick="renderPage('missions')">View all missions →</div>
      </div>
      <div class="card">
        <div class="card-title">Consistency Heatmap</div>
        <div class="card-sub">Last 90 days of activity</div>
        <div class="heatmap-grid">${heatmapCells}</div>
        <div style="display:flex;justify-content:space-between;margin-top:8px;">
          <span style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;">3 months ago</span>
          <span style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;">Today</span>
        </div>
      </div>
    </div>

    <div class="section-label">Life Map · 8 Domains</div>
    <div class="life-areas">${domainCards}</div>

    <div class="grid-2" style="margin-top:16px;">
      <div class="card">
        <div class="card-title">AI Insights</div>
        <div class="card-sub">Patterns from your last 7 days</div>
        ${[
          ['#3de08a','Gym days improve your focus by 31%. Your best study sessions happen on training days.'],
          ['#e84040','You wasted 14 hours this week — mostly late-night scrolling after 11 PM.'],
          ['#a374f0','Photography spiked your creativity score by 18 points this week.'],
          ['#4a9eff','Sleep below 7 hours tanks your mood score. Last night cost you −8 points.'],
        ].map(([c,t]) => `
          <div class="insight-item">
            <div class="insight-dot" style="background:${c};"></div>
            <div class="insight-text">${t}</div>
          </div>`).join('')}
      </div>
      <div class="card">
        <div class="card-title">Smart Feed</div>
        <div class="card-sub">Curated for your interests</div>
        ${feed.slice(0,3).map(f => `
          <div class="mission-item">
            <span style="font-size:18px;">${f.emoji}</span>
            <div style="flex:1;">
              <div style="font-size:12px;font-weight:500;">${f.title}</div>
              <div style="font-size:10px;color:var(--text3);margin-top:2px;">${f.time} · ${f.cat}</div>
            </div>
          </div>`).join('')}
        <div style="margin-top:10px;font-size:12px;color:var(--gold);cursor:pointer;" onclick="renderPage('feed')">See full feed →</div>
      </div>
    </div>`;
}

function renderMissions() {
  return `
    <div class="card" style="margin-bottom:16px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
        <div>
          <div class="card-title">Today's Missions</div>
          <div class="card-sub">Tap to complete · XP updates live</div>
        </div>
        <div style="text-align:right;">
          <div style="font-family:'Syne',sans-serif;font-size:20px;font-weight:700;color:var(--gold);" id="missionXP">410 XP</div>
          <div style="font-size:11px;color:var(--text3);" id="missionCount">5 of 8 done</div>
        </div>
      </div>
      <div id="missionListFull">
        ${missions.map((m, i) => `
          <div class="mission-item ${m.done ? 'done' : ''}" data-mission="${i}" style="margin-bottom:8px;">
            <div class="mission-check">${m.done ? '✓' : ''}</div>
            <span style="font-size:18px;">${m.emoji}</span>
            <span class="mission-name">${m.name}</span>
            <span class="mission-xp">+${m.xp} XP</span>
          </div>`).join('')}
      </div>
    </div>`;
}

function renderLifeMap() {
  return `
    <div style="display:grid;grid-template-columns:1fr 280px;gap:16px;">
      <div>
        <div class="card" style="margin-bottom:16px;padding:16px 20px;display:flex;align-items:center;gap:16px;">
          <svg width="60" height="60" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="24" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="5"/>
            <circle cx="30" cy="30" r="24" fill="none" stroke="#c9a84c" stroke-width="5"
              stroke-linecap="round" stroke-dasharray="150.8" stroke-dashoffset="39"
              transform="rotate(-90 30 30)"/>
            <text x="30" y="35" text-anchor="middle" fill="#c9a84c" font-family="Syne" font-size="13" font-weight="800">74</text>
          </svg>
          <div>
            <div style="font-family:'Syne',sans-serif;font-size:14px;font-weight:600;">Overall Life Score</div>
            <div style="font-size:11px;color:var(--text3);margin-top:2px;">Across all 8 domains</div>
            <div style="font-size:11px;color:var(--green);margin-top:6px;background:rgba(61,224,138,0.08);display:inline-block;padding:2px 8px;border-radius:10px;">↑ +4.2 this week · Top 12%</div>
          </div>
        </div>
        <div class="life-areas" id="domainCards">
          ${domains.map((d, i) => `
            <div class="area-card" data-domain="${i}">
              <span class="area-pct">${d.pct}%</span>
              <div class="area-icon">${d.emoji}</div>
              <div class="area-name">${d.name}</div>
              <div class="area-level">Lv ${d.level} · ${d.title}</div>
              <div class="area-progress-track">
                <div class="area-progress-fill" style="width:${d.pct}%;background:${d.color};"></div>
              </div>
            </div>`).join('')}
        </div>
      </div>
      <div>
        <div class="card" id="domainDetail">
          <div style="font-size:12px;color:var(--text3);">Select a domain to deep-dive →</div>
        </div>
      </div>
    </div>`;
}

function renderDomainDetail(i) {
  const d = domains[i];
  return `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
      <span style="font-size:26px;">${d.emoji}</span>
      <div>
        <div style="font-family:'Syne',sans-serif;font-size:15px;font-weight:700;color:${d.color};">${d.name}</div>
        <div style="font-size:10px;color:var(--text3);">Level ${d.level} · ${d.title}</div>
      </div>
    </div>
    <div style="font-family:'Syne',sans-serif;font-size:34px;font-weight:800;color:${d.color};letter-spacing:-1px;">${d.pct}<span style="font-size:14px;color:var(--text3);font-weight:400;"> / 100</span></div>
    <div class="area-progress-track" style="height:6px;margin:10px 0 16px;">
      <div class="area-progress-fill" style="width:${d.pct}%;background:${d.color};"></div>
    </div>
    <div style="background:rgba(${d.color === '#c9a84c' ? '201,168,76' : '255,255,255'},0.04);border-left:2px solid ${d.color};border-radius:0 8px 8px 0;padding:10px 12px;font-size:11px;color:var(--text2);line-height:1.7;margin-bottom:16px;">
      <strong style="color:var(--text);">AI Insight:</strong> ${['Your reading streak is your strongest habit.','6 of 7 gym days this week — best month yet.','Income is growing. Add one more stream.','Photography is your fastest-growing skill.','Outfits are consistent. Refine your signature.','Top 5% for consistency. Keep it iron.','One real conversation a day changes this.','Photography is pulling this score up fast.'][i]}
    </div>
    <div style="font-size:10px;color:var(--text3);letter-spacing:1px;text-transform:uppercase;margin-bottom:10px;">Quick actions</div>
    ${['Log a session','Track progress','Set a goal'].map(a => `
      <div class="mission-item" style="margin-bottom:6px;">
        <span style="color:${d.color};font-size:14px;">+</span>
        <span style="font-size:12px;">${a} for ${d.name}</span>
      </div>`).join('')}`;
}

function renderAnalytics() {
  const weekData = [55, 62, 58, 71, 68, 74, 74];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxV = Math.max(...weekData);
  const bars = weekData.map((v, i) => {
    const h = Math.round((v / maxV) * 100);
    const isLast = i === weekData.length - 1;
    return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
      <div style="font-size:10px;color:var(--text3);">${v}</div>
      <div style="width:100%;height:${h}px;background:${isLast ? '#c9a84c' : 'rgba(201,168,76,0.3)'};border-radius:4px 4px 0 0;transition:height 0.6s ease;"></div>
      <div style="font-size:10px;color:var(--text3);">${days[i]}</div>
    </div>`;
  }).join('');

  return `
    <div class="grid-2" style="margin-bottom:16px;">
      ${[
        ['74','Life Score this week','↑ +4.2 vs last week','#c9a84c'],
        ['88%','Mission completion','↑ +12% vs last week','#3de08a'],
        ['6.5h','Avg sleep this week','↓ −45min vs last week','#e84040'],
        ['₹2,400','Earned this week','↑ +12% vs last week','#c9a84c'],
      ].map(([v,l,d,c]) => `
        <div class="card" style="text-align:center;">
          <div style="font-family:'Syne',sans-serif;font-size:30px;font-weight:800;color:${c};">${v}</div>
          <div style="font-size:12px;color:var(--text3);margin-top:4px;">${l}</div>
          <div style="font-size:11px;margin-top:6px;color:${c.includes('e84') ? '#e84040' : '#3de08a'};background:${c.includes('e84') ? 'rgba(232,64,64,0.08)' : 'rgba(61,224,138,0.08)'};display:inline-block;padding:2px 8px;border-radius:10px;">${d}</div>
        </div>`).join('')}
    </div>

    <div class="card" style="margin-bottom:16px;">
      <div class="card-title">Life Score — This Week</div>
      <div class="card-sub">Daily overall score (0–100)</div>
      <div style="display:flex;align-items:flex-end;gap:6px;height:120px;padding-top:10px;">${bars}</div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-title">Domain Breakdown</div>
        <div class="card-sub">This week vs last week</div>
        ${domains.map(d => `
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
            <span style="font-size:14px;">${d.emoji}</span>
            <span style="font-size:12px;width:70px;color:var(--text2);">${d.name}</span>
            <div style="flex:1;height:4px;background:var(--bg3);border-radius:2px;overflow:hidden;">
              <div style="width:${d.pct}%;height:100%;background:${d.color};border-radius:2px;"></div>
            </div>
            <span style="font-size:11px;color:var(--text3);width:28px;text-align:right;">${d.pct}</span>
          </div>`).join('')}
      </div>
      <div class="card">
        <div class="card-title">Time Breakdown</div>
        <div class="card-sub">Where your time went this week</div>
        ${[
          ['Study','28h','#4a9eff',0.85],
          ['Gym','6h','#3de08a',0.55],
          ['Sleep','45.5h','#a374f0',0.7],
          ['Screen time','19.6h','#e84040',0.4],
          ['Skills','6.5h','#c9a84c',0.5],
          ['Wasted','14h','#555',0.3],
        ].map(([l,v,c,p]) => `
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
            <span style="font-size:12px;width:90px;color:var(--text2);">${l}</span>
            <div style="flex:1;height:4px;background:var(--bg3);border-radius:2px;overflow:hidden;">
              <div style="width:${Math.round(p*100)}%;height:100%;background:${c};border-radius:2px;"></div>
            </div>
            <span style="font-size:11px;color:var(--text3);width:36px;text-align:right;">${v}</span>
          </div>`).join('')}
      </div>
    </div>`;
}

function renderFeed() {
  return `
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
      ${['All','Fitness','Mindset','Fashion','Money','Cinema','Cricket'].map((t,i) => `
        <div style="padding:6px 16px;border-radius:20px;font-size:12px;cursor:pointer;border:1px solid ${i===0?'rgba(201,168,76,0.35)':'var(--border)'};color:${i===0?'var(--gold)':'var(--text3)'};background:${i===0?'rgba(201,168,76,0.06)':'transparent'};font-weight:500;">${t}</div>`).join('')}
    </div>
    <div style="display:flex;flex-direction:column;gap:10px;">
      ${feed.map(f => `
        <div class="card" style="display:flex;align-items:center;gap:14px;padding:16px 20px;cursor:pointer;transition:border-color 0.15s;" onmouseover="this.style.borderColor='var(--border2)'" onmouseout="this.style.borderColor='var(--border)'">
          <div style="width:44px;height:44px;background:var(--bg3);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">${f.emoji}</div>
          <div style="flex:1;">
            <div style="font-size:13px;font-weight:500;color:var(--text);margin-bottom:4px;">${f.title}</div>
            <div style="font-size:11px;color:var(--text3);">${f.time} · ${f.cat}</div>
          </div>
          <div style="font-size:18px;color:var(--text3);">→</div>
        </div>`).join('')}
    </div>`;
}

function renderCommunity() {
  const posts = [
    { handle: 'ghost_builder', time: '2h ago', content: 'Hit my 30-day gym streak today. Never thought I\'d stick to anything this long. The dashboard making it visible changed everything.', emoji: '🔥', likes: 47 },
    { handle: 'silent_grind', time: '5h ago', content: 'Finished my first freelance project. ₹8,000 in. Small, but real. Money domain finally moving.', emoji: '💰', likes: 31 },
    { handle: 'anon_creator', time: '8h ago', content: 'Photography walk today. 3 hours, no phone except the camera. Focus score hit 9.4 after. This is the practice.', emoji: '📸', likes: 58 },
    { handle: 'iron_mind_17', time: '1d ago', content: 'Reading "Atomic Habits" changed how I think about the mission system here. Small reps > big motivation.', emoji: '📖', likes: 92 },
  ];

  return `
    <div style="display:grid;grid-template-columns:1fr 260px;gap:16px;">
      <div>
        <div class="card" style="margin-bottom:16px;padding:16px 20px;display:flex;align-items:center;gap:12px;">
          <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#c9a84c,#7a5c1a);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#000;">AK</div>
          <input placeholder="Share your progress anonymously..." style="flex:1;background:var(--bg3);border:1px solid var(--border2);border-radius:10px;padding:10px 14px;font-size:13px;color:var(--text);font-family:'DM Sans',sans-serif;outline:none;" />
          <div class="btn-primary" style="padding:9px 18px;font-size:12px;">Post</div>
        </div>
        ${posts.map(p => `
          <div class="card" style="margin-bottom:10px;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
              <div style="width:32px;height:32px;border-radius:50%;background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:13px;">👤</div>
              <div>
                <div style="font-size:12px;font-weight:500;color:var(--text);">@${p.handle}</div>
                <div style="font-size:10px;color:var(--text3);">${p.time}</div>
              </div>
            </div>
            <div style="font-size:13px;color:var(--text2);line-height:1.7;margin-bottom:12px;">${p.content}</div>
            <div style="display:flex;align-items:center;gap:16px;">
              <div style="font-size:12px;color:var(--text3);cursor:pointer;">${p.emoji} ${p.likes} reactions</div>
              <div style="font-size:12px;color:var(--text3);cursor:pointer;">💬 Reply</div>
            </div>
          </div>`).join('')}
      </div>
      <div>
        <div class="card" style="margin-bottom:12px;">
          <div class="card-title">Community</div>
          <div style="font-size:12px;color:var(--text3);margin-bottom:14px;">Private · Non-toxic · Real growth only</div>
          ${[['Members online','248 now'],['Posts today','34'],['Active circles','6'],['Your rank','Top 12%']].map(([l,v]) => `
            <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border);font-size:12px;">
              <span style="color:var(--text3);">${l}</span>
              <span style="color:var(--text);font-weight:500;">${v}</span>
            </div>`).join('')}
        </div>
        <div class="card">
          <div class="card-title" style="margin-bottom:12px;">Circles</div>
          ${[['💪 Gym Bros','128 members'],['📖 Readers','84 members'],['💰 Hustlers','67 members']].map(([n,c]) => `
            <div class="mission-item" style="margin-bottom:6px;">
              <span style="font-size:16px;">${n.split(' ')[0]}</span>
              <div style="flex:1;"><div style="font-size:12px;">${n.slice(2)}</div><div style="font-size:10px;color:var(--text3);">${c}</div></div>
              <div style="font-size:11px;color:var(--gold);cursor:pointer;">Join</div>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
}

function attachHandlers(page) {
  if (page === 'missions') {
    document.querySelectorAll('[data-mission]').forEach(el => {
      el.addEventListener('click', () => {
        const i = parseInt(el.dataset.mission);
        missions[i].done = !missions[i].done;
        renderPage('missions');
      });
    });
  }
  if (page === 'dashboard') {
    document.querySelectorAll('[data-mission]').forEach(el => {
      el.addEventListener('click', () => {
        const i = parseInt(el.dataset.mission);
        missions[i].done = !missions[i].done;
        renderPage('dashboard');
      });
    });
  }
  if (page === 'lifemap') {
    document.querySelectorAll('[data-domain]').forEach(el => {
      el.addEventListener('click', () => {
        const i = parseInt(el.dataset.domain);
        document.querySelectorAll('[data-domain]').forEach(c => c.style.borderColor = '');
        el.style.borderColor = domains[i].color + '55';
        document.getElementById('domainDetail').innerHTML = renderDomainDetail(i);
      });
    });
  }
}

function animateScore() {
  const el = document.getElementById('scoreNum');
  if (!el) return;
  let n = 0;
  const target = 74;
  const t = setInterval(() => {
    n += 2;
    if (n >= target) { n = target; clearInterval(t); }
    el.innerHTML = n + '<span>/100</span>';
  }, 20);
}

// Desktop sidebar nav
document.querySelectorAll('.nav-icon[data-page]').forEach(icon => {
  icon.addEventListener('click', () => renderPage(icon.dataset.page));
});

// Mobile bottom nav
document.querySelectorAll('.mn-item[data-page]').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.mn-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    renderPage(item.dataset.page);
  });
});

// Sync mobile nav active state with page changes
const origRenderPage = renderPage;
function renderPage(page) {
  origRenderPage(page);
  document.querySelectorAll('.mn-item').forEach(i => {
    i.classList.toggle('active', i.dataset.page === page);
  });
}

renderPage('dashboard');
