# Claude Code — Düzeltme ve İyileştirme Talimatı
## HSI Medya Content Planner

Aşağıdaki sorunları mevcut kodu bozmadan, öncelik sırasına göre düzelt.

---

## 🔴 KRİTİK — Hemen Düzeltilmeli

---

### 1. Şifreler ve API Key açıkta — .env'e taşı

**Sorun:** Şifreler ve Apify token doğrudan kaynak kodda yazılı. Deploy edildiğinde herkes görebilir.

```js
// ŞU AN (tehlikeli):
const PASSWORDS = { admin: "admin2026", ekip: "ekip2026", mudur: "eserdeniz" };
const APIFY_TOKEN = "apify_api_..."; // .env dosyasına taşı
```

**Yapılacak:**
- Proje kökünde `.env` dosyası oluştur
- Şifreleri ve token'ı oraya taşı
- Kodda `process.env.VITE_ADMIN_PASSWORD` gibi referans et
- `.gitignore`'a `.env` ekle

```env
VITE_ADMIN_PASSWORD=admin2026
VITE_EKIP_PASSWORD=ekip2026
VITE_MUDUR_PASSWORD=eserdeniz
VITE_APIFY_TOKEN=apify_api_...
VITE_ANTHROPIC_API_KEY=...
```

---

### 2. Veri kalıcılığı yok — Supabase entegrasyonu

**Sorun:** Tüm veriler React state'te tutuluyor. Sayfa yenilendiğinde şunlar kayboluyor:
- Stok güncellemeleri
- Üretilen fikirler
- Telefon numaraları
- Mekan analizleri
- Onay durumları
- Anket sonuçları

**Yapılacak:** Supabase entegrasyonu — aşağıdaki tablolar:

```sql
-- Mekanlar (venues)
create table venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  concept text default '',
  stock int default 0,
  color text default '#7B68EE',
  phone text default '',
  venue_analysis text default '',
  ideas jsonb default '[]',
  intro_videos jsonb default '[]',
  reference_links jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Haftalık program (schedule)
create table schedule_slots (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  day text not null,
  venue_id uuid references venues(id),
  status text default 'taslak',
  note text default '',
  ekip_notu text default '',
  icerik_gonderildi boolean default false,
  icerik_onaylandi boolean default false,
  gonderilen_icerik text default '',
  created_at timestamptz default now()
);

-- Anket sonuçları (survey_results)
create table survey_results (
  id uuid primary key default gen_random_uuid(),
  venue_id uuid references venues(id),
  week_start date not null,
  score int check (score between 1 and 5),
  note text default '',
  sent_at timestamptz default now()
);
```

**Uygulama tarafında:**
- `useEffect` ile sayfa açılışında Supabase'den veri çek
- Her stok güncellemesi, onay durumu değişikliği, fikir üretimi anında Supabase'e yaz
- Gerçek zamanlı sync için `supabase.channel()` subscription ekle — ekip onay değiştirince admin anında görsün

---

### 3. Apify 5 paralel run açıyor — tek run'a topla

**Sorun:** Şu an 5 fikir için `Promise.all` ile 5 ayrı Apify run başlatılıyor. Her run ~10-15 saniye + Apify'de ayrı ücret.

```js
// ŞU AN (yanlış):
const ideasWithReels = await Promise.all(parsed.map(async (idea) => {
  const reels = await searchInstagramReels(tags, 4); // 5 ayrı run açılıyor
}));
```

**Yapılacak:** Tüm hashtag'leri tek bir Apify run'ında gönder, sonuçları fikir başına böl:

```js
// OLMASI GEREKEN:
// 1. Tüm hashtag'leri topla (tekrarları çıkar)
const allHashtags = [...new Set(parsed.flatMap(idea => idea.instagram_hashtags || []))];

// 2. Tek run'da hepsini çek
const allReels = await searchInstagramReels(allHashtags, 20); // tek run

// 3. Her fikre kendi hashtag'lerine uyan reels'leri eşleştir
const ideasWithReels = parsed.map(idea => {
  const tags = idea.instagram_hashtags || [];
  const matching = allReels.filter(reel =>
    tags.some(tag => 
      (reel.hashtags || []).includes(tag) || 
      (reel.caption || "").toLowerCase().includes(tag)
    )
  ).slice(0, 4);
  return { ...idea, instagramReels: matching.length > 0 ? matching : allReels.slice(0, 2) };
});
```

---

## 🟠 ÖNEMLİ — Bu Hafta Düzeltilmeli

---

### 4. Randevu WA butonu telefon numarasını kullanmıyor

**Sorun:** Her mekana telefon numarası eklendi ama "Randevu WA" butonu hâlâ `wa.me/?text=...` formatında — kime gönderileceği belli değil.

```js
// ŞU AN:
<a href={`https://wa.me/?text=${encodeURIComponent(waMsg)}`}>

// OLMASI GEREKEN:
<a href={v.phone 
  ? `https://wa.me/${v.phone.replace(/[^0-9]/g,"")}?text=${encodeURIComponent(waMsg)}`
  : `https://wa.me/?text=${encodeURIComponent(waMsg)}`
}>
```

Telefon varsa direkt o kişiye açsın, yoksa mevcut davranış korunsun.

---

### 5. `updateSlotNote` ve `updateSlotField` aynı fonksiyon — birini sil

**Sorun:** İkisi birebir aynı şeyi yapıyor, kod karışıklığı.

```js
// Bunların ikisi de aynı:
const updateSlotNote = (day, venueId, field, val) => { ... }
const updateSlotField = (day, venueId, field, val) => { ... }
```

**Yapılacak:** `updateSlotNote` fonksiyonunu sil, tüm çağrıları `updateSlotField` ile değiştir.

---

### 6. `eye` ikonu tanımlı değil — eklenmeli

**Sorun:** Müdür rolünde sidebar'da `<Icon name="eye">` çağrılıyor ama `Icon` bileşeninde `eye` ikonu yok, `null` render ediyor.

**Yapılacak:** `Icon` bileşenindeki `icons` nesnesine şunu ekle:

```js
eye: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
  <circle cx="12" cy="12" r="3"/>
</svg>,
```

---

### 7. AI max_tokens 1500 — yetersiz, 2500'e çıkar

**Sorun:** 5 fikir + her birinde konsept + çekim tarzı + hashtag = 1500 token'ı kolayca aşıyor. Yanıt ortada kesilirse JSON parse hatası veriyor.

**Yapılacak:** `callClaude` ve `callClaudeWithImages` fonksiyonlarında:

```js
// ŞU AN:
max_tokens: 1500

// OLMASI GEREKEN:
max_tokens: 2500
```

---

### 8. Login ekranı hint metni güvenlik açığı

**Sorun:** `"Admin · Ekip · Müdür şifresi"` yazısı rollerin adlarını açıkça gösteriyor.

**Yapılacak:** Nötr bir metinle değiştir:

```js
// ŞU AN:
"Admin · Ekip · Müdür şifresi"

// OLMASI GEREKEN:
"Erişim şifrenizi girin"
```

---

### 9. `<a>` içinde `<button>` — HTML hatası

**Sorun:** "WA'da Aç" gibi butonlar `<a>` içinde `<button>` kullanıyor. HTML spec'e göre geçersiz.

**Yapılacak:** `<button>` kaldır, stili `<a>` üzerine taşı:

```js
// ŞU AN (yanlış):
<a href="..."><button style={s.btn("success")}>WA'da Aç</button></a>

// OLMASI GEREKEN:
<a href="..." style={{...s.btn("success"), textDecoration:"none"}}>WA'da Aç</a>
```

Bu pattern tüm dosyada geçen her `<a><button>` ikilisinde düzeltilmeli.

---

## 🟡 ORTA — Claude Code Aşamasında

---

### 10. Schedule yenilenince onay durumları kayboluyor

**Sorun:** `generateSchedule` her çalıştığında mevcut onay durumları, notlar ve ekip notları sıfırlanıyor. `venues` state'i değişince (stok güncellemesi gibi) schedule de resetleniyor.

**Yapılacak:**
- `generateSchedule` yalnızca "Yeniden Oluştur" butonuna basıldığında ve ilk açılışta çalışsın
- `venues` değişikliği schedule'ı tetiklemesin
- `useEffect` dependency array'ini `[]` olarak bırak, `generateSchedule`'ı `useCallback`'ten çıkar
- Supabase entegrasyonu sonrası schedule Supabase'den yüklensin, state'ten değil

---

### 11. VenueModal ve diğer büyük componentler App içinde tanımlı

**Sorun:** `VenueModal`, `AddVenueModal`, `OnayPanel`, `MudurPanel`, `AnketPanel`, `AnketPanel` — hepsi `App()` fonksiyonu içinde tanımlı. Her state değişiminde yeniden oluşturuluyor, gereksiz re-render.

**Yapılacak:** Tüm bu componentleri `App()` dışına taşı, gerekli prop'ları parametre olarak geç:

```js
// App dışında:
const VenueModal = ({ venue, onClose, updateVenue, showToast, loading, setLoading, s }) => { ... }
const OnayPanel = ({ venues, schedule, role, ... }) => { ... }
// vs.

// App içinde sadece render:
export default function App() {
  // state'ler burada
  return (
    <div>
      {selectedVenue && <VenueModal venue={...} onClose={...} ... />}
    </div>
  );
}
```

---

### 12. Haftalık program mantığı — 14 mekan için slot sayısı yetersiz

**Sorun:** 5 gün × günde 2 mekan = 10 slot. 14 mekandan 4'ü her hafta programa giremez — en düşük stoklu 10 mekan seçiliyor, geri kalanlar defalarca atlanıyor.

**Seçenekler:**
- A) Günde 3 mekan yap → 15 slot → tüm mekanlar girer
- B) Haftada 3 aktif gün, günde 5 mekan → 15 slot
- C) 14 mekanı 2 haftada bir döndüren rotasyon sistemi

**Önerilen:** Seçenek A — günde 3 slot. `generateSchedule` içindeki `i < 2` koşulunu `i < 3` yap ve layout'u buna göre güncelle.

---

### 13. Anket sonuçları localStorage'a yedekle (Supabase öncesi geçici çözüm)

**Sorun:** Anket puanları state'te tutuluyor, sayfa kapanınca kayboluyor. Supabase'e geçilene kadar geçici çözüm.

**Yapılacak:**

```js
// AnketPanel içinde:
const [anketResults, setAnketResults] = useState(() => {
  try {
    const saved = localStorage.getItem("hsi_anket_results");
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
});

// Her güncelleme sonrası:
useEffect(() => {
  localStorage.setItem("hsi_anket_results", JSON.stringify(anketResults));
}, [anketResults]);
```

---

### 14. Stok güncellemesi gerçek zamanlı değil — debounce ekle

**Sorun:** Stok input'unda her tuş vuruşunda `updateVenue` çağrılıyor ve ileride Supabase'e yazılacak — her harf için bir DB isteği oluşacak.

**Yapılacak:** 500ms debounce ekle:

```js
// Stok input'unda:
onChange={e => {
  const n = parseInt(e.target.value);
  if (!isNaN(n) && n >= 0) {
    // UI'ı anında güncelle
    setLocalStock(n);
    // DB'yi 500ms sonra güncelle
    clearTimeout(stockDebounce.current);
    stockDebounce.current = setTimeout(() => updateVenue(venue.id, { stock: n }), 500);
  }
}}
```

---

## 📋 Uygulama Sırası

```
1. .env dosyası oluştur → şifreleri ve token'ı taşı          (5 dk)
2. eye ikonu ekle                                             (2 dk)
3. updateSlotNote'u sil, updateSlotField'e birleştir          (5 dk)
4. max_tokens 1500 → 2500                                     (1 dk)
5. Randevu WA butonuna telefon entegrasyonu                   (5 dk)
6. <a><button> → <a> düzeltmesi (tüm dosyada)                 (10 dk)
7. Login hint metni                                           (1 dk)
8. Apify tek run'a topla                                      (20 dk)
9. localStorage anket yedekleme                               (10 dk)
10. Supabase entegrasyonu                                     (2-3 saat)
11. Schedule sıfırlanma sorunu (Supabase sonrası)             (30 dk)
12. Component'leri dışarı çıkar                               (1 saat)
13. Günde 3 slot                                              (15 dk)
14. Stok debounce (Supabase sonrası)                          (10 dk)
```

---

## ⚠️ Dikkat Edilecekler

- Supabase entegrasyonu sırasında **mevcut INITIAL_VENUES verisini** Supabase'e seed olarak yükle — ilk açılışta boş gelmesin
- `.env` değişkenlerini Vercel/Netlify dashboard'unda da tanımlamayı unutma
- Apify token'ı `.env`'e taşıdıktan sonra bu token'ı **rotate et** — zaten kaynak kodda göründüğü için artık güvensiz sayılır, Apify dashboard'undan yenisini üret
- Component'leri dışarı çıkarırken `s` (styles objesi) App içinde tanımlı olduğu için ya global'e taşı ya da prop olarak geç — yoksa erişim hatası alırsın

---

*HSI Medya Content Planner — Düzeltme Talimatı — Mart 2026*
