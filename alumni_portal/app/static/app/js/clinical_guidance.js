
  // Helpers
  const $  = (s, el=document)=>el.querySelector(s);
  const $$ = (s, el=document)=>Array.from(el.querySelectorAll(s));
  const norm = s => (s||'').toLowerCase();

  // Elements
  const qInput = $('#q');
  const cards  = $$('#guides .guide');
  const noRes  = $('#noResults');
  const countEl= $('#count');

  // Filter state
  const state = { type:'', scope:'', system:'', q:'' };

  // Chips
  function wireChips(container, key){
    $$('#'+container+' .chip').forEach(chip=>{
      chip.addEventListener('click', ()=>{
        const value = chip.dataset[key] || '';
        state[key] = value;
        // active
        $$('#'+container+' .chip').forEach(c=>c.classList.toggle('active', (c.dataset[key]||'')===value));
        applyFilters();
      });
    });
  }
  wireChips('typeChips','type');
  wireChips('scopeChips','scope');
  wireChips('systemChips','system');

  // Search
  qInput.addEventListener('input', ()=>{ state.q = qInput.value; applyFilters(); });

  // Reset
  $('#reset').addEventListener('click', ()=>{
    state.type = state.scope = state.system = state.q = '';
    qInput.value = '';
    ['typeChips','scopeChips','systemChips'].forEach(id=>{
      const chips = $$('#'+id+' .chip');
      chips.forEach(c=>c.classList.toggle('active', (c.dataset[id.replace('Chips','').toLowerCase()]||'')===''));
    });
    applyFilters();
  });

  // Apply (closes mobile panel)
  $('#applyMobile').addEventListener('click', ()=>closeRail());

  // Filtering
  function applyFilters(){
    const q = norm(state.q);
    let shown = 0;
    cards.forEach(card=>{
      const type   = norm(card.dataset.type||'');
      const scope  = norm(card.dataset.scope||'');
      const system = norm(card.dataset.system||'');
      const title  = norm(card.dataset.title||'');
      const keys   = norm(card.dataset.keywords||'');

      const okType   = !state.type   || type === state.type;
      const okScope  = !state.scope  || scope === state.scope;
      const okSystem = !state.system || system === state.system;
      const okQ      = !q || title.includes(q) || keys.includes(q);

      const ok = okType && okScope && okSystem && okQ;
      card.style.display = ok ? '' : 'none';
      if(ok) shown++;
    });
    noRes.style.display = shown ? 'none' : '';
    countEl.textContent = shown + (shown===1 ? ' result' : ' results');
  }

  // Initial render
  applyFilters();

  // Mobile rail open/close
  const rail = $('#rail');
  const scrim = $('#scrim');
  const openBtns = ['#openRail', '#openRailTop'].map(sel=>$(sel));
  const mq = window.matchMedia('(max-width:979px)');

  function setTopFilterButton(){
    $('#openRailTop').style.display = mq.matches ? 'inline-grid' : 'none';
  }
  setTopFilterButton();
  mq.addEventListener('change', setTopFilterButton);

  function openRail(){
    rail.classList.add('open');
    openBtns.forEach(b=>{ if(b){ b.setAttribute('aria-expanded','true'); } });
  }
  function closeRail(){
    rail.classList.remove('open');
    openBtns.forEach(b=>{ if(b){ b.setAttribute('aria-expanded','false'); } });
  }

  openBtns.forEach(b=> b && b.addEventListener('click', openRail));
  scrim.addEventListener('click', closeRail);

  // Close on Escape when open
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && rail.classList.contains('open')) closeRail();
  });
