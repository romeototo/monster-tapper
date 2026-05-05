<div align="center">

# 🗡️ Monster Tapper PRO

**เกมแนว Idle Clicker สุดพรีเมียม — ปราบมอนสเตอร์ รวบรวม Essence อัปเกรดกองกำลัง และเผชิญหน้ากับบอสยักษ์สุดท้าทาย!**

<p>
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />
  <img src="https://img.shields.io/github/last-commit/romeototo/monster-tapper?style=for-the-badge&color=8B5CF6" />
  <img src="https://img.shields.io/github/license/romeototo/monster-tapper?style=for-the-badge&color=10B981" />
</p>

<i>👉 <a href="README.md">🇬🇧 Read in English</a></i><br><br>

![Monster Tapper Demo](https://raw.githubusercontent.com/romeototo/monster-tapper/main/screenshot.gif)

👉 **[เล่นเกมฟรีที่นี่](https://romeototo.github.io/monster-tapper/)**

</div>

---

## 🌟 ฟีเจอร์ระดับ PRO (อัปเดตใหม่ล่าสุด!)

- **♻️ ระบบจุติ (Ascension):** เมื่อถึงด่านที่ 50 สามารถเลือก "จุติ" เพื่อเริ่มเล่นใหม่พร้อมรับโบนัสตัวคูณพลังโจมตีแบบถาวร!
- **⚡ สกิลกดใช้และบัฟติดตัว:** ใช้สกิลทำลายล้างอย่าง **Berserk** หรือ **Midas Touch** พร้อมระบบอัปเกรดบัฟติดตัวถาวร
- **🛡️ ระบบสะสมสมบัติ (Relics):** ปราบมอนสเตอร์บอสเพื่อดรอปไอเทมสมบัติลับที่เพิ่มสเตตัสแบบก้าวกระโดด
- **🐾 ระบบสัตว์เลี้ยง (Pets):** ฟักไข่และเลี้ยงดูคู่หูอย่าง *Dragon Whelp* หรือ *Spirit Fox* เพื่อช่วยต่อสู้
- **✨ เอฟเฟกต์ระดับพรีเมียม (Game Juice):** ระบบหน้าจอสะเทือนตอนติดคริ (Screen Shake), แถบเลือดสมจริง (Trailing HP), เงาใต้พื้น, และโลโก้เรืองแสงนีออน
- **🌌 ฉากหลังเปลี่ยนตามด่าน (Dynamic Biomes):** บรรยากาศของเกมและโทนสีจะเปลี่ยนไปเรื่อยๆ ตามระดับด่าน (Forest, Volcano, Void, Cyber)
- **💾 ระบบเล่นอัตโนมัติ (Offline Progression):** กองทัพของคุณยังคงฟาร์มเงินต่อไปแม้คุณจะปิดเบราว์เซอร์ไปแล้ว

## 🎮 กลไกการเล่นหลัก

- **คลิกเพื่อโจมตี:** กดที่มอนสเตอร์ตรงกลางจอเพื่อทำดาเมจและเก็บเหรียญ
- **อัปเกรดกองกำลัง:** จ้างยูนิตอย่าง _Void Warlock_ หรือ _Celestial Titan_ เพื่อเพิ่มความเสียหายต่อวินาที (DPS) แบบอัตโนมัติ
- **บอสใหญ่จำกัดเวลา:** ทุกๆ 10 ด่าน คุณต้องล้มบอสยักษ์ให้ได้ภายใน 30 วินาที หากพลาดคุณจะถูกดีดกลับไปด่านก่อนหน้า!
- **ระบบคอมโบ (Combo):** คลิกอย่างรวดเร็วเพื่อสร้างคอมโบและคูณดาเมจสูงสุดถึง 5 เท่า

## 🛠️ เทคโนโลยีที่ใช้เบื้องหลัง

โปรเจกต์นี้เป็นการนำเทคนิคการพัฒนาเว็บ Front-end ขั้นสูงมาใช้งานจริง:

- **Game Loop:** ใช้การคำนวณ Delta time ทำให้ลอจิกเกมทำงานได้เสถียร
- **State Management:** ระบบเซฟเกมด้วย `localStorage` พร้อมการคำนวณรายได้ย้อนหลังตอนออฟไลน์
- **Web Audio API:** สังเคราะห์เสียงเอฟเฟกต์ 8-bit แบบสดๆ ด้วย Oscillator แทนการใช้ไฟล์เสียงทั่วไป
- **Modern UI/UX:** ออกแบบด้วยเทคนิค Glassmorphism, CSS Variables, และ Keyframe Animations ที่ซับซ้อน

## 🗺️ แผนการพัฒนา (Roadmap)

- [x] **Phase 1:** ระบบคลิกพื้นฐาน และระบบมอนสเตอร์บอส
- [x] **Phase 2:** ยกระดับกราฟิก (เอฟเฟกต์สะเก็ด, จอสั่น, การใช้ CSS Masking)
- [x] **Phase 3:** ระบบสวมบทบาท RPG (สัตว์เลี้ยง, ของขวัญ, บัฟติดตัว, ความสำเร็จ)
- [ ] **Phase 4:** ระบบเซฟคลาวด์ และเข้าสู่ระบบ (Cloud Save / Auth)
- [ ] **Phase 5:** กระดานผู้นำระดับโลก (Global Leaderboards)
- [ ] **Phase 6:** รองรับ PWA และ ปรับแต่งหน้าจอมือถือ (Mobile Optimization)

## 💻 วิธีการติดตั้งสำหรับนักพัฒนา

หากต้องการรันโปรเจกต์นี้บนเครื่องของคุณเพื่อปรับแต่งหรือศึกษา:

```bash
# 1. โคลน Repository
git clone https://github.com/romeototo/monster-tapper.git

# 2. เข้าไปในโฟลเดอร์โปรเจกต์
cd monster-tapper

# 3. รันผ่าน Local Web Server ใดก็ได้ (ตัวอย่างใช้ Python)
python -m http.server 8000
```
จากนั้นเปิดเบราว์เซอร์ไปที่ `http://localhost:8000` ก็สามารถเล่นและแก้ไขโค้ดได้เลย โดยไม่ต้องมีการคอมไพล์!

## 📜 ลิขสิทธิ์และเงื่อนไข (License)

โปรเจกต์นี้เปิดให้ใช้งานภายใต้ลิขสิทธิ์ **MIT License** คุณสามารถนำโค้ดไปศึกษา ดัดแปลง หรือใช้งานต่อในโปรเจกต์ของคุณได้อย่างอิสระ หากมีข้อเสนอแนะสามารถส่ง Pull Request มาได้เลย!

---

<div align="center">
  <b>พัฒนาโดย <a href="https://github.com/romeototo">romeototo</a></b><br>
  <i>Automate · Control · Innovate</i><br>
  <a href="https://romeototo.github.io/resume/">ดูพอร์ตโฟลิโอของฉัน</a>
</div>
