# Production workspace

**Live:** [muekotchamon.github.io/Production](https://muekotchamon.github.io/Production/)

The Next.js app lives in **`dashboard/`** (lowercase package name required by npm).

## GitHub Pages — ถ้าเปิดแล้วเห็นแต่ README (ไม่ขึ้นแอป)

สาเหตุคือ Pages ยังชี้ที่ **`/(root)`** เลยโชว์แต่ไฟล์ในราก repo ไม่ใช่เว็บที่ build แล้ว

### วิธีที่แนะนำ: GitHub Actions (อัตโนมัติ)

**สำคัญ:** ต้องทำข้อ 2–3 **ก่อนหรือทันทีหลัง push ครั้งแรก** — ถ้ายังไม่เปิด Pages / ยังไม่เลือก GitHub Actions เป็นแหล่ง build ขั้น **Configure Pages** ใน Actions จะ error `Not Found`

1. Push โค้ดนี้ขึ้น `main` (มีไฟล์ `.github/workflows/deploy-github-pages.yml` แล้ว)
2. บน GitHub ไปที่ **Settings → Pages**
3. ที่ **Build and deployment → Source** เลือก **GitHub Actions** (ไม่ใช่ “Deploy from a branch” และไม่ใช่ `/ (root)`)
4. กลับไปที่แท็บ **Actions** → เปิด run ที่ล้ม → **Re-run all jobs** (หรือ push commit ใหม่)
5. รอ workflow **Deploy GitHub Pages** รันจบ (เขียว)
6. รีเฟรช `https://muekotchamon.github.io/Production/` (อาจรอ 1–2 นาที)

#### ถ้าเห็น error: “Get Pages site failed” / `HttpError: Not Found`

แปลว่ายังไม่ได้ทำข้อ 3 — ไป **Settings → Pages** แล้วตั้ง **Source = GitHub Actions** จากนั้น **Re-run** workflow

### วิธีสำรอง: โฟลเดอร์ `/docs`

1. **Settings → Pages** → Source: **Deploy from a branch**
2. Branch **`main`**, folder **`/docs`** (ห้ามเลือก `/ (root)`)
3. บนเครื่องรัน `cd dashboard && npm run build:pages` แล้ว **commit + push** โฟลเดอร์ **`docs/`**

---

## Local dev

```bash
cd dashboard
npm install
npm run dev
```

เปิด **[http://localhost:3000/Production](http://localhost:3000/Production)** (มี base path `/Production` ให้ตรงกับ GitHub Pages)

แท็บ: **Step bar**, **Timeline**, **Card grid**, **Premium**, **Project**.
