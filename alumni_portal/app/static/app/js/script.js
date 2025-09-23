(function(){
  const track = document.getElementById('track');
  const slides = Array.from(track.children);
  const dots = Array.from(document.querySelectorAll('.carousel-dot'));
  const prev = document.getElementById('prevBtn');
  const next = document.getElementById('nextBtn');
  const viewport = track.parentElement;

  let index = 0;
  let timer = null;
  const INTERVAL = 4000; // 5 seconds

  function goTo(i){
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d,n)=> d.setAttribute('aria-current', n===index ? 'true' : 'false'));
  }

  function play(){
    stop();
    timer = setInterval(()=> goTo(index + 1), INTERVAL);
  }
  function stop(){
    if (timer){ clearInterval(timer); timer = null; }
  }

  // Buttons
  prev.addEventListener('click', ()=>{ goTo(index - 1); play(); });
  next.addEventListener('click', ()=>{ goTo(index + 1); play(); });

  // Dots
  dots.forEach(d => d.addEventListener('click', e => {
    goTo(+e.currentTarget.dataset.index);
    play();
  }));

  // Keyboard
  track.closest('.carousel').tabIndex = 0;
  track.closest('.carousel').addEventListener('keydown', e=>{
    if (e.key === 'ArrowLeft') { goTo(index - 1); play(); }
    if (e.key === 'ArrowRight'){ goTo(index + 1); play(); }
  });

  // Swipe
  let startX = 0, dx = 0, dragging = false;
  const onDown = e => {
    dragging = true;
    startX = (e.touches ? e.touches[0].clientX : e.clientX) || 0;
    track.style.transition = 'none';
    stop();
  };
  const onMove = e => {
    if (!dragging) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX) || 0;
    dx = x - startX;
    const pct = dx / viewport.clientWidth * 100;
    track.style.transform = `translateX(calc(-${index*100}% + ${pct}%))`;
  };
  const onUp = () => {
    if (!dragging) return;
    track.style.transition = '';
    const threshold = viewport.clientWidth * 0.15;
    if (Math.abs(dx) > threshold){
      goTo(index + (dx < 0 ? 1 : -1));
    } else {
      goTo(index);
    }
    dragging = false; dx = 0; play();
  };

  viewport.addEventListener('mousedown', onDown);
  viewport.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
  viewport.addEventListener('touchstart', onDown, {passive:true});
  viewport.addEventListener('touchmove', onMove, {passive:true});
  viewport.addEventListener('touchend', onUp);

  // Pause autoplay while hovering/focusing for better UX
  track.closest('.carousel').addEventListener('mouseenter', stop);
  track.closest('.carousel').addEventListener('mouseleave', play);
  track.closest('.carousel').addEventListener('focusin', stop);
  track.closest('.carousel').addEventListener('focusout', play);

  // Kickoff
  goTo(0);
  play();
})();