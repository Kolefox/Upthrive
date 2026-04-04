// =====================================================================
// OGL IMPORT
// OGL is a minimal WebGL library loaded from the esm.sh CDN.
// The page must be served over HTTP (not file://) for this import.
// Easiest way: VS Code "Live Server" extension → right-click index.html
// =====================================================================
import { Renderer, Triangle, Program, Mesh } from 'https://esm.sh/ogl';


// =====================
// MOBILE NAVIGATION TOGGLE
// Toggles .nav-open on <header> to show/hide the mobile drawer.
// The hamburger ↔ close icon swap is handled entirely in CSS.
// =====================
const siteHeader = document.querySelector('header');
const navToggle  = document.querySelector('.nav-toggle');

if (navToggle && siteHeader) {
  navToggle.addEventListener('click', function (e) {
    e.stopPropagation();
    siteHeader.classList.toggle('nav-open');
    const isOpen = siteHeader.classList.contains('nav-open');
    document.querySelector('.mobile-nav')?.setAttribute('aria-hidden', !isOpen);
  });

  // Close drawer when clicking outside the header
  document.addEventListener('click', function (e) {
    if (!siteHeader.contains(e.target)) {
      siteHeader.classList.remove('nav-open');
      document.querySelector('.mobile-nav')?.setAttribute('aria-hidden', 'true');
    }
  });

  // Close drawer when a mobile nav link is clicked
  document.querySelectorAll('.mobile-nav a').forEach(function (link) {
    link.addEventListener('click', function () {
      siteHeader.classList.remove('nav-open');
      document.querySelector('.mobile-nav')?.setAttribute('aria-hidden', 'true');
    });
  });
}


// =====================
// TRANSPARENT → FROSTED NAV ON SCROLL
// Adds 'scrolled' class past 40px so the header
// transitions from transparent to the frosted-dark state.
// =====================
if (siteHeader) {
  const onNavScroll = () => {
    siteHeader.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll(); // run immediately for mid-page loads / hard refreshes
}


// =====================
// SMOOTH SCROLL
// All in-page anchor links (#section) scroll smoothly.
// Also closes the mobile nav after tapping a link.
// =====================
document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  link.addEventListener('click', function (e) {
    const href   = this.getAttribute('href');
    const target = href === '#' ? document.body : document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});


// =====================
// SCROLL REVEAL
// Watches all .reveal elements with IntersectionObserver.
// When an element enters the viewport it receives .visible,
// triggering the CSS fade-up transition.
// Each element can have a --delay CSS custom property for
// staggered grid reveals (set inline in index.html).
// =====================
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target); // animate once only
      }
    });
  }, {
    threshold:  0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.reveal').forEach(function (el) {
    revealObserver.observe(el);
  });
}


// =====================
// CONTACT FORM
// Handles submission with a visual success state.
// Replace the body of this handler with a real fetch/API
// call (e.g. Formspree, EmailJS) when you're ready.
// =====================
const contactForm = document.querySelector('.contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const btn = contactForm.querySelector('.btn-submit');
    if (btn) {
      btn.textContent = 'Message Sent';
      btn.style.pointerEvents = 'none';
      btn.style.opacity = '0.55';
    }

    // Reset after 4 seconds so the form can be used again
    setTimeout(function () {
      contactForm.reset();
      if (btn) {
        btn.textContent = 'Send Message';
        btn.style.pointerEvents = '';
        btn.style.opacity = '';
      }
    }, 4000);
  });
}


// =====================================================================
// PRISM HERO ANIMATION
// Converted from React to vanilla JS using OGL (WebGL library).
// A fragment-shader ray-march produces the colorful prism/light
// refraction background.
//
// HOW IT WORKS:
//   1. A full-screen triangle covers the WebGL canvas.
//   2. Each pixel runs through a fragment shader that ray-marches
//      through a virtual prism (pyramid SDF).
//   3. Colors come from sine waves accumulated along the ray path.
//   4. A rotation matrix (uRot) and wobble matrix animate the shape.
//
// TO CHANGE THE LOOK: edit the CONFIG block below.
// TO CHANGE THE COPY: edit index.html inside .hero-content.
// =====================================================================

const CONFIG = {
  height:        3.5,
  baseWidth:     5.5,
  animationType: 'rotate',   // 'rotate' | 'hover' | '3drotate'
  glow:          1,
  offsetX:       0,
  offsetY:       0,
  noise:         0,
  transparent:   true,
  scale:         3.6,
  hueShift:      0,
  colorFrequency: 1,
  hoverStrength: 2,
  inertia:       0.05,
  bloom:         1,
  timeScale:     0.5
};

const container = document.getElementById('prism-container');
if (!container) {
  console.warn('Prism: #prism-container not found, skipping animation.');
} else {
  initPrism(container, CONFIG);
}

function initPrism(container, cfg) {

  const H         = Math.max(0.001, cfg.height);
  const BW        = Math.max(0.001, cfg.baseWidth);
  const BASE_HALF = BW * 0.5;
  const GLOW      = Math.max(0, cfg.glow);
  const NOISE     = Math.max(0, cfg.noise);
  const SAT       = cfg.transparent ? 1.5 : 1;
  const SCALE     = Math.max(0.001, cfg.scale);
  const HUE       = cfg.hueShift      || 0;
  const CFREQ     = Math.max(0, cfg.colorFrequency || 1);
  const BLOOM     = Math.max(0, cfg.bloom          || 1);
  const TS        = Math.max(0, cfg.timeScale       || 1);
  const HOVSTR    = Math.max(0, cfg.hoverStrength   || 1);
  const INERT     = Math.max(0, Math.min(1, cfg.inertia || 0.12));

  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  const dpr = isMobile
    ? Math.min(1,   window.devicePixelRatio || 1)
    : Math.min(1.5, window.devicePixelRatio || 1);

  const STEP_COUNT = isMobile ? 50 : 80;
  const FRAME_MS   = isMobile ? 1000 / 30 : 0;

  const renderer = new Renderer({
    dpr,
    alpha:           cfg.transparent,
    antialias:       false,
    powerPreference: isMobile ? 'default' : 'high-performance'
  });
  const gl = renderer.gl;

  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);
  gl.disable(gl.BLEND);

  Object.assign(gl.canvas.style, {
    position: 'absolute',
    inset:    '0',
    width:    '100%',
    height:   '100%',
    display:  'block'
  });
  container.appendChild(gl.canvas);

  const vertex = /* glsl */`
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragment = /* glsl */`
    precision highp float;

    uniform vec2  iResolution;
    uniform float iTime;
    uniform float uHeight;
    uniform float uBaseHalf;
    uniform mat3  uRot;
    uniform int   uUseBaseWobble;
    uniform float uGlow;
    uniform vec2  uOffsetPx;
    uniform float uNoise;
    uniform float uSaturation;
    uniform float uScale;
    uniform float uHueShift;
    uniform float uColorFreq;
    uniform float uBloom;
    uniform float uCenterShift;
    uniform float uInvBaseHalf;
    uniform float uInvHeight;
    uniform float uMinAxis;
    uniform float uPxScale;
    uniform float uTimeScale;

    vec4 tanh4(vec4 x) {
      vec4 e2x = exp(2.0 * x);
      return (e2x - 1.0) / (e2x + 1.0);
    }

    float rand(vec2 co) {
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    float sdOctaAnisoInv(vec3 p) {
      vec3 q = vec3(abs(p.x) * uInvBaseHalf,
                    abs(p.y) * uInvHeight,
                    abs(p.z) * uInvBaseHalf);
      float m = q.x + q.y + q.z - 1.0;
      return m * uMinAxis * 0.5773502691896258;
    }

    float sdPyramidUpInv(vec3 p) {
      float oct       = sdOctaAnisoInv(p);
      float halfSpace = -p.y;
      return max(oct, halfSpace);
    }

    mat3 hueRotation(float a) {
      float c = cos(a), s = sin(a);
      mat3 W = mat3(0.299, 0.587, 0.114,
                    0.299, 0.587, 0.114,
                    0.299, 0.587, 0.114);
      mat3 U = mat3( 0.701, -0.587, -0.114,
                    -0.299,  0.413, -0.114,
                    -0.300, -0.588,  0.886);
      mat3 V = mat3( 0.168, -0.331,  0.500,
                     0.328,  0.035, -0.500,
                    -0.497,  0.296,  0.201);
      return W + U * c + V * s;
    }

    void main() {
      vec2 f = (gl_FragCoord.xy - 0.5 * iResolution.xy - uOffsetPx) * uPxScale;

      float z = 5.0;
      float d = 0.0;
      vec3  p;
      vec4  o = vec4(0.0);

      float centerShift = uCenterShift;
      float cf          = uColorFreq;

      mat2 wob = mat2(1.0);
      if (uUseBaseWobble == 1) {
        float t  = iTime * uTimeScale;
        float c0 = cos(t +  0.0);
        float c1 = cos(t + 33.0);
        float c2 = cos(t + 11.0);
        wob = mat2(c0, c1, c2, c0);
      }

      const int STEPS = ${STEP_COUNT};
      for (int i = 0; i < STEPS; i++) {
        p      = vec3(f, z);
        p.xz   = p.xz * wob;
        p      = uRot * p;
        vec3 q = p;
        q.y   += centerShift;
        d      = 0.1 + 0.2 * abs(sdPyramidUpInv(q));
        z     -= d;
        o     += (sin((p.y + z) * cf + vec4(0.0, 1.0, 2.0, 3.0)) + 1.0) / d;
      }

      o = tanh4(o * o * (uGlow * uBloom) / 1e5);

      vec3 col = o.rgb;

      float n = rand(gl_FragCoord.xy + vec2(iTime));
      col    += (n - 0.5) * uNoise;
      col     = clamp(col, 0.0, 1.0);

      float L = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col     = clamp(mix(vec3(L), col, uSaturation), 0.0, 1.0);

      if (abs(uHueShift) > 0.0001) {
        col = clamp(hueRotation(uHueShift) * col, 0.0, 1.0);
      }

      gl_FragColor = vec4(col, o.a);
    }
  `;

  const geometry  = new Triangle(gl);
  const iResBuf   = new Float32Array(2);
  const offPxBuf  = new Float32Array(2);

  const program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
      iResolution:    { value: iResBuf },
      iTime:          { value: 0 },
      uHeight:        { value: H },
      uBaseHalf:      { value: BASE_HALF },
      uUseBaseWobble: { value: 1 },
      uRot:           { value: new Float32Array([1,0,0, 0,1,0, 0,0,1]) },
      uGlow:          { value: GLOW },
      uOffsetPx:      { value: offPxBuf },
      uNoise:         { value: NOISE },
      uSaturation:    { value: SAT },
      uScale:         { value: SCALE },
      uHueShift:      { value: HUE },
      uColorFreq:     { value: CFREQ },
      uBloom:         { value: BLOOM },
      uCenterShift:   { value: H * 0.25 },
      uInvBaseHalf:   { value: 1 / BASE_HALF },
      uInvHeight:     { value: 1 / H },
      uMinAxis:       { value: Math.min(BASE_HALF, H) },
      uPxScale:       { value: 1 / ((gl.drawingBufferHeight || 1) * 0.1 * SCALE) },
      uTimeScale:     { value: TS }
    }
  });

  const mesh = new Mesh(gl, { geometry, program });

  const doResize = () => {
    const w = container.clientWidth  || 1;
    const h = container.clientHeight || 1;
    renderer.setSize(w, h);
    iResBuf[0]  = gl.drawingBufferWidth;
    iResBuf[1]  = gl.drawingBufferHeight;
    offPxBuf[0] = cfg.offsetX * dpr;
    offPxBuf[1] = cfg.offsetY * dpr;
    program.uniforms.uPxScale.value =
      1 / ((gl.drawingBufferHeight || 1) * 0.1 * SCALE);
  };

  let resizeTimer = null;
  const resize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(doResize, 120);
  };

  const ro = new ResizeObserver(resize);
  ro.observe(container);
  doResize();

  const rotBuf = new Float32Array(9);

  function setMat3FromEuler(yawY, pitchX, rollZ, out) {
    const cy = Math.cos(yawY),   sy = Math.sin(yawY);
    const cx = Math.cos(pitchX), sx = Math.sin(pitchX);
    const cz = Math.cos(rollZ),  sz = Math.sin(rollZ);

    out[0] = cy*cz + sy*sx*sz;  out[3] = -cy*sz + sy*sx*cz;  out[6] = sy*cx;
    out[1] = cx*sz;              out[4] =  cx*cz;              out[7] = -sx;
    out[2] = -sy*cz + cy*sx*sz; out[5] =  sy*sz + cy*sx*cz;  out[8] = cy*cx;
    return out;
  }

  const rnd = () => Math.random();
  const wX  = 0.3 + rnd() * 0.6;
  const wY  = 0.2 + rnd() * 0.7;
  const wZ  = 0.1 + rnd() * 0.5;
  const phX = rnd() * Math.PI * 2;
  const phZ = rnd() * Math.PI * 2;

  let yaw = 0, pitch = 0, roll = 0;
  let targetYaw = 0, targetPitch = 0;
  const lerp = (a, b, t) => a + (b - a) * t;

  let rafId         = 0;
  let lastFrameTime = 0;
  const t0          = performance.now();

  const startRAF = () => { if (!rafId) rafId = requestAnimationFrame(render); };
  const stopRAF  = () => { if (rafId)  { cancelAnimationFrame(rafId); rafId = 0; } };

  const pointer = { x: 0, y: 0, inside: true };

  if (cfg.animationType === 'hover') {
    program.uniforms.uUseBaseWobble.value = 0;
    window.addEventListener('pointermove', e => {
      const ww = Math.max(1, window.innerWidth);
      const wh = Math.max(1, window.innerHeight);
      pointer.x = Math.max(-1, Math.min(1, (e.clientX - ww * 0.5) / (ww * 0.5)));
      pointer.y = Math.max(-1, Math.min(1, (e.clientY - wh * 0.5) / (wh * 0.5)));
      pointer.inside = true;
      startRAF();
    }, { passive: true });
    window.addEventListener('mouseleave', () => { pointer.inside = false; });
    window.addEventListener('blur',       () => { pointer.inside = false; });

  } else if (cfg.animationType === '3drotate') {
    program.uniforms.uUseBaseWobble.value = 0;

  } else {
    program.uniforms.uUseBaseWobble.value = 1;
  }

  const NOISE_IS_ZERO = NOISE < 1e-6;

  function render(t) {
    if (FRAME_MS > 0 && t - lastFrameTime < FRAME_MS) {
      rafId = requestAnimationFrame(render);
      return;
    }
    if (FRAME_MS > 0) lastFrameTime = t;

    const time = (t - t0) * 0.001;
    program.uniforms.iTime.value = time;

    let continueRAF = true;

    if (cfg.animationType === 'hover') {
      targetYaw   = (pointer.inside ? -pointer.x : 0) * 0.6 * HOVSTR;
      targetPitch = (pointer.inside ?  pointer.y : 0) * 0.6 * HOVSTR;
      yaw   = lerp(yaw,   targetYaw,   INERT);
      pitch = lerp(pitch, targetPitch, INERT);
      roll  = lerp(roll,  0,           0.1);
      program.uniforms.uRot.value = setMat3FromEuler(yaw, pitch, roll, rotBuf);

      if (NOISE_IS_ZERO) {
        const settled =
          Math.abs(yaw - targetYaw)     < 1e-4 &&
          Math.abs(pitch - targetPitch) < 1e-4 &&
          Math.abs(roll)                < 1e-4;
        if (settled) continueRAF = false;
      }

    } else if (cfg.animationType === '3drotate') {
      const ts = time * TS;
      yaw   = ts * wY;
      pitch = Math.sin(ts * wX + phX) * 0.6;
      roll  = Math.sin(ts * wZ + phZ) * 0.5;
      program.uniforms.uRot.value = setMat3FromEuler(yaw, pitch, roll, rotBuf);
      if (TS < 1e-6) continueRAF = false;

    } else {
      rotBuf[0]=1; rotBuf[1]=0; rotBuf[2]=0;
      rotBuf[3]=0; rotBuf[4]=1; rotBuf[5]=0;
      rotBuf[6]=0; rotBuf[7]=0; rotBuf[8]=1;
      program.uniforms.uRot.value = rotBuf;
      if (TS < 1e-6) continueRAF = false;
    }

    renderer.render({ scene: mesh });

    if (continueRAF) {
      rafId = requestAnimationFrame(render);
    } else {
      rafId = 0;
    }
  }

  // Pause when hero is scrolled off-screen — saves GPU
  const io = new IntersectionObserver(entries => {
    const visible = entries.some(e => e.isIntersecting);
    if (visible) startRAF();
    else         stopRAF();
  });
  io.observe(container);

  startRAF();

} // end initPrism


// =====================
// JOURNEY SECTION ANIMATION — v2
//
// Two independent systems work together:
//
// 1. SCROLL-DRIVEN TRACK FILL
//    Positions of each dot are cached as document-relative Y values
//    once on load (and re-cached on resize). A passive scroll listener
//    schedules a rAF that reads window.pageYOffset (no forced layout)
//    and writes fill.style.height. This gives true scroll-progress
//    motion rather than discrete jumps per stage.
//
// 2. INTERSECTION OBSERVER — STAGE ACTIVATION
//    Adds .active to each stage when it reaches the trigger threshold.
//    .active drives: fade-up reveal, dot glow, one-shot pulse ring,
//    and cascading text brightening (via CSS transition-delay).
//    After the final stage activates, the CTA footer is revealed with
//    a deliberate 360ms delay so it feels like a settling conclusion.
//
// Both paths fall back to instant reveal for:
//   - prefers-reduced-motion
//   - IntersectionObserver unsupported
// =====================
(function journeyInit() {
  var stages = document.querySelectorAll('.journey-stage');
  var fill   = document.querySelector('.journey-track-fill');
  var track  = document.querySelector('.journey-track');
  var footer = document.querySelector('.journey-footer');

  if (!stages.length) return;

  // ── Instant fallback ─────────────────────────────────────────
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)) {
    stages.forEach(function (s) { s.classList.add('active'); });
    if (fill)   fill.style.height = '100%';
    if (footer) footer.classList.add('journey-footer--visible');
    return;
  }

  // ── 1. Scroll-driven track fill ──────────────────────────────
  // Cache document-relative dot centers so the scroll handler
  // only does arithmetic — zero layout reads at scroll time.

  var dotDocY   = [];   // document-Y of each dot's center
  var trackDocY = 0;    // document-Y of the track element's top

  function cachePositions() {
    var sy    = window.pageYOffset;
    trackDocY = track ? track.getBoundingClientRect().top + sy : 0;
    dotDocY   = [];
    stages.forEach(function (stage) {
      var dot = stage.querySelector('.journey-dot');
      if (dot) {
        var r = dot.getBoundingClientRect();
        dotDocY.push(r.top + sy + r.height * 0.5);
      }
    });
  }

  var fillTicking = false;

  function updateFill() {
    fillTicking = false;
    if (!fill || !dotDocY.length) return;
    // The fill "reaches" a dot when it scrolls to 62% of the viewport —
    // felt natural across iPhone sizes in testing.
    var reachY = window.pageYOffset + window.innerHeight * 0.62;
    var maxH   = 0;
    for (var i = 0; i < dotDocY.length; i++) {
      if (dotDocY[i] <= reachY) {
        var h = dotDocY[i] - trackDocY;
        if (h > maxH) maxH = h;
      }
    }
    if (maxH > 0) fill.style.height = maxH + 'px';
  }

  // Passive scroll listener — never blocks scrolling on iOS
  window.addEventListener('scroll', function () {
    if (!fillTicking) {
      window.requestAnimationFrame(updateFill);
      fillTicking = true;
    }
  }, { passive: true });

  // Debounced resize — recompute cached positions
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(cachePositions, 200);
  });

  // ── 2. Stage activation via IntersectionObserver ─────────────
  var totalStages = stages.length;
  var activeCount = 0;

  var journeyObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        journeyObs.unobserve(entry.target);
        activeCount++;
        // After the last stage activates, reveal the CTA with
        // a deliberate delay so it feels like a final beat.
        if (activeCount >= totalStages && footer) {
          setTimeout(function () {
            footer.classList.add('journey-footer--visible');
          }, 360);
        }
      }
    });
  }, {
    threshold:  0.22,
    rootMargin: '0px 0px -44px 0px'
  });

  stages.forEach(function (s) { journeyObs.observe(s); });

  // Cache positions once the first paint is done, then run the
  // fill check in case the section is already partially in view.
  window.requestAnimationFrame(function () {
    setTimeout(function () {
      cachePositions();
      updateFill();
    }, 60);
  });
}());


// =====================
// STATS COUNTER ANIMATION
// Numbers count up with an ease-out curve when the stats bar
// scrolls into view. Uses IntersectionObserver — fires once only.
// Each .stat-number element reads:
//   data-target   — the final numeric value
//   data-prefix   — text before the number (e.g. "$")
//   data-suffix   — text after  the number (e.g. "M+", "%")
//   data-decimals — decimal places to display (default 0)
// =====================
(function statsCounterInit() {
  var statNumbers = document.querySelectorAll('.stat-number');
  var statItems   = document.querySelectorAll('.stat-item');
  var statsSection = document.getElementById('stats');

  if (!statNumbers.length || !statsSection) return;

  var hasRun = false;
  var DURATION = 1800; // ms

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateOne(el) {
    var target   = parseFloat(el.dataset.target) || 0;
    var decimals = parseInt(el.dataset.decimals  || '0', 10);
    var valEl    = el.querySelector('.stat-val');
    if (!valEl) return;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var elapsed  = ts - start;
      var progress = Math.min(elapsed / DURATION, 1);
      var eased    = easeOutQuart(progress);
      var current  = eased * target;
      valEl.textContent = current.toFixed(decimals);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  function runAnimation() {
    if (hasRun) return;
    hasRun = true;

    // Reveal items with stagger, then start counters
    statItems.forEach(function (item) {
      item.classList.add('stats-visible');
    });

    // Slight delay so the fade-in starts before counting begins
    setTimeout(function () {
      statNumbers.forEach(function (el) { animateOne(el); });
    }, 120);
  }

  if ('IntersectionObserver' in window &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var statsObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          runAnimation();
          statsObs.disconnect();
        }
      });
    }, { threshold: 0.35 });

    statsObs.observe(statsSection);
  } else {
    // No observer or reduced-motion: show final values immediately
    statNumbers.forEach(function (el) {
      var target   = parseFloat(el.dataset.target) || 0;
      var decimals = parseInt(el.dataset.decimals  || '0', 10);
      var valEl    = el.querySelector('.stat-val');
      if (valEl) valEl.textContent = target.toFixed(decimals);
    });
    statItems.forEach(function (item) {
      item.classList.add('stats-visible');
    });
  }
}());
