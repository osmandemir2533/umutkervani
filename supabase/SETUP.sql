-- =============================================================================
-- Umut Kervanı — sıfırdan kurulum (tek dosya)
-- =============================================================================
-- Nasıl:
-- 1) Supabase'de yeni proje aç (bölge: Frankfurt / Central EU — Almanya)
-- 2) SQL Editor > New query > bu dosyanın tamamını yapıştır > Run
-- 3) Authentication > Providers > Email açık olsun
-- 4) Authentication > Users > Add user:
--      e-posta: kullaniciadi@gmail.com   şifre: ...
--      (panelde sadece "kullaniciadi" yazılır)
-- 5) Project Settings > API:
--      Project URL     → VITE_SUPABASE_URL
--      anon public     → VITE_SUPABASE_ANON_KEY
--      (service_role'ü asla .env / frontend'e koymayın)
-- 6) Proje kökünde .env yazın, npm run dev
-- =============================================================================

create extension if not exists "pgcrypto";

-- Eski tabloyu temiz kurulum için kaldır
drop table if exists public.tespit_formlari cascade;

create table public.tespit_formlari (
  id uuid primary key default gen_random_uuid(),

  -- Üst bilgiler
  kayit_no text,
  tc_kimlik text not null default '',
  adi_soyadi text not null default '',
  mahalle text,
  gorusulen_kisi text,
  gorusulen_yakinlik text,
  telefon text,
  adres_durumu text,

  -- Checkbox bölümleri
  magduriyet text[] not null default '{}',
  magduriyet_diger text,
  acil_ihtiyac text[] not null default '{}',
  acil_ihtiyac_diger text[] not null default '{}',
  yardim_kurumlari text[] not null default '{}',
  yardim_stk_adi text,
  yardim_kurumlari_diger text[] not null default '{}',
  yardim_turleri text[] not null default '{}',
  yardim_turleri_diger text[] not null default '{}',
  mal_varligi text[] not null default '{}',
  mal_varligi_diger text[] not null default '{}',
  ev_esyalari text[] not null default '{}',
  ev_esyalari_diger text[] not null default '{}',

  -- Ev
  ev_mulkiyet text,
  ev_mulkiyet_diger text,
  kira_tutari numeric check (kira_tutari is null or kira_tutari >= 0),
  ev_durum text[] not null default '{}',
  ev_durum_diger text,
  ev_tipi text,
  ev_tipi_diger text,
  ev_ozellik text[] not null default '{}',
  ev_ozellik_diger text[] not null default '{}',
  oda_sayisi text,

  -- Gelir / gider (JSON)
  gelir jsonb not null default '{}'::jsonb,
  gider jsonb not null default '{}'::jsonb,

  -- Sağlık
  saglik_durumlari text[] not null default '{}',
  saglik_diger text[] not null default '{}',
  hastalar jsonb not null default '[]'::jsonb,
  devamli_hasta_sayisi integer check (devamli_hasta_sayisi is null or devamli_hasta_sayisi >= 0),
  hasta_adi text,
  saglik_aciklama text,
  tibbi_cihaz_gerekli boolean not null default false,
  tibbi_mudahale_gerekli boolean not null default false,
  engel_yuzdesi numeric check (engel_yuzdesi is null or (engel_yuzdesi >= 0 and engel_yuzdesi <= 100)),
  kronik_hasta_sayisi integer,

  -- Sonuç
  dusunceler text,
  -- 0 = Belirlenecek, 1–6 = aciliyet, 7 = tek seferlik
  aciliyet integer not null default 0 check (aciliyet between 0 and 7),
  vakif_gorevlisi text,
  tespit_tarihi date,

  -- Sistem
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tespit_formlari_aciliyet_idx on public.tespit_formlari (aciliyet);
create index tespit_formlari_mahalle_idx on public.tespit_formlari (mahalle);
create index tespit_formlari_adi_idx on public.tespit_formlari (adi_soyadi);
create index tespit_formlari_tc_idx on public.tespit_formlari (tc_kimlik);
create index tespit_formlari_created_at_idx on public.tespit_formlari (created_at desc);

create unique index tespit_formlari_kayit_no_uidx
  on public.tespit_formlari (kayit_no)
  where kayit_no is not null and btrim(kayit_no) <> '';

-- updated_at otomatik
create or replace function public.uk_set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tespit_formlari_set_updated_at on public.tespit_formlari;
create trigger tespit_formlari_set_updated_at
  before update on public.tespit_formlari
  for each row
  execute function public.uk_set_updated_at();

-- created_by: giriş yapan kullanıcı (client manipülasyonuna karşı)
create or replace function public.uk_set_created_by()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is not null then
    new.created_by = auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists tespit_formlari_set_created_by on public.tespit_formlari;
create trigger tespit_formlari_set_created_by
  before insert on public.tespit_formlari
  for each row
  execute function public.uk_set_created_by();

-- Güvenlik: RLS
alter table public.tespit_formlari enable row level security;
alter table public.tespit_formlari force row level security;

-- Anon (girişsiz) erişimi yok; sadece authenticated
revoke all on table public.tespit_formlari from anon, public;
grant select, insert, update, delete on table public.tespit_formlari to authenticated;

drop policy if exists "Giris yapanlar okuyabilir" on public.tespit_formlari;
create policy "Giris yapanlar okuyabilir"
  on public.tespit_formlari for select
  to authenticated
  using (auth.uid() is not null);

drop policy if exists "Giris yapanlar ekleyebilir" on public.tespit_formlari;
create policy "Giris yapanlar ekleyebilir"
  on public.tespit_formlari for insert
  to authenticated
  with check (auth.uid() is not null);

drop policy if exists "Giris yapanlar guncelleyebilir" on public.tespit_formlari;
create policy "Giris yapanlar guncelleyebilir"
  on public.tespit_formlari for update
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

drop policy if exists "Giris yapanlar silebilir" on public.tespit_formlari;
create policy "Giris yapanlar silebilir"
  on public.tespit_formlari for delete
  to authenticated
  using (auth.uid() is not null);

/*
 * وَآتَى الْمَالَ عَلَىٰ حُبِّهِ ذَوِي الْقُرْبَىٰ وَالْيَتَامَىٰ وَالْمَسَاكِينَ
 * "Malı, sevgisine rağmen akrabaya, yetimlere, yoksullara verir." (Bakara 2/177)
 */
