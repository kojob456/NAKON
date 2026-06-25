# 📋 Sprint Overview Report: NakhonFlood Alert & Recovery System
**โครงการระบบเตือนภัยล่วงหน้าน้ำท่วม และบริหารจัดการฟื้นฟูภัยพิบัติ จังหวัดนครศรีธรรมราช**

---

## 🌟 1. บทนำ และภาพรวมโครงการ (Project Executive Summary)
**NakhonFlood Alert** คือแพลตฟอร์มเว็บแอปพลิเคชันเชิงรุกเพื่อการจัดการภัยพิบัติน้ำท่วมอย่างครบวงจรของจังหวัดนครศรีธรรมราช ออกแบบภายใต้แนวคิด **"เตือนภัยก่อนน้ำมา รักษาชีวิตก่อนเกิดเหตุ"** โดยมุ่งเน้นการแจ้งเตือนภัยล่วงหน้า 3 ชั่วโมง (3-Hour Early Warning) ก่อนมวลน้ำจากเทือกเขาหลวงจะไหลหลากเข้าท่วมเขตเมืองและพื้นที่ลุ่มต่ำ 

ตัวระบบผสมผสานข้อมูลจากสถานีโทรมาตรวัดปริมาณน้ำฝนและระดับลำน้ำจริง ร่วมกับโมเดลการประเมินความเสี่ยงรายอำเภอ (Dynamic Flood Chance) ถ่ายทอดผ่านส่วนต่อประสานผู้ใช้งานสมัยใหม่แบบ **Glassmorphism** ที่รองรับการใช้งานบนทุกแพลตฟอร์ม (Smartphone, Tablet, Desktop) อย่างสมบูรณ์แบบ พร้อมระบบอาสาสมัครภาคประชาชน (Sentinel Watch) และระบบจัดการความคุ้มภัยหลังน้ำท่วม

---

## 🎯 2. สาระสำคัญ และฟีเจอร์หลักที่พัฒนาใน Sprint นี้ (Key Features & Deliverables)

### 2.1 🔴 ระบบเตือนภัยล่วงหน้า 3 ชั่วโมง และคำนวณโอกาสท่วม (Dynamic Flood Chance)
* **คำนวณสัดส่วนความเสี่ยง (0 - 100%):** วิเคราะห์จากปริมาณน้ำฝนสะสม 24 ชั่วโมงบริเวณเทือกเขาหลวง (ลานสกา) และระดับน้ำในแม่น้ำสายหลัก (แม่น้ำท่าดี)
* **ระบบป้ายแจ้งเตือนอัจฉริยะ (Risk Badges):** แบ่งระดับสถานการณ์เป็น 4 ระดับสีสากล (เขียว-ปลอดภัย, เหลือง-เฝ้าระวัง, ส้ม-เสี่ยงภัยสูงเตรียมอพยพ, แดง-วิกฤตอพยพด่วนที่สุด)

### 2.2 📱 ดีไซน์ Modern UX/UI และระบบ Smart Navbar
* **อัปเกรดความสวยงามแบบ Glassmorphism:** ปรับพื้นหลังและหน้าต่างเมนูให้มีความใสแบบกระจกเงาไล่ระดับสี (Vibrant Gradients & Micro-animations)
* **Smart Auto-Hiding Navbar:** แก้ปัญหาส่วนหัวกินพื้นที่หน้าจอมือถือ โดยระบบจะพับเก็บแถบสถานะและสไลด์ซ่อนโลโก้ด้านบนสุดโดยอัตโนมัติเมื่อผู้ใช้ "เลื่อนลง" (`window.scrollY > 50px`) และสไลด์ลงมาอย่างนุ่มนวลเมื่อ "เลื่อนขึ้น"

### 2.3 🔐 ระบบยืนยันตัวตน และเชื่อมต่อฐานข้อมูล Cloud Firestore เรียลไทม์
* **Social Login Integrated:** รองรับการเข้าสู่ระบบผ่าน **Google Authentication** และ **LINE OIDC Provider** 
* **Dual-Collection Firestore Sync:** เชื่อมต่อฐานข้อมูล Cloud Firestore สองชุดพร้อมกัน ได้แก่ Collection **`flooddata`** และ **`location`** เพื่ออัปเดตโอกาสเกิดน้ำท่วมและสถานะของแต่ละอำเภอ/หมู่บ้านแบบเรียลไทม์ รองรับการเพิ่มหมุดสถานที่ใหม่ผ่าน Firebase Console ได้ทันทีโดยไม่ต้องแก้รหัสต้นฉบับ

### 2.4 🛠️ โหมดนักพัฒนา และการจำลองสิทธิ์ (Debug & Role Simulator Mode)
* **Production Clean UI:** ในการเข้าใช้งานปกติผ่าน URL ทั่วไป (เช่น `http://localhost:3001/`) ระบบจะซ่อนแถบสลับบทบาทจำลองไว้เสมอ
* **Developer Debugging Query:** เปิดใช้งานแถบ Quick Role Switcher เฉพาะเมื่อต่อท้ายลิงก์ด้วยพารามิเตอร์ **`?debug=true`** เท่านั้น เพื่อความปลอดภัยและความเรียบร้อยของหน้าเว็บจริง

---

## 💻 3. สถาปัตยกรรมระบบ และสแต็กเทคโนโลยี (Technology Stack)
* **Frontend Framework:** React 19 (TypeScript) + Vite
* **Styling & UI:** Vanilla CSS + Modern Design Tokens (Glassmorphism, Responsive Grid)
* **Animations:** Framer Motion (`motion/react`) สำหรับ Micro-interactions และ Page Transitions
* **Mapping GIS:** Leaflet GIS + OpenStreetMap Tile Layer
* **Backend & Database:** Firebase Authentication + Google Cloud Firestore API SDK

---

## 🧪 4. สรุปภาพรวมการทดสอบระบบ (Testcase Summary)
การทดสอบใน Sprint นี้ครอบคลุม 4 มิติสำคัญ ได้แก่ ความถูกต้องในการล็อกอิน, ประสิทธิภาพการแสดงผลบนอุปกรณ์พกพา, การเชื่อมต่อฐานข้อมูลคลาวด์ และการตอบสนองของแผนที่ GIS 

*(สามารถดูรายละเอียดรายการทดสอบแบบละเอียดทั้ง 14 รายการได้ที่เอกสารแยก [testcase.md](file:///Users/chok/Downloads/nakhon-si-thammarat-flood-early-warning-&-recovery-system/testcase.md))*

| รหัสชุดทดสอบ | โมดูลที่ทดสอบ | จำนวนเทสเคส | สถานะผ่าน (Pass) |
| :--- | :--- | :---: | :---: |
| **TC-AUTH** | ระบบยืนยันตัวตน (Google / LINE Login) | 3 | 🟢 ผ่านทั้งหมด |
| **TC-NAV** | ระบบ UX/UI Responsive & Smart Navbar | 5 | 🟢 ผ่านทั้งหมด |
| **TC-DATA** | ระบบฐานข้อมูล Cloud Firestore (`flooddata` / `location`) | 4 | 🟢 ผ่านทั้งหมด |
| **TC-MAP** | ระบบแผนที่ GIS และรายงาน Sentinel | 2 | 🟢 ผ่านทั้งหมด |
| **รวมทั้งสิ้น** | | **14** | **100% Pass** |
