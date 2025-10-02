# OLX Clone

Full-stack OLX-style classifieds app built with:
- Backend: Node.js + Express + Prisma (SQLite)
- Frontend: React (Vite + TypeScript)

## Features
- User auth (register/login/logout)
- Create, edit, delete listings with multiple images (local uploads)
- Categories, search, price filter, sorting
- Favorites (save/unsave)
- Messages (buyer ⇄ seller conversations)

## Getting started

Prerequisites: Node 18+, npm

1) Install dependencies
```bash
cd backend && npm i
cd ../frontend && npm i
```

2) Generate Prisma client and create DB
```bash
cd backend
npx prisma generate
# Apply schema (SQLite file at backend/dev.db)
npx prisma migrate dev --name init --schema prisma/schema.prisma --skip-seed
# Seed categories
npm run prisma:seed
```

3) Run dev servers (two terminals)
```bash
# Terminal 1 - backend
cd backend
npm run dev

# Terminal 2 - frontend
cd frontend
npm run dev
```

- Backend: http://localhost:4000
- Frontend: http://localhost:5173

The frontend dev server proxies `/api` and `/uploads` to the backend (see `frontend/vite.config.ts`).

## Environment
Backend uses safe defaults if `.env` is missing:
```
DATABASE_URL=file:./dev.db
JWT_SECRET=devsecret_change_me
PORT=4000
CORS_ORIGIN=http://localhost:5173
```
You can override by creating `backend/.env`.

## Common issues
- Port already in use (4000): stop existing process
```powershell
$pid = (Get-NetTCPConnection -LocalPort 4000 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty OwningProcess)
if ($pid) { Stop-Process -Id $pid -Force }
```
- Prisma client out of date: `cd backend && npx prisma generate`

## Scripts
Backend (`backend/package.json`):
- `npm run dev` – start Express in watch mode
- `npm run build && npm start` – build and run
- `npm run prisma:generate` – generate client
- `npm run prisma:migrate` – create/apply migration
- `npm run prisma:seed` – seed categories

Frontend (`frontend/package.json`):
- `npm run dev` – start Vite dev server
- `npm run build` – build
- `npm run preview` – preview build

## Folder structure
```
backend/
  prisma/
  src/
    routes/ (auth, listings, messages, uploads)
    middleware/
    lib/
    utils/
frontend/
  src/
    pages/ (Home, Login, Register, NewListing, EditListing, ListingDetail, Messages, Favorites, MyAds)
    lib/
```

## Notes
- Image uploads are stored locally in `backend/uploads`. For production, switch to S3/Cloudinary.
- Database is SQLite for simplicity. You can point `DATABASE_URL` to Postgres/MySQL and run new migrations.

## License
MIT
