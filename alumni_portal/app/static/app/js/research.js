
document.addEventListener('DOMContentLoaded', () => {
  "use strict";

  // -------- Helpers --------
  const $  = (s, el=document)=>el.querySelector(s);
  const $$ = (s, el=document)=>Array.from(el.querySelectorAll(s));
  const norm = s => (s||'').toLowerCase();

  // -------- Elements (ONLY All Papers section) --------
  const papersEl = $('#papers');                 // results container (filterable)
  const cards    = $$('#papers .paper');         // paper cards that are filterable
  const qDesk    = $('#qDesk');                  // desktop search (in rail)
  const qMobile  = $('#qMobile');                // mobile search (outside rail)
  const noRes    = $('#noResults');
  const countEl  = $('#count');
  const sortSel  = $('#sort');
  const resetBtn = $('#reset');
  const yearWrap = $('#yearChips');

  // -------- State --------
  const state = { year:'', type:'', q:'', sort: sortSel ? sortSel.value : 'new' };

  // Initialize state.q from whichever input has content
  state.q = (qDesk && qDesk.value) ? qDesk.value : (qMobile && qMobile.value) ? qMobile.value : '';

  // -------- Build Year chips dynamically from #papers (NOT spotlight) --------
  function buildYearChips(){
    if(!yearWrap) return;
    yearWrap.innerHTML = '';
    const yearsSet = new Set(cards.map(c => c.dataset.year).filter(Boolean));
    const yearsArr = Array.from(yearsSet)
      .map(n => parseInt(n,10))
      .filter(n => !isNaN(n))
      .sort((a,b)=> b-a)
      .map(String);

    const all = document.createElement('button');
    all.className = 'chip active';
    all.dataset.year = '';
    all.textContent = 'All';
    yearWrap.appendChild(all);

    yearsArr.forEach(y=>{
      const b = document.createElement('button');
      b.className = 'chip';
      b.dataset.year = y;
      b.textContent = y;
      yearWrap.appendChild(b);
    });
  }
  buildYearChips();

  // -------- Chip wiring --------
  function wireChipGroup(containerId, key){
    $$('#'+containerId+' .chip').forEach(chip=>{
      chip.addEventListener('click', ()=>{
        const val = chip.dataset[key] || '';
        state[key] = val;
        $$('#'+containerId+' .chip').forEach(c=>{
          c.classList.toggle('active', (c.dataset[key]||'')===val);
        });
        apply(); // update results and (if needed) sort
      });
    });
  }
  wireChipGroup('yearChips','year');
  wireChipGroup('typeChips','type');

  // -------- Search (both desktop + mobile, kept in sync) --------
  function wireSearch(input){
    if(!input) return;
    input.addEventListener('input', ()=>{
      state.q = input.value;
      // sync the other input without re-triggering event side-effects
      if(input === qDesk && qMobile && qMobile.value !== state.q) qMobile.value = state.q;
      if(input === qMobile && qDesk && qDesk.value !== state.q) qDesk.value = state.q;
      apply();
    });
  }
  wireSearch(qDesk);
  wireSearch(qMobile);

  // -------- Sort (Newest/Oldest) --------
  if(sortSel){
    sortSel.addEventListener('change', (e)=>{
      state.sort = e.target.value;  // 'new' | 'old'
      apply();                      // reorders DOM + filters
    });
  }

  // -------- Reset --------
  function setActiveChip(containerId, value){
    const attr = containerId === 'yearChips' ? 'year' : 'type';
    $$('#'+containerId+' .chip').forEach(c=>{
      c.classList.toggle('active', (c.dataset[attr]||'') === value);
    });
  }
  if(resetBtn){
    resetBtn.addEventListener('click', ()=>{
      state.year = '';
      state.type = '';
      state.q    = '';
      if(qDesk)   qDesk.value   = '';
      if(qMobile) qMobile.value = '';
      setActiveChip('yearChips','');
      setActiveChip('typeChips','');
      apply();
    });
  }

  // -------- Core: filter + (optional) reorder (All Papers only) --------
  function apply(keepOrder=false){
    const q = norm(state.q);

    // Reorder cards by year if not asked to keep order
    if(!keepOrder && papersEl){
      const sorted = [...cards].sort((a,b)=>{
        const ya = parseInt(a.dataset.year,10) || 0;
        const yb = parseInt(b.dataset.year,10) || 0;
        return state.sort === 'new' ? (yb - ya) : (ya - yb);
      });
      sorted.forEach(el => papersEl.appendChild(el));
    }

    // Apply filters + count
    let shown = 0;
    cards.forEach(card=>{
      const year    = card.dataset.year || '';
      const type    = card.dataset.type || '';
      const title   = norm(card.dataset.title   || '');
      const authors = norm(card.dataset.authors || '');
      const venue   = norm(card.dataset.venue   || '');
      const keys    = norm(card.dataset.keywords|| '');

      const okYear = !state.year || state.year === year;
      const okType = !state.type || state.type === type;
      const okQ    = !q || title.includes(q) || authors.includes(q) || venue.includes(q) || keys.includes(q);

      const ok = okYear && okType && okQ;
      card.style.display = ok ? '' : 'none';
      if(ok) shown++;
    });

    if(noRes)   noRes.style.display = shown ? 'none' : '';
    if(countEl) countEl.textContent = shown + (shown === 1 ? ' result' : ' results');
  }

  // Initial paint (keep initial order)
  apply(true);

  // -------- Cite toggle + Copy BibTeX (works for All Papers only) --------
  $$('.citeBtn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id  = btn.dataset.target;
      const box = $('#'+id);
      if(!box) return;
      const open = box.style.display === 'block';
      $$('.cite').forEach(c => c.style.display='none');
      box.style.display = open ? 'none' : 'block';
    });
  });

  $$('[data-copy]').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      const id  = btn.dataset.copy;
      const pre = $('#'+id+' pre');
      if(!pre) return;
      try{
        await navigator.clipboard.writeText(pre.textContent);
        btn.textContent = 'Copied!';
        setTimeout(()=>btn.textContent='Copy BibTeX', 1200);
      }catch(e){
        btn.textContent = 'Press Ctrl/Cmd+C';
        setTimeout(()=>btn.textContent='Copy BibTeX', 1500);
      }
    });
  });

  // -------- Mobile filter bottom-sheet (All Papers only) --------
  const rail         = $('#rail');
  const scrim        = $('#scrim');
  const openButtons  = ['#openRail', '#openRailTop'].map(sel => $(sel));
  const applyMobile  = $('#applyMobile');
  const mq           = window.matchMedia('(max-width:979px)');

  function setTopFilterButton(){
    const topBtn = $('#openRailTop');
    if(topBtn) topBtn.style.display = mq.matches ? 'inline-grid' : 'none';
  }
  setTopFilterButton();
  mq.addEventListener('change', setTopFilterButton);

  function openRail(){
    if(!rail) return;
    rail.classList.add('open');
    openButtons.forEach(b=> b && b.setAttribute('aria-expanded','true'));
  }
  function closeRail(){
    if(!rail) return;
    rail.classList.remove('open');
    openButtons.forEach(b=> b && b.setAttribute('aria-expanded','false'));
  }
  openButtons.forEach(b => b && b.addEventListener('click', openRail));
  if(scrim)       scrim.addEventListener('click', closeRail);
  if(applyMobile) applyMobile.addEventListener('click', closeRail);
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && rail && rail.classList.contains('open')) closeRail();
  });
});