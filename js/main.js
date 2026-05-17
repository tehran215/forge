document.addEventListener('DOMContentLoaded', () => {

  const interests = [
    { label: 'Fitness & Gym', emoji: '💪' },
    { label: 'Fashion & Style', emoji: '👔' },
    { label: 'Cricket & Sports', emoji: '🏏' },
    { label: 'Photography', emoji: '📸' },
    { label: 'Content Creation', emoji: '🎬' },
    { label: 'Earning Money', emoji: '💰' },
    { label: 'Productivity', emoji: '⚡' },
    { label: 'Mindset & Intelligence', emoji: '🧠' },
    { label: 'Discipline', emoji: '🔥' },
    { label: 'Politics & Thinking', emoji: '🌍' },
    { label: 'Movies & Web Series', emoji: '🎭' },
    { label: 'Self Growth', emoji: '📈' },
    { label: 'Reading', emoji: '📖' },
    { label: 'Music', emoji: '🎵' },
  ];

  const grid = document.getElementById('interestsGrid');
  if (grid) {
    interests.forEach(int => {
      const tag = document.createElement('div');
      tag.className = 'int-tag';
      tag.innerHTML = `<span>${int.emoji}</span>${int.label}`;
      tag.addEventListener('click', () => tag.classList.toggle('active'));
      grid.appendChild(tag);
    });
  }

  function animateCount(el, target, suffix = '', duration = 1800) {
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(ease * target).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    tick();
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        animateCount(el, target, suffix);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-num').forEach(el => observer.observe(el));

  document.querySelectorAll('.fade-up').forEach((el, i) => {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { el.style.animationPlayState = 'running'; io.unobserve(el); }
      });
    }, { threshold: 0.1 });
    el.style.animationPlayState = 'paused';
    io.observe(el);
  });
});

function handleWaitlist() {
  const input = document.getElementById('emailInput');
  const msg = document.getElementById('waitlistMsg');
  if (!input || !input.value || !input.value.includes('@')) {
    if (msg) { msg.style.color = '#e84040'; msg.textContent = 'Enter a valid email address.'; }
    return;
  }
  const emails = JSON.parse(localStorage.getItem('forge_waitlist') || '[]');
  if (!emails.includes(input.value)) { emails.push(input.value); }
  localStorage.setItem('forge_waitlist', JSON.stringify(emails));
  if (msg) { msg.style.color = '#3de08a'; msg.textContent = "You're on the list. Welcome to FORGE."; }
  input.value = '';
}
