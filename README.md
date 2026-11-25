<div align="center">
  <!-- TODO: Logo — Imgur linkini güncelle -->
  <img src="https://i.imgur.com/UK_LOGO_REPLACE.png" alt="Umut Kervanı Logo" width="200"/>
</div>

# Umut Kervanı Panel
## _Balıkesir Umut Kervanı — Muhtaç Tespit ve Kayıt Yönetimi_

Umut Kervanı Panel, tanıtım ekibinin sahada / telefonda doldurduğu **muhtaç tespit formlarını** dijital ortamda toplayan, aciliyet derecesine göre listeleyen ve yöneten bir web uygulamasıdır. İleride yeni özelliklerle kullanım alanı genişletilebilir.

[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61dafb?style=for-the-badge&logo=react&logoColor=white)](#teknoloji-yığını)
[![Backend](https://img.shields.io/badge/Backend-Supabase%20(BaaS)-3ecf8e?style=for-the-badge&logo=supabase&logoColor=white)](#neden-ayrı-backend-yok--supabase-nasıl-çalışır)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-4169e1?style=for-the-badge&logo=postgresql&logoColor=white)](#neden-ayrı-backend-yok--supabase-nasıl-çalışır)
[![Build](https://img.shields.io/badge/Build-Vite-646cff?style=for-the-badge&logo=vite&logoColor=white)](#teknoloji-yığını)

> İsteğe bağlı derin geliştirici turu (dosya dosya): [`GELISTIRICI.md`](./GELISTIRICI.md) — GitHub’a koymak zorunda değilsiniz; bu README tek başına yeterlidir.

---

## Ekran görüntüleri

> Imgur’a yükledikten sonra aşağıdaki `src` linklerini güncellemeniz yeterli.

### Giriş

<img src="https://i.imgur.com/UK_SHOT_LOGIN.png" alt="Giriş ekranı" width="600"/>

### Anasayfa (kayıt listesi)

<img src="https://i.imgur.com/UK_SHOT_LIST.png" alt="Anasayfa — kayıt listesi" width="600"/>

### Kayıt detayı

<img src="https://i.imgur.com/UK_SHOT_DETAIL.png" alt="Kayıt detayı" width="600"/>

### Yeni / düzenle formu

<img src="https://i.imgur.com/UK_SHOT_FORM.png" alt="Form" width="600"/>

### Mobil

<img src="https://i.imgur.com/UK_SHOT_MOBILE.png" alt="Mobil görünüm" width="320"/>

---

## İçindekiler

1. [Ne yapar?](#ne-yapar)
2. [Neden ayrı backend yok? / Supabase nasıl çalışır?](#neden-ayrı-backend-yok--supabase-nasıl-çalışır)
3. [Mimari (büyük resim)](#mimari-büyük-resim)
4. [Teknoloji yığını](#teknoloji-yığını)
5. [Gereksinimler](#gereksinimler)
6. [Kurulum (sıfırdan)](#kurulum-sıfırdan)
7. [Scriptler](#scriptler)
8. [Klasör yapısı](#klasör-yapısı)
9. [Rotalar ve sayfa akışları](#rotalar-ve-sayfa-akışları)
10. [Liste: arama ve sıralama](#liste-arama-ve-sıralama)
11. [PDF, form taslağı, oturum](#pdf-form-taslağı-oturum)
12. [Kim hangi veriyi görür? (RLS)](#kim-hangi-veriyi-görür-rls)
13. [Domain kuralları](#domain-kuralları)
14. [Supabase’e nasıl istek atılır?](#supabasee-nasıl-istek-atılır)
15. [Güvenlik](#güvenlik)
16. [Örnek veri](#örnek-veri)
17. [GitHub’a yükleme](#githuba-yükleme)
18. [GitHub + canlı site (Pages)](#github--canlı-site-pages)  
    *(push → Actions → Pages; `git status` sadece değişenleri listeler)*
19. [Sık hatalar](#sık-hatalar)
20. [Nereye bakarak geliştiririm?](#nereye-bakarak-geliştiririm)
21. [İletişim](#iletişim)

---

## Ne yapar?

| Özellik | Açıklama |
|--------|---------|
| Giriş | Kullanıcı adı + şifre (arka planda Supabase Auth e-posta/şifre) |
| Yeni kayıt | Uzun tespit formu: mağduriyet, acil ihtiyaç, yardım, mal varlığı, ev, gelir/gider, sağlık, düşünceler, aciliyet |
| Liste | Aciliyet filtresi, sayfalama (9’lu), esnek arama (isim / telefon / TC) |
| Sıralama | Önce Belirlenecek (0), sonra 1…7; aynı derecede **en yeni kayıt önce** |
| Detay | Özet + tüm bölümler; düzenle / sil / PDF indir |
| PDF | Tarayıcıda üretilir, doğrudan `.pdf` iner; **Supabase Storage kullanılmaz** |
| Form taslağı | Yeni kayıt yazarken `localStorage`; tarayıcı/telefon arka plana alınsa kaybolmaz |
| Tema | Açık / koyu (panel Layout’ta; **giriş ekranında yok**) |
| Mobil | Alt menü: Liste · Ara · Yeni kayıt |

**Aciliyet:** `0` Belirlenecek · `1–5` düzenli destek aralıkları · `6` Red · `7` Tek seferlik

---

## Neden ayrı backend yok? / Supabase nasıl çalışır?

Bu repo **yalnızca frontend** (React + Vite) içerir. Klasik bir Express / .NET API klasörü **yok**. Veri ve kimlik işleri **Supabase** (BaaS — Backend as a Service) üzerinden yürür.

```
GitHub / Vercel / Netlify  →  sadece statik frontend (HTML/JS/CSS)
                │
                │  HTTPS + JWT
                ▼
           Supabase Cloud
           ├─ Auth (giriş / oturum)
           └─ PostgreSQL + RLS (tespit_formlari)
```

| Soru | Kısa cevap |
|------|------------|
| GitHub neden “sadece front”a uygun? | Repoda API sunucusu yok; `npm run build` → `dist/` statik dosya. GitHub Pages / benzeri host’lar bunu yayınlar. |
| Backend olmadan veri nereden geliyor? | Tarayıcı doğrudan Supabase HTTPS API’sine istek atar (`@supabase/supabase-js`). |
| “Backend” kim? | Supabase: Auth + PostgREST + Postgres. Sizin yazdığınız Node sunucusu değil. |
| Front ↔ “backend” ilişkisi | Front: UI + form. Supabase: oturum (JWT) + tablo CRUD. RLS girişsiz erişimi keser. |
| Neden böyle? | Kurum içi panel için hızlı, az bakım; Storage’a PDF yığılmaz; tek `SETUP.sql` ile şema kurulur. |

Özet: **GitHub’daki kod = arayüz.** Veritabanı ve auth **Supabase bulutunda** yaşar; yerel backend process’i çalıştırmanız gerekmez.

---

## Mimari (büyük resim)

```
Tarayıcı (React SPA — Vite)
        │  HTTPS + JWT
        ▼
Supabase
  ├─ Auth          → oturum (localStorage, otomatik yenileme)
  └─ Postgres+RLS  → tespit_formlari
         ▲
         └── PostgREST: select / insert / update / delete
```

- Ayrı bir Express / Nest backend **yok**.
- Frontend, `@supabase/supabase-js` ile konuşur; SDK arka planda REST çağrıları yapar.
- Yetki veritabanında **Row Level Security (RLS)** ile uygulanır.

Uygulama girişi (`src/main.tsx`):

```
ThemeProvider → ToastProvider → AuthProvider → App (rotalar)
```

---

## Teknoloji yığını

| Katman | Teknoloji | Rol |
|--------|-----------|-----|
| UI | React 19 + TypeScript | Sayfalar ve bileşenler |
| Build | Vite 8 | `dev` / `build` / `preview` |
| Stil | Tailwind CSS 4 | Utility + `src/index.css` (`--uk-*` değişkenleri) |
| Routing | React Router 7 | URL → sayfa |
| Backend | Supabase | Auth + PostgreSQL + RLS |
| İstemci | `@supabase/supabase-js` | REST / Auth |
| PDF | `jspdf` + `html2canvas` | İstemci tarafı PDF indirme |

---

## Gereksinimler

- **Node.js 20+** (LTS)
- **npm**
- Ücretsiz [Supabase](https://supabase.com) hesabı

---

## Kurulum (sıfırdan)

### 1) Bağımlılıklar

```bash
git clone https://github.com/osmandemir2533/umutKervani.git
cd umutKervani
npm install
```

### 2) Supabase projesi

1. [supabase.com](https://supabase.com) → **New project**
2. Bölge: **Frankfurt (eu-central-1)** (Türkiye’ye yakın)
3. Database şifresini güvenli yerde saklayın

### 3) Veritabanı şeması

1. Dashboard → **SQL Editor** → **New query**
2. `supabase/SETUP.sql` dosyasının **tamamını** yapıştırın → **Run**

Bu dosya şunları yapar:

- `tespit_formlari` tablosunu oluşturur
- Index / unique `kayit_no` / check constraint’ler
- `updated_at` ve `created_by` tetikleyicileri
- RLS: **anon** kapalı; sadece **authenticated** CRUD

> `SETUP.sql` tabloyu `DROP` edip yeniden kurar. Canlıda veri varken körlemesine çalıştırmayın; sıfır kurulum içindir.

**İsteğe bağlı örnek veri:** Aynı şekilde `supabase/ORNEK_VERI.sql` dosyasını çalıştırın (12 demo kayıt: dolu / eksik / farklı aciliyet). Tekrar çalıştırınca `ORNEK-…` kayıtları yenilenir.

### 4) Kullanıcı oluşturma

1. **Authentication → Users → Add user**
2. E-posta: `kullaniciadi@gmail.com` (ör. `osmandemir@gmail.com`)
3. Şifre · **Auto Confirm** açık olsun

Panelde girişte sadece `osmandemir` yazılır; uygulama `@gmail.com` ekler (`src/features/auth/username.ts`).

### 5) Ortam değişkenleri

```bash
# Windows
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

`.env` içeriği (Supabase → **Project Settings → API**):

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

| Supabase alanı | `.env` |
|----------------|--------|
| Project URL | `VITE_SUPABASE_URL` |
| `anon` `public` | `VITE_SUPABASE_ANON_KEY` |

**`service_role` key’i asla frontend’e, `.env` örneğine veya GitHub’a koymayın** — RLS’i bypass eder.

`.env` değişince `npm run dev` sürecini durdurup yeniden başlatın (Vite env’i açılışta okur).

### 6) Çalıştırma

```bash
npm run dev
```

Tarayıcı: [http://localhost:5173](http://localhost:5173)

---

## Scriptler

| Komut | Ne yapar? |
|-------|-----------|
| `npm install` | Bağımlılıkları kurar |
| `npm run dev` | Geliştirme sunucusu (hot reload) |
| `npm run build` | `tsc --noEmit` + production bundle → `dist/` |
| `npm run preview` | `dist/` lokal önizleme (`build` sonrası) |

---

## Klasör yapısı

```
umutKervani/
├── public/                      # favicon vb.
├── src/
│   ├── main.tsx                 # Mount + provider sırası
│   ├── index.css                # Tailwind + tema + buton stilleri
│   ├── app/App.tsx              # Tüm route’lar
│   ├── features/
│   │   ├── auth/                # Login, AuthContext, ProtectedRoute, username
│   │   └── tespit/              # Liste, form, detay, PDF, taslak, sabitler
│   ├── shared/
│   │   ├── components/          # Layout, CheckboxGroup, UrgencyBadge, …
│   │   ├── utils/               # money, kayitNo, listSearch, supabaseError, …
│   │   ├── theme/               # Açık / koyu
│   │   └── toast/               # Bildirimler
│   ├── lib/supabase.ts          # Tek Supabase client
│   └── types/database.ts        # TespitFormu ve alt tipler
├── supabase/
│   ├── SETUP.sql                # Sıfırdan şema + RLS
│   └── ORNEK_VERI.sql           # Demo kayıtlar (isteğe bağlı)
├── .env.example
├── package.json
├── vite.config.ts
├── GELISTIRICI.md               # İsteğe bağlı derin özet
└── README.md                    # Bu dosya
```

Önemli tespit dosyaları:

| Dosya | Görev |
|-------|--------|
| `TespitListPage.tsx` | Liste, arama, filtre, sıralama, sayfalama |
| `TespitFormPage.tsx` | Yeni + düzenle |
| `TespitDetailPage.tsx` | Detay, sil, PDF |
| `printTespitPdf.ts` | PDF üretimi ve indirme |
| `formDraft.ts` | Yeni kayıt localStorage taslağı |
| `constants.ts` | Checkbox / aciliyet seçenekleri |
| `listSearch.ts` | Esnek isim / telefon / TC araması |

---

## Rotalar ve sayfa akışları

| URL | Sayfa | Not |
|-----|--------|-----|
| `/giris` | Login | Oturumsuz |
| `/` | Liste | Korumalı |
| `/kayit/yeni` | Yeni form | Korumalı |
| `/kayit/:kayitNo` | Detay | URL’de **kayıt no** (UUID değil) |
| `/kayit/:kayitNo/duzenle` | Düzenle | Korumalı |
| `*` | 404 | |

Eski `/tespit/...` yolları `/kayit/...` adresine yönlendirilir.

### Liste

1. Supabase’ten kayıtlar çekilir  
2. Client-side arama + aciliyet filtresi + sıralama  
3. Kart → detay  

### Form

1. Yeni: boş şablon veya taslak  
2. Düzenle: kayıt yüklenir  
3. Kaydet → doğrulama → insert/update  
4. Yeni kayıtta **İptal / Sil** taslağı temizler  

### Detay

Özet + bölümler · Düzenle · Sil · **PDF indir**

---

## Liste: arama ve sıralama

### Arama (`listSearch.ts`)

| Alan | Davranış |
|------|----------|
| İsim | Büyük/küçük harf ve boşluk fark etmez (`Ayşe Yılmaz` ≈ `ayşeyılmaz`) |
| Telefon | `+90`, `05…`, `539…`, boşluk/tire temizlenir; en az 3 hane |
| TC | En az **7** hane (kısa `539` TC ile karışmaz) |

Placeholder: *İsim, telefon veya TC ara…*

### Sıralama

1. Aciliyet artan: `0 → 1 → 2 → … → 7`  
2. Aynı aciliyette `created_at` azalan (en son eklenen önce)  

PC’de grid soldan sağa, telefonda yukarıdan aşağı aynı sırayı gösterir.

---

## PDF, form taslağı, oturum

### PDF (Storage yok)

Detaydaki **PDF indir**, kaydın güncel verisinden tarayıcıda A4 belge üretir (`html2canvas` + `jsPDF`) ve dosyayı indirir. Sunucuya yazılmaz; yer kaplamaz.

```
Detay → buildTespitPrintBody → gizli DOM → canvas → .pdf indir
```

### Yeni kayıt taslağı

| Durum | Sonuç |
|-------|--------|
| Yazarken / telefon ana ekran | Taslak `localStorage`’da kalır |
| Sekme kapanıp açılınca | Taslak geri yüklenir |
| **Kaydet** başarılı | Taslak silinir |
| **İptal / Sil** | Taslak + form temizlenir → liste |
| Düzenleme formu | Taslak kullanılmaz |

Anahtar: `uk-tespit-form-draft-v1` (sadece o cihaz / tarayıcı).

### Oturum

- Çıkış: header **Çıkış** (`signOut`) — sabit “otomatik çıkış timer” yok  
- `persistSession` + `autoRefreshToken`: tarayıcı kapansa genelde girişli kalır  
- Gizli pencere / başka cihaz: yeniden giriş  

---

## Kim hangi veriyi görür? (RLS)

`SETUP.sql` politikası: **giriş yapmış her kullanıcı** tüm `tespit_formlari` satırlarını okuyup yazabilir.

```
authenticated  →  select / insert / update / delete
anon           →  yok
```

Bu bilinçli bir **paylaşımlı ekip defteri** modelidir.  
`created_by` kim eklediğini tutar; “sadece sahibi görsün” kuralı yoktur.  
İleride kişiye özel yapmak için policy’ye `created_by = auth.uid()` eklenebilir.

---

## Domain kuralları

| Konu | Kural |
|------|--------|
| Aciliyet | `0` Belirlenecek, `1–6` derece/red, `7` Tek seferlik |
| Kayıt no | `YYYYMMDD-HHMMSS`; URL’de bu kullanılır |
| “Diğer” alanları | Çoğu `text[]` (birden fazla satır) |
| Hastalar | `hastalar` jsonb: `[{ adi, aciklama, engelli, engel_yuzdesi }]` |
| Kira | Ev mülkiyet “Kira” ise tutar gider.kira ile senkron |
| Tema | `data-theme` + `--uk-*` CSS değişkenleri |

Checkbox / aciliyet listeleri: `src/features/tespit/constants.ts`

---

## Supabase’e nasıl istek atılır?

Hepsi `import { supabase } from '../lib/supabase'` ile:

```ts
// Liste
supabase.from('tespit_formlari').select('...').order('aciliyet').order('created_at', { ascending: false })

// Ekle
supabase.from('tespit_formlari').insert(payload).select('kayit_no').single()

// Güncelle
supabase.from('tespit_formlari').update(payload).eq('id', id)

// Sil
supabase.from('tespit_formlari').delete().eq('id', id)

// Giriş
supabase.auth.signInWithPassword({ email, password })
```

SDK bunları PostgREST `GET/POST/PATCH/DELETE` çağrılarına çevirir; JWT header’a eklenir.

---

## Güvenlik

| Konu | Uygulama |
|------|----------|
| Kimlik | Supabase Auth (e-posta/şifre) |
| Frontend anahtarı | Sadece `anon` |
| Veri | RLS; girişsiz erişim yok |
| `.env` | `.gitignore`’da |
| `created_by` | Insert trigger → `auth.uid()` |
| PDF | İstemci; Storage’a yazılmaz |

---

## Örnek veri

Listeyi dolu görmek için SQL Editor’da `supabase/ORNEK_VERI.sql` çalıştırın.

- 12 demo kayıt (`ORNEK-…` kayıt no)
- Dolu / eksik / farklı aciliyet karışımı
- Tekrar çalıştırınca eski `ORNEK-%` satırları silinip yenilenir

Temizlemek için:

```sql
delete from public.tespit_formlari where kayit_no like 'ORNEK-%';
```

---

## GitHub + canlı site (Pages)

### Neden “sadece Pages açayım, push yeter” yetmez?

GitHub Pages **hazır HTML/CSS/JS** sunar. Bu proje **React + Vite** — yayınlanmadan önce `npm run build` ile derlenmesi gerekir. Pages tek başına TypeScript/React derlemez.

Bu yüzden: **`main`’e push → GitHub Actions otomatik `npm run build` yapar → Pages yayınlar.**  
Sen günlük işte sadece kodu push’larsın; site kendiliğinden güncellenir.

| Ne? | Nerede? |
|-----|---------|
| Kaynak kod (`src`…) | `main` — bunu push’larsın |
| Canlı site | Actions’ın ürettiği `dist` → Pages |
| `.env` | PC’nde; GitHub’a **gitmez** |
| Canlı env | Settings → Secrets → Actions |

`git status` sadece **değişen** dosyaları gösterir; diğerleri zaten commit’li.

Canlı: **https://osmandemir2533.github.io/umutkervani/** (`/#/giris` …)

---

### A) İlk kurulum (bir kez)

**1) Kodu gönder:**

```powershell
cd C:\Users\smndm\Desktop\umutKervani
git add .
git status
git commit -m "Pages: otomatik deploy + HashRouter"
git push
```

**2) Secrets** (Settings → Secrets and variables → Actions):

| Name | Value |
|------|--------|
| `VITE_SUPABASE_URL` | `.env` URL |
| `VITE_SUPABASE_ANON_KEY` | `.env` anon key |

**3) Pages** (Settings → Pages): Source → **GitHub Actions**

**4) Actions** → **Deploy GitHub Pages** yeşil olsun.

**5) Supabase** URL Configuration → Site URL: `https://osmandemir2533.github.io/umutkervani` (+ localhost redirect)

---

### B) Sonraki güncellemeler

```powershell
git add .
git commit -m "Ne değişti"
git push
```

Actions build+deploy eder. Lokal: `npm run dev` → `http://localhost:5173/#/giris`

---

## Sık hatalar

| Belirti | Çözüm |
|---------|--------|
| `Could not find the table … tespit_formlari` | `SETUP.sql` çalıştırılmamış |
| Giriş olmuyor | User e-postası `ad@gmail.com` mi? Auto Confirm? |
| Env değişmedi | `npm run dev` yeniden başlat |
| Boş liste | Kayıt yok veya filtre/arama dar; `ORNEK_VERI.sql` deneyin |
| PDF hata | Sayfayı yenileyip tekrar deneyin |
| Eski form taslağı | Formda **İptal / Sil** |
| Telefon araması bulamıyor | En az 3 hane yazın; `+90` / boşluk sorun olmaz |
| TC kısa numarayla geliyor | TC eşleşmesi ≥7 hane ister (bilinçli) |

Debug: DevTools → Network → `/rest/v1/tespit_formlari` ve Auth istekleri.

---

## Nereye bakarak geliştiririm?

| İstek | Dosya(lar) |
|-------|------------|
| Yeni form alanı | `constants` · `database.ts` · `formDefaults` · form/detay/PDF · gerekirse `SETUP.sql` |
| Yeni aciliyet | `constants` · `UrgencyBadge` · `index.css` · `SETUP.sql` check |
| Liste kartı / arama | `TespitListPage` · `listSearch.ts` |
| PDF alanı | `printTespitPdf.ts` |
| Giriş | `features/auth/*` |
| Hata metni | `supabaseError.ts` |
| Buton / tema | `index.css` |

**Şema:** Geliştirmede kaynak `SETUP.sql`. Canlı tablo doluysa `ALTER` gerekir; bu repoda bilinçli olarak tek SETUP dosyası vardır.

---

## İletişim

**Osman Demir**

[![Web Sitem](https://img.shields.io/badge/Web%20Site-1976d2?style=for-the-badge&logo=google-chrome&logoColor=white)](https://osmandemir2533.github.io/)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0a66c2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/osmandemir2533/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/osmandemir2533)



---

> • **Umut Kervanı Panel**, muhtaç tespit süreçlerini dijitalleştiren kurum içi bir paneldir.  
> • Frontend GitHub’da; veri ve kimlik **Supabase** üzerindedir — ayrı bir lokal backend yoktur.  
> • Aciliyet sıralı liste, esnek arama, PDF indirme ve form taslağı ile sahada kullanımı kolaylaştırır.  
> • İleride yeni modüllerle genişletilebilir.

---