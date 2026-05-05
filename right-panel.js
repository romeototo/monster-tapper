/* ═══════════════════════════════════════════════
   right-panel.js — Stats, Buffs, Relics, Pets, Achievements
═══════════════════════════════════════════════ */

// ─── PASSIVE BUFFS ───────────────────────────
const passiveBuffs = [
  { id:"quickHands", icon:"⚡", name:"Quick Hands", desc:"Skill CD -10%", baseCost:5000, costMult:2.5, level:0, maxLvl:5, effect:"cdReduction", value:0.10 },
  { id:"fortune",   icon:"🎲", name:"Fortune",     desc:"Gold Rush +20%", baseCost:8000, costMult:2.5, level:0, maxLvl:5, effect:"goldRushDur", value:4 },
  { id:"fury",      icon:"🔥", name:"Fury",        desc:"Crit Dmg x1.5",  baseCost:12000,costMult:3,   level:0, maxLvl:3, effect:"critMult",    value:0.5 },
  { id:"vitality",  icon:"💚", name:"Vitality",    desc:"Auto DPS +25%",  baseCost:15000,costMult:2.8, level:0, maxLvl:5, effect:"autoDmgMult", value:0.25 },
  { id:"precision", icon:"🎯", name:"Precision",   desc:"Crit Rate +5%",  baseCost:20000,costMult:3,   level:0, maxLvl:5, effect:"critRate",    value:0.05 },
];

// ─── RELICS ──────────────────────────────────
const relicsData = [
  { id:"blade",   icon:"🗡️", name:"Fury Blade",    desc:"+15% Tap Damage",       owned:false, boss:10 },
  { id:"shield",  icon:"🛡️", name:"Iron Shield",   desc:"-3s Boss Timer",         owned:false, boss:20 },
  { id:"ring",    icon:"💍", name:"Midas Ring",    desc:"+5s Gold Rush",          owned:false, boss:30 },
  { id:"crown",   icon:"👑", name:"Void Crown",    desc:"+10% All Damage",        owned:false, boss:40 },
  { id:"orb",     icon:"🔮", name:"Arcane Orb",    desc:"+20% Essence gain",      owned:false, boss:50 },
  { id:"pendant", icon:"📿", name:"Soul Pendant",  desc:"Auto-revive streak",     owned:false, boss:60 },
  { id:"tome",    icon:"📕", name:"Elder Tome",    desc:"+30% Offline earnings",   owned:false, boss:70 },
  { id:"gem",     icon:"💎", name:"Chaos Gem",     desc:"x2 Prestige bonus",      owned:false, boss:80 },
  { id:"star",    icon:"⭐", name:"Celestial Star", desc:"+50% Everything",        owned:false, boss:100 },
];

// ─── PETS ────────────────────────────────────
const petsData = [
  { id:"dragon",  icon:"🐲", name:"Dragon Whelp",  desc:"Auto-click 1/s",         cost:10000,  owned:false, active:false },
  { id:"fox",     icon:"🦊", name:"Spirit Fox",    desc:"Crit rate +5%",          cost:25000,  owned:false, active:false },
  { id:"owl",     icon:"🦉", name:"Arcane Owl",    desc:"Essence +15%",           cost:50000,  owned:false, active:false },
  { id:"wolf",    icon:"🐺", name:"Shadow Wolf",   desc:"Auto DPS +30%",          cost:100000, owned:false, active:false },
  { id:"phoenix", icon:"🐦‍🔥", name:"Phoenix",       desc:"Gold Rush 2x freq",      cost:250000, owned:false, active:false },
];

// ─── ACHIEVEMENTS ────────────────────────────
const achievementsData = [
  { id:"first_blood",  icon:"🎯", name:"First Blood",  desc:"Kill 1 monster",           target:1,     type:"kills", unlocked:false },
  { id:"centurion",    icon:"💯", name:"Centurion",    desc:"Kill 100 monsters",         target:100,   type:"kills", unlocked:false },
  { id:"slayer",       icon:"☠️", name:"Slayer 1K",    desc:"Kill 1,000 monsters",       target:1000,  type:"kills", unlocked:false },
  { id:"stage5",       icon:"🗺️", name:"Explorer",     desc:"Reach Stage 5",             target:5,     type:"stage", unlocked:false },
  { id:"stage25",      icon:"🌋", name:"Depths",       desc:"Reach Stage 25",            target:25,    type:"stage", unlocked:false },
  { id:"stage50",      icon:"🌀", name:"Void Walker",  desc:"Reach Stage 50",            target:50,    type:"stage", unlocked:false },
  { id:"goldrush1",    icon:"💰", name:"Gold Touch",   desc:"Trigger Gold Rush",         target:1,     type:"goldrush", unlocked:false },
  { id:"ascend1",      icon:"👑", name:"Ascended",     desc:"Prestige once",             target:1,     type:"prestige", unlocked:false },
];

// ─── STATS TRACKING ──────────────────────────
let lifetimeEssence = 0;
let highestStage = 0;
let clicksThisSecond = 0;
let currentCPS = 0;
setInterval(() => { currentCPS = clicksThisSecond; clicksThisSecond = 0; }, 1000);

// Hook into clicks
const origClick = window.onclick;
document.addEventListener("click", () => { clicksThisSecond++; });

// ─── SAVE / LOAD ─────────────────────────────
const RP_SAVE_KEY = "mt_right_panel";
function loadRPState() {
  const s = localStorage.getItem(RP_SAVE_KEY);
  if (!s) return;
  try {
    const d = JSON.parse(s);
    if (d.buffs) d.buffs.forEach(sb => { const b = passiveBuffs.find(x=>x.id===sb.id); if(b) b.level = sb.level; });
    if (d.relics) d.relics.forEach(sr => { const r = relicsData.find(x=>x.id===sr.id); if(r) r.owned = sr.owned; });
    if (d.pets) d.pets.forEach(sp => { const p = petsData.find(x=>x.id===sp.id); if(p){ p.owned=sp.owned; p.active=sp.active; }});
    if (d.achievements) d.achievements.forEach(sa => { const a = achievementsData.find(x=>x.id===sa.id); if(a) a.unlocked = sa.unlocked; });
    lifetimeEssence = d.lifetimeEssence || 0;
    highestStage = d.highestStage || 0;
  } catch(e){}
}
function saveRPState() {
  localStorage.setItem(RP_SAVE_KEY, JSON.stringify({
    buffs: passiveBuffs.map(b=>({id:b.id, level:b.level})),
    relics: relicsData.map(r=>({id:r.id, owned:r.owned})),
    pets: petsData.map(p=>({id:p.id, owned:p.owned, active:p.active})),
    achievements: achievementsData.map(a=>({id:a.id, unlocked:a.unlocked})),
    lifetimeEssence, highestStage,
  }));
}

// ─── TAB SWITCHING ───────────────────────────
window.switchPanelTab = function(tabId) {
  document.querySelectorAll(".panel-tab").forEach(t => t.classList.toggle("active", t.dataset.tab === tabId));
  document.querySelectorAll(".tab-content").forEach(c => c.classList.toggle("active", c.id === "tab-"+tabId));
};

// ─── RENDER FUNCTIONS ────────────────────────
function renderStats() {
  const el = document.getElementById("statsDashboard");
  if (!el) return;
  const tapDmg = typeof clickPower !== "undefined" ? clickPower : 1;
  const autoDps = typeof tokensPerSecond !== "undefined" ? tokensPerSecond : 0;
  const totalDps = tapDmg * Math.max(1, currentCPS) + autoDps;
  const stage = typeof currentStage !== "undefined" ? currentStage : 1;
  if (stage > highestStage) highestStage = stage;
  el.innerHTML = `
    <div class="stats-section-title">⚔️ Combat</div>
    <div class="stat-row"><span class="stat-row-label"><span class="stat-icon">💥</span>Total DPS</span><span class="stat-row-value highlight">${formatNumber(totalDps)}</span></div>
    <div class="stat-row"><span class="stat-row-label"><span class="stat-icon">👆</span>Tap Power</span><span class="stat-row-value">${formatNumber(tapDmg)}</span></div>
    <div class="stat-row"><span class="stat-row-label"><span class="stat-icon">⚡</span>CPS</span><span class="stat-row-value">${currentCPS}</span></div>
    <div class="stats-section-title">📊 Progress</div>
    <div class="stat-row"><span class="stat-row-label"><span class="stat-icon">🏔️</span>Highest Stage</span><span class="stat-row-value gold">${highestStage}</span></div>
    <div class="stat-row"><span class="stat-row-label"><span class="stat-icon">☠️</span>Total Kills</span><span class="stat-row-value">${formatNumber(typeof totalKills!=="undefined"?totalKills:0)}</span></div>
    <div class="stat-row"><span class="stat-row-label"><span class="stat-icon">💎</span>Lifetime Essence</span><span class="stat-row-value gold">${formatNumber(lifetimeEssence)}</span></div>
  `;
}

function renderBuffs() {
  const el = document.getElementById("buffsList");
  if (!el) return;
  el.innerHTML = "";
  passiveBuffs.forEach(b => {
    const cost = Math.floor(b.baseCost * Math.pow(b.costMult, b.level));
    const maxed = b.level >= b.maxLvl;
    const canBuy = typeof tokens !== "undefined" && tokens >= cost && !maxed;
    const btn = document.createElement("button");
    btn.className = "buff-btn";
    btn.disabled = !canBuy;
    btn.innerHTML = `
      <div class="buff-info">
        <h3>${b.icon} ${b.name}</h3>
        <p>${b.desc}</p>
        <div class="buff-level">Lv ${b.level} / ${b.maxLvl}${maxed?" — MAX":""}</div>
      </div>
      <span class="buff-price ${canBuy?"cost-green":"cost-red"}">${maxed?"MAX":formatNumber(cost)}</span>
    `;
    if (!maxed) btn.onclick = () => buyBuff(b);
    el.appendChild(btn);
  });
}

function renderRelics() {
  const el = document.getElementById("relicsGrid");
  if (!el) return;
  el.innerHTML = "";
  relicsData.forEach(r => {
    const slot = document.createElement("div");
    slot.className = `relic-slot ${r.owned?"owned":"locked"}`;
    slot.innerHTML = `
      <span class="relic-icon">${r.owned?r.icon:"❓"}</span>
      <span class="relic-name">${r.owned?r.name:"Boss "+r.boss}</span>
      <div class="relic-tooltip"><div class="relic-tooltip-title">${r.name}</div><div class="relic-tooltip-desc">${r.desc}<br>Drop: Boss Stage ${r.boss}</div></div>
    `;
    el.appendChild(slot);
  });
}

function renderPets() {
  const el = document.getElementById("petsList");
  if (!el) return;
  el.innerHTML = "";
  petsData.forEach(p => {
    const card = document.createElement("div");
    card.className = `pet-card ${p.active?"active-pet":""} ${!p.owned?"locked-pet":""}`;
    card.innerHTML = `
      <div class="pet-avatar">${p.icon}</div>
      <div class="pet-info">
        <div class="pet-name">${p.name}</div>
        <div class="pet-desc">${p.desc}</div>
        ${p.active?'<div class="pet-level-badge">ACTIVE</div>':""}
      </div>
      <span class="pet-cost">${p.owned?(p.active?"✓":"Select"):formatNumber(p.cost)}</span>
    `;
    card.onclick = () => { if(!p.owned) buyPet(p); else activatePet(p); };
    el.appendChild(card);
  });
}

function renderAchievements() {
  const el = document.getElementById("achievementsGrid");
  if (!el) return;
  el.innerHTML = "";
  achievementsData.forEach(a => {
    const cell = document.createElement("div");
    cell.className = `achievement-cell ${a.unlocked?"unlocked":"locked"}`;
    cell.innerHTML = `
      <span class="achievement-icon">${a.icon}</span>
      <span class="achievement-name">${a.unlocked?a.name:"???"}</span>
      <div class="relic-tooltip"><div class="relic-tooltip-title">${a.name}</div><div class="relic-tooltip-desc">${a.desc}</div></div>
    `;
    el.appendChild(cell);
  });
}

// ─── BUY / ACTIVATE ──────────────────────────
function buyBuff(b) {
  const cost = Math.floor(b.baseCost * Math.pow(b.costMult, b.level));
  if (typeof tokens==="undefined" || tokens < cost || b.level >= b.maxLvl) return;
  tokens -= cost; b.level++;
  if (typeof updateUI === "function") updateUI();
  saveRPState(); renderBuffs();
  if (window.missionOnUpgradeBuy) window.missionOnUpgradeBuy();
}

function buyPet(p) {
  if (typeof tokens==="undefined" || tokens < p.cost || p.owned) return;
  tokens -= p.cost; p.owned = true;
  activatePet(p);
  if (typeof updateUI === "function") updateUI();
  saveRPState(); renderPets();
}

function activatePet(p) {
  if (!p.owned) return;
  petsData.forEach(x => x.active = false);
  p.active = true;
  saveRPState(); renderPets();
}

// ─── ACHIEVEMENT CHECKER ─────────────────────
function checkAchievements() {
  const kills = typeof totalKills !== "undefined" ? totalKills : 0;
  const stage = typeof currentStage !== "undefined" ? currentStage : 1;
  achievementsData.forEach(a => {
    if (a.unlocked) return;
    let met = false;
    if (a.type === "kills" && kills >= a.target) met = true;
    if (a.type === "stage" && stage >= a.target) met = true;
    if (a.type === "goldrush" && typeof goldRushTriggered !== "undefined" && goldRushTriggered >= a.target) met = true;
    if (a.type === "prestige" && typeof ascensionCount !== "undefined" && ascensionCount >= a.target) met = true;
    if (met) {
      a.unlocked = true;
      saveRPState(); renderAchievements();
      // Show notification
      if (typeof createFloatingNumber === "function") {
        createFloatingNumber(window.innerWidth/2-200, 100, 0, true, "🏆 "+a.name+"! ");
      }
    }
  });
}

// ─── RELIC DROP CHECK (called after boss kill) ───
window.checkRelicDrop = function(stage) {
  const r = relicsData.find(x => x.boss === stage && !x.owned);
  if (r) {
    r.owned = true;
    saveRPState(); renderRelics();
    if (typeof createFloatingNumber === "function") {
      createFloatingNumber(window.innerWidth/2-200, 200, 0, true, r.icon+" RELIC: "+r.name+"! ");
    }
  }
};

// ─── ESSENCE TRACKING ────────────────────────
window.trackEssence = function(amount) { lifetimeEssence += amount; };

// ─── PET AUTO-CLICK LOOP ─────────────────────
setInterval(() => {
  const activePet = petsData.find(p => p.active);
  if (!activePet || activePet.id !== "dragon") return;
  if (typeof dealDamage === "function" && typeof clickPower !== "undefined") {
    const mx = parseFloat(document.getElementById("aiCore")?.style.left) || 400;
    const my = parseFloat(document.getElementById("aiCore")?.style.top) || 400;
    dealDamage(clickPower, mx + 100, my + 100, false);
  }
}, 1000);

// ─── PERIODIC UPDATE ─────────────────────────
setInterval(() => {
  renderStats();
  checkAchievements();
  // Update buff affordability
  const activeTab = document.querySelector(".panel-tab.active");
  if (activeTab && activeTab.dataset.tab === "buffs") renderBuffs();
}, 1000);

// ─── BOOT ────────────────────────────────────
loadRPState();
renderStats(); renderBuffs(); renderRelics(); renderPets(); renderAchievements();
