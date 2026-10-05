/* ==========================================================================
   1. DUAL-RING MECHANICAL CURSOR PHYSICS
   ========================================================================== */
const dot = document.getElementById('cursorDot');
const outline = document.getElementById('cursorOutline');
const badge = document.getElementById('cursorBadge');

let mouseX = 0, mouseY = 0;
let outlineX = 0, outlineY = 0;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  
  dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  badge.style.transform = `translate(${mouseX + 18}px, ${mouseY + 18}px)`;
});

function animateCursor() {
  outlineX += (mouseX - outlineX) * 0.15;
  outlineY += (mouseY - outlineY) * 0.15;
  
  outline.style.transform = `translate(${outlineX}px, ${outlineY}px) translate(-50%, -50%)`;
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Interactive cursor tooltips
document.querySelectorAll('a, button, .btn, .about-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    outline.style.width = '50px';
    outline.style.height = '50px';
    outline.style.borderColor = '#8b5cf6';
    badge.style.opacity = '1';
    badge.textContent = el.getAttribute('data-badge') || 'INSPECT';
  });
  
  el.addEventListener('mouseleave', () => {
    outline.style.width = '36px';
    outline.style.height = '36px';
    outline.style.borderColor = '#00f0ff';
    badge.style.opacity = '0';
  });
});

/* ==========================================================================
   2. THREE.JS 3D DIGITAL TWIN VIEWER (POWERTWINAI)
   ========================================================================== */
const container = document.getElementById('threeContainer');
if (container && typeof Three !== 'undefined') {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Create Transformer Core Geometry
  const group = new THREE.Group();
  
  // Main Tank Body
  const bodyGeo = new THREE.BoxGeometry(2.2, 2.8, 1.8);
  const bodyMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  group.add(bodyMesh);

  // Bushings (Top Cylinders)
  for (let i = -0.6; i <= 0.6; i += 0.6) {
    const bushGeo = new THREE.CylinderGeometry(0.15, 0.2, 1.2, 8);
    const bushMat = new THREE.MeshBasicMaterial({ color: 0x8b5cf6, wireframe: true });
    const bushing = new THREE.Mesh(bushGeo, bushMat);
    bushing.position.set(i, 2, 0);
    group.add(bushing);
  }

  scene.add(group);
  camera.position.set(4, 3, 5);
  camera.lookAt(0, 0, 0);

  // Animation Loop
  function animate3D() {
    requestAnimationFrame(animate3D);
    group.rotation.y += 0.008;
    renderer.render(scene, camera);
  }
  animate3D();

  // Mode Switches
  document.getElementById('btnWireframe')?.addEventListener('click', function() {
    bodyMat.wireframe = true;
    bodyMat.color.setHex(0x00f0ff);
    setActiveBtn(this);
  });

  document.getElementById('btnHeatmap')?.addEventListener('click', function() {
    bodyMat.wireframe = false;
    bodyMat.color.setHex(0xef4444);
    setActiveBtn(this);
  });

  document.getElementById('btnPoints')?.addEventListener('click', function() {
    bodyMat.wireframe = true;
    bodyMat.color.setHex(0xf59e0b);
    setActiveBtn(this);
  });

  document.getElementById('btnResetCam')?.addEventListener('click', function() {
    group.rotation.y = 0;
  });

  function setActiveBtn(btn) {
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }

  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}

/* ==========================================================================
   3. IOT SOUND WAVEFORM SIMULATOR
   ========================================================================== */
const waveCanvas = document.getElementById('soundWaveCanvas');
if (waveCanvas) {
  const ctx = waveCanvas.getContext('2d');
  let phase = 0;
  let isTapped = false;
  let tapCount = 0;

  function drawWave() {
    ctx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = isTapped ? '#10b981' : '#00f0ff';

    const amp = isTapped ? 35 : 12;
    const freq = isTapped ? 0.08 : 0.04;

    for (let x = 0; x < waveCanvas.width; x++) {
      const y = waveCanvas.height / 2 + Math.sin(x * freq + phase) * amp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    phase += 0.08;
    requestAnimationFrame(drawWave);
  }
  drawWave();

  const lockStatus = document.getElementById('lockStatus');
  document.getElementById('btnTapPulse')?.addEventListener('click', () => {
    isTapped = true;
    tapCount++;
    setTimeout(() => { isTapped = false; }, 400);

    if (tapCount >= 3) {
      lockStatus.innerHTML = '<i class="fa-solid fa-lock-open"></i> SERVO: UNLOCKED';
      lockStatus.style.color = '#10b981';
    }
  });

  document.getElementById('btnResetLock')?.addEventListener('click', () => {
    tapCount = 0;
    lockStatus.innerHTML = '<i class="fa-solid fa-lock"></i> SERVO: LOCKED';
    lockStatus.style.color = '#00f0ff';
  });
}

/* ==========================================================================
   4. TERMINAL CLI HUD
   ========================================================================== */
const termInput = document.getElementById('termInput');
const termOutput = document.getElementById('termOutput');

if (termInput) {
  termInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const cmd = termInput.value.trim().toLowerCase();
      termInput.value = '';

      // Print prompt line
      appendLine(`rakesh$ ${cmd}`, 'term-cmd');

      // Command Execution Logic
      switch (cmd) {
        case 'help':
          appendLine('Available commands: powertwin, skills, cgpa, contact, clear');
          break;
        case 'powertwin':
          appendLine('Powertwinai: 3D Photogrammetry & AI Digital Twin platform. Tech: COLMAP, Open3D, SIFT.');
          break;
        case 'skills':
          appendLine('Programming: C, Python, MATLAB. Hardware: ESP32, Arduino. Core: Electrical Machines, Power Systems.');
          break;
        case 'cgpa':
          appendLine('Current Academic CGPA: 8.32 (NIT Nagaland - Electrical & Electronics Engineering).');
          break;
        case 'contact':
          appendLine('Email: dileshwarao02@gmail.com | GitHub: github.com/RakeshPedada');
          break;
        case 'clear':
          termOutput.innerHTML = '';
          break;
        default:
          appendLine(`Command not recognized: "${cmd}". Type "help" for command list.`);
      }

      termOutput.scrollTop = termOutput.scrollHeight;
    }
  });

  function appendLine(text, className = '') {
    const p = document.createElement('p');
    p.className = `term-line ${className}`;
    p.textContent = text;
    termOutput.appendChild(p);
  }
}