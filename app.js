/**
 * Vista Food Mart - Main Application Script
 * Handles Theme Toggle, Live Hours Calculation, Product Filtering, Photo Lightbox, Reviews Slider.
 */

document.addEventListener('DOMContentLoaded', () => {
  let activeTheme = localStorage.getItem('theme') || 'dark';
  let currentReviewIndex = 0;

  const htmlElement = document.documentElement;
  const themeToggleBtn = document.getElementById('theme-toggle');
  const headerElement = document.querySelector('header');
  const openTimeSpan = document.getElementById('open-time-msg');
  const currentYearSpan = document.getElementById('current-year');

  initTheme();
  updateLiveHours();
  initScrollEffects();
  initReviewsSlider();

  if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();

  function initTheme() {
    htmlElement.setAttribute('data-theme', activeTheme);

    themeToggleBtn?.addEventListener('click', () => {
      activeTheme = activeTheme === 'dark' ? 'light' : 'dark';
      htmlElement.setAttribute('data-theme', activeTheme);
      localStorage.setItem('theme', activeTheme);
      updateLogoTextTheme();
    });

    updateLogoTextTheme();
  }

  function updateLogoTextTheme() {
    const logoSvg = document.querySelector('.logo-wrapper svg');
    if (!logoSvg) return;

    logoSvg.classList.toggle('theme-light', activeTheme === 'light');
    logoSvg.classList.toggle('theme-dark', activeTheme !== 'light');
  }

  function getCentralTime() {
    try {
      const now = new Date();
      const weekday = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        weekday: 'short'
      }).format(now);

      const hour = parseInt(
        new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/Chicago',
          hour: '2-digit',
          hour12: false
        }).format(now),
        10
      );

      return { weekday, hour };
    } catch (e) {
      const now = new Date();
      const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return {
        weekday: weekdays[now.getDay()],
        hour: now.getHours()
      };
    }
  }

  function updateLiveHours() {
    const { weekday, hour } = getCentralTime();
    const isFridayOrSaturday = ['Fri', 'Sat'].includes(weekday);
    const isOpen = isFridayOrSaturday ? hour >= 7 && hour < 24 : hour >= 7 && hour < 23;

    document.querySelectorAll('.live-status-badge').forEach(badge => {
      badge.classList.toggle('closed', !isOpen);
      badge.innerHTML = `<span class="indicator-dot"></span>${isOpen ? 'Open Now' : 'Closed'}`;
    });

    if (openTimeSpan) {
      openTimeSpan.textContent = isOpen
        ? (isFridayOrSaturday ? 'Open Today until 11:59 PM' : 'Open Today until 11:00 PM')
        : 'Closed (Opens Today at 7:00 AM)';
    }

    const navStatusDot = document.querySelector('.nav-status-dot');
    if (navStatusDot) navStatusDot.classList.toggle('open', isOpen);

    const shortDays = {
      Sunday: 'Sun',
      Monday: 'Mon',
      Tuesday: 'Tue',
      Wednesday: 'Wed',
      Thursday: 'Thu',
      Friday: 'Fri',
      Saturday: 'Sat'
    };

    document.querySelectorAll('.store-hours-table tr').forEach(row => {
      if (!row.cells.length) return;
      const dayName = row.cells[0].textContent.trim();
      row.classList.toggle('current-day', shortDays[dayName] === weekday);
    });
  }

  setInterval(updateLiveHours, 60000);

  function initScrollEffects() {
    window.addEventListener('scroll', () => {
      headerElement?.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  const reviews = [
    { author: 'Laxman Bista', stars: 5, text: 'Awesome store with hard-to-find items.' },
    { author: 'Local Customer', stars: 5, text: 'Great selection and friendly staff.' }
  ];

  function initReviewsSlider() {
    const track = document.getElementById('reviews-track');
    const dots = document.getElementById('reviews-dots');
    if (!track || !dots) return;

    reviews.forEach((r, i) => {
      const slide = document.createElement('div');
      slide.className = 'review-slide';

      let stars = '';
      for (let j = 0; j < r.stars; j++) stars += '<i class="fas fa-star"></i> ';

      slide.innerHTML = `
        <div class="review-card">
          <div>${stars}</div>
          <p>"${r.text}"</p>
          <strong>${r.author}</strong>
        </div>
      `;

      track.appendChild(slide);

      const dot = document.createElement('div');
      dot.className = `reviews-dot ${i === 0 ? 'active' : ''}`;
      dots.appendChild(dot);
    });

    function goTo(i) {
      currentReviewIndex = i;
      track.style.transform = `translateX(-${i * 100}%)`;

      document.querySelectorAll('.reviews-dot').forEach((d, idx) => {
        d.classList.toggle('active', idx === i);
      });
    }

    setInterval(() => {
      let next = currentReviewIndex + 1;
      if (next >= reviews.length) next = 0;
      goTo(next);
    }, 6000);
  }
});
