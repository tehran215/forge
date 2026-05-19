// FORGE — Landing page JS
// Waitlist goes to Formspree (free, no account needed for basic use)
// Replace FORM_ID below with your actual Formspree ID

var FORMSPREE_ID = 'YOUR_FORM_ID'; // ← you will replace this in Step 3 below

document.addEventListener('DOMContentLoaded', function() {

  // ── INTEREST TAGS ──────────────────────────────
  var interests = [
    { label: 'Fitness & Gym',        emoji: '💪' },
    { label: 'Fashion & Style',       emoji: '👔' },
    { label: 'Cricket & Sports',      emoji: '🏏' },
    { label: 'Photography',           emoji: '📸' },
    { label: 'Content Creation',      emoji: '🎬' },
    { label: 'Earning Money',         emoji: '💰' },
    { label: 'Productivity',          emoji: '⚡' },
    { label: 'Mindset & Intelligence',emoji: '🧠' },
    { label: 'Discipline',            emoji: '🔥' },
    { label: 'Politics & Thinking',   emoji: '🌍' },
    { label: 'Movies & Web Series',   emoji: '🎭' },
    { label: 'Self Growth',           emoji: '📈' },
    { label: 'Reading',               emoji: '📖' },
    { label: 'Music',                 emoji: '🎵' },
  ];

  var grid = document.getElementById('interestsGrid');
  if (grid) {
    interests.forEach(function(int) {
      var tag = document.createElement('div');
      tag.className = 'int-tag';
      tag.innerHTML = '<span>' + int.emoji + '</span>' + int.label;
      tag.addEventListener('click', function() { tag.classList.toggle('active'); });
      grid.appendChild(tag);
    });
  }

  // ── ANIMATED COUNTERS ─────────────────────────
  function animateCount(el, target, suffix, duration) {
    suffix   = suffix   || '';
    duration = duration || 1800;
    var start = Date.now();
    function tick() {
      var p    = Math.min((Date.now() - start) / duration, 1);
      var ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(ease * target).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    tick();
  }

  var countObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var el     = entry.target;
        var target = parseInt(el.dataset.target);
        var suffix = el.dataset.suffix || '';
        animateCount(el, target, suffix);
        countObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-num').forEach(function(el) {
    countObserver.observe(el);
  });

});

// ── WAITLIST SUBMIT ───────────────────────────────
function handleWaitlist() {
  var input = document.getElementById('emailInput');
  var msg   = document.getElementById('waitlistMsg');
  var btn   = document.getElementById('waitlistBtn');

  if (!input || !input.value || !input.value.includes('@')) {
    if (msg) { msg.style.color = '#e84040'; msg.textContent = 'Enter a valid email address.'; }
    return;
  }

  var email = input.value.trim();

  // Show loading state
  if (btn)  { btn.textContent = 'Sending...'; btn.style.opacity = '0.6'; }
  if (msg)  { msg.style.color = '#3a3835'; msg.textContent = ''; }

  // Send to Formspree
  fetch('https://formspree.io/f/' + FORMSPREE_ID, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body:    JSON.stringify({ email: email, source: 'FORGE waitlist — batttehran' })
  })
  .then(function(res) { return res.json(); })
  .then(function(data) {
    if (data.ok || data.next) {
      // Success
      if (msg) { msg.style.color = '#3de08a'; msg.textContent = "You're on the list. Welcome to FORGE."; }
      if (btn) { btn.textContent = 'Get Access →'; btn.style.opacity = '1'; }
      input.value = '';
    } else {
      throw new Error('Form error');
    }
  })
  .catch(function() {
    // Fallback — save locally so no data is lost
    var saved = JSON.parse(localStorage.getItem('forge_waitlist') || '[]');
    if (!saved.includes(email)) saved.push(email);
    localStorage.setItem('forge_waitlist', JSON.stringify(saved));
    if (msg) { msg.style.color = '#3de08a'; msg.textContent = "You're on the list. Welcome to FORGE."; }
    if (btn) { btn.textContent = 'Get Access →'; btn.style.opacity = '1'; }
    input.value = '';
  });
}
