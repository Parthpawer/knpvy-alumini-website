
    // ------- Helpers -------
    const norm = v => (v ?? "").toString().trim().toLowerCase();

    // ------- This Year’s Winners filter -------
    const wcat = document.getElementById('wcat');
    const wsearch = document.getElementById('wsearch');
    const winnerCards = Array.from(document.querySelectorAll('#winners .winner'));
    const noWinners = document.getElementById('noWinners');

    function filterWinners(){
      const cat = norm(wcat.value);
      const q = norm(wsearch.value);
      let count = 0;

      winnerCards.forEach(c=>{
        const matchCat = !cat || norm(c.dataset.award) === cat;
        const matchName = !q || norm(c.dataset.name).includes(q);
        const show = matchCat && matchName;
        c.classList.toggle('is-hidden', !show);
        if (show) count++;
      });
      noWinners.classList.toggle('is-hidden', !!count);
    }
    wcat.addEventListener('change', filterWinners);
    wsearch.addEventListener('input', filterWinners);
    filterWinners(); // init

    // ------- Past Awards filters (default to last year: 2024) -------
    const pyear = document.getElementById('pyear');
    const pcat  = document.getElementById('pcat');
    const pastGroups = Array.from(document.querySelectorAll('.past-group'));
    const noPast = document.getElementById('noPast');

    function filterPast(){
      const year = pyear.value;
      const cat  = norm(pcat.value);
      let anyShown = 0;

      pastGroups.forEach(group=>{
        const isYear = group.dataset.year === year;
        group.classList.toggle('is-hidden', !isYear);

        if (isYear){
          let anyInGroup = 0;
          const cards = Array.from(group.querySelectorAll('.rec'));
          cards.forEach(card=>{
            const matchCat = !cat || norm(card.dataset.award) === cat;
            card.classList.toggle('is-hidden', !matchCat);
            if (matchCat) anyInGroup++;
          });
          anyShown += anyInGroup;
        }
      });

      noPast.classList.toggle('is-hidden', !!anyShown);
    }

    pyear.value = "2024"; // ensure default to last year
    filterPast();
    pyear.addEventListener('change', filterPast);
    pcat.addEventListener('change', filterPast);
