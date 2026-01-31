# STAGE 1: Build
# FROM oven/bun:1 AS build
# WORKDIR /app

# คัดลอกไฟล์จัดการ package
# COPY package.json bun.lock* ./
# RUN bun install --frozen-lockfile

# คัดลอกโค้ดทั้งหมดและสั่ง Build
# COPY . .
# RUN bun run build

# STAGE 2: Production
# FROM oven/bun:1 AS production
# WORKDIR /app
# ENV NODE_ENV=production

# คัดลอกเฉพาะไฟล์ที่ Build เสร็จแล้วจาก Stage แรก
# Nuxt 3 เก็บไฟล์รันไว้ใน .output
# COPY --from=build /app/.output ./.output

# EXPOSE 3000

# รัน Server ของ Nuxt (Nitro)
# CMD ["bun", ".output/server/index.mjs"]
# ใช้ Node.js 20 หรือเวอร์ชันที่ใกล้เคียง
FROM node:20-slim

# ตั้งค่า WORKDIR
WORKDIR /app

# ติดตั้ง Bun (เนื่องจากในโปรเจกต์คุณมี bun.lock)
RUN npm install -g bun

# คัดลอกไฟล์จัดการ package ก่อนเพื่อใช้ประโยชน์จาก Docker Cache
COPY package.json bun.lock ./

# ติดตั้ง dependencies
RUN bun install

# คัดลอกโค้ดทั้งหมด
COPY . .

# Build โปรเจกต์ Nuxt
# RUN bun run build

# กำหนด Port (Nuxt ปกติใช้ 3000)
EXPOSE 3000

# ตั้งค่าให้ Nuxt รับการเชื่อมต่อจากภายนอก container
ENV HOST=0.0.0.0
ENV PORT=3000

# คำสั่งรัน
CMD ["bun", "run", "dev"]