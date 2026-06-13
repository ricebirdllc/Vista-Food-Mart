/**
 * Vista Food Mart - Main Application Script
 * Handles Theme Toggle, Live Hours Calculation, Product Filtering, Photo Lightbox, Reviews Slider.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- STATE ---
  let activeTheme = localStorage.getItem('theme') || 'dark';
  let currentReviewIndex = 0;
  let activeLightboxIndex = 0;

  // --- DOM ELEMENTS ---
  const htmlElement = document.documentElement;
  const themeToggleBtn = document.getElementById('theme-toggle');
  const headerElement = document.querySelector('header');
  const navMenu = document.getElementById('nav-menu');
  const openTimeSpan = document.getElementById('open-time-msg');
  const currentYearSpan = document.getElementById('current-year');

  // --- INITIALIZATION ---
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

    if (activeTheme === 'light') {
      logoSvg.classList.add('theme-light');
      logoSvg.classList.remove('theme-dark');
    } else {
      logoSvg.classList.add('theme-dark');
      logoSvg.classList.remove('theme-light');
    }
  }

  // ---------------- TIME ----------------
  function getCentralTime() {
    const options = {
      timeZone: 'America/Chicago',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
      weekday: 'short'
    };

    try {
      const formatter = new Intl.DateTimeFormat([], options);
      const parts = formatter.formatToParts(new Date());

      const data = {};
      parts.forEach(p => (data[p.type] = p.value));

      return {
        weekday: data.weekday,
        hour: parseInt(data.hour, 10),
        minute: parseInt(data.minute, 10)
      };
    } catch (e) {
      const now = new Date();
      const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      return {
        weekday: weekdays[now.getDay()],
        hour: now.getHours(),
        minute: now.getMinutes()
      };
    }
  }

  // ---------------- LIVE HOURS ----------------
  function updateLiveHours() {
    const { weekday, hour } = getCentralTime();

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
    const weekends = ['Fri', 'Sat'];

    const isWeekday = weekdays.includes(weekday);
    const isWeekend = weekends.includes(weekday);

    // ✅ FIXED LOGIC
    const isOpen =
      (isWeekday && hour >= 7 && hour < 23) ||
      (isWeekend && hour >= 7 && hour < 24);

    // Update badges
    const badges = document.querySelectorAll('.live-status-badge');

    badges.forEach(badge => {
      if (isOpen) {
        badge.classList.remove('closed');
        badge.innerHTML = `<span class="indicator-dot"></span>Open Now`;
      } else {
        badge.classList.add('closed');
        badge.innerHTML = `<span class="indicator-dot"></span>Closed`;
      }
    });

    // Status message
    let msg = '';

    if (isOpen) {
      msg = isWeekday
        ? 'Open Today until 11:00 PM'
        : 'Open Today until 12:00 AM';
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

    // Nav dot FIXED (no scope error)
    const navStatusDot = document.querySelector('.nav-status-dot');
    if (navStatusDot) {
      navStatusDot.classList.toggle('open', isOpen);
    }

    // Highlight current day
    const dayRows = document.querySelectorAll('.store-hours-table tr');

    const shortDays = {
      Sunday: 'Sun',
      Monday: 'Mon',
      Tuesday: 'Tue',
      Wednesday: 'Wed',
      Thursday: 'Thu',
      Friday: 'Fri',
      Saturday: 'Sat'
    };

    dayRows.forEach(row => {
      if (!row.cells.length) return;

      const dayName = row.cells[0].textContent.trim();

      if (shortDays[dayName] === weekday) {
        row.classList.add('current-day');
      } else {
        row.classList.remove('current-day');
      }
    });
  }

  setInterval(updateLiveHours, 60000);

  // ---------------- SCROLL ----------------
  function initScrollEffects() {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        headerElement.classList.add('scrolled');
      } else {
        headerElement.classList.remove('scrolled');
      }
    });
  }

  // ---------------- REVIEWS ----------------
  const reviews = [
    {
      author: "Laxman Bista",
      stars: 5,
      meta: "Google Review",
      text: "Awesome store with hard-to-find items."
    },
    {
      author: "Local Customer",
      stars: 5,
      meta: "Google Review",
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
