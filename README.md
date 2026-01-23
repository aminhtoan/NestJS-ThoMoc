```markdown
# NestJS-ThoMoc

Backend API cho hệ thống thương mại điện tử ThoMoc (E-commerce).

## Tech Stack
- NestJS 11.x
- Prisma 7 (ORM) + PostgreSQL (qua @prisma/adapter-pg)
- Zod validation (qua nestjs-zod)
- JWT + Passport authentication
- Social login: Google + Facebook
- Redis (cache / rate limit / session)
- Resend + React Email cho gửi mail đẹp
- Throttler chống brute-force
- Swagger API docs
- Devtools integration

## Setup môi trường

1. Clone repo:
   ```bash
   git clone https://github.com/aminhtoan/NestJS-ThoMoc.git
   cd NestJS-ThoMoc
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Tạo file `.env` (copy từ `.env.example` nếu có) và điền các biến môi trường

4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

5. Chạy migration (lần đầu):
   ```bash
   npx prisma migrate dev --name init
   ```

6. Seed data cơ bản (permission + data mẫu):
   ```bash
   npm run create-permission
   npm run init-seed-data
   ```

7. Chạy development: 
   ```bash
   npm run start:dev
   ```

8. Preview email template (react-email + resend):
   ```bash
   npm run email:dev
   ```

9. Cập nhật schema database an toàn (khi sửa file `prisma/schema.prisma`):
   - Nếu muốn **review hoặc edit migration SQL trước khi apply** (tránh mất data, rename column, copy data...):
     ```bash
     npx prisma migrate dev --create-only   # Tạo draft migration (không apply ngay)
     ```
     → Mở file SQL mới tạo trong `prisma/migrations/.../migration.sql` để chỉnh sửa nếu cần.
   - Sau khi hài lòng, apply migration:
     ```bash
     npx prisma migrate dev
     npx prisma generate
     ```
     
10. Muốn tạo route tự động:
    ```bash
    nest g resource [name] --no-spec
    ```
## Hướng dẫn tạo credentials cho Social Login

### 1. Login với Google
1. Truy cập: https://console.cloud.google.com/apis/credentials
2. Tạo hoặc chọn Project → **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Thêm **Authorized redirect URIs**:
   - Dev: `http://localhost:3000/auth/google/callback`
   - Prod: `https://your-domain.com/auth/google/callback`
5. Copy **Client ID** và **Client Secret** → dán vào `.env`

### 2. Login với Facebook
1. Truy cập: https://developers.facebook.com/apps/
2. **Create App** → chọn loại (Consumer/Business)
3. Thêm product **Facebook Login** → Settings → thêm **Valid OAuth Redirect URIs** giống trên
4. Copy **App ID** và **App Secret** → dán vào `.env`

### 3. Redis Cloud (free tier)
1. Truy cập: https://app.redis.io/
2. Tạo free database → copy connection string dạng `redis://default:...` → dán vào `REDIS_URL` trong `.env`

Project đang trong quá trình phát triển.  
Có góp ý hoặc muốn đóng góp thì cứ mở Issue hoặc Push PR nhé! 🚀
```

