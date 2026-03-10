# 25-HD Movie Streaming Website

🎬 เว็บไซต์สตรีมมิ่งหนังออนไลน์ ใช้ฐานข้อมูล Firebase Firestore

## 🌐 Live Demo

� **[ดูเว็บไซต์](https://classic-e8ab7.web.app)**

## �📋 ภาพรวมโปรเจค

### ✅ ฟีเจอร์ที่ทำงานได้ (Spark Plan)

- แสดงหนังจาก Firestore Database
- ค้นหาหนัง
- ดูหนังผ่าน YouTube embed
- แสดงข้อมูลหนังครบถ้วน (ชื่อ, โปสเตอร์, คำอธิบาย, หมวดหมู่, ปี, ยอดวิว)
- รองรับข้อมูลจาก collection `movies` และ `series`

### ⚠️ ฟีเจอร์ที่ต้องอัปเกรดเป็น Blaze Plan

- AI Import (นำเข้าหนังจาก YouTube ด้วย AI)
- Admin Panel (เพิ่ม/แก้ไขหนัง)
- อัปเดตยอดวิวอัตโนมัติ

## 🚀 การเริ่มต้น (Quick Start)

### 1. Clone โปรเจค

```bash
git clone https://github.com/classic1990/effective-journey.git
cd effective-journey
```

### 2. ติดตั้ง Dependencies

```bash
cd functions
npm install
```

### 3. ตั้งค่า Environment Variables

```bash
cp functions/.env.example functions/.env
# แก้ไขไฟล์ .env ใส่ API Keys จริง
```

### 4. Deploy

```bash
firebase deploy --only hosting
```

## 📁 โครงสร้างโปรเจค

```
effective-journey/
├── 📄 README.md                    # เอกสารหลัก
├── 📄 CONTRIBUTING.md              # คู่มือนักพัฒนา
├── 📄 SECURITY.md                  # นโยบายความปลอดภัย
├── 📄 ENVIRONMENT_SETUP_V2.md      # คู่มือตั้งค่า
├── 🔧 firebase.json                # Firebase config
├── 🔒 firestore.rules              # Security rules
├── 📊 firestore.indexes.json       # Database indexes
├── 📁 public/                      # Frontend
│   ├── 📄 index.html              # หน้าแรก
│   ├── 📄 watch.html               # หน้าดูหนัง
│   ├── 📄 admin.html               # หน้าแอดมิน
│   ├── 📁 css/main.css             # Styles
│   └── 📁 js/main.js               # JavaScript
└── 📁 functions/                   # Backend (Blaze Plan)
    ├── 🔧 .env.example             # Environment variables template
    ├── 🔧 .eslintrc.js              # ESLint config
    ├── 📄 index.js                 # Functions หลัก
    ├── 📄 firestore-functions.js   # Firestore functions
    ├── 📦 package.json             # Dependencies
    └── 📦 package-lock.json         # Lock file
```

## 🔧 การตั้งค่า

### สำหรับ Spark Plan (ฟรี)

- ใช้ Firestore REST API โดยตรง
- ไม่ต้องใช้ Cloud Functions
- Deploy ได้ทันที

### สำหรับ Blaze Plan (มีค่าใช้จ่าย)

- ใช้ Cloud Functions
- AI Import ทำงานได้
- Admin Panel ทำงานได้

ดูรายละเอียดเพิ่มเติม: [CONTRIBUTING.md](CONTRIBUTING.md)

## 📊 ฐานข้อมูล Firestore

### Collection: movies

```javascript
{
  title: "ชื่อหนัง",
  poster: "https://img.youtube.com/vi/xxx/maxresdefault.jpg",
  url: "youtubeVideoId",
  desc: "คำอธิบายหนัง",
  category: "หมวดหมู่",
  year: 2024,
  quality: "HD",
  viewCount: 100,
  createdAt: timestamp
}
```

## 🔐 ความปลอดภัย

- ✅ API Keys อยู่ใน `.env` (ไม่ commit ลง Git)
- ✅ มี `.gitignore` ครบถ้วน
- ✅ มีไฟล์ `.env.example` สำหรับนักพัฒนา
- ✅ Firebase Security Rules คุ้มครองข้อมูล

ดูรายละเอียด: [SECURITY.md](SECURITY.md)

## 📦 การ Deploy

### 1. Deploy Hosting (เสมอได้)

```bash
firebase deploy --only hosting
```

### 2. Deploy Functions (ต้อง Blaze Plan)

```bash
firebase deploy --only functions
```

### 3. Deploy ทั้งหมด

```bash
firebase deploy
```

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Firebase Functions (Node.js)
- **Database:** Firebase Firestore
- **Hosting:** Firebase Hosting
- **APIs:** YouTube Data API v3, Gemini API
- **Authentication:** Firebase Auth

## 🌐 ลิงก์ที่เกี่ยวข้อง

- **🎬 Live Site:** <https://classic-e8ab7.web.app>
- **📚 GitHub:** <https://github.com/classic1990/effective-journey>
- **🔧 Firebase Console:** <https://console.firebase.google.com/project/classic-e8ab7/overview>
- **📊 Firestore:** <https://console.firebase.google.com/project/classic-e8ab7/firestore/data>

## 📝 บันทึกการพัฒนา

- ✅ ใช้ Firestore Database แทน YouTube API
- ✅ ใช้ Firestore REST API สำหรับ Spark Plan
- ✅ ลบโค้ดที่ไม่ได้ใช้
- ✅ จัดระเบียบโปรเจคให้สะอาด
- ✅ ใช้ข้อมูลจากฐานข้อมูลที่มีอยู่แล้ว
- ✅ เพิ่มความปลอดภัยสูงสุด

## 🤝 การมีส่วนร่วม

1. Fork โปรเจค
2. สร้าง feature branch
3. Commit การเปลี่ยนแปลง
4. Push ไป branch
5. สร้าง Pull Request

## 📄 License

Private Project - 25-HD Movie Streaming

---

**🎬 ขอให้สนุกกับการพัฒนาเว็บไซต์สตรีมมิ่งหนัง!**
