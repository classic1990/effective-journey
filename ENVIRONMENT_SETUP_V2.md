# Environment Configuration Guide

## การตั้งค่า Environment Variables สำหรับความปลอดภัย (Firebase Functions v2 + Params API)

### 1. ติดตั้ง Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. ตั้งค่า API Keys ด้วย Params API (Firebase Functions v2)

#### สร้างไฟล์ `functions/.env`
```bash
# YouTube Data API v3
YOUTUBE_API_KEY=your_youtube_api_key_here

# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Admin emails (comma separated)
ADMIN_EMAILS=duy.kan1234@gmail.com,admin2@example.com
```

#### หรือตั้งค่าผ่าน Firebase CLI
```bash
# ตั้งค่า YouTube API Key
firebase functions:secrets:set YOUTUBE_API_KEY

# ตั้งค่า Gemini API Key  
firebase functions:secrets:set GEMINI_API_KEY

# ตั้งค่า Admin Emails
firebase functions:secrets:set ADMIN_EMAILS
```

### 3. การตั้งค่าใน Local Development

สร้างไฟล์ `functions/.env`:

```env
YOUTUBE_API_KEY=your_youtube_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
ADMIN_EMAILS=duy.kan1234@gmail.com,admin2@example.com
```

### 4. การ Deploy

```bash
# Install dependencies
npm install

# Deploy พร้อมกับตั้งค่า environment
firebase deploy --only functions

# หรือ deploy ทั้งหมด
firebase deploy
```

## การรับ API Keys

### YouTube Data API v3
1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้างโปรเจคใหม่หรือใช้โปรเจคที่มีอยู่
3. เปิดใช้งาน YouTube Data API v3
4. สร้าง API Key จาก Credentials page
5. จำกัดสิทธิ์ API Key เฉพาะ YouTube Data API v3

### Gemini API
1. ไปที่ [Google AI Studio](https://makersuite.google.com/app/apikey)
2. สร้าง API Key สำหรับ Gemini API
3. คัดลอก API Key มาใช้

## ความปลอดภัย

- **อย่า** commit `.env` ขึ้น Git - เพิ่มเข้า `.gitignore`
- **อย่า** เปิดเผย API Keys ในโค้ด frontend
- **ควร** จำกัดสิทธิ์ API Keys ให้จำเพาะกับบริการที่ต้องใช้
- **ควร** ตั้งค่า quota limits สำหรับ APIs

## การทดสอบ

### Local Testing
```bash
# Start Firebase emulators
firebase emulators:start

# Test functions locally
firebase functions:shell
```

### Production Testing
```bash
# View logs
firebase functions:log

# Test specific function
curl -X POST https://your-region-your-project.cloudfunctions.net/youtubeVideo?id=TEST_ID
```

## ปัญหาที่พบบ่อย

### 1. API Key ไม่ทำงาน
- ตรวจสอบว่า API key ถูกต้อง
- ตรวจสอบว่า API ถูกเปิดใช้งานใน Google Cloud Console
- ตรวจสอบ quota limits

### 2. CORS Issues
- ตรวจสอบว่ามีการใช้ CORS middleware ใน Cloud Functions
- ตรวจสอบว่า rewrites ใน firebase.json ถูกต้อง

### 3. Permission Denied
- ตรวจสอบว่า user ได้ login ด้วย Firebase Auth
- ตรวจสอบว่า email อยู่ใน ADMIN_EMAILS

### 4. ESLint Issues
- ตรวจสอบว่ามีไฟล์ `.eslintrc.js`
- รัน `npm run lint` เพื่อตรวจสอบ

## การย้ายจาก Config API ไป Params API

ถ้าคุณมีการใช้ `functions.config()` เก่า:
```bash
# Export ค่า config เก่า
firebase functions:config:export

# ตั้งค่า params ใหม่
firebase functions:params:set YOUTUBE_API_KEY
firebase functions:params:set GEMINI_API_KEY
firebase functions:params:set ADMIN_EMAILS
```

## โครงสร้างไฟล์ที่เกี่ยวข้อง

```
functions/
├── .env                  # Environment variables (local)
├── .eslintrc.js          # ESLint configuration
├── index.js              # Main functions file
├── api-proxy.js          # API proxy functions
├── package.json          # Dependencies
└── node_modules/         # Installed packages
```

## การเพิ่ม .gitignore

เพิ่มบรรทัดเหล่านี้ใน `.gitignore`:

```
# Environment variables
functions/.env
.env.local
.env.production

# Runtime config
functions/.runtimeconfig.json
```
