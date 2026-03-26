// =====================================================================
// OGL IMPORT
// ─────────────────────────────────────────────────────────────────────
// OGL is a minimal WebGL library. We load it from the esm.sh CDN —
// no npm install needed. The page must be served over HTTP (not opened
// as a file://) for this import to work.
//
// EASY WAY: install the "Live Server" VS Code extension, right-click
// index.html → "Open with Live Server".
//
// To pin a specific version (recommended for production):
//   import { ... } from 'https://esm.sh/ogl@1.0.11';
// =====================================================================
import { Renderer, Triangle, Program, Mesh } from 'https://esm.sh/ogl';


// =====================
// MOBILE NAVIGATION TOGGLE
// =====================
// Opens and closes the nav menu on small screens
// when the "Menu" button is clicked.

const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', function () {
    navLinks.classList.toggle('open');
  });
}


// =====================
// TRANSPARENT NAV ON SCROLL
// =====================
// Adds the 'scrolled' class to <header> once the user passes 40px,
// transitioning the nav from a transparent bar floating over the
// dark hero to a frosted-white bar over the rest of the page.

const siteHeader = document.querySelector('header');

if (siteHeader) {
  const onNavScroll = () => {
    siteHeader.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onNavScroll, { passive: true });
  onNavScroll(); // run immediately — handles mid-page loads and hard refreshes
}


// =====================
// SMOOTH SCROLL
// =====================
// Makes all in-page anchor links (#section) scroll
// smoothly instead of jumping instantly.

document.querySelectorAll('a[href^="#"]').forEach(function (link) {
  link.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });

      // Close mobile nav if open after clicking a link
      if (navLinks) {
        navLinks.classList.remove('open');
      }
    }
  });
});


// =====================
// CONTACT FORM
// =====================
// Handles the contact form submission.
// Replace the alert with your own logic (e.g. fetch/API call)
// when you're ready to wire up a backend.

const contactForm = document.querySelector('.contact-form');

if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    alert('Thanks for reaching out! We\'ll be in touch soon.');
    contactForm.reset();
  });
}


// =====================================================================
// PRISM HERO ANIMATION
// ─────────────────────────────────────────────────────────────────────
// Converted from the original React component to vanilla JS.
// Uses OGL (WebGL library) to run a fragment-shader ray-march that
// produces the colorful prism/light-refraction background effect.
//
// HOW IT WORKS:
//   1. A full-screen triangle covers the WebGL canvas.
//   2. Each pixel runs through a fragment shader that ray-marches
//      through a virtual prism (pyramid SDF).
//   3. Colors come from sine waves accumulated along the ray path.
//   4. A rotation matrix (uRot) and wobble matrix animate the shape.
// =====================================================================

// ── CONFIG ────────────────────────────────────────────────────────────
// Edit these values to change how the animation looks.
// They match the props from the original React component exactly.
// ─────────────────────────────────────────────────────────────────────
const CONFIG = {
  height:        3.5,       // prism height (vertical scale)
  baseWidth:     5.5,       // prism base width (horizontal scale)
  animationType: 'rotate',  // 'rotate' | 'hover' | '3drotate'
  glow:          1,         // brightness / glow intensity
  offsetX:       0,         // horizontal canvas offset in px
  offsetY:       0,         // vertical canvas offset in px
  noise:         0,         // grain/film noise (0 = clean, 1 = grainy)
  transparent:   true,      // true = richer saturation
  scale:         3.6,       // zoom level — larger = more zoomed out
  hueShift:      0,         // rotate all colors (radians, e.g. Math.PI/4)
  colorFrequency: 1,        // how many color cycles appear
  hoverStrength: 2,         // how far the prism tilts on hover
  inertia:       0.05,      // hover follow speed (0 = instant, 1 = never)
  bloom:         1,         // extra brightness multiplier
  timeScale:     0.5        // animation speed (0 = frozen, 1 = full speed)
};
// ─────────────────────────────────────────────────────────────────────

// Bail out gracefully if the container element is missing
const container = document.getElementById('prism-container');
if (!container) {
  console.warn('Prism: #prism-container not found, skipping animation.');
} else {
  initPrism(container, CONFIG);
}

function initPrism(container, cfg) {

  // ── Normalize config values (same logic as original component) ──────
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

  // ── Performance tier ─────────────────────────────────────────────────
  // All performance knobs live here. Adjust to trade quality for speed.
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  // DPR caps:
  //   Mobile  1.0 — a 3× Retina iPhone has 9× the pixels of a 1× screen.
  //                  Capping at 1× is the single biggest mobile GPU saving.
  //   Desktop 1.5 — looks visually identical to 2.0 for a shader like this
  //                  but renders 44% fewer pixels on Retina Macs.
  const dpr = isMobile
    ? Math.min(1,   window.devicePixelRatio || 1)
    : Math.min(1.5, window.devicePixelRatio || 1);

  // Ray-march step count — the dominant GPU cost (one SDF eval per step
  // per pixel per frame). Going below ~40 becomes visually rough.
  //   Desktop 80 steps — 20% faster than the original 100, imperceptible.
  //   Mobile  50 steps — 50% faster than original, still looks great.
  const STEP_COUNT = isMobile ? 50 : 80;

  // FPS cap: 30fps on mobile halves draw calls vs 60fps with no visible
  // difference for a slow ambient animation. 0 = uncapped on desktop
  // (browser's native rAF rate, typically 60 hz).
  const FRAME_MS = isMobile ? 1000 / 30 : 0;

  // ── OGL Renderer ─────────────────────────────────────────────────────
  // powerPreference 'high-performance' tells the OS to use the discrete GPU
  // on dual-GPU laptops (MacBooks, etc.). Leave as 'default' on mobile so
  // the browser can choose the power-efficient path.
  const renderer = new Renderer({
    dpr,
    alpha:           cfg.transparent,
    antialias:       false,
    powerPreference: isMobile ? 'default' : 'high-performance'
  });
  const gl = renderer.gl;

  // Disable state we don't need — keeps each frame lean
  gl.disable(gl.DEPTH_TEST);
  gl.disable(gl.CULL_FACE);
  gl.disable(gl.BLEND);

  // Style the canvas so it fills its container absolutely
  Object.assign(gl.canvas.style, {
    position: 'absolute',
    inset:    '0',
    width:    '100%',
    height:   '100%',
    display:  'block'
  });
  container.appendChild(gl.canvas);

  // ── Vertex shader ────────────────────────────────────────────────────
  // Just a full-screen triangle — no 3D vertices, all the magic is in
  // the fragment shader below.
  const vertex = /* glsl */`
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  // ── Fragment shader ──────────────────────────────────────────────────
  // Ray-marches through a prism/pyramid SDF to produce the animation.
  // Each pixel accumulates color along a ray cast into the prism shape.
  const fragment = /* glsl */`
    precision highp float;

    uniform vec2  iResolution;   /* canvas size in pixels              */
    uniform float iTime;         /* elapsed time in seconds            */

    /* Shape params */
    uniform float uHeight;       /* prism height                       */
    uniform float uBaseHalf;     /* half of base width                 */
    uniform mat3  uRot;          /* rotation matrix (JS → shader)      */
    uniform int   uUseBaseWobble;/* 1 = animate xz wobble in shader    */

    /* Visual params */
    uniform float uGlow;
    uniform vec2  uOffsetPx;
    uniform float uNoise;
    uniform float uSaturation;
    uniform float uScale;
    uniform float uHueShift;
    uniform float uColorFreq;
    uniform float uBloom;

    /* Precomputed constants (updated on resize) */
    uniform float uCenterShift;
    uniform float uInvBaseHalf;
    uniform float uInvHeight;
    uniform float uMinAxis;
    uniform float uPxScale;
    uniform float uTimeScale;

    /* Smooth color clamping — avoids harsh clipping */
    vec4 tanh4(vec4 x) {
      vec4 e2x = exp(2.0 * x);
      return (e2x - 1.0) / (e2x + 1.0);
    }

    /* Pseudo-random noise for film grain */
    float rand(vec2 co) {
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    /* Signed distance to an anisotropic octahedron (inverted) */
    float sdOctaAnisoInv(vec3 p) {
      vec3 q = vec3(abs(p.x) * uInvBaseHalf,
                    abs(p.y) * uInvHeight,
                    abs(p.z) * uInvBaseHalf);
      float m = q.x + q.y + q.z - 1.0;
      return m * uMinAxis * 0.5773502691896258;
    }

    /* Upper-half pyramid SDF (the "prism" shape) */
    float sdPyramidUpInv(vec3 p) {
      float oct       = sdOctaAnisoInv(p);
      float halfSpace = -p.y;
      return max(oct, halfSpace);
    }

    /* Hue rotation matrix */
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
      /* Center the fragment and apply pixel scale */
      vec2 f = (gl_FragCoord.xy - 0.5 * iResolution.xy - uOffsetPx) * uPxScale;

      float z = 5.0;
      float d = 0.0;
      vec3  p;
      vec4  o = vec4(0.0);

      float centerShift = uCenterShift;
      float cf          = uColorFreq;

      /* Wobble matrix — animates the xz base in 'rotate' mode */
      mat2 wob = mat2(1.0);
      if (uUseBaseWobble == 1) {
        float t  = iTime * uTimeScale;
        float c0 = cos(t +  0.0);
        float c1 = cos(t + 33.0);
        float c2 = cos(t + 11.0);
        wob = mat2(c0, c1, c2, c0);
      }

      /* Ray march — STEPS iterations through the prism SDF.
         Step count is injected by JS at shader compile time:
           Desktop → 80 steps  (20% less work, visually imperceptible)
           Mobile  → 50 steps  (50% less work, still looks great)
         Going below ~40 starts to look noticeably rough. */
      const int STEPS = ${STEP_COUNT};
      for (int i = 0; i < STEPS; i++) {
        p      = vec3(f, z);
        p.xz   = p.xz * wob;       /* apply base wobble  */
        p      = uRot * p;          /* apply rotation     */
        vec3 q = p;
        q.y   += centerShift;       /* center the prism   */
        d      = 0.1 + 0.2 * abs(sdPyramidUpInv(q));
        z     -= d;
        o     += (sin((p.y + z) * cf + vec4(0.0, 1.0, 2.0, 3.0)) + 1.0) / d;
      }

      /* Tone-map accumulated color */
      o = tanh4(o * o * (uGlow * uBloom) / 1e5);

      vec3 col = o.rgb;

      /* Optional film grain */
      float n = rand(gl_FragCoord.xy + vec2(iTime));
      col    += (n - 0.5) * uNoise;
      col     = clamp(col, 0.0, 1.0);

      /* Saturation */
      float L = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col     = clamp(mix(vec3(L), col, uSaturation), 0.0, 1.0);

      /* Optional hue shift */
      if (abs(uHueShift) > 0.0001) {
        col = clamp(hueRotation(uHueShift) * col, 0.0, 1.0);
      }

      gl_FragColor = vec4(col, o.a);
    }
  `;

  // ── Geometry & uniforms ──────────────────────────────────────────────
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

  // ── Resize handler ───────────────────────────────────────────────────
  // Actual resize work — updates renderer size and all affected uniforms.
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

  // Debounced wrapper: subsequent ResizeObserver firings (e.g. iOS Safari
  // URL-bar show/hide) wait 120 ms before acting, preventing redundant
  // canvas resizes. The first call (below) bypasses the debounce so the
  // canvas is sized correctly before the first frame renders.
  let resizeTimer = null;
  const resize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(doResize, 120);
  };

  const ro = new ResizeObserver(resize);
  ro.observe(container);
  doResize(); // immediate — do not debounce the initial sizing

  // ── Rotation matrix helper ───────────────────────────────────────────
  // Builds a column-major Float32Array mat3 from yaw/pitch/roll Euler
  // angles, which is what the GLSL `uniform mat3 uRot` expects.
  const rotBuf = new Float32Array(9);

  function setMat3FromEuler(yawY, pitchX, rollZ, out) {
    const cy = Math.cos(yawY),   sy = Math.sin(yawY);
    const cx = Math.cos(pitchX), sx = Math.sin(pitchX);
    const cz = Math.cos(rollZ),  sz = Math.sin(rollZ);

    // Column 0        Column 1               Column 2
    out[0] = cy*cz + sy*sx*sz;  out[3] = -cy*sz + sy*sx*cz;  out[6] = sy*cx;
    out[1] = cx*sz;              out[4] =  cx*cz;              out[7] = -sx;
    out[2] = -sy*cz + cy*sx*sz; out[5] =  sy*sz + cy*sx*cz;  out[8] = cy*cx;
    return out;
  }

  // ── Animation state ──────────────────────────────────────────────────
  // Random frequencies for '3drotate' mode — gives each page load
  // a slightly different feel without changing the overall character.
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
  let lastFrameTime = 0;  // used by the FPS throttle below
  const t0          = performance.now();

  const startRAF = () => { if (!rafId) rafId = requestAnimationFrame(render); };
  const stopRAF  = () => { if (rafId)  { cancelAnimationFrame(rafId); rafId = 0; } };

  // ── Pointer tracking (hover mode only) ──────────────────────────────
  const pointer = { x: 0, y: 0, inside: true };

  if (cfg.animationType === 'hover') {
    // Hover mode: tilt the prism toward the mouse cursor
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
    // 3D rotate mode: full yaw/pitch/roll driven by JS
    program.uniforms.uUseBaseWobble.value = 0;

  } else {
    // Default 'rotate' mode: rotation happens inside the shader
    // via the wobble matrix — no JS rotation needed.
    program.uniforms.uUseBaseWobble.value = 1;
  }

  // ── Render loop ──────────────────────────────────────────────────────
  const NOISE_IS_ZERO = NOISE < 1e-6;

  function render(t) {
    // FPS throttle — on mobile (FRAME_MS = ~33ms) we skip frames until
    // enough time has passed to hit the 30fps target. On desktop
    // (FRAME_MS = 0) this block is never entered; native rAF rate applies.
    if (FRAME_MS > 0 && t - lastFrameTime < FRAME_MS) {
      rafId = requestAnimationFrame(render);
      return;
    }
    if (FRAME_MS > 0) lastFrameTime = t;

    const time = (t - t0) * 0.001;       /* seconds elapsed */
    program.uniforms.iTime.value = time;

    let continueRAF = true;

    if (cfg.animationType === 'hover') {
      // Smoothly lerp rotation toward mouse position
      targetYaw   = (pointer.inside ? -pointer.x : 0) * 0.6 * HOVSTR;
      targetPitch = (pointer.inside ?  pointer.y : 0) * 0.6 * HOVSTR;
      yaw   = lerp(yaw,   targetYaw,   INERT);
      pitch = lerp(pitch, targetPitch, INERT);
      roll  = lerp(roll,  0,           0.1);
      program.uniforms.uRot.value = setMat3FromEuler(yaw, pitch, roll, rotBuf);

      // If settled and no noise, stop the RAF to save GPU
      if (NOISE_IS_ZERO) {
        const settled =
          Math.abs(yaw - targetYaw)   < 1e-4 &&
          Math.abs(pitch - targetPitch) < 1e-4 &&
          Math.abs(roll) < 1e-4;
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
      // 'rotate' — identity matrix; the shader's wobble matrix does the work
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

  // ── Intersection Observer ────────────────────────────────────────────
  // Automatically pauses the animation when the hero scrolls off-screen
  // and resumes when it comes back. Saves GPU on long pages.
  const io = new IntersectionObserver(entries => {
    const visible = entries.some(e => e.isIntersecting);
    if (visible) startRAF();
    else         stopRAF();
  });
  io.observe(container);

  // Kick off the first frame
  startRAF();

} // end initPrism
