// LUXORA SLIDE 5 — CSS Mask Furniture Reveal + Multi-Angle Gallery
// Each furniture layer is the FULL roomdoluoda.jpg masked to a specific region.
// This ensures perfect perspective and proportions from the original image.

function initDemo() {
  threeInit = true;

  const cmd     = document.getElementById('s5-cmd');
  const stepEl  = document.getElementById('s5-step');
  const countEl = document.getElementById('mv-count');
  const dots    = document.querySelectorAll('.s5-dot');
  const procEl  = document.getElementById('s5-processing');
  const btn360  = document.getElementById('btn-360');
  const ringEl  = document.getElementById('s5-ring');

  // Furniture layers (masked versions of roomdoluoda.jpg)
  const fLayers = [
    document.getElementById('fl-sofa'),
    document.getElementById('fl-tables'),
    document.getElementById('fl-decor'),
    document.getElementById('fl-lights'),
  ];

  const steps = [
    { cmd: '›_ Koltuk grubu yerleştir',          count: 3, layer: 0, cx: 50, cy: 52 },
    { cmd: '›_ Sehpa ve yan masalar ekle',       count: 5, layer: 1, cx: 42, cy: 64 },
    { cmd: '›_ Dekorasyon ve tablo ekle',         count: 7, layer: 2, cx: 22, cy: 36 },
    { cmd: '›_ Aydınlatma ve son dokunuşlar',     count: 9, layer: 3, cx: 50, cy: 8 },
  ];

  function showCmd(text) {
    cmd.textContent = text;
    cmd.classList.add('show');
  }
  function hideCmd() { cmd.classList.remove('show'); }

  function showRing(cx, cy) {
    if (!ringEl) return;
    ringEl.style.left = cx + '%';
    ringEl.style.top = cy + '%';
    ringEl.classList.remove('active');
    void ringEl.offsetWidth;
    ringEl.classList.add('active');
    setTimeout(() => ringEl.classList.remove('active'), 2200);
  }

  function revealFurniture(idx) {
    const el = fLayers[idx];
    if (!el) return;
    // Blur-to-sharp + fade-in for natural materialization
    el.style.transition = 'opacity 1.8s ease, filter 2.2s ease';
    el.style.opacity = '1';
    el.style.filter = 'blur(0px)';
  }

  function reset() {
    fLayers.forEach(el => {
      if (el) {
        el.style.transition = 'none';
        el.style.opacity = '0';
        el.style.filter = 'blur(12px)';
      }
    });
    hideCmd();
    stepEl.textContent = 'AI komutunu bekliyor...';
    stepEl.style.color = '';
    countEl.textContent = '0';
    dots.forEach(d => d.classList.remove('done'));
    if (procEl) procEl.classList.remove('active');
    if (ringEl) ringEl.classList.remove('active');
    if (btn360) btn360.classList.remove('show');
  }

  function run() {
    reset();
    let delay = 2500;

    steps.forEach((step, i) => {
      // Processing spinner before each step
      setTimeout(() => {
        if (procEl) procEl.classList.add('active');
      }, delay - 800);

      setTimeout(() => {
        if (procEl) procEl.classList.remove('active');
        showCmd(step.cmd);
        dots[i].classList.add('done');
        stepEl.textContent = step.cmd.replace('›_ ', '');

        // Ring pulse + furniture reveal
        setTimeout(() => {
          showRing(step.cx, step.cy);
          revealFurniture(step.layer);

          // Animate counter
          const prev = i > 0 ? steps[i-1].count : 0;
          const target = step.count;
          let cur = prev;
          const tick = setInterval(() => {
            cur++;
            countEl.textContent = cur;
            if (cur >= target) clearInterval(tick);
          }, 200);
        }, 600);

        // Hide command bubble
        setTimeout(() => {
          hideCmd();
          if (i === steps.length - 1) {
            setTimeout(() => {
              stepEl.textContent = '✓ Tasarım tamamlandı';
              stepEl.style.color = '#C9A84C';
              if (btn360) btn360.classList.add('show');
            }, 1000);
          }
        }, 3200);
      }, delay);

      delay += 4800;
    });

    // Loop after generous pause for 360 button
    setTimeout(run, delay + 10000);
  }

  run();

  // --- MULTI-ANGLE GALLERY ---
  if (btn360) {
    btn360.addEventListener('click', (e) => {
      e.stopPropagation();
      openGallery();
    });
  }

  function openGallery() {
    const overlay = document.getElementById('pano-overlay');
    if (!overlay) return;
    overlay.classList.add('active');

    const container = document.getElementById('pano-container');
    const gallery = document.getElementById('gallery-track');
    const dotsCtn = document.getElementById('gallery-dots');
    if (!gallery) return;

    const candidates = [
      'roomdoluoda.jpg',
      'room_angle_left.png',
      'room_angle_right.png',
      'room_angle_close.png'
    ];

    const loadImage = (src) => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = () => resolve(null);
      img.src = src;
    });

    Promise.all(candidates.map(loadImage)).then(results => {
      const images = results.filter(Boolean);
      if (images.length === 0) return;

      let currentIndex = 0;
      let autoTimer;

      gallery.innerHTML = '';
      if (dotsCtn) dotsCtn.innerHTML = '';

      images.forEach((src, i) => {
        const slide = document.createElement('div');
        slide.className = 'gallery-slide' + (i === 0 ? ' active' : '');
        slide.style.backgroundImage = `url(${src})`;
        gallery.appendChild(slide);

        if (dotsCtn) {
          const dot = document.createElement('div');
          dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
          dot.onclick = () => goTo(i);
          dotsCtn.appendChild(dot);
        }
      });

      function goTo(idx) {
        const slides = gallery.querySelectorAll('.gallery-slide');
        const galDots = dotsCtn ? dotsCtn.querySelectorAll('.gallery-dot') : [];
        slides.forEach(s => s.classList.remove('active'));
        galDots.forEach(d => d.classList.remove('active'));
        slides[idx]?.classList.add('active');
        galDots[idx]?.classList.add('active');
        currentIndex = idx;
      }

      function next() {
        goTo((currentIndex + 1) % images.length);
      }

      autoTimer = setInterval(next, 4000);

      let startX = 0;
      container.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        clearInterval(autoTimer);
      });
      container.addEventListener('mouseup', (e) => {
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 50) {
          if (dx < 0) next();
          else goTo((currentIndex - 1 + images.length) % images.length);
        }
        autoTimer = setInterval(next, 4000);
      });

      container.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        clearInterval(autoTimer);
      });
      container.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 50) {
          if (dx < 0) next();
          else goTo((currentIndex - 1 + images.length) % images.length);
        }
        autoTimer = setInterval(next, 4000);
      });

      document.getElementById('pano-close').onclick = () => {
        overlay.classList.remove('active');
        clearInterval(autoTimer);
      };
    });
  }
}
