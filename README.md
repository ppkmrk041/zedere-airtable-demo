# Zedere Frontend

Angular 16 frontend สำหรับใช้งานคู่กับ `zedereBlackend`

## Project name

- Angular project: `zedere-frontend`
- App name: `Zedere Frontend`
- Default backend API: `http://localhost:1502/api`

## มีอะไรให้แล้ว

- Login / Register / Logout
- JWT Access Token + Refresh Token
- Auth Guard / Permission Guard
- HTTP Interceptor แนบ Bearer Token อัตโนมัติ
- Auto Refresh Token เมื่อเจอ 401
- User Management
- Permission Catalog / Role Matrix / User Override
- Profile / Change Password
- System Health ผ่าน Actuator
- Audit Log viewer
- Theme service ผ่าน CSS variables
- ERP shell สำหรับใช้เป็นแม่แบบทุกโปรเจกต์
- Docker + Nginx สำหรับ deploy

## Run

```bash
npm install
npm start
```

เปิด `http://localhost:4200`

## Backend config

แก้ `src/environments/environment.ts`

```ts
baseURL: 'http://localhost:1502/api',
actuatorURL: 'http://localhost:1502/actuator'
```

หลังบ้าน `zedereBlackend` เปิดค่า default ที่ port `1502` ดังนั้นค่าเริ่มต้นใน dev ใช้ `http://localhost:1502/api` ได้ทันที

## สร้างหน้าใหม่

ใช้ `--skip-tests` เสมอ:

```bash
ng g c features/example/example-list --skip-tests
```
