
    (function(){
      function initSlider(root){
        const track = root.querySelector('[class$="-track"]');
        const slides = Array.from(track.children);
        const prev = root.querySelector('[data-prev]');
        const next = root.querySelector('[data-next]');
        const dotsWrap = root.querySelector('.dots');
        const isStories = root.dataset.slider === 'stories';
        const auto = root.getAttribute('data-auto') === 'true';
        const interval = parseInt(root.getAttribute('data-interval')) || 4000;
        let index = 0, timer = null;

        function go(i){
          index = (i + slides.length) % slides.length;
          const w = slides[0].getBoundingClientRect().width;
          track.style.transform = 'translateX(' + (-index * w) + 'px)';
          if(dotsWrap){ Array.from(dotsWrap.children).forEach((d,di)=>d.setAttribute('aria-selected', di===index)); }
        }
        function nextSlide(){ go(index+1); }
        function prevSlide(){ go(index-1); }
        function play(){ if(timer) clearInterval(timer); timer = setInterval(nextSlide, interval); }
        function pause(){ if(timer) clearInterval(timer); timer = null; }

        if(dotsWrap){
          dotsWrap.innerHTML = '';
          slides.forEach((_, i)=>{
            const b = document.createElement('button');
            b.type = 'button'; b.setAttribute('role','tab'); b.setAttribute('aria-label','Go to '+(i+1));
            b.addEventListener('click', ()=>{ go(i); play(); });
            dotsWrap.appendChild(b);
          });
        }

        next && next.addEventListener('click', ()=>{ nextSlide(); play(); });
        prev && prev.addEventListener('click', ()=>{ prevSlide(); play(); });
        root.addEventListener('mouseenter', pause);
        root.addEventListener('mouseleave', ()=>{ if(auto) play(); });
        window.addEventListener('resize', ()=>go(index));

        go(0);
        if(auto) play();
      }
      document.addEventListener('DOMContentLoaded', ()=>{
        document.querySelectorAll('[data-slider]').forEach(initSlider);
      });
    })();