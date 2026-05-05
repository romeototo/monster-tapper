/* ═══════════════════════════════════════════════════════════════
   missions.js  —  Daily Mission System + Streak Bar UI
   - 3 missions per day, reset at midnight
   - Progress saves to localStorage
   - Streak bar shown when killStreak >= 1
═══════════════════════════════════════════════════════════════ */

// ─── Mission Definitions ─────────────────────────────────────
const MISSION_TEMPLATES = [
  {
    id: "kill_50",
    name: "Monster Hunter",
    desc: "Kill 50 monsters today",
    icon: "⚔️",
    target: 50,
    type: "kills",
    reward: 5000,
    rewardLabel: "5K Essence",
  },
  {
    id: "kill_200",
    name: "Relentless Slaughter",
    desc: "Kill 200 monsters today",
    icon: "🩸",
    target: 200,
    type: "kills",
    reward: 25000,
    rewardLabel: "25K Essence",
  },
  {
    id: "reach_stage_5",
    name: "Dungeon Crawler",
    desc: "Reach Stage 5",
    icon: "🗺️",
    target: 5,
    type: "stage",
    reward: 3000,
    rewardLabel: "3K Essence",
  },
  {
    id: "reach_stage_20",
    name: "Void Breaker",
    desc: "Reach Stage 20",
    icon: "🌀",
    target: 20,
    type: "stage",
    reward: 50000,
    rewardLabel: "50K Essence",
  },
  {
    id: "gold_rush",
    name: "Golden Frenzy",
    desc: "Trigger Gold Rush once",
    icon: "💰",
    target: 1,
    type: "goldrush",
    reward: 10000,
    rewardLabel: "10K Essence",
  },
  {
    id: "spend_essence",
    name: "Arms Race",
    desc: "Buy 10 upgrades",
    icon: "🛡️",
    target: 10,
    type: "upgrades",
    reward: 8000,
    rewardLabel: "8K Essence",
  },
];

// Pick 3 missions for today (seeded by date)
function getTodaysMissions() {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  // Simple deterministic shuffle using the seed
  const shuffled = [...MISSION_TEMPLATES].sort((a, b) => {
    const ha = simpleHash(a.id + seed);
    const hb = simpleHash(b.id + seed);
    return ha - hb;
  });
  return shuffled.slice(0, 3);
}
function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < String(str).length; i++) {
    h = (h * 31 + String(str).charCodeAt(i)) >>> 0;
  }
  return h;
}

// ─── State ────────────────────────────────────────────────────
const MISSION_SAVE_KEY = "mt_daily_missions";
let dailyMissions = [];
let missionProgress = {};   // { id: { progress, claimed } }
let upgradesBought = 0;     // tracked here
let goldRushTriggered = 0;  // tracked here

function loadMissionState() {
  const saved = localStorage.getItem(MISSION_SAVE_KEY);
  const todayStr = new Date().toDateString();
  if (saved) {
    try {
      const data = JSON.parse(saved);
      if (data.date === todayStr) {
        missionProgress = data.progress || {};
        upgradesBought  = data.upgradesBought || 0;
        goldRushTriggered = data.goldRushTriggered || 0;
      }
      // If different date → fresh start (new daily missions)
    } catch (e) { /* ignore */ }
  }
  dailyMissions = getTodaysMissions();
}

function saveMissionState() {
  const todayStr = new Date().toDateString();
  localStorage.setItem(MISSION_SAVE_KEY, JSON.stringify({
    date: todayStr,
    progress: missionProgress,
    upgradesBought,
    goldRushTriggered,
  }));
}

// ─── Progress Trackers (called from script.js via window hooks) ───
window.missionOnKill = function() {
  dailyMissions.forEach(m => {
    if (m.type === "kills" && !getMissionState(m).claimed) {
      const st = getMissionState(m);
      if (st.progress < m.target) {
        st.progress++;
        saveMissionState();
        renderMissions();
      }
    }
  });
};

window.missionOnStageReach = function(stage) {
  dailyMissions.forEach(m => {
    if (m.type === "stage" && !getMissionState(m).claimed) {
      const st = getMissionState(m);
      if (stage >= m.target && st.progress < m.target) {
        st.progress = stage;
        saveMissionState();
        renderMissions();
      }
    }
  });
};

window.missionOnGoldRush = function() {
  goldRushTriggered++;
  dailyMissions.forEach(m => {
    if (m.type === "goldrush" && !getMissionState(m).claimed) {
      const st = getMissionState(m);
      st.progress = goldRushTriggered;
      saveMissionState();
      renderMissions();
    }
  });
};

window.missionOnUpgradeBuy = function() {
  upgradesBought++;
  dailyMissions.forEach(m => {
    if (m.type === "upgrades" && !getMissionState(m).claimed) {
      const st = getMissionState(m);
      st.progress = upgradesBought;
      saveMissionState();
      renderMissions();
    }
  });
};

function getMissionState(m) {
  if (!missionProgress[m.id]) {
    missionProgress[m.id] = { progress: 0, claimed: false };
  }
  return missionProgress[m.id];
}

// ─── Rendering ────────────────────────────────────────────────
function renderMissions() {
  const list = document.getElementById("missionsList");
  if (!list) return;
  list.innerHTML = "";

  dailyMissions.forEach(m => {
    const st = getMissionState(m);
    const pct = Math.min(100, (st.progress / m.target) * 100);
    const isDone = st.progress >= m.target;
    const isClaimed = st.claimed;

    const row = document.createElement("div");
    row.className = `mission-row${isDone && !isClaimed ? " completed" : ""}${isClaimed ? " claimed" : ""}`;

    row.innerHTML = `
      <div class="mission-top">
        <span class="mission-name">${m.icon} ${m.name}</span>
        <span class="mission-reward">+${m.rewardLabel}</span>
      </div>
      <div class="mission-progress-track">
        <div class="mission-progress-fill" style="width:${pct}%"></div>
      </div>
      <div class="mission-footer">
        <span class="mission-progress-text">${formatMissionProgress(st.progress, m.target, m.type)}</span>
        ${isDone && !isClaimed
          ? `<button class="mission-claim-btn" onclick="claimMission('${m.id}')">CLAIM!</button>`
          : isClaimed
          ? `<span class="mission-done-badge">✓ Claimed</span>`
          : ""
        }
      </div>
    `;
    list.appendChild(row);
  });
}

function formatMissionProgress(progress, target, type) {
  if (type === "kills")    return `${Math.min(progress, target)} / ${target} kills`;
  if (type === "stage")    return `Stage ${progress} / ${target}`;
  if (type === "goldrush") return `${Math.min(progress, target)} / ${target} triggered`;
  if (type === "upgrades") return `${Math.min(progress, target)} / ${target} bought`;
  return `${progress} / ${target}`;
}

// ─── Claim Reward ─────────────────────────────────────────────
window.claimMission = function(missionId) {
  const m = dailyMissions.find(x => x.id === missionId);
  if (!m) return;
  const st = getMissionState(m);
  if (st.claimed || st.progress < m.target) return;

  st.claimed = true;

  // Give reward via global tokens variable (declared in script.js)
  if (typeof tokens !== "undefined") {
    tokens += m.reward;
    // Show floating reward number in the center of screen
    if (typeof createFloatingNumber === "function") {
      createFloatingNumber(
        window.innerWidth / 2 - 200,
        window.innerHeight / 2,
        m.reward,
        true,
        "MISSION! +"
      );
    }
    if (typeof updateUI === "function") updateUI();
  }

  saveMissionState();

  // Animate the row
  const rows = document.querySelectorAll(".mission-row");
  rows.forEach(r => {
    if (r.innerHTML.includes(m.id) || r.innerHTML.includes(m.name)) {
      r.classList.add("mission-claiming");
      setTimeout(() => r.classList.remove("mission-claiming"), 500);
    }
  });

  renderMissions();
};

// ─── Streak Bar UI ────────────────────────────────────────────
window.updateStreakBar = function(streak, max) {
  const wrapper = document.getElementById("streakWrapper");
  const bar     = document.getElementById("streakBar");
  const count   = document.getElementById("streakCount");
  if (!wrapper || !bar || !count) return;

  if (streak > 0) {
    wrapper.style.display = "block";
    const pct = Math.min(100, (streak / max) * 100);
    bar.style.width = pct + "%";
    count.innerText = `${streak} / ${max}`;
  } else {
    wrapper.style.display = "none";
  }
};

// ─── Reset Timer Countdown ────────────────────────────────────
function updateResetTimer() {
  const el = document.getElementById("missionsResetTimer");
  if (!el) return;
  const now  = new Date();
  const next = new Date();
  next.setHours(24, 0, 0, 0); // midnight tonight
  const diff = Math.max(0, next - now);
  const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
  const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
  el.innerText = `Resets in: ${h}:${m}:${s}`;
}

// ─── Boot ─────────────────────────────────────────────────────
loadMissionState();
renderMissions();
setInterval(updateResetTimer, 1000);
updateResetTimer();
