/**
 * Vista Food Mart - Main Application Script
 * Handles Theme Toggle, Live Hours Calculation, Product Filtering, Photo Lightbox, Reviews Slider.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- STATE ---
  let activeTheme = localStorage.getItem('theme') || 'dark';
  let currentReviewIndex = 0;

  // --- DOM ELEMENTS ---
  const htmlElement = document.documentElement;
  const themeToggleBtn = document.getElementById('theme-toggle');
  const headerElement = document.querySelector('header');
  const openTimeSpan = document.getElementById('open-time-msg');
  const currentYearSpan = document.getElementById('current-year');

  // --- INIT ---
  initTheme();
  updateLiveHours();
  initScrollEffects();
  initReviewsSlider();

  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // ---------------- THEME ----------------
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

  // ---------------- TIME ----------------
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

  // ---------------- LIVE HOURS ----------------
  function updateLiveHours() {
    const { weekday, hour } = getCentralTime();

    const isWeekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'].includes(weekday);
    const isWeekend = ['Fri', 'Sat'].includes(weekday);

    // ✅ FIXED FINAL LOGIC (NO midnight bug)
    const isOpen =
      (isWeekday && hour >= 7 && hour < 23) ||
      (isWeekend && hour >= 7 && hour <= 23);

    // ---------------- BADGES ----------------
    document.querySelectorAll('.live-status-badge').forEach(badge => {
      badge.classList.toggle('closed', !isOpen);

      const text = isOpen ? 'Open Now' : 'Closed';

      badge.innerHTML = `
        <span class="indicator-dot"></span>${text}
      `;
    });

    // ---------------- MESSAGE ----------------
    let msg = '';

    if (isOpen) {
      msg = isWeekend
        ? 'Open Today until 12:00 AM'
        : 'Open Today until 11:00 PM';
    } else {
      if (hour < 7) {
        msg = 'Closed (Opens Today at 7:00 AM)';
      } else if (weekday === 'Sat') {
        msg = 'Closed (Opens Sunday at 7:00 AM)';
      } else {
        msg = 'Closed (Opens Tomorrow at 7:00 AM)';
      }
    }

    if (openTimeSpan) {
      openTimeSpan.textContent = msg;
    }

    // ---------------- NAV DOT SAFE ----------------
    const navStatusDot = document.querySelector('.nav-status-dot');
    if (navStatusDot) {
      navStatusDot.classList.toggle('open', isOpen);
    }

    // ---------------- HIGHLIGHT DAY ----------------
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

  // ---------------- SCROLL ----------------
  function initScrollEffects() {
    window.addEventListener('scroll', () => {
      headerElement?.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  // ---------------- REVIEWS ----------------
  const reviews = [
    {
      author: "Laxman Bista",
      stars: 5,
      text: "Awesome store with hard-to-find items."
    },
    {
      author: "Local Customer",
      stars: 5,
      text: "Great selection and friendly staff."
    }
  ];

  function initReviewsSlider() {
    const track = document.getElementById('reviews-track');
    const dots = document.getElementById('reviews-dots');

    if (!track || !dots) return;

    reviews.forEach((r, i) => {
      const slide = document.createElement('div');
      slide.className = 'review-slide';

      let stars = '';
      for (let j = 0; j < r.stars; j++) {
        stars += '<i class="fas fa-star"></i> ';
      }

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
