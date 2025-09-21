
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
(function(){
  function visibleCount(){
    // Mobile: 1, Tablet: 2, Desktop: 4
    if (window.matchMedia('(max-width: 639px)').matches) return 1;
    if (window.matchMedia('(max-width: 999px)').matches) return 2;
    return 4;
  }

  function initCarousel(root){
    const viewport = root.querySelector('.cc-viewport');
    const track    = root.querySelector('.cc-track');
    const prevBtn  = root.querySelector('.cc-btn.prev');
    const nextBtn  = root.querySelector('.cc-btn.next');
    if (!viewport || !track || !prevBtn || !nextBtn) return;

    const cards = Array.from(track.children).filter(el => el.classList.contains('card'));
    if (!cards.length) return;

    // prevent image ghost-drag
    cards.forEach(card => card.querySelectorAll('img').forEach(img => img.draggable = false));

    let vis = visibleCount();
    let page = 0;

    function pages(){ return Math.max(1, Math.ceil(cards.length / vis)); }

    function applyVisible(keepIndex=true){
      const oldVis = vis;
      vis = visibleCount();
      track.style.setProperty('--cc-visible', String(vis));
      const totalPages = pages();

      if (keepIndex){
        const firstIndex = page * oldVis;                 // approx first card index
        page = Math.floor(firstIndex / vis);
      }
      page = Math.max(0, Math.min(totalPages - 1, page));
      jumpTo(page);
      updateButtons();
    }

    function updateButtons(){
      prevBtn.disabled = page <= 0;
      nextBtn.disabled = page >= pages() - 1;
    }

    function offsetFor(p){
      return viewport.clientWidth * p;
    }

    function slideTo(p){
      page = Math.max(0, Math.min(pages() - 1, p));
      track.style.transform = `translateX(-${offsetFor(page)}px)`;
      updateButtons();
    }

    function jumpTo(p){
      const prev = track.style.transition;
      track.style.transition = 'none';
      track.style.transform = `translateX(-${offsetFor(p)}px)`;
      // force reflow then restore transition
      // eslint-disable-next-line no-unused-expressions
      track.offsetHeight;
      track.style.transition = prev || 'transform .45s ease';
    }

    // Arrow controls
    prevBtn.addEventListener('click', () => slideTo(page - 1));
    nextBtn.addEventListener('click', () => slideTo(page + 1));

    // ----- Swipe / drag support -----
    let dragging = false;
    let dragLocked = false;       // lock to horizontal once intent is clear
    let startX = 0, startY = 0;
    let startOffset = 0;

    function beginDrag(clientX, clientY, pointerId, target){
      dragging = true;
      dragLocked = false;
      startX = clientX;
      startY = clientY;
      startOffset = -offsetFor(page);
      track.style.transition = 'none';
      track.classList.add('is-dragging');
      document.body.classList.add('no-select');
      // pointer capture for consistent events
      if (target.setPointerCapture && pointerId != null) target.setPointerCapture(pointerId);
    }

    function moveDrag(clientX, clientY, e){
      if (!dragging) return;
      const dx = clientX - startX;
      const dy = clientY - startY;

      // Lock gesture to horizontal when it’s clearly horizontal
      if (!dragLocked){
        if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) + 4){
          dragLocked = true;
        } else if (Math.abs(dy) > Math.abs(dx) + 4){
          // vertical scroll intent — abort drag visuals, but keep state until pointerup
          return;
        }
      }

      if (dragLocked){
        const totalPages = pages();
        const maxOffset = 0;                             // page 0 => 0
        const minOffset = -offsetFor(totalPages - 1);    // last page => -N*width
        let target = startOffset + dx;

        // resistance at edges
        if (target > maxOffset) target = maxOffset + (target - maxOffset) * 0.25;
        if (target < minOffset) target = minOffset + (target - minOffset) * 0.25;

        track.style.transform = `translateX(${target}px)`;
        // prevent the page from also scrolling horizontally
        if (e && e.cancelable) e.preventDefault();
      }
    }

    function endDrag(clientX, clientY, pointerId, target){
      if (!dragging) return;
      dragging = false;
      const dx = clientX - startX;
      const threshold = viewport.clientWidth * 0.20; // swipe threshold = 20% of viewport
      if (dragLocked && Math.abs(dx) > threshold){
        slideTo(dx < 0 ? page + 1 : page - 1);
      } else {
        slideTo(page); // snap back
      }
      track.classList.remove('is-dragging');
      document.body.classList.remove('no-select');
      if (target.releasePointerCapture && pointerId != null){
        try { target.releasePointerCapture(pointerId); } catch(_) {}
      }
    }

    // Use pointer events (works for touch, pen, mouse)
    viewport.addEventListener('pointerdown', (e) => {
      // Left mouse or any touch/pen
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      beginDrag(e.clientX, e.clientY, e.pointerId, viewport);
    }, { passive: true });

    viewport.addEventListener('pointermove', (e) => {
      moveDrag(e.clientX, e.clientY, e);
    }, { passive: false }); // we may call preventDefault during horizontal drag

    const endHandler = (e) => endDrag(e.clientX, e.clientY, e.pointerId, viewport);
    viewport.addEventListener('pointerup', endHandler, { passive: true });
    viewport.addEventListener('pointercancel', endHandler, { passive: true });
    viewport.addEventListener('pointerleave', (e) => {
      if (!dragging) return;
      endDrag(e.clientX ?? startX, e.clientY ?? startY, e.pointerId, viewport);
    }, { passive: true });

    // Resize handling: recalc visible and keep alignment
    let rAF;
    function onResize(){
      cancelAnimationFrame(rAF);
      rAF = requestAnimationFrame(() => applyVisible(true));
    }
    window.addEventListener('resize', onResize);

    // If images load later, realign (width unaffected but safe)
    window.addEventListener('load', () => jumpTo(page));

    // Start
    applyVisible(false); // set vis & align to page 0
  }

  document.querySelectorAll('.cards-carousel').forEach(initCarousel);
})();
