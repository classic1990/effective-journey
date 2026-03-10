# 🔐 Security Policy

## ความปลอดภัยของโปรเจค

### ⚠️ ข้อมูลที่ละเอียดและไม่เคย commit ลง Git:

1. **API Keys**
   - YouTube API Key (`functions/.env`)
   - Gemini API Key (`functions/.env`)
   - อยู่ในไฟล์ `.gitignore` แล้ว

2. **Environment Variables**
   - ทั้งหมดอยู่ใน `functions/.env`
   - มีไฟล์ตัวอย่าง: `functions/.env.example`

3. **Firebase Configuration**
   - Runtime config files
   - ข้อมูลการเชื่อมต่อฐานข้อมูล

## 🛡️ มาตรการรักษาความปลอดภัย

### สำหรับนักพัฒนา:
1. **ห้าม commit API Keys ลง Git**
2. **ใช้ `.env.example` เป็นตัวอย่าง**
3. **ตั้งค่า Environment Variables ในเครื่อง local**
4. **ไม่เปิดเผยข้อมูลสำคัญใน public repos**

### สำหรับ Production:
1. **ใช้ Firebase Environment Variables**
2. **จำกัดสิทธิ์ API Keys**
3. **เปิดใช้งาน Firebase Security Rules**
4. **ตรวจสอบ CORS settings**

## 📋 การตั้งค่าสำหรับนักพัฒนาคนอื่น:

### 1. Clone โปรเจค:
```bash
git clone https://github.com/classic1990/effective-journey.git
cd effective-journey
```

### 2. ตั้งค่า Environment Variables:
```bash
# คัดลอกไฟล์ตัวอย่าง
cp functions/.env.example functions/.env

# แก้ไขไฟล์ .env ใส่ API Keys จริง
notepad functions/.env
```

### 3. ติดตั้ง Dependencies:
```bash
cd functions
npm install
```

### 4. Deploy:
```bash
firebase deploy --only hosting
```

## 🚨 คำเตือนความปลอดภัย:

- **ห้าม** commit ไฟล์ `.env` ลง Git
- **ห้าม** แชร์ API Keys กับใคร
- **ห้าม** ใส่ API Keys ใน frontend code
- **ควร** ใช้ Environment Variables ใน production
- **ควร** ตรวจสอบ Firebase Security Rules

## 🔍 การตรวจสอบความปลอดภัย:

### ก่อน commit:
```bash
# ตรวจสอบว่าไม่มีข้อมูลละเอียด
git status
git diff --cached

# ตรวจสอบ .gitignore
git check-ignore functions/.env
```

### หลัง deploy:
- ตรวจสอบว่า API Keys ไม่รั่วไหล
- ตรวจสอบ CORS settings
- ตรวจสอบ Firebase Security Rules

## 📞 รายงานปัญหาความปลอดภัย:

หากพบปัญหาความปลอดภัย กรุณาแจ้ง:
1. สร้าง Issue ใน GitHub (private)
2. ส่งอีเมล: duy.kan1234@gmail.com
3. ห้ามเปิดเผยข้อมูลละเอียดใน public

---

**⚠️ ข้อมูลในเอกสารนี้เป็นความลับ และเฉพาะผู้มีสิทธิ์เท่านั้น**
