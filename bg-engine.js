
// ═══════════════════════════════════════════════════════════════
//  BACKGROUND ANIMATION ENGINE
//  Star field (3-layer parallax) + Meteors + Floating Runes
//  + Click Ripples + Biome-reactive colors
// ═══════════════════════════════════════════════════════════════

const bgCanvas = document.getElementById("bgCanvas");
if (bgCanvas) {
  const bgCtx = bgCanvas.getContext("2d");

  // Resize canvas to fill window
  function resizeBgCanvas() {
    bgCanvas.width  = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  }
  resizeBgCanvas();
  window.addEventListener("resize", () => { resizeBgCanvas(); initStars(); });

  // ── Biome Color Map (smooth lerp between biomes) ──
  const BIOME_COLORS = {
    "theme-forest":  { r: 16,  g: 185, b: 129 },
    "theme-volcano": { r: 244, g: 63,  b: 94  },
    "theme-void":    { r: 139, g: 92,  b: 246 },
    "theme-cyber":   { r: 6,   g: 182, b: 212 },
    "default":       { r: 94,  g: 106, b: 210 },
  };
  let curColor = { r: 94, g: 106, b: 210 };

  function getTargetBiomeColor() {
    for (const [cls, col] of Object.entries(BIOME_COLORS)) {
      if (cls !== "default" && document.body.classList.contains(cls)) return col;
    }
    return BIOME_COLORS["default"];
  }

  // ── 3-Layer Star Field ──
  const STAR_LAYERS = [
    { count: 90,  speed: 0.06, size: 0.9, baseOpacity: 0.28 },
    { count: 55,  speed: 0.14, size: 1.5, baseOpacity: 0.50 },
    { count: 22,  speed: 0.28, size: 2.4, baseOpacity: 0.80 },
  ];
  const stars = [];

  function initStars() {
    stars.length = 0;
    STAR_LAYERS.forEach((layer, li) => {
      for (let i = 0; i < layer.count; i++) {
        stars.push({
          x: Math.random() * bgCanvas.width,
          y: Math.random() * bgCanvas.height,
          layer: li,
          phase: Math.random() * Math.PI * 2,
          phaseSpeed: 0.015 + Math.random() * 0.025,
        });
      }
    });
  }
  initStars();

  // ── Floating Rune Particles ──
  const RUNE_CHARS = ["◈", "⬡", "⬢", "◉", "✦", "✧", "⋆", "◇", "⬟", "∞", "⟁", "⌬"];
  const runes = [];

  function spawnRune() {
    if (runes.length >= 28) return;
    runes.push({
      x:          Math.random() * bgCanvas.width,
      y:          bgCanvas.height + 24,
      char:       RUNE_CHARS[Math.floor(Math.random() * RUNE_CHARS.length)],
      speed:      0.25 + Math.random() * 0.55,
      drift:      (Math.random() - 0.5) * 0.35,
      size:       9 + Math.random() * 13,
      maxOpacity: 0.08 + Math.random() * 0.18,
      life:       0,   // 0 → 1
    });
  }

  // ── Meteors ──
  const meteors = [];
  function spawnMeteor() {
    if (meteors.length >= 4) return;
    const startX = Math.random() * bgCanvas.width + bgCanvas.width * 0.3;
    meteors.push({
      x:       startX,
      y:       -30,
      vx:      -(6 + Math.random() * 7),
      vy:       5 + Math.random() * 6,
      length:   70 + Math.random() * 110,
      opacity:  0.55 + Math.random() * 0.4,
      life:     1.0,
    });
  }

  // ── Click Ripples ──
  const ripples = [];
  document.addEventListener("click", (e) => {
    // Don't ripple on UI panels
    if (e.target.closest(".info-panel, .upgrades-panel, .skills-container, .offline-modal")) return;
    for (let i = 0; i < 2; i++) {
      ripples.push({
        x:       e.clientX,
        y:       e.clientY,
        r:       i * 15,
        maxR:    100 + i * 40,
        opacity: 0.55 - i * 0.1,
        speed:   3.5 + i * 1.5,
      });
    }
  });

  // ── Energy Pulses (triggered by crit — exposed globally) ──
  const energyPulses = [];
  window.triggerEnergyPulse = function(x, y) {
    for (let i = 0; i < 3; i++) {
      energyPulses.push({ x, y, r: 0, maxR: 180 + i * 60, opacity: 0.6, speed: 5 + i * 2 });
    }
  };

  // ── Main Render Loop ──
  let bgFrame = 0;

  function animateBG() {
    requestAnimationFrame(animateBG);
    bgFrame++;

    // Lerp biome color
    const tc = getTargetBiomeColor();
    curColor.r += (tc.r - curColor.r) * 0.008;
    curColor.g += (tc.g - curColor.g) * 0.008;
    curColor.b += (tc.b - curColor.b) * 0.008;
    const { r, g, b } = curColor;

    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

    // Subtle radial background glow
    const grd = bgCtx.createRadialGradient(
      bgCanvas.width * 0.45, bgCanvas.height * 0.5, 0,
      bgCanvas.width * 0.45, bgCanvas.height * 0.5, bgCanvas.width * 0.65
    );
    grd.addColorStop(0,   `rgba(${r},${g},${b}, 0.07)`);
    grd.addColorStop(0.5, `rgba(${r},${g},${b}, 0.025)`);
    grd.addColorStop(1,   "rgba(0,0,0,0)");
    bgCtx.fillStyle = grd;
    bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);

    // ── Stars ──
    STAR_LAYERS.forEach((layer, li) => {
      stars.filter(s => s.layer === li).forEach(s => {
        s.y    -= layer.speed;
        s.phase += s.phaseSpeed;
        if (s.y < -4) { s.y = bgCanvas.height + 4; s.x = Math.random() * bgCanvas.width; }

        const tw    = (Math.sin(s.phase) + 1) * 0.5;
        const alpha = layer.baseOpacity * (0.55 + tw * 0.45);

        // Colored glow
        bgCtx.beginPath();
        bgCtx.arc(s.x, s.y, layer.size * (1.0 + tw * 0.5), 0, Math.PI * 2);
        bgCtx.fillStyle = `rgba(${r},${g},${b}, ${alpha * 0.45})`;
        bgCtx.shadowBlur   = 6;
        bgCtx.shadowColor  = `rgba(${r},${g},${b}, 0.9)`;
        bgCtx.fill();

        // White hot core
        bgCtx.beginPath();
        bgCtx.arc(s.x, s.y, layer.size * 0.45, 0, Math.PI * 2);
        bgCtx.fillStyle   = `rgba(255,255,255, ${alpha})`;
        bgCtx.shadowBlur  = 3;
        bgCtx.shadowColor = "rgba(255,255,255,0.8)";
        bgCtx.fill();
        bgCtx.shadowBlur = 0;
      });
    });

    // ── Floating Runes ──
    if (bgFrame % 55 === 0) spawnRune();
    runes.forEach((rp, i) => {
      rp.y    -= rp.speed;
      rp.x    += rp.drift;
      rp.life += 0.003;
      const fadeIn  = Math.min(rp.life / 0.12, 1);
      const fadeOut = Math.max(0, 1 - (rp.life - 0.8) / 0.2);
      const alpha   = rp.maxOpacity * fadeIn * fadeOut;
      if (rp.life >= 1 || rp.y < -30) { runes.splice(i, 1); return; }

      bgCtx.font      = `${rp.size}px 'Outfit', monospace`;
      bgCtx.fillStyle = `rgba(${r},${g},${b}, ${alpha})`;
      bgCtx.shadowBlur  = 8;
      bgCtx.shadowColor = `rgba(${r},${g},${b}, ${alpha * 2})`;
      bgCtx.fillText(rp.char, rp.x, rp.y);
      bgCtx.shadowBlur = 0;
    });

    // ── Click Ripples ──
    ripples.forEach((rp, i) => {
      rp.r       += rp.speed;
      rp.opacity -= 0.022;
      if (rp.opacity <= 0) { ripples.splice(i, 1); return; }
      bgCtx.beginPath();
      bgCtx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
      bgCtx.strokeStyle = `rgba(${r},${g},${b}, ${rp.opacity})`;
      bgCtx.lineWidth   = 1.5;
      bgCtx.stroke();
    });

    // ── Energy Pulses (Crit) ──
    energyPulses.forEach((ep, i) => {
      ep.r       += ep.speed;
      ep.opacity -= 0.018;
      if (ep.opacity <= 0) { energyPulses.splice(i, 1); return; }
      bgCtx.beginPath();
      bgCtx.arc(ep.x, ep.y, ep.r, 0, Math.PI * 2);
      bgCtx.strokeStyle = `rgba(255,200,50, ${ep.opacity})`;
      bgCtx.lineWidth   = 2.5;
      bgCtx.stroke();
    });

    // ── Meteors ──
    if (bgFrame % 200 === 0 && Math.random() > 0.4) spawnMeteor();
    meteors.forEach((m, i) => {
      m.x    += m.vx;
      m.y    += m.vy;
      m.life -= 0.016;
      if (m.life <= 0) { meteors.splice(i, 1); return; }

      const tailX = m.x - m.vx / Math.hypot(m.vx, m.vy) * m.length;
      const tailY = m.y - m.vy / Math.hypot(m.vx, m.vy) * m.length;
      const mg    = bgCtx.createLinearGradient(m.x, m.y, tailX, tailY);
      mg.addColorStop(0,    `rgba(255,255,255, ${m.life * m.opacity})`);
      mg.addColorStop(0.2,  `rgba(${r},${g},${b}, ${m.life * m.opacity * 0.7})`);
      mg.addColorStop(1,    "rgba(0,0,0,0)");

      bgCtx.beginPath();
      bgCtx.moveTo(m.x, m.y);
      bgCtx.lineTo(tailX, tailY);
      bgCtx.strokeStyle = mg;
      bgCtx.lineWidth   = 2;
      bgCtx.stroke();

      // Bright head
      bgCtx.beginPath();
      bgCtx.arc(m.x, m.y, 2, 0, Math.PI * 2);
      bgCtx.fillStyle   = `rgba(255,255,255, ${m.life})`;
      bgCtx.shadowBlur  = 8;
      bgCtx.shadowColor = `rgba(${r},${g},${b}, 0.9)`;
      bgCtx.fill();
      bgCtx.shadowBlur = 0;
    });
  }

  animateBG();
}
