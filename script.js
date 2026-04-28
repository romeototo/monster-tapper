let tokens = 0;
let tokensPerSecond = 0;
let clickPower = 1;

let currentStage = 1;
let monsterMaxHP = 50;
let monsterHP = 50;
let bossTimeLeft = 0;
let isBossStage = false;

// ระบบ Combo
let combo = 1;
let comboTimer = 0;

// Constants สำหรับระบบ Save
const SAVE_KEY = 'ai_tycoon_save';

const scoreDisplay = document.getElementById('scoreDisplay');
const tpsDisplay = document.getElementById('tpsDisplay');
const aiCore = document.getElementById('aiCore');
const upgradesList = document.getElementById('upgradesList');
const comboDisplay = document.getElementById('comboDisplay');
const offlineModal = document.getElementById('offlineModal');
const offlineEarnings = document.getElementById('offlineEarnings');
const claimBtn = document.getElementById('claimBtn');

const upgrades = [
    { id: 'peasant', name: '🧑‍🌾 ชาวบ้านถือไม้กระบอง', desc: '+1 Auto-Damage / วินาที', baseCost: 15, costMult: 1.15, tps: 1, count: 0 },
    { id: 'mercenary', name: '⚔️ นักดาบรับจ้าง', desc: '+5 Auto-Damage / วินาที', baseCost: 100, costMult: 1.15, tps: 5, count: 0 },
    { id: 'archer', name: '🏹 พลธนูเอลฟ์', desc: '+50 Auto-Damage / วินาที', baseCost: 1100, costMult: 1.15, tps: 50, count: 0 },
    { id: 'mage', name: '🧙‍♂️ จอมเวทศักดิ์สิทธิ์', desc: '+250 Auto-Damage / วินาที', baseCost: 12000, costMult: 1.15, tps: 250, count: 0 },
    { id: 'dragon', name: '🐉 มังกรเพลิงบรรลัยกัลป์', desc: '+2000 Auto-Damage / วินาที', baseCost: 130000, costMult: 1.15, tps: 2000, count: 0 }
];

// --- Generated Art Assets ---
const monsters = [
    'assets/m1_1777370042685.png',
    'assets/m2_1777370058399.png',
    'assets/m3_1777370073259.png',
    'assets/m4_1777370087803.png',
    'assets/m5_1777370102613.png',
    'assets/m6_1777370116923.png',
    'assets/m7_1777370132267.png',
    'assets/m8_1777370147464.png',
    'assets/m9_1777370161632.png',
    'assets/m10_1777370177406.png'
];

const weapons = [
    'assets/cursor_w1_1777370190416.png',
    'assets/cursor_w2_1777370204615.png',
    'assets/cursor_w3_1777370220897.png'
];

// ----------------- Web Audio API -----------------
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx;
function initAudio() { if (!audioCtx) audioCtx = new AudioContext(); if (audioCtx.state === 'suspended') audioCtx.resume(); }

function playPop() {
    initAudio(); const osc = audioCtx.createOscillator(); const gainNode = audioCtx.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(400, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.05);
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
    osc.connect(gainNode); gainNode.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 0.05);
}

function playBuy() {
    initAudio(); const osc = audioCtx.createOscillator(); const gainNode = audioCtx.createGain();
    osc.type = 'square'; osc.frequency.setValueAtTime(300, audioCtx.currentTime); osc.frequency.setValueAtTime(400, audioCtx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    osc.connect(gainNode); gainNode.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 0.2);
}

function playGolden() {
    initAudio(); const osc = audioCtx.createOscillator(); const gainNode = audioCtx.createGain();
    osc.type = 'triangle'; osc.frequency.setValueAtTime(800, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(1600, audioCtx.currentTime + 0.5);
    gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime); gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5);
    osc.connect(gainNode); gainNode.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 0.5);
}

// ----------------- Core Game Logic -----------------
function formatNumber(num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return Math.floor(num).toString();
}

function getCost(upgrade) { return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMult, upgrade.count)); }

function renderUpgrades() {
    upgradesList.innerHTML = '';
    upgrades.forEach(upgrade => {
        const cost = getCost(upgrade);
        const canAfford = tokens >= cost;
        const wrapper = document.createElement('div'); wrapper.className = 'upgrade-wrapper';
        const btn = document.createElement('button'); btn.className = 'upgrade-btn'; btn.disabled = !canAfford; btn.onclick = () => buyUpgrade(upgrade);
        btn.innerHTML = `<div class="upgrade-info"><h3>${upgrade.name}</h3><p>${upgrade.desc}</p></div><div class="upgrade-price ${canAfford ? 'cost-green' : 'cost-red'}">${formatNumber(cost)} T</div>`;
        if (upgrade.count > 0) { const countBadge = document.createElement('div'); countBadge.className = 'upgrade-count'; countBadge.innerText = upgrade.count; wrapper.appendChild(countBadge); }
        wrapper.appendChild(btn); upgradesList.appendChild(wrapper);
    });
}

function updateUI() {
    scoreDisplay.innerText = formatNumber(tokens);
    tpsDisplay.innerText = formatNumber(tokensPerSecond) + ' DPS';
    const btns = document.querySelectorAll('.upgrade-btn');
    const prices = document.querySelectorAll('.upgrade-price');
    upgrades.forEach((upgrade, index) => {
        const cost = getCost(upgrade);
        const canAfford = tokens >= cost;
        if(btns[index]) {
            btns[index].disabled = !canAfford;
            prices[index].className = `upgrade-price ${canAfford ? 'cost-green' : 'cost-red'}`;
        }
    });
}

function recalculateStats() {
    tokensPerSecond = upgrades.reduce((acc, curr) => acc + (curr.tps * curr.count), 0);
    const totalUpgrades = upgrades.reduce((acc, curr) => acc + curr.count, 0);
    clickPower = 1 + Math.floor(totalUpgrades / 5);
}

// ----------------- Monster Health & Stages -----------------
function initStage() {
    isBossStage = (currentStage % 10 === 0);
    
    // บอสใหญ่มีเลือดเยอะกว่าปกติ 5 เท่า
    const healthMultiplier = isBossStage ? 5 : 1;
    monsterMaxHP = Math.floor(50 * Math.pow(1.2, currentStage - 1)) * healthMultiplier;
    monsterHP = monsterMaxHP;
    
    // บอสใหญ่ใช้รูปมังกร (m10) เสมอ, ลูกกระจ๊อกสุ่ม 9 ตัวแรก
    const mIndex = isBossStage ? 9 : ((currentStage - 1) % 9);
    aiCore.style.backgroundImage = `url('${monsters[mIndex]}')`;
    
    // อัปเดตชื่อด่าน
    const stageNameElem = document.getElementById('stageName');
    if(stageNameElem) {
        if (isBossStage) {
            stageNameElem.innerHTML = `<span style="color: #fbbf24; text-shadow: 0 0 15px #f59e0b;">👑 EPIC BOSS STAGE ${currentStage} 👑</span>`;
        } else {
            stageNameElem.innerText = `Stage ${currentStage}`;
        }
    }
    
    // ตั้งค่าตัวจับเวลาบอส (30 วินาที)
    const bossTimerElem = document.getElementById('bossTimer');
    if (isBossStage) {
        bossTimeLeft = 30.0;
        bossTimerElem.style.display = 'block';
        bossTimerElem.innerText = `⏱️ ${bossTimeLeft.toFixed(1)}s`;
    } else {
        bossTimerElem.style.display = 'none';
    }
    
    updateHPBar();
}

function updateHPBar() {
    const hpBar = document.getElementById('hpBar');
    const hpText = document.getElementById('hpText');
    if(!hpBar || !hpText) return;
    const pct = Math.max(0, (monsterHP / monsterMaxHP) * 100);
    hpBar.style.width = pct + '%';
    hpText.innerText = `${formatNumber(monsterHP)} / ${formatNumber(monsterMaxHP)} HP`;
}

function spawnCoins() {
    const amount = 10 + Math.random() * 10;
    const x = parseFloat(aiCore.style.left) || window.innerWidth/2;
    const y = parseFloat(aiCore.style.top) || window.innerHeight/2;
    
    for(let i=0; i<amount; i++) {
        const coin = document.createElement('div');
        coin.innerText = '🪙';
        coin.style.position = 'absolute';
        coin.style.fontSize = '2rem';
        coin.style.left = x + 'px';
        coin.style.top = y + 'px';
        coin.style.zIndex = '9999';
        coin.style.pointerEvents = 'none';
        document.body.appendChild(coin);
        
        const angle = Math.random() * Math.PI * 2;
        const speed = 20 + Math.random() * 50;
        const vx = Math.cos(angle) * speed;
        let vy = Math.sin(angle) * speed - 30; // กระโดดขึ้นนิดนึง
        
        let cx = x; let cy = y;
        let life = 1.0;
        
        const interval = setInterval(() => {
            vy += 5; // แรงโน้มถ่วง
            cx += vx * 0.1;
            cy += vy * 0.1;
            life -= 0.02;
            coin.style.left = cx + 'px';
            coin.style.top = cy + 'px';
            coin.style.opacity = life;
            coin.style.transform = `scale(${life})`;
            
            if (life <= 0) {
                clearInterval(interval);
                coin.remove();
            }
        }, 20);
    }
}

function dealDamage(amount, x, y, isCrit) {
    monsterHP -= amount;
    tokens += amount; // 1 Damage = 1 Token
    if (x !== null && y !== null) {
        createFloatingNumber(x, y, amount, isCrit);
    }
    
    if (monsterHP <= 0) {
        // Monster Killed
        playGolden();
        spawnCoins(); // ฝนเหรียญทอง!
        
        const bonus = Math.floor(monsterMaxHP * 0.5);
        tokens += bonus;
        createFloatingNumber(window.innerWidth/2, window.innerHeight/2, bonus, true, "DEFEATED! +");
        
        currentStage++;
        initStage();
        swapWeapon();
        moveBossRandomly();
    }
    updateHPBar();
    updateUI();
}

// ----------------- Monster Movement & Swapping -----------------
function moveBossRandomly() {
    const maxX = window.innerWidth - 120;
    const maxY = window.innerHeight - 120;
    const x = Math.max(20, Math.random() * maxX);
    const y = Math.max(20, Math.random() * maxY);
    aiCore.style.left = x + 'px';
    aiCore.style.top = y + 'px';
}

function swapWeapon() {
    const rWeapon = weapons[Math.floor(Math.random() * weapons.length)];
    const cursorStr = `url('${rWeapon}') 24 24, crosshair`;
    document.body.style.cursor = cursorStr;
    aiCore.style.cursor = cursorStr;
}

// วิ่งสุ่มทุกๆ 2 วินาที
setInterval(moveBossRandomly, 2000);

// จัดตำแหน่งตรงกลางจอตอนเริ่ม
aiCore.style.left = (window.innerWidth / 2 - 50) + 'px';
aiCore.style.top = (window.innerHeight / 2 - 50) + 'px';

// เมื่อตีมอนสเตอร์!
aiCore.addEventListener('mousedown', (e) => {
    playPop();
    combo += 0.1; if(combo > 5.0) combo = 5.0; comboTimer = 2.0;
    
    let isCrit = Math.random() < 0.1; // 10% โอกาสติดคริ
    const actualPower = clickPower * combo * (isCrit ? 5 : 1);
    
    dealDamage(actualPower, e.clientX, e.clientY, isCrit);
    
    if (combo >= 1.5) {
        comboDisplay.style.opacity = 1; comboDisplay.innerText = `Combo x${combo.toFixed(1)}! 🔥`; comboDisplay.style.transform = `scale(${1 + (combo/20)})`;
        if (combo >= 3.0) { document.body.classList.remove('shake'); void document.body.offsetWidth; document.body.classList.add('shake'); }
    }
    
    // โดนตีแล้ววาร์ปหนี (โอกาส 30%)
    if (Math.random() < 0.3) {
        moveBossRandomly();
    }
});

// รองรับการทัชบนมือถือ
aiCore.addEventListener('touchstart', (e) => {
    e.preventDefault(); 
    for(let i=0; i<e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        aiCore.dispatchEvent(new MouseEvent('mousedown', { clientX: touch.clientX, clientY: touch.clientY }));
    }
}, {passive: false});

function createFloatingNumber(x, y, amount, isCrit = false, prefix = "+") {
    const el = document.createElement('div'); el.className = 'floating-number';
    if (isCrit) { 
        el.innerText = prefix + formatNumber(amount) + (prefix === "+" ? ' CRIT💥' : ' 💎'); 
        el.style.color = '#fbbf24'; el.style.fontSize = '3rem'; el.style.textShadow = '0 0 20px #fbbf24'; 
    } 
    else { 
        el.innerText = prefix + formatNumber(amount); 
        if(combo >= 4.0) el.style.color = '#ef4444'; 
    }
    const offsetX = (Math.random() - 0.5) * 50; el.style.left = (x + offsetX - 15) + 'px'; el.style.top = (y - 30) + 'px';
    document.body.appendChild(el); setTimeout(() => el.remove(), 1000);
}

function buyUpgrade(upgrade) {
    const cost = getCost(upgrade);
    if (tokens >= cost) {
        playBuy(); tokens -= cost; upgrade.count++;
        recalculateStats(); renderUpgrades(); updateUI(); saveGame();
    }
}

// ----------------- Save / Load System & Offline Progress -----------------
function saveGame() {
    const saveState = {
        tokens: tokens,
        currentStage: currentStage,
        monsterHP: monsterHP,
        lastSaveTime: Date.now(),
        upgrades: upgrades.map(u => u.count)
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveState));
}

function loadGame() {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
        try {
            const data = JSON.parse(saved);
            tokens = data.tokens || 0;
            currentStage = data.currentStage || 1;
            monsterHP = data.monsterHP || -1;
            
            if (data.upgrades) {
                upgrades.forEach((u, i) => { if(data.upgrades[i] !== undefined) u.count = data.upgrades[i]; });
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
        } catch(e) { console.error("Save file corrupted"); }
    }
    
    initStage();
    if(monsterHP > 0) {
        updateHPBar();
    }
}

function showOfflineModal(amount) {
    offlineEarnings.innerText = '+' + formatNumber(amount) + ' Tokens';
    offlineModal.classList.add('active');
}

claimBtn.addEventListener('click', () => {
    playBuy(); offlineModal.classList.remove('active'); updateUI();
});

setInterval(saveGame, 5000);

// ----------------- Golden Bug Event -----------------
setInterval(() => { if (Math.random() < 0.20) spawnGoldenBug(); }, 15000);
function spawnGoldenBug() {
    if(document.querySelector('.golden-bug')) return;
    const bug = document.createElement('div'); bug.className = 'golden-bug'; bug.innerText = '💰';
    const startY = Math.random() * (window.innerHeight - 100); bug.style.left = '-100px'; bug.style.top = startY + 'px';
    document.body.appendChild(bug);
    let posX = -100; const speed = 2 + Math.random() * 3;
    const moveInterval = setInterval(() => {
        posX += speed; bug.style.left = posX + 'px'; bug.style.transform = `translateY(${Math.sin(posX/50) * 30}px)`;
        if (posX > window.innerWidth + 100) { clearInterval(moveInterval); bug.remove(); }
    }, 20);
    bug.onmousedown = (e) => {
        playGolden();
        const reward = Math.max(tokensPerSecond * 30, 100 * clickPower); tokens += reward;
        createFloatingNumber(e.clientX, e.clientY, reward, true); updateUI(); saveGame();
        clearInterval(moveInterval); bug.remove();
    };
    bug.addEventListener('touchstart', (e) => { e.preventDefault(); bug.onmousedown(e.touches[0]); }, {passive: false});
}

// Game Loop
let lastTime = Date.now();
setInterval(() => {
    const now = Date.now(); const dt = (now - lastTime) / 1000; lastTime = now;
    if(comboTimer > 0) { comboTimer -= dt; if(comboTimer <= 0) { combo = 1; comboDisplay.style.opacity = 0; comboDisplay.style.transform = 'scale(1)'; } }
    
    // จับเวลาบอสใหญ่
    if (isBossStage && bossTimeLeft > 0 && monsterHP > 0) {
        bossTimeLeft -= dt;
        const bossTimerElem = document.getElementById('bossTimer');
        if (bossTimeLeft <= 0) {
            bossTimeLeft = 0;
            bossTimerElem.innerText = `⏱️ 0.0s (FAILED!)`;
            // ถ้าตีบอสไม่ทัน เด้งกลับด่านก่อนหน้า
            currentStage--;
            if(currentStage < 1) currentStage = 1;
            initStage();
            createFloatingNumber(window.innerWidth/2, window.innerHeight/2, 0, false, "TIME'S UP! BACK TO STAGE " + currentStage);
            moveBossRandomly();
        } else {
            bossTimerElem.innerText = `⏱️ ${bossTimeLeft.toFixed(1)}s`;
        }
    }
    
    if (tokensPerSecond > 0 && monsterHP > 0) { 
        dealDamage(tokensPerSecond * dt, null, null, false); 
    }
}, 50);

// เริ่มเกม!
loadGame();
swapWeapon();
renderUpgrades();
updateUI();

// ปุ่ม Reset Progress สำหรับผู้เล่น
const resetBtn = document.getElementById('resetBtn');
if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to completely reset your progress? This cannot be undone.')) {
            localStorage.removeItem(SAVE_KEY);
            location.reload();
        }
    });
}
