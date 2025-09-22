
(function(){
  const header = document.querySelector('header.navbar');
  const toggleBtn = document.querySelector('.nav-toggle');
  const dropdownBtns = document.querySelectorAll('.has-dropdown > .dropdown-toggle');

  // Toggle mobile menu
  toggleBtn.addEventListener('click', () => {
    const open = header.classList.toggle('open');
    toggleBtn.setAttribute('aria-expanded', open);
  });

  // Toggle dropdown (mobile)
  dropdownBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Only treat as toggle on mobile widths
      if (window.matchMedia('(max-width: 860px)').matches){
        const li = btn.closest('.has-dropdown');
        const isOpen = li.classList.toggle('open');
        btn.setAttribute('aria-expanded', isOpen);
      }
    });
  });

  // Close menus on outside click
  document.addEventListener('click', (e) => {
    if (!header.contains(e.target)){
      header.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded','false');
      document.querySelectorAll('.has-dropdown.open').forEach(li => {
        li.classList.remove('open');
        li.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded','false');
      });
    }
  });

  // ESC to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape'){
      header.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded','false');
      document.querySelectorAll('.has-dropdown.open').forEach(li => {
        li.classList.remove('open');
        li.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded','false');
      });
    }
  });

  // Close menu after clicking a link (mobile)
  document.querySelectorAll('.site-nav a').forEach(a => {
    a.addEventListener('click', () => {
      header.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded','false');
      document.querySelectorAll('.has-dropdown.open').forEach(li => {
        li.classList.remove('open');
        li.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded','false');
      });
    });
  });
})();

// Card carousels: arrows page by visible-count; responsive (4 / 2 / 1) + swipe/drag support
// ===== Windowed Cards Carousel (Announcements + Alumni) =====
(function(){
  const carousels = document.querySelectorAll('.cards-carousel');
  if (!carousels.length) return;

  carousels.forEach(setupCarousel);

  function setupCarousel(root){
    const viewport = root.querySelector('.cc-viewport');
    const track    = root.querySelector('.cc-track');
    const cards    = track ? Array.from(track.children).filter(el => el.classList.contains('card')) : [];
    const prevBtn  = root.querySelector('.cc-btn.prev');
    const nextBtn  = root.querySelector('.cc-btn.next');

    if (!viewport || !track || !cards.length) return;

    let index = 0;            // leftmost visible card index
    let step = 0;             // px to move per click (card width + gap)
    let maxIndex = 0;         // last valid leftmost index
    let rafId = null;

    function getCSSNumber(el, prop){
      const v = getComputedStyle(el).getPropertyValue(prop).trim();
      return parseFloat(v) || 0;
    }

    function recalc(){
      const styles = getComputedStyle(root);
      const per = parseFloat(styles.getPropertyValue('--cc-per')) || 1;
      const gap = getCSSNumber(track, 'gap');

      // Measure actual card width (includes flex calc at current breakpoint)
      const firstCard = cards[0];
      const cardW = firstCard.getBoundingClientRect().width;

      step = cardW + gap;
      maxIndex = Math.max(0, cards.length - per);

      if (index > maxIndex) index = maxIndex; // clamp if resizing shrinks space
      applyOffset();
      updateButtons();
    }

    function applyOffset(){
      // Update CSS var so track translates cleanly in CSS
      root.style.setProperty('--cc-offset', `${index * step}px`);
    }

    function updateButtons(){
      prevBtn && (prevBtn.disabled = index <= 0);
      nextBtn && (nextBtn.disabled = index >= maxIndex);
    }

    function go(dir){
      index = Math.min(maxIndex, Math.max(0, index + dir));
      applyOffset();
      // Let transform finish before updating disabled state (avoids flicker)
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateButtons);
    }

    // Bind
    prevBtn && prevBtn.addEventListener('click', () => go(-1));
    nextBtn && nextBtn.addEventListener('click', () => go(1));

    // Recalculate on resize (debounced)
    let t;
    window.addEventListener('resize', () => {
      clearTimeout(t);
      t = setTimeout(recalc, 80);
    }, { passive:true });

    // Init once layout is ready
    requestAnimationFrame(recalc);
  }
})();
