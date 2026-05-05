let totalKills = 0; // จำนวนที่ฆ่าได้ทั้งหมด
let killStreak = 0;
let streakTimer = 0; // วิที่เหลือสำหรับ streak
let isGoldRush = false;
let goldRushTimer = 0; // วิที่เหลือสำหรับ Gold Rush
let tokensPerSecond = 0;
let clickPower = 1;

let currentStage = 1;
let monsterMaxHP = 50;
let monsterHP = 50;
let bossTimeLeft = 0;
let isBossStage = false;

// Combo System
let combo = 1;
let comboTimer = 0;

// Save System
const SAVE_KEY = "ai_tycoon_save";

let prestigeMultiplier = 1;
let totalAscensions = 0;

const scoreDisplay    = document.getElementById("scoreDisplay");
const tpsDisplay      = document.getElementById("tpsDisplay");
const stageNumber     = document.getElementById("stageNumber");
const aiCore          = document.getElementById("aiCore");
const upgradesList    = document.getElementById("upgradesList");
const comboDisplay    = document.getElementById("comboDisplay");
const offlineModal    = document.getElementById("offlineModal");
const offlineEarnings = document.getElementById("offlineEarnings");
const claimBtn        = document.getElementById("claimBtn");
const skillsContainer = document.getElementById("skillsContainer");
const prestigeSection = document.getElementById("prestigeSection");
const prestigeBtn     = document.getElementById("prestigeBtn");
const floatingHP      = document.getElementById("floatingHP");
const stageNameElem   = document.getElementById("stageName");
const PANEL_WIDTH     = 380; // px — width of right upgrades panel

const upgrades = [
  {
    id: "recruit",
    icon: "🗡️",
    name: "Volunteer Militia",
    desc: "+1 Auto-Damage",
    baseCost: 15,
    costMult: 1.15,
    tps: 1,
    count: 0,
  },
  {
    id: "knight",
    icon: "⚔️",
    name: "Elite Knight",
    desc: "+5 Auto-Damage",
    baseCost: 100,
    costMult: 1.15,
    tps: 5,
    count: 0,
  },
  {
    id: "sniper",
    icon: "🏹",
    name: "Elven Sniper",
    desc: "+50 Auto-Damage",
    baseCost: 1100,
    costMult: 1.15,
    tps: 50,
    count: 0,
  },
  {
    id: "warlock",
    icon: "🔮",
    name: "Void Warlock",
    desc: "+250 Auto-Damage",
    baseCost: 12000,
    costMult: 1.15,
    tps: 250,
    count: 0,
  },
  {
    id: "behemoth",
    icon: "🐉",
    name: "Ancient Behemoth",
    desc: "+2,000 Auto-Damage",
    baseCost: 130000,
    costMult: 1.15,
    tps: 2000,
    count: 0,
  },
  {
    id: "titan",
    icon: "⚡",
    name: "Celestial Titan",
    desc: "+10,000 Auto-Damage",
    baseCost: 1400000,
    costMult: 1.15,
    tps: 10000,
    count: 0,
  },
];

const activeSkills = [
  {
    id: "berserk",
    name: "Berserk",
    icon: "🔥",
    desc: "x5 Click Damage",
    duration: 10,
    cooldown: 60,
    currentCD: 0,
    isActive: false,
  },
  {
    id: "midas",
    name: "Midas",
    icon: "💰",
    desc: "Loot Stash",
    duration: 0,
    cooldown: 45,
    currentCD: 0,
    isActive: false,
  },
];

// --- Generated Art Assets (Epic transparent-bg monsters) ---
const monsters = [
  "assets/m1_crystal_golem.png",      // Crystal Golem
  "assets/m2_neon_dragon.png",        // Neon Cyber Dragon
  "assets/m3_lava_titan.png",         // Lava Titan
  "assets/m4_void_phantom.png",       // Void Phantom
  "assets/m5_storm_phoenix.png",      // Storm Phoenix
  "assets/m6_toxic_troll.png",        // Toxic Troll
  "assets/m7_frost_queen.png",        // Frost Queen
  "assets/m8_shadow_necromancer.png", // Shadow Necromancer
  "assets/m9_golden_demon.png",       // Golden Demon (mini-boss)
  "assets/m10_chaos_dragon.png",      // Chaos Dragon (Elite Boss)
];
let lastMonsterIndex = -1; // track last shown to avoid repeat

const weapons = [
  "assets/cursor_w1_1777370190416.png",
  "assets/cursor_w2_1777370204615.png",
  "assets/cursor_w3_1777370220897.png",
];

// ----------------- Web Audio API -----------------
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;
function initAudio() {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume();
}

function playPop() {
  initAudio();
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(400, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.05);
  gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.05);
}

function playBuy() {
  initAudio();
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(300, audioCtx.currentTime);
  osc.frequency.setValueAtTime(400, audioCtx.currentTime + 0.1);
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.2);
}

function playGolden() {
  initAudio();
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(800, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1600, audioCtx.currentTime + 0.5);
  gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.5);
}

// ----------------- Core Game Logic -----------------
function formatNumber(num) {
  if (num < 1000) return Math.floor(num).toString();
  const suffixes = [
    "",
    "K",
    "M",
    "B",
    "T",
    "Qa",
    "Qi",
    "Sx",
    "Sp",
    "Oc",
    "No",
    "Dc",
  ];
  const suffixNum = Math.floor(("" + Math.floor(num)).length / 3);
  let shortValue = parseFloat(
    (suffixNum != 0 ? num / Math.pow(1000, suffixNum) : num).toPrecision(3),
  );
  if (shortValue % 1 != 0) shortValue = shortValue.toFixed(2);
  return shortValue + suffixes[suffixNum];
}

function getCost(upgrade) {
  return Math.floor(
    upgrade.baseCost * Math.pow(upgrade.costMult, upgrade.count),
  );
}

function renderUpgrades() {
  upgradesList.innerHTML = "";
  upgrades.forEach((upgrade) => {
    const cost = getCost(upgrade);
    const canAfford = tokens >= cost;
    const wrapper = document.createElement("div");
    wrapper.className = "upgrade-wrapper";
    const btn = document.createElement("button");
    btn.className = "upgrade-btn";
    btn.disabled = !canAfford;
    btn.onclick = () => buyUpgrade(upgrade);
    btn.innerHTML = `
      <div class="upgrade-info">
        <h3><span class="upgrade-icon">${upgrade.icon}</span>${upgrade.name}</h3>
        <p>${upgrade.desc}</p>
      </div>
      <div class="upgrade-price ${canAfford ? "cost-green" : "cost-red"}">${formatNumber(cost)} T</div>
    `;
    if (upgrade.count > 0) {
      const countBadge = document.createElement("div");
      countBadge.className = "upgrade-count";
      countBadge.innerText = upgrade.count;
      wrapper.appendChild(countBadge);
    }
    wrapper.appendChild(btn);
    upgradesList.appendChild(wrapper);
  });
}

function updateUI() {
  scoreDisplay.innerText = formatNumber(tokens);
  tpsDisplay.innerText   = formatNumber(tokensPerSecond);
  if (stageNumber) stageNumber.innerText = currentStage;
  const killDisplay = document.getElementById("killCountDisplay");
  if (killDisplay) killDisplay.innerText = formatNumber(totalKills);
  updateStageProgress();
  const btns   = document.querySelectorAll(".upgrade-btn");
  const prices = document.querySelectorAll(".upgrade-price");
  upgrades.forEach((upgrade, index) => {
    const cost = getCost(upgrade);
    const canAfford = tokens >= cost;
    if (btns[index]) {
      btns[index].disabled = !canAfford;
      prices[index].className = `upgrade-price ${canAfford ? "cost-green" : "cost-red"}`;
    }
  });
}

// Stage progress: how far to next boss (every 10 stages)
function updateStageProgress() {
  const bar  = document.getElementById("stageProgressBar");
  const lbl  = document.getElementById("stageProgressLabel");
  if (!bar || !lbl) return;
  const stageInCycle = ((currentStage - 1) % 10) + 1; // 1-10
  const pct = (stageInCycle / 10) * 100;
  bar.style.width = pct + "%";
  const bossIn = 10 - stageInCycle;
  lbl.innerText = bossIn === 0 ? "👑 BOSS NOW!" : `Boss in ${bossIn} stage${bossIn > 1 ? "s" : ""}`;
}

function recalculateStats() {
  tokensPerSecond =
    upgrades.reduce((acc, curr) => acc + curr.tps * curr.count, 0) *
    prestigeMultiplier;
  const totalUpgrades = upgrades.reduce((acc, curr) => acc + curr.count, 0);
  clickPower = (1 + Math.floor(totalUpgrades / 5)) * prestigeMultiplier;
}

// ----------------- Monster Health & Stages -----------------
function initStage() {
  isBossStage = currentStage % 10 === 0;
  const healthMultiplier = isBossStage ? 5 : 1;
  monsterMaxHP = Math.floor(50 * Math.pow(1.2, currentStage - 1)) * healthMultiplier;
  monsterHP = monsterMaxHP;

  // Monster image — Boss = Chaos Dragon (9), Normal = random no-repeat
  let mIndex;
  if (isBossStage) {
    mIndex = 9; // always Chaos Dragon for boss
  } else {
    // Random pick from m0–m8, avoid repeating last shown
    const pool = [...Array(9).keys()].filter(i => i !== lastMonsterIndex);
    mIndex = pool[Math.floor(Math.random() * pool.length)];
    lastMonsterIndex = mIndex;
  }
  aiCore.style.backgroundImage = `url('${monsters[mIndex]}')`;

  // Trigger Entrance Animation
  aiCore.classList.remove("monster-spawn");
  void aiCore.offsetWidth; // Trigger reflow
  aiCore.classList.add("monster-spawn");

  // Monster aura color changes per boss stage
  const aura = document.getElementById("monsterAura");
  if (aura) {
    aura.className = "monster-aura" + (isBossStage ? " aura-boss" : "");
  }

  // Stage name (floating element above monster)
  if (stageNameElem) {
    if (isBossStage) {
      stageNameElem.innerHTML = `<span style="color:#f5a623;">👑 ELITE BOSS ${currentStage}</span>`;
    } else {
      stageNameElem.innerText = `STAGE ${currentStage}`;
    }
  }

  if (stageNumber) stageNumber.innerText = currentStage;
  updateStageProgress();

  // Prestige check
  if (currentStage >= 50 && prestigeSection) {
    prestigeSection.style.display = "flex";
  }

  // Boss timer
  const bossTimerElem = document.getElementById("bossTimer");
  if (isBossStage) {
    bossTimeLeft = 30.0;
    bossTimerElem.style.display = "block";
    bossTimerElem.innerText = `⏱️ ${bossTimeLeft.toFixed(1)}s`;
  } else {
    bossTimerElem.style.display = "none";
  }

  updateHPBar();
  updateBiome();
}

function updateBiome() {
  document.body.classList.remove(
    "theme-forest",
    "theme-volcano",
    "theme-void",
    "theme-cyber",
  );
  if (currentStage <= 10) document.body.classList.add("theme-forest");
  else if (currentStage <= 20) document.body.classList.add("theme-volcano");
  else if (currentStage <= 30) document.body.classList.add("theme-void");
  else document.body.classList.add("theme-cyber");
}

function updateHPBar() {
  const hpBar  = document.getElementById("hpBar");
  const hpText = document.getElementById("hpText");
  if (!hpBar || !hpText) return;
  const pct = Math.max(0, (monsterHP / monsterMaxHP) * 100);
  hpBar.style.width = pct + "%";
  // Color changes: green → yellow → red
  if (pct > 60) hpBar.style.background = "linear-gradient(90deg, #10b981, #34d399)";
  else if (pct > 30) hpBar.style.background = "linear-gradient(90deg, #f59e0b, #fbbf24)";
  else hpBar.style.background = "linear-gradient(90deg, #ef4444, #f97316)";
  hpText.innerText = `${formatNumber(monsterHP)} / ${formatNumber(monsterMaxHP)} HP`;
}

// Position floating HP bar, stage name, and monster aura
function updateFloatingElements() {
  const mx = parseFloat(aiCore.style.left) || window.innerWidth / 2;
  const my = parseFloat(aiCore.style.top)  || window.innerHeight / 2;
  const monsterSize = 200; // match CSS size

  // Floating HP — centered above monster
  if (floatingHP) {
    floatingHP.style.left = (mx + monsterSize / 2) + "px";
    floatingHP.style.top  = (my - 55) + "px";
  }
  // Stage name — above HP bar
  if (stageNameElem) {
    stageNameElem.style.left = (mx + monsterSize / 2) + "px";
    stageNameElem.style.top  = (my - 78) + "px";
  }
  // Monster Aura — centered on monster
  const aura = document.getElementById("monsterAura");
  if (aura) {
    aura.style.left = (mx + monsterSize / 2) + "px";
    aura.style.top  = (my + monsterSize / 2) + "px";
  }
}

function spawnCoins() {
  const amount = 10 + Math.random() * 10;
  const x = parseFloat(aiCore.style.left) || window.innerWidth / 2;
  const y = parseFloat(aiCore.style.top) || window.innerHeight / 2;

  for (let i = 0; i < amount; i++) {
    const coin = document.createElement("div");
    coin.innerText = "🪙";
    coin.style.position = "absolute";
    coin.style.fontSize = "2rem";
    coin.style.left = x + "px";
    coin.style.top = y + "px";
    coin.style.zIndex = "9999";
    coin.style.pointerEvents = "none";
    document.body.appendChild(coin);

    const angle = Math.random() * Math.PI * 2;
    const speed = 20 + Math.random() * 50;
    const vx = Math.cos(angle) * speed;
    let vy = Math.sin(angle) * speed - 30; // กระโดดขึ้นนิดนึง

    let cx = x;
    let cy = y;
    let life = 1.0;

    const interval = setInterval(() => {
      vy += 5; // แรงโน้มถ่วง
      cx += vx * 0.1;
      cy += vy * 0.1;
      life -= 0.02;
      coin.style.left = cx + "px";
      coin.style.top = cy + "px";
      coin.style.opacity = life;
      coin.style.transform = `scale(${life})`;

      if (life <= 0) {
        clearInterval(interval);
        coin.remove();
      }
    }, 20);
  }
}

function spawnParticles(x, y, color, count = 8) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    p.className = "particle";
    const size = Math.random() * 15 + 5;
    p.style.width = size + "px";
    p.style.height = size + "px";
    p.style.background = color || "var(--primary)";
    p.style.left = x + "px";
    p.style.top = y + "px";
    p.style.boxShadow = `0 0 10px ${color || "var(--primary)"}`;

    const spread = count > 10 ? 600 : 200; // ระเบิดกระจายแรงขึ้น 3 เท่าตอนตีติดคริ
    const tx = (Math.random() - 0.5) * spread;
    const ty = (Math.random() - 0.5) * spread;
    p.style.setProperty("--tx", `${tx}px`);
    p.style.setProperty("--ty", `${ty}px`);

    document.body.appendChild(p);
    setTimeout(() => p.remove(), 600);
  }
}

function dealDamage(amount, x, y, isCrit) {
  let multiplier = isGoldRush ? 2 : 1;
  let finalAmount = amount * multiplier;
  
  monsterHP -= amount; // HP ลดเท่าเดิม แต่ได้ตังค์เพิ่ม
  tokens += finalAmount; 
  if (x !== null && y !== null) {
    createFloatingNumber(x, y, finalAmount, isCrit);

    if (isCrit) {
      spawnParticles(x, y, "#ef4444", 30); // ระเบิดเลือดแดง
      spawnParticles(x, y, "#fbbf24", 20); // ประกายทอง
      spawnParticles(x, y, "#ffffff", 10); // สะเก็ดแสงสว่าง
      triggerFlash();
      if (window.triggerEnergyPulse) window.triggerEnergyPulse(x, y);
    } else {
      spawnParticles(x, y, "var(--primary)", 8);
    }

    // Squash & Stretch
    aiCore.classList.remove("monster-hit");
    void aiCore.offsetWidth;
    aiCore.classList.add("monster-hit");
  }

  if (monsterHP <= 0) {
    // Monster Killed
    totalKills++;
    updateUI();
    playGolden();
    spawnCoins(); // ฝนเหรียญทอง!

    const baseBonus = Math.floor(monsterMaxHP * 0.5);
    const bonus = isGoldRush ? baseBonus * 2 : baseBonus;
    tokens += bonus;
    createFloatingNumber(
      window.innerWidth / 2,
      window.innerHeight / 2,
      bonus,
      true,
      "CLEARED! +",
    );

    currentStage++;
    initStage();
    swapWeapon();
    moveBossRandomly();
  }
  updateHPBar();
  updateUI();
  
  // Kill Streak Logic
  if (monsterHP <= 0) {
    killStreak++;
    streakTimer = 8; // มีเวลา 8 วิในการฆ่าตัวต่อไป
    if (killStreak >= 5 && !isGoldRush) {
      triggerGoldRush();
    }
  }
}

function triggerGoldRush() {
  isGoldRush = true;
  goldRushTimer = 20; // 20 seconds of glory
  document.body.classList.add("gold-rush-active");
  playGolden();
  // Reset streak after trigger
  killStreak = 0;
}

// Monster zone: left side only, safe margins for 160px monster
function moveBossRandomly() {
  const safeRight = window.innerWidth - PANEL_WIDTH - 180;
  const maxY = window.innerHeight - 220;
  const x = Math.max(40, Math.random() * safeRight);
  const y = Math.max(100, Math.random() * maxY);
  aiCore.style.left = x + "px";
  aiCore.style.top  = y + "px";
  updateFloatingElements();
}

// ── Custom Animated Weapon Cursor ──
const weaponCursor = document.getElementById("weaponCursor");
const weaponImg    = document.getElementById("weaponImg");

function swapWeapon() {
  const rWeapon = weapons[Math.floor(Math.random() * weapons.length)];
  if (weaponImg) weaponImg.src = rWeapon;
  // ซ่อน cursor ดั้งเดิม (CSS จัดการแล้ว แต่ reset ค่า JS ไว้ด้วย)
  document.body.style.cursor = "none";
}

// ติดตามเมาส์ — อัปเดตตำแหน่ง cursor แบบ raw (ไม่มี transition เพื่อ smooth)
let curX = 0, curY = 0;
document.addEventListener("mousemove", (e) => {
  curX = e.clientX;
  curY = e.clientY;
  if (weaponCursor) {
    weaponCursor.style.left = (curX - 16) + "px"; // offset ให้หัวค้อนอยู่ตรงปลาย cursor
    weaponCursor.style.top  = (curY - 16) + "px";
  }
});

// กดเมาส์ — ยกค้อนขึ้น
document.addEventListener("mousedown", () => {
  if (!weaponCursor) return;
  weaponCursor.classList.remove("raise", "strike");
  void weaponCursor.offsetWidth; // reflow เพื่อ reset animation
  weaponCursor.classList.add("raise");
});

// ปล่อยเมาส์ — ตีลง!
document.addEventListener("mouseup", () => {
  if (!weaponCursor) return;
  weaponCursor.classList.remove("raise", "strike");
  void weaponCursor.offsetWidth;
  weaponCursor.classList.add("strike");
});

// วิ่งสุ่มทุกๆ 2 วินาที
setInterval(moveBossRandomly, 2000);

// เริ่มตำแหน่งตรงกลางโซนซ้าย
const initX = (window.innerWidth - PANEL_WIDTH) / 2 - 55;
aiCore.style.left = initX + "px";
aiCore.style.top  = (window.innerHeight / 2 - 55) + "px";
updateFloatingElements();

// เมื่อตีมอนสเตอร์!
aiCore.addEventListener("mousedown", (e) => {
  playPop();
  combo += 0.1;
  if (combo > 5.0) combo = 5.0;
  comboTimer = 2.0;

  let isCrit = Math.random() < 0.15; // เพิ่มโอกาสคริติคอลเป็น 15% เพื่อความสะใจ

  // Skill: Berserk Check
  const berserkSkill = activeSkills.find((s) => s.id === "berserk");
  const skillMult = berserkSkill.isActive ? 5 : 1;

  const actualPower = clickPower * combo * (isCrit ? 5 : 1) * skillMult;

  dealDamage(actualPower, e.clientX, e.clientY, isCrit);

  if (isCrit) {
    // 💥 Massive Screen Shake (Earthquake)
    document.body.classList.remove("earthquake");
    void document.body.offsetWidth;
    document.body.classList.add("earthquake");

    // ⏱️ Hit Stop (หยุดเวลาสั้นๆ พร้อมเปลี่ยนสี)
    aiCore.classList.add("hit-stop");
    setTimeout(() => aiCore.classList.remove("hit-stop"), 80);
    
    // Combo effect without shake (since earthquake handles it)
    comboDisplay.style.opacity = 1;
    comboDisplay.innerText = `Combo x${combo.toFixed(1)}! 🔥`;
    comboDisplay.style.transform = `scale(${1 + combo / 20})`;
  } else if (combo >= 1.5) {
    comboDisplay.style.opacity = 1;
    comboDisplay.innerText = `Combo x${combo.toFixed(1)}! 🔥`;
    comboDisplay.style.transform = `scale(${1 + combo / 20})`;
    if (combo >= 3.0) {
      document.body.classList.remove("shake");
      void document.body.offsetWidth;
      document.body.classList.add("shake");
    }
  }

  // โดนตีแล้ววาร์ปหนี (โอกาส 30%)
  if (Math.random() < 0.3) {
    moveBossRandomly();
  }
});

// รองรับการทัชบนมือถือ
aiCore.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      aiCore.dispatchEvent(
        new MouseEvent("mousedown", {
          clientX: touch.clientX,
          clientY: touch.clientY,
        }),
      );
    }
  },
  { passive: false },
);

function createFloatingNumber(x, y, amount, isCrit = false, prefix = "+") {
  const el = document.createElement("div");
  el.className = "floating-number";
  if (isCrit) {
    el.innerText =
      prefix + formatNumber(amount) + (prefix === "+" ? " CRIT💥" : " 💎");
    el.style.color = "#fbbf24";
    el.style.fontSize = "3rem";
    el.style.textShadow = "0 0 20px #fbbf24";
  } else {
    el.innerText = prefix + formatNumber(amount);
    if (combo >= 4.0) el.style.color = "#ef4444";
  }
  const offsetX = (Math.random() - 0.5) * 50;
  el.style.left = x + offsetX - 15 + "px";
  el.style.top = y - 30 + "px";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

function buyUpgrade(upgrade) {
  const cost = getCost(upgrade);
  if (tokens >= cost) {
    playBuy();
    tokens -= cost;
    upgrade.count++;
    recalculateStats();
    renderUpgrades();
    updateUI();
    saveGame();
  }
}

// ----------------- Save / Load System & Offline Progress -----------------
function saveGame() {
  const saveState = {
    totalKills: totalKills,
    tokens: tokens,
    currentStage: currentStage,
    monsterHP: monsterHP,
    prestigeMultiplier: prestigeMultiplier,
    totalAscensions: totalAscensions,
    lastSaveTime: Date.now(),
    upgrades: upgrades.map((u) => u.count),
  };
  localStorage.setItem(SAVE_KEY, JSON.stringify(saveState));
}

function loadGame() {
  const saved = localStorage.getItem(SAVE_KEY);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      totalKills = data.totalKills || 0;
      tokens = data.tokens || 0;
      currentStage = data.currentStage || 1;
      monsterHP = data.monsterHP || -1;
      prestigeMultiplier = data.prestigeMultiplier || 1;
      totalAscensions = data.totalAscensions || 0;

      if (data.upgrades) {
        upgrades.forEach((u, i) => {
          if (data.upgrades[i] !== undefined) u.count = data.upgrades[i];
        });
      }
      recalculateStats();

      if (data.lastSaveTime && tokensPerSecond > 0) {
        const now = Date.now();
        const diffSeconds = (now - data.lastSaveTime) / 1000;
        if (diffSeconds > 60) {
          const earned = diffSeconds * tokensPerSecond;
          tokens += earned;
          showOfflineModal(earned);
        }
      }
    } catch (e) {
      console.error("Save file corrupted");
    }
  }

  initStage();
  if (monsterHP > 0) {
    updateHPBar();
  }
}

function showOfflineModal(amount) {
  offlineEarnings.innerText = "+" + formatNumber(amount) + " Essence";
  offlineModal.classList.add("active");
}

claimBtn.addEventListener("click", () => {
  playBuy();
  offlineModal.classList.remove("active");
  updateUI();
});

setInterval(saveGame, 5000);

// ----------------- Golden Bug Event -----------------
setInterval(() => {
  if (Math.random() < 0.2) spawnGoldenBug();
}, 15000);
function spawnGoldenBug() {
  if (document.querySelector(".golden-bug")) return;
  const bug = document.createElement("div");
  bug.className = "golden-bug";
  bug.innerText = "💰";
  const startY = Math.random() * (window.innerHeight - 100);
  bug.style.left = "-100px";
  bug.style.top = startY + "px";
  document.body.appendChild(bug);
  let posX = -100;
  const speed = 2 + Math.random() * 3;
  const moveInterval = setInterval(() => {
    posX += speed;
    bug.style.left = posX + "px";
    bug.style.transform = `translateY(${Math.sin(posX / 50) * 30}px)`;
    if (posX > window.innerWidth + 100) {
      clearInterval(moveInterval);
      bug.remove();
    }
  }, 20);
  bug.onmousedown = (e) => {
    playGolden();
    const reward = Math.max(tokensPerSecond * 30, 100 * clickPower);
    tokens += reward;
    createFloatingNumber(e.clientX, e.clientY, reward, true);
    updateUI();
    saveGame();
    clearInterval(moveInterval);
    bug.remove();
  };
  bug.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      bug.onmousedown(e.touches[0]);
    },
    { passive: false },
  );
}

// ----------------- Skills Logic -----------------
function renderSkills() {
  skillsContainer.innerHTML = "";
  activeSkills.forEach((skill) => {
    const btn = document.createElement("button");
    btn.className = `skill-btn ${skill.isActive ? "active" : ""}`;
    btn.disabled = skill.currentCD > 0;
    const cdSecs = skill.currentCD > 0 ? Math.ceil(skill.currentCD) : "";
    btn.innerHTML = `
      <span class="icon">${skill.icon}</span>
      <span class="skill-label">${skill.name}</span>
      ${cdSecs ? `<span class="skill-cd">${cdSecs}s</span>` : ""}
      <div class="cooldown-overlay" style="height: ${(skill.currentCD / skill.cooldown) * 100}%"></div>
    `;
    btn.title = `${skill.name}: ${skill.desc}`;
    btn.onclick = () => useSkill(skill);
    skillsContainer.appendChild(btn);
  });
}

function useSkill(skill) {
  if (skill.currentCD > 0) return;
  playBuy();

  if (skill.id === "berserk") {
    skill.isActive = true;
    skill.currentCD = skill.cooldown;
    setTimeout(() => {
      skill.isActive = false;
      renderSkills();
    }, skill.duration * 1000);
  } else if (skill.id === "midas") {
    const reward = tokensPerSecond * 60 + 500 * clickPower;
    tokens += reward;
    skill.currentCD = skill.cooldown;
    createFloatingNumber(
      window.innerWidth / 2,
      window.innerHeight / 2,
      reward,
      true,
      "JACKPOT! +",
    );
  }

  renderSkills();
}

function triggerFlash() {
  const overlay = document.getElementById("flashOverlay");
  if (!overlay) return;
  overlay.classList.remove("flash-anim");
  void overlay.offsetWidth;
  overlay.classList.add("flash-anim");
}

function ascend() {
  if (
    confirm(
      "ASCENSION: Reset all progress to gain permanent +100% Damage Multiplier?",
    )
  ) {
    totalAscensions++;
    prestigeMultiplier += 1.0;
    tokens = 0;
    currentStage = 1;
    upgrades.forEach((u) => (u.count = 0));
    if (prestigeSection) prestigeSection.style.display = "none";
    recalculateStats();
    initStage();
    renderUpgrades();
    updateUI();
    saveGame();
    playGolden();
  }
}

if (prestigeBtn) prestigeBtn.onclick = ascend;

// Game Loop
let lastTime = Date.now();
setInterval(() => {
  const now = Date.now();
  const dt = (now - lastTime) / 1000;
  lastTime = now;
  if (comboTimer > 0) {
    comboTimer -= dt;
    if (comboTimer <= 0) {
      combo = 1;
      comboDisplay.style.opacity = 0;
      comboDisplay.style.transform = "scale(1)";
    }
  }

  // Gold Rush & Streak Timers
  if (streakTimer > 0) {
    streakTimer -= dt;
    if (streakTimer <= 0) killStreak = 0;
  }
  if (goldRushTimer > 0) {
    goldRushTimer -= dt;
    if (goldRushTimer <= 0) {
      goldRushTimer = 0;
      isGoldRush = false;
      document.body.classList.remove("gold-rush-active");
    }
  }

  // จับเวลาบอสใหญ่
  if (isBossStage && bossTimeLeft > 0 && monsterHP > 0) {
    bossTimeLeft -= dt;
    const bossTimerElem = document.getElementById("bossTimer");
    if (bossTimeLeft <= 0) {
      bossTimeLeft = 0;
      bossTimerElem.innerText = `⏱️ 0.0s (FAILED!)`;
      // ถ้าตีบอสไม่ทัน เด้งกลับด่านก่อนหน้า
      currentStage--;
      if (currentStage < 1) currentStage = 1;
      initStage();
      createFloatingNumber(
        window.innerWidth / 2,
        window.innerHeight / 2,
        0,
        false,
        "TIME'S UP! BACK TO STAGE " + currentStage,
      );
      moveBossRandomly();
    } else {
      bossTimerElem.innerText = `⏱️ ${bossTimeLeft.toFixed(1)}s`;
    }
  }

  if (tokensPerSecond > 0 && monsterHP > 0) {
    dealDamage(tokensPerSecond * dt, null, null, false);
  }

  // Update Skills Cooldown
  activeSkills.forEach((skill) => {
    if (skill.currentCD > 0) {
      skill.currentCD -= dt;
      if (skill.currentCD < 0) skill.currentCD = 0;
      renderSkills();
    }
  });
}, 50);

// เริ่มเกม!
loadGame();
swapWeapon();
renderUpgrades();
renderSkills();
updateUI();

// ปุ่ม Reset Progress สำหรับผู้เล่น
const resetBtn = document.getElementById("resetBtn");
if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    if (
      confirm(
        "Are you sure you want to completely reset your progress? This cannot be undone.",
      )
    ) {
      localStorage.removeItem(SAVE_KEY);
      location.reload();
    }
  });
}
