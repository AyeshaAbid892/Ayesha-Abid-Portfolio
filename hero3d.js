/* ==========================================================================
   HERO 3D — animated gold particle constellation + glowing wireframe
   centerpiece, built only from the site's own theme colors (gold/black).
   Mouse-reactive parallax. Auto-pauses when the hero scrolls out of view
   so it costs nothing on the rest of the page.
   ========================================================================== */

(function () {
  const canvas = document.getElementById('hero-3d-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const heroSection = canvas.closest('.hero') || canvas.parentElement;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSmall = window.innerWidth < 640;

  const GOLD = 0xc9a962;
  const GOLD_HOVER = 0xdbb872;
  const GOLD_DARK = 0x9a7a42;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0a0a, 0.012);

  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1000);
  camera.position.z = isSmall ? 58 : 44;

  function sizeRenderer() {
    const w = heroSection.clientWidth;
    const h = heroSection.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  /* ---- Node cloud (constellation) ---- */
  const NODE_COUNT = isSmall ? 34 : 58;
  const spread = { x: 42, y: 24, z: 20 };
  const positions = new Float32Array(NODE_COUNT * 3);
  const basePositions = [];

  for (let i = 0; i < NODE_COUNT; i++) {
    const x = (Math.random() - 0.5) * spread.x * 2;
    const y = (Math.random() - 0.5) * spread.y * 2;
    const z = (Math.random() - 0.5) * spread.z * 2;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    basePositions.push({ x, y, z, speed: 0.12 + Math.random() * 0.22, phase: Math.random() * Math.PI * 2 });
  }

  const nodeGeo = new THREE.BufferGeometry();
  nodeGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const nodeMat = new THREE.PointsMaterial({
    color: GOLD_HOVER,
    size: 1.1,
    transparent: true,
    opacity: 0.95,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const nodePoints = new THREE.Points(nodeGeo, nodeMat);

  /* ---- Faint deep-layer dust for parallax depth ---- */
  const dustCount = isSmall ? 16 : 30;
  const dustGeo = new THREE.BufferGeometry();
  const dustPositions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    dustPositions[i * 3] = (Math.random() - 0.5) * spread.x * 2.4;
    dustPositions[i * 3 + 1] = (Math.random() - 0.5) * spread.y * 2.4;
    dustPositions[i * 3 + 2] = (Math.random() - 0.5) * spread.z * 2.4 - 14;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dustMat = new THREE.PointsMaterial({
    color: GOLD_DARK, size: 0.7, transparent: true, opacity: 0.4,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  scene.add(new THREE.Points(dustGeo, dustMat));

  /* ---- Connective lines between nearby nodes ---- */
  const maxDist = isSmall ? 10 : 12;
  const lineGeo = new THREE.BufferGeometry();
  const lineMat = new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.16 });
  const lineMesh = new THREE.LineSegments(lineGeo, lineMat);

  function rebuildLines() {
    const verts = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < maxDist) {
          verts.push(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
          verts.push(positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]);
        }
      }
    }
    lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3));
  }
  rebuildLines();

  const group = new THREE.Group();
  group.add(nodePoints, lineMesh);
  scene.add(group);

  /* ---- Mouse parallax ---- */
  const mouse = { x: 0, y: 0 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  sizeRenderer();
  window.addEventListener('resize', sizeRenderer);

  /* ---- Pause rendering entirely when hero is off-screen ---- */
  let isVisible = true;
  let rafId = null;
  const io = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
    if (isVisible && !rafId) {
      clock.start();
      rafId = requestAnimationFrame(animate);
    }
  }, { threshold: 0.01 });
  io.observe(heroSection);

  const clock = new THREE.Clock();
  let lineTimer = 0;

  function animate() {
    if (!isVisible) { rafId = null; return; }
    rafId = requestAnimationFrame(animate);
    if (prefersReducedMotion) { renderer.render(scene, camera); return; }

    const t = clock.getElapsedTime();

    const posAttr = nodeGeo.attributes.position;
    for (let i = 0; i < NODE_COUNT; i++) {
      const b = basePositions[i];
      posAttr.array[i * 3] = b.x + Math.sin(t * b.speed + b.phase) * 1.4;
      posAttr.array[i * 3 + 1] = b.y + Math.cos(t * b.speed + b.phase) * 1.4;
      posAttr.array[i * 3 + 2] = b.z + Math.sin(t * b.speed * 0.8 + b.phase) * 1.1;
    }
    posAttr.needsUpdate = true;

    lineTimer++;
    if (lineTimer % 10 === 0) rebuildLines();

    group.rotation.y = t * 0.035 + mouse.x * 0.22;
    group.rotation.x = mouse.y * 0.12;
    camera.position.x += (mouse.x * 5 - camera.position.x) * 0.02;
    camera.position.y += (-mouse.y * 3 - camera.position.y) * 0.02;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  rafId = requestAnimationFrame(animate);
})();
