/* =====================================================================
   Dansereau Traiteur · Hero · poussière de champagne (Three.js)
   Un champ de particules très discret, teinte champagne pâle, qui monte
   lentement et suit le curseur en parallaxe. Rendu uniquement quand le
   hero est visible. Désactivé en mouvement réduit et si WebGL manque.
   ===================================================================== */
import * as THREE from 'three';

const canvas = document.getElementById('hero-3d');
const hero = document.querySelector('.hero');
const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function webglOk() {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); }
  catch (e) { return false; }
}

if (canvas && hero && !reduit && webglOk()) {
  const mobile = window.innerWidth < 820;
  const NB = mobile ? 220 : 560;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 40);
  camera.position.z = 7;

  // étendue visible à z = 0
  let hauteur = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  let largeur = hauteur;

  // texture : disque doux
  const tex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d');
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,244,220,1)');
    grd.addColorStop(0.35, 'rgba(255,240,205,0.55)');
    grd.addColorStop(1, 'rgba(255,240,205,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();

  const positions = new Float32Array(NB * 3);
  const tailles = new Float32Array(NB);
  const vitesses = new Float32Array(NB);
  const phases = new Float32Array(NB);
  const amplitudes = new Float32Array(NB);

  function resize() {
    const w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    hauteur = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 1.25;
    largeur = hauteur * camera.aspect * 1.25;
  }
  resize();

  for (let i = 0; i < NB; i++) {
    positions[i * 3] = (Math.random() - 0.5) * largeur;
    positions[i * 3 + 1] = (Math.random() - 0.5) * hauteur;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
    tailles[i] = 0.5 + Math.random() * 1.6;
    vitesses[i] = 0.05 + Math.random() * 0.16;
    phases[i] = Math.random() * Math.PI * 2;
    amplitudes[i] = 0.15 + Math.random() * 0.4;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('aTaille', new THREE.BufferAttribute(tailles, 1));
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

  const mat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: {
      uTex: { value: tex },
      uTemps: { value: 0 },
      uCouleur: { value: new THREE.Color(0xD6BC85) },
      uEchelle: { value: (mobile ? 22 : 30) * Math.min(window.devicePixelRatio || 1, 1.5) },
      uOpacite: { value: 0 }
    },
    vertexShader: `
      attribute float aTaille; attribute float aPhase;
      uniform float uTemps; uniform float uEchelle;
      varying float vAlpha;
      void main(){
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float scint = 0.55 + 0.45 * sin(uTemps * 1.3 + aPhase * 5.0);
        vAlpha = scint * smoothstep(-2.6, 0.4, position.z) ;
        gl_PointSize = aTaille * uEchelle * (1.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `
      uniform sampler2D uTex; uniform vec3 uCouleur; uniform float uOpacite;
      varying float vAlpha;
      void main(){
        vec4 t = texture2D(uTex, gl_PointCoord);
        gl_FragColor = vec4(uCouleur, 1.0) * t * vAlpha * uOpacite;
      }`
  });

  const points = new THREE.Points(geo, mat);
  const groupe = new THREE.Group();
  groupe.add(points);
  scene.add(groupe);

  // parallaxe curseur (pointeur fin seulement)
  const souris = { x: 0, y: 0 }, cible = { x: 0, y: 0 };
  if (window.matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      cible.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      cible.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { cible.x = 0; cible.y = 0; });
  }

  let visible = true, actif = true;
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { threshold: 0.02 }).observe(hero);
  document.addEventListener('visibilitychange', () => { actif = !document.hidden; });

  const horloge = new THREE.Clock();
  let apparition = 0;
  function boucle() {
    requestAnimationFrame(boucle);
    if (!visible || !actif) return;
    const dt = Math.min(horloge.getDelta(), 0.05);
    const t = horloge.elapsedTime;
    apparition = Math.min(1, apparition + dt * 0.35);
    mat.uniforms.uTemps.value = t;
    mat.uniforms.uOpacite.value = 0.85 * apparition;

    const p = geo.attributes.position.array;
    for (let i = 0; i < NB; i++) {
      const k = i * 3;
      p[k + 1] += vitesses[i] * dt;
      p[k] += Math.sin(t * 0.5 + phases[i]) * amplitudes[i] * dt * 0.35;
      if (p[k + 1] > hauteur / 2) { p[k + 1] = -hauteur / 2; p[k] = (Math.random() - 0.5) * largeur; }
      if (p[k] > largeur / 2) p[k] = -largeur / 2; else if (p[k] < -largeur / 2) p[k] = largeur / 2;
    }
    geo.attributes.position.needsUpdate = true;

    souris.x += (cible.x - souris.x) * 0.04;
    souris.y += (cible.y - souris.y) * 0.04;
    groupe.rotation.y = souris.x * 0.12;
    groupe.rotation.x = -souris.y * 0.08;
    camera.position.x = souris.x * 0.35;
    camera.position.y = -souris.y * 0.25;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  boucle();

  let minuterie;
  window.addEventListener('resize', () => { clearTimeout(minuterie); minuterie = setTimeout(resize, 120); }, { passive: true });
} else if (canvas) {
  canvas.remove();
}
