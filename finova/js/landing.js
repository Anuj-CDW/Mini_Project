// ── SCROLL REVEAL ──
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => observer.observe(el));

// ── ANIMATED BAR WIDTH IN MOCKUP ──
const mockObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      document.querySelectorAll('.ms-bar').forEach(b => b.classList.add('animated'));
      mockObs.disconnect();
    }
  });
}, { threshold: 0.3 });
const mock = document.querySelector('.browser-mock');
if (mock) mockObs.observe(mock);

// ── COUNT UP NUMBERS ──
function animateCount(el, target, prefix = '', suffix = '', duration = 1600) {
  let start = 0;
  const step = target / (duration / 16);
  const tick = () => {
    start = Math.min(start + step, target);
    el.textContent = prefix + Math.floor(start).toLocaleString('en-IN') + suffix;
    if (start < target) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const tickerObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      document.querySelectorAll('[data-count]').forEach(el => {
        const val  = parseInt(el.dataset.count);
        const pre  = el.dataset.prefix  || '';
        const suf  = el.dataset.suffix  || '';
        animateCount(el, val, pre, suf);
      });
      tickerObs.disconnect();
    }
  });
}, { threshold: 0.5 });
const ticker = document.querySelector('.stats-ticker');
if (ticker) tickerObs.observe(ticker);

// ── NAVBAR SCROLL SHADOW ──
window.addEventListener('scroll', () => {
  const nav = document.querySelector('.navbar');
  if (nav) nav.style.boxShadow = window.scrollY > 10 ? '0 4px 24px rgba(0,0,0,.08)' : '';
});

// ── STAGGER STEP CARDS ──
const stepCards = document.querySelectorAll('.step-card');
const stepObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      stepCards.forEach((c, i) => {
        c.style.animation = `stepAppear .5s ${i * .12}s both`;
      });
      stepObs.disconnect();
    }
  });
}, { threshold: 0.2 });
const stepsGrid = document.querySelector('.steps-grid');
if (stepsGrid) stepObs.observe(stepsGrid);

// ── FEATURE CARDS STAGGER ──
const featCards = document.querySelectorAll('.feat-card');
const featObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      featCards.forEach((c, i) => {
        c.style.opacity = '0';
        c.style.transform = 'translateY(28px)';
        setTimeout(() => {
          c.style.transition = 'opacity .55s ease, transform .55s ease';
          c.style.opacity = '1';
          c.style.transform = 'translateY(0)';
        }, i * 90);
      });
      featObs.disconnect();
    }
  });
}, { threshold: 0.15 });
const featGrid = document.querySelector('.features-grid');
if (featGrid) featObs.observe(featGrid);
