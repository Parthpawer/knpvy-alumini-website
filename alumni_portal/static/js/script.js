// Auto-play carousel (pauses on hover, respects reduced motion)
    (function(){
      const ids = ['c1','c2','c3'];
      const radios = ids.map(id => document.getElementById(id)).filter(Boolean);
      if (!radios.length) return;
      let idx = radios.findIndex(r => r.checked);
      if (idx < 0) idx = 0;
      let timer;
      const step = () => { idx = (idx + 1) % radios.length; radios[idx].checked = true; };
      const start = () => { stop(); timer = setInterval(step, 5000); };
      const stop  = () => { if (timer) clearInterval(timer); };

      // sync when user clicks dots
      radios.forEach((r, i) => r.addEventListener('change', () => { idx = i; start(); }));

      // pause on hover/focus within carousel
      const carousel = document.querySelector('.carousel');
      if (carousel){
        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        carousel.addEventListener('focusin', stop);
        carousel.addEventListener('focusout', start);
      }

      // respect reduced motion
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) start();
    })();