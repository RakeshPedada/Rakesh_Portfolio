/* ==========================================================================
   1. KINETIC PARTICLE TRAIL & DUAL RETICLE CURSOR
   ========================================================================== */
const cursorCanvas = document.getElementById('cursorCanvas');
const ctx = cursorCanvas ? cursorCanvas.getContext('2d') : null;

if (cursorCanvas && ctx) {
  function resizeCanvas() {
    cursorCanvas.width = window.innerWidth;
    cursorCanvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const particles = [];
  
  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 3 + 1;
      this.speedX = (Math.random() - 0.5) * 1.5;
      this.speedY = (Math.random() - 0.5) * 1.5;
      this.color = '#00f0ff';
      this.life = 1;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life -= 0.03;
    }

    draw() {
      ctx.fillStyle = `rgba(0, 240, 255, ${this.life})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function handleParticles() {
    ctx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
      if (particles[i].life <= 0) {
        particles.splice(i, 1);
        i--;
      }
    }
  }

  window.addEventListener('mousemove', (e) => {
    if (Math.random() > 0.3) {
      particles.push(new Particle(e.clientX, e.clientY));
    }
  });

  function renderParticles() {
    handleParticles();
    requestAnimationFrame(renderParticles);
  }
  renderParticles();
}

/* Cursor Telemetry & Physics */
const dot = document.getElementById('cursorDot');
const outline = document.getElementById('cursorOutline');
const coordsText = document.getElementById('coordsText');
const badge = document.getElementById('cursorBadge');
const telemetry = document.getElementById('cursorTelemetry');

let mouseX = 0, mouseY = 0;
let outlineX = 0, outlineY = 0;

window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  
  if (dot) dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  if (telemetry) telemetry.style.transform = `translate(${mouseX + 22}px, ${mouseY + 22}px)`;
  if (coordsText) coordsText.textContent = `X:${String(mouseX).padStart(3, '0')} Y:${String(mouseY).padStart(3, '0')}`;
});

function animateCursor() {
  outlineX += (mouseX - outlineX) * 0.18;
  outlineY += (mouseY - outlineY) * 0.18;
  
  if (outline) outline.style.transform = `translate(${outlineX}px, ${outlineY}px) translate(-50%, -50%)`;
  requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('a, button, .btn, .about-card, .leadership-card, .metric-card').forEach(el => {
  el.addEventListener('mouseenter', () => {
    if (outline) {
      outline.style.width = '52px';
      outline.style.height = '52px';
      outline.style.borderColor = '#8b5cf6';
    }
    if (badge) badge.textContent = el.getAttribute('data-badge') || 'INSPECT';
  });
  
  el.addEventListener('mouseleave', () => {
    if (outline) {
      outline.style.width = '40px';
      outline.style.height = '40px';
      outline.style.borderColor = 'rgba(0, 240, 255, 0.4)';
    }
    if (badge) badge.textContent = 'READY';
  });
});

/* ==========================================================================
   2. THREE.JS 3D DIGITAL TWIN VIEWER
   ========================================================================== */
const container = document.getElementById('threeContainer');
if (container && typeof THREE !== 'undefined') {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const group = new THREE.Group();
  
  const bodyGeo = new THREE.BoxGeometry(2.2, 2.8, 1.8);
  const bodyMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff, wireframe: true });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  group.add(bodyMesh);

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

  function animate3D() {
    requestAnimationFrame(animate3D);
    group.rotation.y += 0.008;
    renderer.render(scene, camera);
  }
  animate3D();

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
   3. ACOUSTIC SOUND WAVE SIMULATOR
   ========================================================================== */
const waveCanvas = document.getElementById('soundWaveCanvas');
if (waveCanvas) {
  const ctxWave = waveCanvas.getContext('2d');
  let phase = 0;
  let isTapped = false;
  let tapCount = 0;

  function drawWave() {
    ctxWave.clearRect(0, 0, waveCanvas.width, waveCanvas.height);
    ctxWave.beginPath();
    ctxWave.lineWidth = 2;
    ctxWave.strokeStyle = isTapped ? '#10b981' : '#00f0ff';

    const amp = isTapped ? 35 : 12;
    const freq = isTapped ? 0.08 : 0.04;

    for (let x = 0; x < waveCanvas.width; x++) {
      const y = waveCanvas.height / 2 + Math.sin(x * freq + phase) * amp;
      if (x === 0) ctxWave.moveTo(x, y);
      else ctxWave.lineTo(x, y);
    }
    ctxWave.stroke();
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
      if (lockStatus) {
        lockStatus.innerHTML = '<i class="fa-solid fa-lock-open"></i> SERVO: UNLOCKED';
        lockStatus.style.color = '#10b981';
      }
    }
  });

  document.getElementById('btnResetLock')?.addEventListener('click', () => {
    tapCount = 0;
    if (lockStatus) {
      lockStatus.innerHTML = '<i class="fa-solid fa-lock"></i> SERVO: LOCKED';
      lockStatus.style.color = '#00f0ff';
    }
  });
}

/* ==========================================================================
   4. INTERACTIVE TERMINAL HUD CLI
   ========================================================================== */
const termInput = document.getElementById('termInput');
const termOutput = document.getElementById('termOutput');

if (termInput) {
  termInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const cmd = termInput.value.trim().toLowerCase();
      termInput.value = '';

      appendLine(`rakesh$ ${cmd}`, 'term-cmd');

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
          if (termOutput) termOutput.innerHTML = '';
          break;
        default:
          appendLine(`Command not recognized: "${cmd}". Type "help" for command list.`);
      }

      if (termOutput) termOutput.scrollTop = termOutput.scrollHeight;
    }
  });

  function appendLine(text, className = '') {
    const p = document.createElement('p');
    p.className = `term-line ${className}`;
    p.textContent = text;
    if (termOutput) termOutput.appendChild(p);
  }
}
