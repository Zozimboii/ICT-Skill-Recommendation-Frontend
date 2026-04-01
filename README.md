# ICT Job Skill Recommendation — Frontend

## DEMO: VIDEO

[System Concept &Skill Trends & Job Search](https://youtu.be/FI7PBpGdnkY)

[AI Skill Analysis & User Assessment](https://youtu.be/lKsy3q15cvY)

[User Dashboard & System Management](https://youtu.be/nREshTdHzn0)

Nuxt 3 frontend สำหรับระบบวิเคราะห์ทักษะและแนะนำงาน ICT ไทย

---

## Tech Stack

- **Nuxt 4** — Vue 3 framework
- **TypeScript** — Type safety
- **Tailwind CSS** — Styling
- **Pinia** — State management
- **D3 + d3-sankey** — Sankey diagram
- **ApexCharts / vue3-apexcharts** — กราฟ trend
- **ECharts / vue-echarts** — กราฟเพิ่มเติม
- **Chart.js / vue-chartjs** — Radar chart

---

## โครงสร้างโปรเจกต์

```
frontend/
├── app/
│   ├── assets/
│   │   └── css/            # main.css, tailwind.css
│   ├── components/
│   │   ├── Charts/         # RadarChart.vue, RadarDebugPanel.vue
│   │   └── Trend/          # JobTrendChart, SankeyChart, SkillBlockPanel, SkillTrendChart
│   ├── composables/        # useApiFetch, useAssessment, useDashboard, useJobSearch, useTrend ...
│   ├── layouts/
│   │   └── default.vue
│   ├── middleware/
│   │   ├── admin.global.ts
│   │   ├── auth.global.ts
│   │   └── guest.global.ts
│   ├── pages/
│   │   ├── admin/
│   │   │   └── index.vue   # Admin panel
│   │   ├── index.vue       # ICT Skill Trends
│   │   ├── assessment.vue
│   │   ├── dashboard.vue
│   │   ├── login.vue
│   │   ├── register.vue
│   │   ├── searchJob.vue
│   │   └── transcript.vue
│   ├── plugins/
│   │   └── apexcharts.client.ts
│   ├── stores/
│   │   ├── useAuthStore.ts
│   │   └── useDashboardStore.ts
│   ├── types/              # TypeScript interfaces
│   ├── validators/
│   │   └── auth_validator.ts
│   └── app.vue
├── public/
├── .env.example
├── nuxt.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## การติดตั้ง

### 1. Clone โปรเจกต์

```bash
git clone <repo-url>
cd frontend
```

### 2. ติดตั้ง Dependencies

```bash
# npm
npm install

# หรือ bun (เร็วกว่า)
bun install
```

> Dependencies ทั้งหมดรวมถึง D3, ApexCharts, ECharts อยู่ใน `package.json` แล้ว ไม่ต้องติดตั้งเพิ่ม

### 3. ตั้งค่า Environment Variables

คัดลอกจาก `.env.example` แล้วแก้ไขค่า:

```bash
cp .env.example .env
```

เนื้อหาใน `.env`:

```env
# URL ของ Backend API
NUXT_PUBLIC_API_BASE=http://localhost:8000
```

> ต้องรัน Backend ก่อน โดย default อยู่ที่ port 8000

---

## รัน Development Server

```bash
# npm
npm run dev

# bun
bun run dev
```

เปิดได้ที่ `http://localhost:3000`

---

## Build สำหรับ Production

```bash
# Build
npm run build

# Preview build
npm run preview
```

---

## หน้าต่างๆ ในระบบ

| Path | หน้า | เข้าได้โดย |
|------|------|-----------|
| `/` | ICT Skill Trends | ทุกคน |
| `/searchjob` | ค้นหางาน | ทุกคน |
| `/login` | Login | ทุกคน (redirect ออกถ้า login แล้ว) |
| `/register` | สมัครสมาชิก | ทุกคน (redirect ออกถ้า login แล้ว) |
| `/assessment` | Skill Assessment | ทุกคน (บันทึกผลต้อง login) |
| `/transcript` | อัปโหลด Transcript | Login แล้ว |
| `/dashboard` | Dashboard & Skill Gap | Login แล้ว |
| `/admin` | Admin Panel | Admin เท่านั้น |

---

## Auth Flow

- Token เก็บเป็น cookie ชื่อ `auth_token`
- ทุก API call ผ่าน `useApiFetch` composable ที่จัดการ 401 อัตโนมัติ
- ถ้า token หมดอายุ ระบบ logout และแจ้งเตือน toast อัตโนมัติ
- Route guard แบ่งเป็น 3 middleware:
  - `auth.global.ts` — redirect ไป `/login` ถ้ายังไม่ login
  - `admin.global.ts` — redirect ออกถ้าไม่ใช่ admin
  - `guest.global.ts` — redirect ออกจาก `/login` และ `/register` ถ้า login แล้ว

---

## สิ่งที่ต้องมีก่อนรัน

- [ ] Node.js 18+ หรือ Bun 1+
- [ ] Backend รันอยู่ที่ `http://localhost:8000`
- [ ] ไฟล์ `.env` มี `NUXT_PUBLIC_API_BASE` ถูกต้อง
