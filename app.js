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
  // const menuToggleBtn = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const liveStatusBadge = document.getElementById('live-status');
  const openTimeSpan = document.getElementById('open-time-msg');
  const currentYearSpan = document.getElementById('current-year');

  // --- INITIALIZATION ---
  initTheme();
  updateLiveHours();
  // initScrollEffects();
  // initProductCatalog() and initGallery() are called after galleryImages is declared below
  // initReviewsSlider();

  // Set current year in footer
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // --- THEME MANAGEMENT ---
  function initTheme() {
    htmlElement.setAttribute('data-theme', activeTheme);
    themeToggleBtn.addEventListener('click', () => {
      activeTheme = activeTheme === 'dark' ? 'light' : 'dark';
      htmlElement.setAttribute('data-theme', activeTheme);
      localStorage.setItem('theme', activeTheme);
      updateLogoTextTheme();
    });
    updateLogoTextTheme();
  }

  function updateLogoTextTheme() {
    const logoSvg = document.querySelector('.logo-wrapper svg');
    if (logoSvg) {
      if (activeTheme === 'light') {
        logoSvg.classList.add('theme-light');
        logoSvg.classList.remove('theme-dark');
      } else {
        logoSvg.classList.add('theme-dark');
        logoSvg.classList.remove('theme-light');
      }
    }
  }

  // --- LIVE STORE HOURS CHECKER (Central Time Zone) ---
  function getCentralTime() {
    const options = {
      timeZone: 'America/Chicago',
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric',
      hour12: false
    };

    try {
      const formatter = new Intl.DateTimeFormat([], options);
      const parts = formatter.formatToParts(new Date());
      const dateObj = {};
      parts.forEach(p => dateObj[p.type] = p.value);

      const dayOptions = { timeZone: 'America/Chicago', weekday: 'short' };
      const dayFormatter = new Intl.DateTimeFormat([], dayOptions);
      const weekdayStr = dayFormatter.format(new Date());

      return {
        weekday: weekdayStr,
        hour: parseInt(dateObj.hour, 10),
        minute: parseInt(dateObj.minute, 10)
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

  function updateLiveHours() {
    const { weekday, hour, minute } = getCentralTime();

    // Vista Food Mart Hours:
    // Sunday - Thursday: 7:00 AM - 11:00 PM
    // Friday & Saturday: 7:00 AM - 12:00 PM (noon)

    const openDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
    const halfDays = ['Fri', 'Sat'];

    const isFullDay = openDays.includes(weekday);
    const isHalfDay = halfDays.includes(weekday);

    const isOpen = (isFullDay && hour >= 7 && hour < 23) ||
      (isHalfDay && hour >= 7 && hour < 12);

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

    let msg = '';
    if (isOpen) {
      if (isFullDay) {
        msg = `Open Today until 11:00 PM`;
      } else {
        msg = `Open Today until 12:00 AM`;
      }
    } else {
      if (weekday === 'Sat' && hour >= 12) {
        msg = `Closed (Opens Sunday at 7:00 AM)`;
      } else if (weekday === 'Fri' && hour >= 12) {
        msg = `Closed (Opens Tomorrow at 7:00 AM)`;
      } else if (weekday === 'Thu' && hour >= 23) {
        msg = `Closed (Opens Tomorrow at 7:00 AM)`;
      } else if (hour < 7) {
        msg = `Closed (Opens Today at 7:00 AM)`;
      } else {
        msg = `Closed (Opens Tomorrow at 7:00 AM)`;
      }
    }

    if (openTimeSpan) {
      openTimeSpan.textContent = msg;
    }

    const dayRows = document.querySelectorAll('.store-hours-table tr');
    const shortDays = {
      'Sunday': 'Sun', 'Monday': 'Mon', 'Tuesday': 'Tue',
      'Wednesday': 'Wed', 'Thursday': 'Thu', 'Friday': 'Fri', 'Saturday': 'Sat'
    };

    dayRows.forEach(row => {
      if (!row.cells || row.cells.length === 0) return;
      const dayName = row.cells[0].textContent.trim();
      if (shortDays[dayName] === weekday) {
        row.classList.add('current-day');
      } else {
        row.classList.remove('current-day');
      }
    });
  }

  setInterval(updateLiveHours, 60000);

  // --- MOBILE MENU (disabled - toggle button removed) ---

  // --- SCROLL EFFECTS ---
  function initScrollEffects() {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        headerElement.classList.add('scrolled');
      } else {
        headerElement.classList.remove('scrolled');
      }
      updateActiveNavLink();
    });

    function updateActiveNavLink() {
      const sections = document.querySelectorAll('section[id]');
      const scrollPosition = window.scrollY + 120;

      sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${id}"]`);

        if (navLink && scrollPosition >= top && scrollPosition < top + height) {
          document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
          navLink.classList.add('active');
        }
      });
    }
  }

  // --- PHOTO DATA (all 27 store photos, categorised) ---
  // Used by both the Product Catalog and the Store Tour Gallery.
  const galleryImages = [
    // EXTERIOR - 4 photos (in /photo/Exterior/)
    { src: "./photo/Exterior/whole building looks from outside.jpg", category: "exterior", title: "Storefront View", desc: "Full view of the Vista Food Mart building exterior." },
    { src: "./photo/Exterior/building outside.jpg", category: "exterior", title: "Building Entrance", desc: "Street view of Vista Food Mart entrance." },
    { src: "./photo/Exterior/buildong look.jpg", category: "exterior", title: "Store Exterior View", desc: "Exterior view showcasing our convenient location." },
    { src: "./photo/Exterior/big logo.jpg", category: "exterior", title: "Store Logo", desc: "Official brand logo of Vista Food Mart." },
    { src: "./photo/logo.jpg", category: "exterior", title: "Vista Emblem", desc: "Logo emblem of Vista Food Mart." },
    // GROCERY - 4 photos (in /photo/Grocery/)
    { src: "./photo/Grocery/indian spices.png", category: "grocery", title: "Indian Spices Shelf", desc: "Authentic masalas and spices for home cooking." },
    { src: "./photo/Grocery/indian oil rice.png", category: "grocery", title: "Indian Rice & Oils", desc: "Pantry essentials including Basmati rice and traditional oils." },
    { src: "./photo/Grocery/milk eggs.png", category: "grocery", title: "Milk & Eggs Section", desc: "Fresh dairy, milk, and eggs delivered weekly." },
    { src: "./photo/Grocery/kitchen.png", category: "grocery", title: "Deli Kitchen Area", desc: "Clean food preparation area for hot foods." },
    // ESSENTIALS - 3 photos (in /photo/Essentials/)
    { src: "./photo/Essentials/house items.png", category: "essentials", title: "Household Supplies", desc: "Daily cleaning products and home utilities." },
    { src: "./photo/Essentials/stationary battery.png", category: "essentials", title: "Stationery & Batteries", desc: "Office/school supplies and all sizes of batteries." },
    { src: "./photo/Essentials/miscellanoeous.png", category: "essentials", title: "General Merchandise", desc: "Various hardware, chargers, and utility goods." },
    // Snacks - 4 photos (in /photo/Snacks/ — lowercase)
    { src: "./photo/Snacks/big chips.png", category: "Snacks", title: "Snacks Display", desc: "A large variety of potato chips and savory Snacks." },
    { src: "./photo/Snacks/chips big.png", category: "Snacks", title: "Potato Chips Row", desc: "All your favorite classic and spicy chips in stock." },
    { src: "./photo/Snacks/ice cream.png", category: "Snacks", title: "Frozen Ice Creams", desc: "Refreshing ice creams and frozen desserts." },
    { src: "./photo/Snacks/jams.png", category: "Snacks", title: "Jams & Sweet Spreads", desc: "Sweet jams, honey, and specialty sauces." },
    // BEVERAGES - 4 photos (in /photo/Beverages/)
    { src: "./photo/Beverages/cold drinks.png", category: "beverages", title: "Cold Drinks Cooler", desc: "Ice-cold sodas, sports drinks, and energy drinks." },
    { src: "./photo/Beverages/buzzball.png", category: "beverages", title: "BuzzBallz Selection", desc: "Popular premixed cocktails and party drinks." },
    { src: "./photo/Beverages/hard drinks.png", category: "beverages", title: "Craft Beer Vault", desc: "Chilled selection of craft beer and alcoholic beverages." },
    { src: "./photo/Beverages/hard2.png", category: "beverages", title: "Imported Beer & Wine", desc: "Imported and local selection of beers and wines." },
    // TOBACCO - 5 photos (in /photo/Tobacco/)
    { src: "./photo/Tobacco/vape.jpeg", category: "tobacco", title: "Premium Vaporizers", desc: "Latest disposable vape devices and accessories." },
    { src: "./photo/Tobacco/vape3.jpeg", category: "tobacco", title: "Vape Collection", desc: "A premium selection of quality vaporizers." },
    { src: "./photo/Tobacco/cigerellos.png", category: "tobacco", title: "Cigarillos & Cigar Wraps", desc: "Popular cigarillos and premium blunt wraps." },
    { src: "./photo/Tobacco/cigratte.png", category: "tobacco", title: "Tobacco Cigarettes", desc: "All major brands of cigarettes available." },
    { src: "./photo/Tobacco/hard2.png", category: "tobacco", title: "Alcohol & Spirits", desc: "Selection of spirits and alcoholic beverages." },
    // SERVICES - 3 photos (in /photo/Services/)
    { src: "./photo/Services/Ice machine.png", category: "services", title: "In-Store Ice Machine", desc: "Bagged ice available in-store." },
    { src: "./photo/Services/counter.png", category: "services", title: "Checkout Counter", desc: "Fast and friendly checkout experience." },
    { src: "./photo/Services/lotto.png", category: "services", title: "Texas Lottery Station", desc: "Try your luck with our collection of lottery scratchers." }
  ];

  // Category icons for catalog cards
  const catalogCategoryIcons = {
    Snacks: 'fa-cookie-bite',
    beverages: 'fa-glass-cheers',
    tobacco: 'fa-smoking',
    services: 'fa-concierge-bell',
    essentials: 'fa-box-open',
    grocery: 'fa-seedling',
    exterior: 'fa-store'
  };

  // Init catalog and gallery NOW — after galleryImages is defined
  initProductCatalog();
  initGallery();

  // --- PRODUCT CATALOG ---
  // Driven by galleryImages — clicking a filter shows the matching real photos.
  function initProductCatalog() {
    const catalogGrid = document.getElementById('catalog-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');

    if (!catalogGrid) return;

    renderCatalog('all');

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filterValue = btn.getAttribute('data-filter');

        catalogGrid.style.opacity = 0;
        setTimeout(() => {
          renderCatalog(filterValue);
          catalogGrid.style.opacity = 1;
        }, 200);
      });
    });

    function renderCatalog(categoryFilter) {
      catalogGrid.innerHTML = '';

      const filtered = categoryFilter === 'all'
        ? galleryImages
        : galleryImages.filter(img => img.category === categoryFilter);

      if (filtered.length === 0) {
        catalogGrid.innerHTML = `<p style="color:var(--text-muted);text-align:center;grid-column:1/-1;padding:3rem 0;">No items in this category yet.</p>`;
        return;
      }

      filtered.forEach(img => {
        const icon = catalogCategoryIcons[img.category] || 'fa-tag';
        const label = img.category.charAt(0).toUpperCase() + img.category.slice(1);
        const card = document.createElement('div');
        card.className = 'product-card glass-card fade-in';
        card.innerHTML = `
          <div class="product-image-container">
            <span class="product-tag"><i class="fas ${icon}"></i> ${label}</span>
            <img src="${img.src}" alt="${img.title}" loading="lazy" onerror="this.style.display='none'; this.parentElement.style.background='var(--bg-2)';">
          </div>
          <div class="product-info">
            <div class="product-meta">
              <span class="product-category">${label}</span>
              <span class="product-availability">In Store</span>
            </div>
            <h3 class="product-name">${img.title}</h3>
            <p class="product-description">${img.desc}</p>
            <div class="product-footer">
              <span class="product-specialty">
                <i class="fas fa-check-circle"></i> Everyday Low Price
              </span>
            </div>
          </div>
        `;
        catalogGrid.appendChild(card);
      });
    }
  }

  // --- STORE TOUR GALLERY & LIGHTBOX ---


  function initGallery() {
    const galleryGrid = document.getElementById('gallery-grid');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox ? lightbox.querySelector('.lightbox-img') : null;
    const lightboxCaption = lightbox ? lightbox.querySelector('.lightbox-caption') : null;
    const closeBtn = lightbox ? lightbox.querySelector('.lightbox-close') : null;
    const prevBtn = lightbox ? lightbox.querySelector('.lightbox-prev') : null;
    const nextBtn = lightbox ? lightbox.querySelector('.lightbox-next') : null;
    const filterButtons = document.querySelectorAll('.gallery-filter-btn');

    if (!galleryGrid || !lightbox) return;

    let visibleImages = [...galleryImages];

    function renderGallery(categoryFilter) {
      galleryGrid.innerHTML = '';

      visibleImages = categoryFilter === 'all'
        ? galleryImages
        : galleryImages.filter(img => img.category === categoryFilter);

      visibleImages.forEach((img, idx) => {
        const item = document.createElement('div');
        item.className = 'gallery-item fade-in';
        item.setAttribute('data-index', idx);
        item.innerHTML = `
          <img src="${img.src}" alt="${img.title}" loading="lazy" onerror="this.style.display='none'; this.parentElement.style.background='var(--bg-2)';">
          <div class="gallery-overlay">
            <span class="gallery-tag">${img.category.replace(/-/g, ' ')}</span>
            <h4 class="gallery-title">${img.title}</h4>
          </div>
        `;
        galleryGrid.appendChild(item);

        item.addEventListener('click', () => {
          openLightbox(idx);
        });
      });
    }

    renderGallery('all');

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filterValue = btn.getAttribute('data-filter');

        galleryGrid.style.opacity = 0;
        setTimeout(() => {
          renderGallery(filterValue);
          galleryGrid.style.opacity = 1;
        }, 200);
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closeLightbox);
    }
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateLightbox(-1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateLightbox(1);
      });
    }

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    });

    function openLightbox(index) {
      activeLightboxIndex = index;
      const img = visibleImages[index];
      if (!img) return;

      lightboxImg.src = img.src;
      lightboxCaption.innerHTML = `<strong>${img.title}</strong> - ${img.desc}`;

      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }

    function navigateLightbox(dir) {
      if (visibleImages.length === 0) return;
      let nextIndex = activeLightboxIndex + dir;
      if (nextIndex < 0) nextIndex = visibleImages.length - 1;
      if (nextIndex >= visibleImages.length) nextIndex = 0;

      lightboxImg.style.opacity = 0;
      setTimeout(() => {
        openLightbox(nextIndex);
        lightboxImg.style.opacity = 1;
      }, 150);
    }
  }

  // --- REVIEWS CAROUSEL ---
  const reviews = [
    {
      author: "Laxman Bista",
      stars: 5,
      meta: "Verified Customer · Google Review",
      text: "Awesome Store with things that are hard to find. They had Himalayan Shilajit. Cool store. Very helpful staff and a great clean environment."
    },
    {
      author: "Shalarith Sundras",
      stars: 5,
      meta: "Verified Customer · Google Review",
      text: "Great little selection, friendly staff even in the late hours. Great to have for the neighborhood! Perfect one-stop shop for both Snacks and international spices."
    },
    {
      author: "Nextdoor Neighbor",
      stars: 5,
      meta: "Resident in Golden Triangle Heritage · Nextdoor",
      text: "Vista Food Mart is my neighborhood favorite stop in Fort Worth. It's clean, welcoming, and they carry an incredible selection of Indian spices and general groceries."
    },
    {
      author: "Fort Worth Local",
      stars: 5,
      meta: "Local Guide · Google Review",
      text: "Super convenient and clean space. Excellent selection of beverages, Mexican foods, Snacks, and basic utilities. Friendly neighborhood customer service."
    }
  ];

  function initReviewsSlider() {
    const reviewsTrack = document.getElementById('reviews-track');
    const dotsContainer = document.getElementById('reviews-dots');

    if (!reviewsTrack || !dotsContainer) return;

    reviews.forEach((review, idx) => {
      const slide = document.createElement('div');
      slide.className = 'review-slide';

      let starHtml = '';
      for (let i = 0; i < review.stars; i++) {
        starHtml += '<i class="fas fa-star"></i> ';
      }

      slide.innerHTML = `
        <div class="review-card glass-card">
          <div class="review-rating">${starHtml}</div>
          <p class="review-text">"${review.text}"</p>
          <div class="review-author">
            <div class="author-avatar">${review.author.charAt(0)}</div>
            <div class="author-info">
              <span class="author-name">${review.author}</span>
              <span class="author-meta">${review.meta}</span>
            </div>
          </div>
        </div>
      `;
      reviewsTrack.appendChild(slide);

      const dot = document.createElement('div');
      dot.className = `reviews-dot ${idx === 0 ? 'active' : ''}`;
      dot.addEventListener('click', () => {
        goToReview(idx);
      });
      dotsContainer.appendChild(dot);
    });

    function goToReview(index) {
      currentReviewIndex = index;
      reviewsTrack.style.transform = `translateX(-${index * 100}%)`;

      const dots = dotsContainer.querySelectorAll('.reviews-dot');
      dots.forEach((dot, idx) => {
        if (idx === index) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }

    let rotateInterval = setInterval(() => {
      let nextIndex = currentReviewIndex + 1;
      if (nextIndex >= reviews.length) nextIndex = 0;
      goToReview(nextIndex);
    }, 6000);

    dotsContainer.addEventListener('click', () => {
      clearInterval(rotateInterval);
      rotateInterval = setInterval(() => {
        let nextIndex = currentReviewIndex + 1;
        if (nextIndex >= reviews.length) nextIndex = 0;
        goToReview(nextIndex);
      }, 6000);
    });
  }
});
