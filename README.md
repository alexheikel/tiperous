# Tiperous 🌟

Simple way to rate a company — service, products, employees.

## Stack
- **Next.js 14** (App Router) — framework
- **Supabase** — Postgres + Auth + Realtime
- **Vercel** — hosting + Edge Functions
- **Google Places API** — company search

---

## Setup en 20 minutos

### 1. Clonar y instalar

```bash
git clone https://github.com/TU_USUARIO/tiperous.git
cd tiperous
npm install
```

### 2. Supabase

1. Ir a [supabase.com](https://supabase.com) → New project
2. Ir a **SQL Editor** → pegar todo el contenido de `supabase/migrations/001_initial_schema.sql` → Run
3. Ir a **Settings → API** → copiar `URL` y `anon key`
4. Ir a **Authentication → Providers** → habilitar **Email** y **Google**
   - Para Google: necesitás crear credenciales OAuth en [console.cloud.google.com](https://console.cloud.google.com)
   - Callback URL de Supabase: `https://TU_PROJECT_ID.supabase.co/auth/v1/callback`

### 3. Google Places API

1. Ir a [console.cloud.google.com](https://console.cloud.google.com)
2. Crear proyecto → habilitar **Places API (New)**
3. Crear API Key → restringirla a tu dominio en producción

### 4. Variables de entorno

```bash
cp .env.example .env.local
# Editar .env.local con tus valores reales
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIza...
GOOGLE_PLACES_API_KEY=AIza...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Correr local

```bash
npm run dev
# → http://localhost:3000
```

### 6. Deploy a Vercel

```bash
# Opción A: desde CLI
npx vercel

# Opción B: conectar repo en vercel.com → Import → add env vars
```

**Env vars en Vercel:** ir a Settings → Environment Variables → agregar todas las de `.env.example`

Cambiar `NEXT_PUBLIC_APP_URL` a tu dominio de Vercel (ej: `https://tiperous.vercel.app`).

También actualizar en Supabase → Authentication → URL Configuration:
- Site URL: `https://tiperous.vercel.app`
- Redirect URLs: `https://tiperous.vercel.app/api/auth/callback`

---

## Estructura del proyecto

```
tiperous/
├── app/
│   ├── (app)/                    # App shell con nav
│   │   ├── page.tsx              # Explore (SSR + search)
│   │   ├── timeline/page.tsx     # Timeline global (realtime)
│   │   └── company/[id]/page.tsx # Detalle empresa (realtime)
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── api/
│       ├── companies/route.ts    # GET/POST companies
│       ├── companies/search/     # Search + Google Places
│       ├── tips/route.ts         # GET/POST tips
│       └── auth/callback/        # OAuth redirect handler
├── components/
│   ├── layout/AppShell.tsx       # Header + bottom nav
│   ├── company/
│   │   ├── CompanyCard.tsx
│   │   ├── CompanyDetailClient.tsx
│   │   └── ExploreClient.tsx
│   └── tips/
│       ├── TipCard.tsx
│       └── AddTipModal.tsx
├── hooks/
│   ├── useAuth.ts                # Supabase Auth hook
│   ├── useRealtime.ts            # Live tips + company scores
│   └── useGeolocation.ts         # Browser GPS
├── lib/
│   ├── supabase/client.ts
│   ├── supabase/server.ts
│   └── google-places.ts
├── supabase/migrations/
│   └── 001_initial_schema.sql    # ← Correr esto primero
├── types/index.ts
└── middleware.ts                 # Session refresh
```

## Features

- ✅ Auth con email + Google OAuth (Supabase)
- ✅ Tips en tiempo real via Supabase Realtime WebSocket
- ✅ Búsqueda de empresas en Google Places
- ✅ Geolocalización para búsquedas cercanas
- ✅ Scores automáticos con DB triggers
- ✅ Anti-spam: un tip por empresa/segmento/día
- ✅ ISR (Incremental Static Regeneration) en Vercel
- ✅ RLS (Row Level Security) en Supabase
- ✅ Responsive mobile-first
