 // Role-only filtering
    const qs = (s, el=document) => el.querySelector(s);
    const qsa = (s, el=document) => Array.from(el.querySelectorAll(s));

    const filterRole = qs('#filterRole');
    const cards = qsa('#memberGrid .person');
    const noResults = qs('#noResults');

    function normalize(s){ return (s||'').toLowerCase().trim(); }

    function applyRoleFilter(){
      const role = normalize(filterRole.value);
      let shown = 0;

      cards.forEach(card=>{
        const r = normalize(card.dataset.role);
        const ok = !role || r === role;
        card.style.display = ok ? '' : 'none';
        if(ok) shown++;
      });

      if(noResults) noResults.style.display = shown ? 'none' : '';
    }

    if(filterRole){ filterRole.addEventListener('change', applyRoleFilter); }
    applyRoleFilter();