# Geliştirici özeti — Umut Kervanı paneli

Bu dosya, projeye yeni giren yazılımcı arkadaşın **hızlıca hakim olması** içindir (dosya dosya tur).  
GitHub’da asıl doküman: [`README.md`](./README.md) — bu dosyayı repoya koymak zorunlu değil.  
Çalıştırma özeti: **§10**.

---

## 1) Büyük resim (30 saniye)

```
Tarayıcı (React SPA)
        │  HTTPS
        ▼
Supabase
  ├─ Auth  → kullanıcı oturumu (JWT)
  └─ Postgres + RLS → tespit_formlari tablosu
```

- **Backend kodu yok** (Express vb. yok).
- Tüm veri işlemleri `supabase.from('tespit_formlari').select/insert/update/delete` ile gider.
- Supabase arkada bunları **PostgREST** ile SQL’e çevirir (`GET/POST/PATCH/DELETE`). Sen elle HTTP yazmazsın; SDK yapar.

Giriş noktası: `src/main.tsx`

```
ThemeProvider → ToastProvider → AuthProvider → App (rotalar)
```

### Neden ayrı backend yok? / Supabase / GitHub

Bu proje **sadece frontend** reposudur. Express/.NET gibi lokal API yazılmaz.

| Konu | Açıklama |
|------|---------|
| GitHub / Pages | `npm run build` → `dist/` statik dosya. Host sadece HTML/JS/CSS sunar; “backend sunucu” çalıştırmaz. |
| Veri nereden? | Tarayıcı → `@supabase/supabase-js` → Supabase HTTPS (Auth + PostgREST + Postgres). |
| Backend kim? | Supabase BaaS. Sizin process’iniz değil; bulutta Auth + DB + RLS. |
| Front ↔ backend | Front UI; Supabase oturum (JWT) + `tespit_formlari` CRUD. RLS girişsiz erişimi keser. |
| Neden? | Az bakım, hızlı kurulum, PDF Storage şişirmemek, tek `SETUP.sql`. |

```
[ GitHub’daki React SPA ]
         │ JWT + HTTPS
         ▼
[ Supabase Auth + PostgreSQL ]
```

Giriş ekranında tema (açık/koyu) butonu **yok**; tema paneli Layout’ta.

**GitHub Pages:** `HashRouter` → `/#/giris`. Production `base`: `/umutkervani/`.  
`main` push → Actions otomatik `npm run build` + Pages. Detay: **§10b**.

---

## 2) Klasörler ne işe yarar?

### `src/app/`

- **`App.tsx`**: Tüm route’lar burada.
  - `/giris` → Login
  - `/` → Liste (ProtectedRoute içinde)
  - `/kayit/yeni`, `/kayit/:kayitNo`, `/kayit/:kayitNo/duzenle`
  - `*` → NotFoundPage

### `src/features/auth/` — kimlik

| Dosya | Ne yapar? |
|-------|-----------|
| `AuthContext.tsx` | Oturum state’i; `signIn` / `signOut`; Supabase `onAuthStateChange` dinler |
| `LoginPage.tsx` | Form UI |
| `ProtectedRoute.tsx` | User yoksa `/giris`’e atar |
| `username.ts` | `osmandemir` → `osmandemir@gmail.com` (ve tersi) |

### `src/features/tespit/` — asıl iş

| Dosya | Ne yapar? |
|-------|-----------|
| `TespitListPage.tsx` | Ana sayfa: ara, aciliyet filtresi, kartlar, sayfalama |
| `TespitFormPage.tsx` | Yeni + düzenle formu (uzun) |
| `TespitDetailPage.tsx` | Tek kayıt okuma / silme / doğrudan PDF indir |
| `printTespitPdf.ts` | HTML → html2canvas + jsPDF; `.pdf` dosyasını indirir (Storage yok) |
| `formDraft.ts` | Yeni kayıt taslağı: localStorage kaydet / yükle / sil |
| `constants.ts` | Checkbox seçenekleri, gelir/gider alanları, aciliyet listesi |
| `formDefaults.ts` | Boş form, boş gelir/gider, hasta normalize |

### `src/lib/`

| Dosya | Ne yapar? |
|-------|-----------|
| `supabase.ts` | Tek client instance; `.env` okur; session localStorage’da |

### `src/types/`

| Dosya | Ne yapar? |
|-------|-----------|
| `database.ts` | `TespitFormu`, `GelirDurumu`, `HastaKaydi` vb. TypeScript modelleri |

### `src/shared/` — ortak parçalar

```
shared/
  components/   Layout, CheckboxGroup, UrgencyBadge, LiveClock, NotFoundPage
  utils/        saf fonksiyonlar (UI’sız)
  theme/        açık/koyu
  toast/        sağ üst bildirim kutuları
```

### `supabase/`

| Dosya | Ne yapar? |
|-------|-----------|
| `SETUP.sql` | Sıfırdan tablo + RLS + trigger. Eski migration klasörü yok; tek dosya. |
| `ORNEK_VERI.sql` | Demo kayıtlar (tam / eksik / farklı aciliyet). SQL Editor’da çalıştır. |

---

## 2b) Projedeki **tüm** dosyalar (kısa kısa)

`node_modules/` hariç — her dosya ne işe yarar. Önemli olsun olmasın hepsi burada.

### Kök dizin

| Dosya | Ne yapar? |
|-------|-----------|
| `README.md` | GitHub / kurulum dokümanı (stack, .env, SETUP, güvenlik) |
| `GELISTIRICI.md` | Bu dosya — yazılımcıya proje turu |
| `package.json` | Bağımlılıklar + scriptler (`dev`, `build`, `preview`) |
| `package-lock.json` | Kilitlemiş npm sürümleri; `npm install` bunu kullanır |
| `.env.example` | Ortam değişkeni şablonu (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) |
| `.env` | Gerçek anahtarlar (git’e **gitme**; sen lokalde oluşturursun) |
| `index.html` | SPA kabuğu; font linkleri; `#root` mount noktası |
| `vite.config.ts` | Vite ayarı (React plugin vb.) |
| `tsconfig.json` | TypeScript derleyici ayarları (app kaynak kodu) |
| `tsconfig.node.json` | Vite config gibi Node tarafı TS ayarları |
| `.gitignore` | `node_modules`, `.env`, `dist` vb. commit dışı bırakır |

### `public/`

| Dosya | Ne yapar? |
|-------|-----------|
| `favicon.svg` | Tarayıcı sekmesi ikonu |

### `supabase/`

| Dosya | Ne yapar? |
|-------|-----------|
| `SETUP.sql` | Tablo, kolonlar, check constraint’ler, RLS politikaları, `updated_at` trigger |
| `ORNEK_VERI.sql` | 12 örnek kayıt (`ORNEK-…`); tekrar çalışınca eskiler silinip yenilenir |

### `src/` — giriş ve stil

| Dosya | Ne yapar? |
|-------|-----------|
| `main.tsx` | React’i `#root`’a basar; Theme → Toast → Auth → App sırası |
| `index.css` | Tailwind import + CSS değişkenleri (`--uk-*`) + aciliyet kart stilleri + mobil dock |
| `vite-env.d.ts` | Vite/`import.meta.env` tip tanımları (derleme için; runtime kod değil) |

### `src/app/`

| Dosya | Ne yapar? |
|-------|-----------|
| `App.tsx` | `BrowserRouter` + tüm `Route` tanımları |

### `src/lib/`

| Dosya | Ne yapar? |
|-------|-----------|
| `supabase.ts` | Tek `createClient` instance; env yoksa anlamlı hata |

### `src/types/`

| Dosya | Ne yapar? |
|-------|-----------|
| `database.ts` | `TespitFormu`, insert tipi, gelir/gider, hasta kaydı arayüzleri |

### `src/features/auth/`

| Dosya | Ne yapar? |
|-------|-----------|
| `AuthContext.tsx` | `user` / `loading`; `signIn` / `signOut`; oturum dinleyici |
| `LoginPage.tsx` | Kullanıcı adı + şifre formu; başarıda ana sayfaya gider |
| `ProtectedRoute.tsx` | Oturum yoksa `/giris`; yüklenirken kısa bekleme |
| `username.ts` | Kullanıcı adı ↔ sahte e-posta (`@gmail.com`) dönüşümü |

### `src/features/tespit/`

| Dosya | Ne yapar? |
|-------|-----------|
| `TespitListPage.tsx` | Liste, arama, aciliyet filtresi, sayfalama, kartlar |
| `TespitFormPage.tsx` | Yeni kayıt + düzenleme formu (tüm bölümler) |
| `TespitDetailPage.tsx` | Tek kayıt görüntüleme, özet, sil / düzenle / PDF indir |
| `printTespitPdf.ts` | `buildTespitPrintBody` + `downloadTespitPdf` — doğrudan `.pdf` indirme |
| `formDraft.ts` | `load/save/clearNewFormDraft` — yeni form taslağı (localStorage) |
| `constants.ts` | Checkbox seçenekleri, aciliyet etiketleri, gelir/gider alan listeleri |
| `formDefaults.ts` | Boş form şablonu; hasta satırı normalize |

### `src/shared/components/`

| Dosya | Ne yapar? |
|-------|-----------|
| `Layout.tsx` | Üst bar (logo, saat, tema, kullanıcı, çıkış) + mobil alt menü + `Outlet` |
| `CheckboxGroup.tsx` | Form checkbox grubu; “Diğer” metinleri; “Yok” diğerlerini kapatır |
| `UrgencyBadge.tsx` | Aciliyet etiketi + liste kartı arka plan sınıfı |
| `LiveClock.tsx` | Header’daki canlı tarih/saat |
| `NotFoundPage.tsx` | Bilinmeyen URL (`*`) için 404 sayfası |

### `src/shared/utils/`

| Dosya | Ne yapar? |
|-------|-----------|
| `array.ts` | `asStringArray` — DB’den gelen string/dizi karışıklığını `string[]` yapar |
| `money.ts` | Para parse, toplam, net bakiye, `₺` format |
| `kayitNo.ts` | Kayıt no üret / göster / eski `UK-` varyantları |
| `kayitPath.ts` | Detay ve düzenle route path’lerini üretir |
| `listSearch.ts` | Liste araması: isim bitişik/TR; tel +90/05/boşluk; TC kısa rakamla karışmaz |
| `supabaseError.ts` | Supabase hata kodlarını Türkçe başlık+açıklamaya çevirir |

### `src/shared/theme/`

| Dosya | Ne yapar? |
|-------|-----------|
| `ThemeContext.tsx` | Açık/koyu tema; `localStorage` + `data-theme` attribute |

### `src/shared/toast/`

| Dosya | Ne yapar? |
|-------|-----------|
| `ToastContext.tsx` | `notify(...)` ile sağ üst bildirim; otomatik kapanır |

### Bilerek yok / commit edilmez

| Şey | Neden |
|-----|--------|
| `node_modules/` | `npm install` ile gelir |
| `dist/` | `npm run build` çıktısı |
| Eski `supabase/migrations/` | Kaldırıldı; tek kaynak `SETUP.sql` |

---

## 3) `shared/utils` dosya dosya (detay)

### `array.ts` — `asStringArray`

Supabase’den bazen `text`, bazen `text[]` gelebilir (eski kayıt / tip değişimi).

```ts
asStringArray(value) → string[]
```

- Dizi ise → string’e map
- Tek string ise → `[string]`
- Boş/null → `[]`

Form/detay yüklerken “Diğer” alanlarında kullanılıyor.

### `money.ts`

| Fonksiyon | Mantık |
|-----------|--------|
| `parseMoneyInput` | `1.000` / `1000,5` gibi TR girişini `number` yapar |
| `sumRecord` | Gelir veya gider objesindeki tüm sayıları toplar |
| `toplamGider` | Gider toplamı; ev kira tutarıyla gider.kira’yı senkron tutar |
| `netBakiye` | gelir − gider |
| `formatTl` | `₺` gösterim (`tr-TR`) |

### `kayitNo.ts`

| Fonksiyon | Mantık |
|-----------|--------|
| `generateKayitNo` | `YYYYMMDD-HHMMSS` (UK öneki yok) |
| `formatKayitNo` | Eski `UK-` varsa gösterimde siler |
| `kayitNoLookupValues` | URL’den gelen no için `UK`’li/`UK`’siz varyantlar (eski kayıt bulmak için) |

### `kayitPath.ts`

```ts
kayitPath('20261125-103000')        → '/kayit/20261125-103000'
kayitPath('20261125-103000', true)  → '/kayit/20261125-103000/duzenle'
```

Detay/düzenle URL’sinde **UUID değil kayıt no** kullanılır. UUID gelirse hâlâ yedek arama var.

### `supabaseError.ts`

Ham İngilizce Supabase hatalarını Türkçe başlık + açıklamaya çevirir  
(ör. tablo yok → “SETUP.sql çalıştırın”).

---

## 4) Supabase’e nasıl istek atıyoruz?

Hepsi `import { supabase } from '../../lib/supabase'` ile.

### Okuma (liste) — `TespitListPage`

```ts
supabase
  .from('tespit_formlari')
  .select('id, kayit_no, adi_soyadi, ...')
  .order('aciliyet', { ascending: true })
  .order('created_at', { ascending: false })
  .limit(1000)
```

→ HTTP **GET** `/rest/v1/tespit_formlari?...`

### Tek kayıt (detay)

```ts
supabase.from('tespit_formlari').select('*').in('kayit_no', variants).maybeSingle()
// veya UUID ise: .eq('id', uuid)
```

### Ekleme (yeni form)

```ts
supabase.from('tespit_formlari').insert(payload).select('kayit_no').single()
```

→ **POST**

### Güncelleme

```ts
supabase.from('tespit_formlari').update(payload).eq('id', recordId)
```

→ **PATCH**

### Silme

```ts
supabase.from('tespit_formlari').delete().eq('id', row.id)
```

→ **DELETE**

### Giriş

```ts
supabase.auth.signInWithPassword({ email, password })
supabase.auth.signOut()
```

Header’a JWT otomatik eklenir; RLS `auth.uid()` ile çalışır.

---

## 5) Sayfa akışları

### Liste (`/`)

1. Mount → `select` ile kayıtları çek  
2. Client-side: arama (isim/TC) + aciliyet filtresi + sayfalama (9’lu)  
3. Kart tıklanınca `kayitPath(kayit_no)` ile detaya git  

### Form (`/kayit/yeni` veya `.../duzenle`)

1. State: `TespitFormuInsert` (`formDefaults` ile boş şablon)  
2. **Yeni kayıt:** `formDraft.ts` ile `localStorage` taslağı yüklenir / ~400ms debounce ile kaydedilir  
3. Düzenlemede kaydı çek → form doldur (taslak kullanılmaz)  
4. Kaydet → doğrulama → insert/update; insert başarılıysa `clearNewFormDraft()`  
5. **İptal / Sil** (yeni): confirm → taslağı sil → formu sıfırla → listeye dön  
6. Kira: ev bölümünde “Kira” seçilirse tutar gider.kira’ya kilitlenir  

### Detay (`/kayit/:kayitNo`)

1. Kayıt no ile bul  
2. Özet + bölümler  
3. Düzenle → form; Sil → confirm + delete  
4. **PDF indir** → `downloadTespitPdf(row)` (yeni sekme yok)  

### PDF indir (istemci, Storage yok)

**Neden böyle?** Her kayıt için PDF’i Supabase Storage’a koymak yer/maliyet şişirir. PDF **hiç saklanmaz**; ihtiyaç anında tarayıcıda üretilip indirilir.

```
Detay → downloadTespitPdf(row)
        │
        ▼
buildTespitPrintBody → gizli DOM (A4 HTML)
        │
        ▼
html2canvas → görüntü
        │
        ▼
jsPDF → umut-kervani-tespit-{kayitNo}.pdf  (doğrudan indirme)
```

- Paketler: `jspdf`, `html2canvas`
- Supabase’e / Storage’a yazılmaz
- Butonlar: `.uk-btn-pdf` / `.uk-btn-edit` / `.uk-btn-danger` (hover `index.css`)

### Form taslağı (yeni kayıt)

| Durum | Ne olur? |
|-------|----------|
| Yazarken / telefon ana ekrana | React state + `localStorage` taslağı kalır; kapanmaz |
| Chrome/sekme kapatıp açma | Taslak `localStorage`’dan geri yüklenir |
| Başarılı **Kaydet** | Taslak silinir |
| **İptal / Sil** | Taslak + form alanları silinir; listeye dönülür |
| Düzenleme formu | Taslak yok (doğrudan DB kaydı) |

Anahtar: `uk-tespit-form-draft-v1` (sadece bu cihaz / bu tarayıcı).

### Oturum (çıkış) nasıl?

- Çıkış **otomatik zamanlayıcı yok**; header’daki **Çıkış** → `supabase.auth.signOut()`.
- Oturum `localStorage`’da (`persistSession: true`, `autoRefreshToken: true`).
- Tarayıcıyı / telefonu kapatıp açınca genelde **hâlâ girişli** kalır (JWT yenilenir).
- Supabase JWT süresi dolup yenilenemezse (çok uzun süre, storage temizlendi) tekrar giriş gerekir.
- Farklı cihazda veya gizli pencerede oturum yok → giriş ister.

### Kim hangi veriyi görür?

RLS (`SETUP.sql`): **giriş yapmış her kullanıcı** tüm `tespit_formlari` satırlarını okuyup yazabilir.

```
authenticated + auth.uid() is not null  →  select / insert / update / delete
anon                                        →  yok
```

Bu panel **paylaşımlı ekip defteri**: `osman` ve `ayse` aynı listeyi görür.  
`created_by` kim eklediğini tutar ama “sadece sahibi görsün” filtresi **yok**.  
İleride kişiye özel yapmak için policy’ye `created_by = auth.uid()` eklenir.

---

## 6) Önemli domain kuralları

| Konu | Kural |
|------|--------|
| Aciliyet | `0` Belirlenecek, `1–6` derece, `7` Tek seferlik |
| Kayıt no | Tarih-saat; URL’de bu kullanılır |
| Diğer alanları | Çoğu `text[]` — birden fazla “Diğer” |
| Hastalar | `hastalar` jsonb: `[{ adi, aciklama, engelli, engel_yuzdesi }]` |
| Tema | `data-theme` + CSS değişkenleri (`--uk-*`) |

Sabit listeler: **`features/tespit/constants.ts`**  
Yeni checkbox seçeneği ekleyeceksen önce buraya yaz.

---

## 7) Ortak bileşenler / theme / toast (kısa kullanım)

| Parça | Kullanım |
|-------|----------|
| `Layout` | Header, mobil alt pill menü, `Outlet` |
| `CheckboxGroup` | Form checkbox’ları; tek/çoklu Diğer; Yok exclusive |
| `UrgencyBadge` | Renkli derece etiketi + kart CSS sınıfları |
| `LiveClock` | Layout header saati |
| `NotFoundPage` | Yanlış URL |
| `ThemeContext` | `useTheme()` → `theme` / `toggleTheme` |
| `ToastContext` | `notify('mesaj', 'success' \| 'error')` |

Dosya listesi için yukarıdaki **§2b** tablosuna bak.

---

## 8) Stil / tema

- Tailwind 4: `@import 'tailwindcss'` → `src/index.css`
- Marka renkleri: `--uk-green`, `--uk-sand`, aciliyet `--uk-u0`…`--uk-u7`
- Aksiyon butonları: `.uk-btn-primary`, `.uk-btn-pdf`, `.uk-btn-edit`, `.uk-btn-danger`, `.uk-btn-ghost` (hover/active)
- Fontlar: El Messiri (başlık), Manrope (gövde), Amiri (Arapça) — `index.html`

---

## 9) Değişiklik yaparken nereye bak?

| İstek | Dosya |
|-------|--------|
| Yeni form alanı | `constants` / `database.ts` / `formDefaults` / `TespitFormPage` / `SETUP.sql` / detay |
| Yeni aciliyet | `constants` + `UrgencyBadge` + `index.css` + `SETUP.sql` check |
| Liste kartında yeni satır | `TespitListPage` (+ select kolonları) |
| PDF’e yeni alan | `printTespitPdf.ts` (`buildTespitPrintBody`) |
| Yeni form taslağı | `formDraft.ts` + `TespitFormPage` |
| Buton hover | `index.css` (`.uk-btn-pdf` vb.) |
| Giriş / çıkış | `auth/*` + `lib/supabase.ts` (persistSession) |
| Kim ne görür | `SETUP.sql` RLS politikaları |
| Hata metni | `supabaseError.ts` |

**Şema değişince:** `SETUP.sql` güncelle (sıfır kurulum). Canlıda tablo zaten varsa ayrı `ALTER` gerekir; bu projede bilinçli olarak tek SETUP dosyası var.

---

## 10) Projeyi nasıl çalıştırırız?

### Gereksinimler

- **Node.js 20+** (LTS)
- **npm** (Node ile gelir)
- Supabase projesi + `SETUP.sql` çalıştırılmış olmalı
- En az bir Auth kullanıcısı (`ad@gmail.com`)

### İlk kurulum (bir kez)

```bash
# 1) Repoyu al
git clone <repo-url>
cd umutKervani

# 2) Bağımlılıklar
npm install

# 3) Ortam dosyası
# Windows PowerShell:
copy .env.example .env
# macOS / Linux:
# cp .env.example .env
```

`.env` içini doldur (Supabase → **Project Settings → API**):

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...   # anon public — service_role ASLA değil
```

Supabase SQL Editor’da `supabase/SETUP.sql` dosyasının **tamamını** çalıştır.  
Kullanıcı: **Authentication → Users → Add user** → e-posta `kullaniciadi@gmail.com`, Auto Confirm açık.

### npm scriptleri

| Komut | Ne yapar? |
|-------|-----------|
| `npm install` | `package.json` / `package-lock.json` bağımlılıklarını kurar |
| `npm run dev` | Vite geliştirme sunucusu → genelde `http://localhost:5173` |
| `npm run build` | Tip kontrol + production bundle → `dist/` (sen çalıştırırsın) |
| `npm run preview` | `dist/` lokal önizleme |
| `npm run deploy:pages` | İsteğe bağlı manuel; asıl yayın Actions ile |

```bash
npm run dev
```

Tarayıcıda `http://localhost:5173` aç. Girişte kullanıcı adı kısmına sadece `kullaniciadi` yazılır (`@gmail.com` kod ekler).

### Önemli pratik detaylar

| Konu | Detay |
|------|--------|
| `.env` değişince | `npm run dev` sürecini **durdurup yeniden başlat** (Vite env’i boot’ta okur) |
| `.env` git’e girmez | `.gitignore`’da; paylaşım için sadece `.env.example` |
| `service_role` | Frontend’e / GitHub’a **asla** koyma; RLS’i bypass eder |
| Port meşgul | Vite başka port açabilir (terminaldeki URL’ye bak) |
| Tip hatası | `npm run build` veya editör TS; `dev` her tipi engellemez |
| `node_modules` | Commit edilmez; klon sonrası mutlaka `npm install` |
| `dist/` | Build çıktısı; commit edilmez; deploy bunu yayınlar |
| Mobil test | Aynı Wi‑Fi’de `http://<bilgisayar-ip>:5173` (firewall izin verebilir) |
| Giriş formatı | Panel: `osmandemir` → Auth: `osmandemir@gmail.com` |
| Tablo yok hatası | `SETUP.sql` henüz çalışmamış |
| Boş liste | Normal; henüz kayıt yok |
| PDF | Detay → **PDF indir**; Storage’a yazılmaz |
| Form taslağı | Yeni kayıt `localStorage`’da; **İptal / Sil** temizler |
| Çıkış | Header **Çıkış**; otomatik zamanlı logout yok |
| Veri paylaşımı | Girişli her hesap aynı kayıtları görür (ekip paneli) |

### Geliştirirken sık bakılacak yerler

```
src/main.tsx          → uygulama mount + provider sırası
src/app/App.tsx       → rotalar
src/lib/supabase.ts   → tek client + env
src/features/tespit/  → liste / form / detay / PDF / taslak
src/features/auth/    → giriş / korumalı rota
supabase/SETUP.sql    → tablo + RLS (tek şema kaynağı)
src/index.css         → tema değişkenleri + buton stilleri
```

### Debug ipuçları

1. Tarayıcı **DevTools → Network**: `/rest/v1/tespit_formlari` ve Auth istekleri  
2. **401 / JWT yok** → oturum düşmüş; tekrar giriş  
3. **Tablo / column hatası** → `SETUP.sql` ile şema uyumsuz  
4. Console’da Supabase env uyarısı → `.env` boş veya yanlış  

### Production build (özet)

```bash
npm run build
npm run preview    # lokal kontrol (isteğe bağlı)
```

---

## 10b) GitHub’a ne gider? Canlı site nasıl güncellenir?

### Kavram

```
main’e push  →  kaynak kod (src…)
      │
      ▼
GitHub Actions  →  npm run build (Secrets’tan env)
      │
      ▼
GitHub Pages    →  canlı site
```

| Soru | Cevap |
|------|--------|
| Tüm dosyalar `git status`’ta mı? | Hayır — sadece **son commit’ten beri değişenler**. Diğerleri zaten repoda. |
| Sadece build mi push’larız? | Hayır — `main`’e **kaynak kod**. Build’i Actions yapar. |
| Pages tek başına yeter mi? | Hayır — React derlemez; Actions gerekir. |
| `.env`? | Push etme. Canlıda Secrets: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. |

Canlı: https://osmandemir2533.github.io/umutkervani/#/

### İlk kurulum

1. Push kaynak (`git add .` → `commit` → `push`)  
2. Secrets ekle  
3. Settings → Pages → Source: **GitHub Actions**  
4. Actions yeşil → site açılır  
5. Supabase Site URL ayarla  

### Her güncellemede

```powershell
git add .
git commit -m "Ne değişti"
git push
```

Actions otomatik build+deploy eder.

Detay: [`README.md`](./README.md) → “GitHub + canlı site”.

---

## 11) Hızlı kontrol listesi

- [ ] `npm install`
- [ ] `.env` dolu (`VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`)
- [ ] `SETUP.sql` çalıştırıldı
- [ ] (isteğe bağlı) `ORNEK_VERI.sql` ile demo kayıtlar
- [ ] Auth kullanıcısı var (`ad@gmail.com`)
- [ ] `npm run dev` → `localhost:5173`
- [ ] Giriş + liste + yeni kayıt dene
- [ ] `npm run build` hatasız

---

Özet cümle: **React ekranları + Supabase client; iş kuralları `features/tespit` içinde; ortak araçlar `shared/utils`; şema `SETUP.sql`; lokalde `npm run dev`.**

Sorun olursa önce Network sekmesinde `/rest/v1/tespit_formlari` isteğine ve Auth JWT’ye bak.
