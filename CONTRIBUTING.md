# 🚀 คู่มือการใช้งานโปรเจค 25-HD Movie Streaming

## 📋 สำหรับนักพัฒนาที่ต้องการ Clone และใช้งาน

### 1. Clone โปรเจค:
```bash
git clone https://github.com/classic1990/effective-journey.git
cd effective-journey
```

### 2. ติดตั้ง Dependencies:
```bash
cd functions
npm install
```

### 3. ตั้งค่า Environment Variables:
```bash
# คัดลอกไฟล์ตัวอย่าง
cp functions/.env.example functions/.env

# แก้ไขไฟล์ .env ใส่ API Keys จริง
# ใช้ Notepad, VS Code, หรือ text editor อื่นๆ
notepad functions/.env
```

### 4. ใส่ API Keys ที่ได้จริง:
ในไฟล์ `functions/.env`:
```bash
YOUTUBE_API_KEY=your_real_youtube_api_key_here
GEMINI_API_KEY=your_real_gemini_api_key_here
ADMIN_EMAILS=your_email@example.com
```

### 5. Deploy เว็บไซต์:
```bash
# Deploy เฉพาะ hosting (ฟรี)
firebase deploy --only hosting

# หรือ deploy ทั้งหมด (ต้อง Blaze Plan)
firebase deploy
```

## 🔧 การรับ API Keys

### YouTube Data API v3:
1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้างโปรเจคใหม่หรือใช้โปรเจคที่มีอยู่
3. เปิดใช้งาน YouTube Data API v3
4. สร้าง API Key จาก Credentials page
5. จำกัดสิทธิ์ API Key เฉพาะ YouTube Data API v3

### Gemini API:
1. ไปที่ [Google AI Studio](https://makersuite.google.com/app/apikey)
2. สร้าง API Key สำหรับ Gemini API
3. คัดลอก API Key มาใช้

## 📁 โครงสร้างโปรเจค:

```
effective-journey/
├── public/                 # Frontend files
│   ├── index.html         # หน้าแรก
│   ├── watch.html          # หน้าดูหนัง
│   ├── admin.html          # หน้าแอดมิน
│   ├── css/main.css        # Styles
│   └── js/main.js          # JavaScript หลัก
├── functions/              # Firebase Functions
│   ├── .env.example        # Environment variables template
│   ├── index.js            # Functions หลัก
│   └── package.json        # Dependencies
├── firebase.json           # Firebase configuration
└── README.md              # เอกสารหลัก
```

## 🌐 การใช้งาน:

### Spark Plan (ฟรี):
- ✅ แสดงหนังจาก Firestore
- ✅ ค้นหาหนัง
- ✅ ดูหนังผ่าน YouTube
- ❌ ไม่มี AI Import
- ❌ ไม่มี Admin Panel

### Blaze Plan (มีค่าใช้จ่าย):
- ✅ ฟีเจอร์ครบถ้วน
- ✅ AI Import
- ✅ Admin Panel
- ✅ อัปเดตยอดวิวอัตโนมัติ

## 📝 การเพิ่มหนังในฐานข้อมูล:

### วิธีที่ 1: ใช้ Firebase Console (ง่ายที่สุด)
1. ไปที่ [Firebase Console](https://console.firebase.google.com/project/classic-e8ab7/firestore/data)
2. คลิกที่ collection `movies`
3. คลิก "Add document"
4. ใส่ข้อมูลตามโครงสร้าง

### วิธีที่ 2: ใช้ Admin Panel (ต้อง Blaze Plan)
1. เปิดหน้า admin.html
2. เพิ่มหนังผ่านฟอร์ม
3. หรือใช้ AI Import จาก YouTube

## 🔐 ความปลอดภัย:

- **ห้าม** commit ไฟล์ `.env` ลง Git
- **ห้าม** แชร์ API Keys
- **ควร** ใช้ Environment Variables
- **ควร** ตรวจสอบ Firebase Security Rules

## 🚨 ปัญหาที่พบบ่อย:

### 1. ไม่เห็นหนัง:
- ตรวจสอบว่า Firestore มีข้อมูล
- ตรวจสอบว่า API URL ถูกต้อง

### 2. Deploy ไม่ได้:
- ตรวจสอบว่า login Firebase แล้ว
- ตรวจสอบว่าอยู่ในโฟลเดอร์โปรเจค

### 3. API ไม่ทำงาน:
- ตรวจสอบ API Keys ใน `.env`
- ตรวจสอบว่า API เปิดใช้งานแล้ว

## 📞 ติดต่อ:

- GitHub: https://github.com/classic1990/effective-journey
- Email: duy.kan1234@gmail.com
- Live Site: https://classic-e8ab7.web.app

---

**🎬 ขอให้สนุกกับการพัฒนาเว็บไซต์สตรีมมิ่งหนัง!**
