# HSI Medya — Content Planner
## Proje Dokümantasyonu

---

## İçindekiler

1. [Proje Özeti](#1-proje-özeti)
2. [Mekanlar](#2-mekanlar)
3. [Roller ve Şifreler](#3-roller-ve-şifreler)
4. [Özellikler](#4-özellikler)
5. [Onay Akışı](#5-onay-akışı)
6. [Stok Barem Sistemi](#6-stok-barem-sistemi)
7. [AI Sistemi](#7-ai-sistemi)
8. [Memnuniyet Anketi](#8-memnuniyet-anketi)
9. [Gelecek Geliştirme Planı](#9-gelecek-geliştirme-planı)
10. [Otomasyon — Stok Sayımı](#10-otomasyon--stok-sayımı)
11. [n8n — Anket Otomasyonu](#11-n8n--anket-otomasyonu)
12. [Maliyet Planı](#12-maliyet-planı)
13. [Şifreler](#13-şifreler)
14. [Kaynak Kod](#14-kaynak-kod)

---

## 1. Proje Özeti

HSI Medya'nın 14 yemek sektörü mekanı için geliştirilmiş içerik yönetim platformu. Her haftaki Instagram Reels çekim programını yönetir; AI ile viral fikir üretir, mekan sahipleriyle koordinasyonu WhatsApp üzerinden sağlar ve üç farklı kullanıcı rolüyle takip imkânı sunar.

**Teknoloji:** React (JSX), Claude API (claude-sonnet-4-20250514), Browser Canvas API

**Çalışma prensibi:** Haftalık 3 çekim günü × 14 mekan → AI destekli program → ekip aramaları → mekan onayları → içerik gönderimi → admin onayı → yayın

---

## 2. Mekanlar

| # | Mekan | Konsept | Renk |
|---|-------|---------|------|
| 1 | Mikado Restaurant | — | #E8503A |
| 2 | Harvey Burger | — | #7B68EE |
| 3 | Doğu Unlu Mamülleri | — | #34C759 |
| 4 | Batura Cafe | — | #F4A623 |
| 5 | Sultan Sofrası | Hatay yöresel yemekler | #C0392B |
| 6 | Ege Döner | — | #48BFAB |
| 7 | Kuban Kuruyemiş | — | #E8A0BF |
| 8 | Şenöz Fırın | — | #D4871E |
| 9 | Antochia Döner | — | #9B7FBA |
| 10 | Sütlü Kavurma | — | #2C3E6B |
| 11 | Süleyman Usta Döner | — | #8B4513 |
| 12 | İSTE Çiftlik | Hatay yöresel ürünler | #5C7A4E |
| 13 | Sezai Usta | Kebap mangal | #E67E22 |
| 14 | Musta Döner | — | #4A7C8E |

> Konsept alanı boş olan mekanlarda AI, yüklenen tanıtım videolarını analiz ederek konsepti kendisi öğrenir.

Her mekan için ayrıca **telefon numarası** (`905XXXXXXXXX` formatında) kaydedilebilir. Bu numara memnuniyet anketi göndermek ve randevu WP mesajları için kullanılır.

---

## 3. Roller ve Şifreler

| Rol | Şifre | Yetki |
|-----|-------|-------|
| Admin | `admin2026` | Tam yetki — tüm sekmeler, mekan yönetimi, içerik onaylama, program kesinleştirme, anket yönetimi |
| Ekip | `ekip2026` | Onay paneli — randevu durumu güncelleme, içerik seçme ve WP gönderimi |
| Müdür / Patron | `eserdeniz` | Salt okunur — KPI takibi, haftalık program, stok durumu |

---

## 4. Özellikler

### 4.1 Mekan Yönetimi (Admin)
- Mekan ekleme ve silme
- Renk seçimi
- Konsept düzenleme
- Stok güncelleme
- **Telefon numarası ekleme** (anket ve WP gönderimi için)

### 4.2 Tanıtım Videoları
Her mekana 3–5 adet kendi videosu yüklenebilir. Claude bu videoların karelerini görsel olarak analiz eder:
- Mutfak türü ve öne çıkan yemekler
- Mekan estetiği ve dekor tarzı
- Hedef kitle
- Çekim tarzı
- Marka kişiliği

Analiz tamamlanınca mekan kartında **✅ AI Tanıyor** rozeti görünür.

### 4.3 Referans Viral Videolar
Instagram/TikTok'tan indirilen viral videolar yüklenebilir veya link + açıklama olarak eklenebilir.

### 4.4 AI ile Viral Fikir Üretimi
Her fikir: başlık, konsept, çekim tarzı, viral sebebi, müzik trendi ve 3 platform arama linki (Google Reels, TikTok, YouTube Shorts).

### 4.5 Haftalık Program
- Stok sayısı en az olan mekanlar öncelikli
- Haftada 3 çekim günü
- Her gün 2 mekan
- Admin dilediği zaman yeniden oluşturabilir veya manuel değiştirebilir

### 4.6 Memnuniyet Anketi (Admin)
Ayrı sekme. Tüm mekan sahiplerine WP üzerinden haftalık memnuniyet anketi gönderilir. Detaylar Bölüm 8'de.

### 4.7 Paylaşım
- WhatsApp Grubu: haftalık program mesajı
- E-posta: hsimedya@gmail.com
- Tüm onaylar tamamlanmadan gönderme uyarısı

---

## 5. Onay Akışı

```
⬜ Taslak          → AI program üretir
📞 Aranıyor        → Ekip mekanı arar
✅ Onaylandı       → Mekan sahibi kabul eder
📤 İçerik Gönderildi → Ekip fikir seçer, WP ile mekan sahibine iletir
🔒 Kesinleşti      → Admin onaylar
→ Program WP Grubuna ve Mail olarak gönderilir
```

**Ertelendi (❌):** O gün müsait olmayan mekan için gün değiştirilir, akış başa döner.

### Ekip Panelinde İçerik Gönderimi
1. Mekan kartında AI fikirleri listelenir
2. Checkbox ile gönderilecek fikirler seçilir
3. "İçerikleri Gönder" butonuna basılır
4. WhatsApp açılır, seçilen fikirler formatlanmış mesaj olarak gönderilir
5. Kart "📤 İçerik gönderildi" olarak işaretlenir

### Admin Panelinde Onay
- Gönderim yapılan kartlarda "✅ Onayla" ve "❌ Geri Al" butonları çıkar
- "🔒 Kesinleşti" butonu yalnızca adminde bulunur

### Müdür / Patron Paneli (Salt Okunur)
- Randevu onay oranı (%), İçerik onay oranı (%)
- Ertelenen randevu sayısı, Düşük stok uyarı sayısı
- 3 ilerleme barı, haftalık çekim tablosu, mekan stok durumu

---

## 6. Stok Barem Sistemi

Yayın frekansı haftada 3 içerik olduğundan stok eşikleri buna göre ayarlanmıştır.

| Stok | Durum | Renk |
|------|-------|------|
| 0 | KRİTİK | Kırmızı |
| 1–3 | DÜŞÜK | Turuncu |
| 4–6 | ORTA | Sarı |
| 7+ | YETERLİ | Yeşil |

Düşük stok uyarıları (≤3) sidebar'da anlık gösterilir ve haftalık paylaşım mesajına otomatik eklenir.

---

## 7. AI Sistemi

### Teknik Detaylar
- **Model:** claude-sonnet-4-20250514
- **Max tokens:** 1500
- **Video kare çıkarma:** Browser Canvas API ile her videodan 3–4 kare
- **Görsel analiz:** Base64 frame'ler direkt Claude'a iletilir

### Mekan Analizi Akışı
1. 3–5 tanıtım videosu yüklenir
2. Her videodan 3 kare çıkarılır (Canvas API)
3. Kareler base64 olarak Claude'a gönderilir
4. Mutfak türü, menü, estetik, hedef kitle, çekim tarzı, marka kişiliği analiz edilir
5. Analiz mekana kaydedilir — sonraki tüm fikirler buna dayalı üretilir

### Kritik Kural
Prompt'ta zorunlu kural: "Mekan analizinden çıkan mutfak türü, yemek çeşidi ve estetik tarzı AYNEN kullan. Farklı bir mutfak/konsept önerme."

### Instagram Bağlantısı (Gelecek)
Claude Code aşamasında Apify entegrasyonuyla her mekana bağlı Instagram hesabının son 20 Reels'i çekilecek. Görüntülenme, müzik, hashtag, yayın saati ve format bilgisi AI'ın fikir üretimine dahil edilecek.

---

## 8. Memnuniyet Anketi

### Özet
Admin panelinde ayrı bir **"Anket"** sekmesi bulunur. Her mekan sahibine haftanın sonunda WhatsApp üzerinden memnuniyet anketi gönderilir. Sonuçlar sistem içinde kaydedilir, Müdür/Patron panelinde haftalık ortalama görünür.

### Kurulum
1. Her mekan için **Mekanlar sekmesinden** telefon numarası girilir (`905XXXXXXXXX` formatında, başında + olmadan)
2. Anket sekmesine geçilir

### Anket Sekmesi — Özellikler

**Özet Kartları:**
- Toplam mekan sayısı
- Numara girilmiş mekan sayısı
- Bu hafta gönderilen anket sayısı
- Haftalık ortalama puan

**Mekan Listesi:**
- Her satırda mekan adı, telefon numarası ve "Anket Gönder" butonu
- Numara girilmemiş mekanlarda kırmızı uyarı
- **Hepsine Gönder** butonu: tüm numarası olan mekanlara sırayla mesaj açar

**Sonuç Girişi:**
- Anket gönderildikten sonra satırda 1–5 puan butonu açılır
- Opsiyonel yorum alanı
- Puan girilince "✅ Kaydedildi" rozeti

**Özet Tablo:**
- Puan girilmiş tüm mekanlar renk kodlu kart olarak listelenir (yeşil ≥4 · sarı 3 · kırmızı ≤2)

### Anket WP Mesajı

```
Merhaba [Mekan Adı]! 👋

HSI Medya olarak bu haftaki hizmetimizi değerlendirmenizi isteriz.

Lütfen 1–5 arasında puanlayın:
1️⃣ Çok kötü
2️⃣ Kötü
3️⃣ Orta
4️⃣ İyi
5️⃣ Çok iyi

Varsa yorumunuzu da yazabilirsiniz.

_HSI Medya Ekibi_ 🎬
```

### Telefon Numarası Formatı
Türkiye numaraları için: `905XXXXXXXXX` (örn: `905321234567`)
Uluslararası format kullanılır, başına `+` veya `0` eklenmez.

---

## 9. Gelecek Geliştirme Planı

### Faz 1 — Claude Code'a Geçiş
- Supabase entegrasyonu (kalıcı veri — şu an sayfa yenilenince sıfırlanıyor)
- Fikir favorileme sistemi
- Stok otomatik düşme (çekim tamamlandı → stok +1)

### Faz 2 — Apify + Instagram Verisi
Her mekana `@instagramHesabi` alanı eklenecek. Apify ile haftalık otomatik veri çekimi:
- Son 20 Reels: görüntülenme, like, yorum, kaydetme
- Kullanılan müzikler ve hashtag'ler
- Yayın günü/saati optimizasyonu
- En iyi performans gösteren format analizi
- Rakip hesap analizi

**Kapasite:** 14 mekan × 3 çekim/hafta = ~168 istek/ay → Apify $49/ay planı yeterli

### Faz 3 — Otomasyon
- Cuma cron job (otomatik mail + WP mesajı)
- Tarayıcı bildirimleri
- WhatsApp Business API tam entegrasyonu

### Faz 4 — Analitik
- Performans takibi
- AI'ın geçmişten öğrenerek daha isabetli öneriler üretmesi
- Anket sonuçlarının trend analizi

---

## 10. Otomasyon — Stok Sayımı

### Renk Mantığı
- **Renksiz (default):** Henüz yapılmadı → STOK olarak sayılır
- **Herhangi bir renk:** Yapıldı / onaylandı / gönderildi → stok sayılmaz

### Hedef: Launch Agent ile Tam Otomasyon

```
Harici diski taktın
   ↓ macOS diski tanır (otomatik)
Launch Agent tetiklenir (1–2 saniye)
   ↓
Python script çalışır
S/ klasöründeki her mekan klasörü taranır
xattr komutu ile dosya renk etiketi okunur
Renksiz dosyalar stok olarak sayılır
   ↓
Sonuç: { "Mikado Restaurant": 4, "Harvey Burger": 7, ... }
   ↓
Supabase'e yazılır → Site açıldığında stoklar güncel
```

**Klasör yapısı:**
```
S/
  Mikado Restaurant/
  Harvey Burger/
  ... (isimler sitedeki mekan isimleriyle birebir eşleşmeli)
```

---

## 11. n8n — Anket Otomasyonu

Manuel anket gönderiminin otomatik versiyonu. Mevcut sistemde anket manuel tetikleniyor; n8n ile tam otomasyona geçilecek.

### Akış

```
Her Pazartesi — n8n cron job tetiklenir
   ↓
14 mekan sahibine WP anketi gönderilir
   ↓
Mekan sahibi yanıt verir (1–5 puan + opsiyonel yorum)
   ↓
n8n yanıtı otomatik yakalar
   ↓
Google Sheets'e işlenir:
  - Mekan adı · Tarih · Puan (1–5) · Yorum · Trend
```

### Maliyet
- n8n self-hosted: Ücretsiz
- n8n cloud: ~$20/ay
- Google Sheets: Ücretsiz

---

## 12. Maliyet Planı

| Servis | Açıklama | Maliyet |
|--------|----------|---------|
| Claude API | Fikir üretimi + video analizleri | ~$30–50/ay |
| Apify | Instagram scraper, 14 mekan × 3/hafta | $49/ay |
| Supabase | Veritabanı, auth, realtime sync | Ücretsiz |
| Vercel | Hosting | Ücretsiz |
| SendGrid | Mail gönderimi | Ücretsiz |
| n8n | Anket otomasyonu (self-hosted) | Ücretsiz |
| WhatsApp Business API | Mekan iletişimi | ~$10–20/ay |
| **Toplam** | | **~$90–120/ay** |

> Apify baştan alınmalı. Onsuz sistem gerçek viral veriye erişemiyor.

---

## 13. Şifreler

| Rol | Şifre |
|-----|-------|
| Admin | `admin2026` |
| Ekip | `ekip2026` |
| Müdür / Patron | `eserdeniz` |

---

## 14. Kaynak Kod

Aşağıda projenin tüm React kaynak kodu yer almaktadır (1009 satır). Antigravity platformuna direkt deploy edilebilir.

```jsx
import { useState, useEffect, useCallback } from "react";

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const COLORS = ["#E8503A","#7B68EE","#34C759","#FF9500","#48BFAB","#E8A0BF","#8B1A2F","#5C7A4E","#2C3E6B","#D4871E","#C0392B","#9B7FBA","#E67E22","#4A7C8E"];
const DAYS   = ["Pazartesi","Salı","Çarşamba","Perşembe","Cuma"];

// durum: taslak → aranıyor → onaylandi → ertelendi → kesinlesti
const STATUS = {
  taslak:     { label:"Taslak",       color:"#555",    bg:"#55555518",  border:"#55555533",  icon:"⬜" },
  aranıyor:   { label:"Aranıyor",     color:"#FF9500", bg:"#FF950018",  border:"#FF950033",  icon:"📞" },
  onaylandi:  { label:"Onaylandı",    color:"#34C759", bg:"#34C75918",  border:"#34C75933",  icon:"✅" },
  ertelendi:  { label:"Ertelendi",    color:"#FF3B30", bg:"#FF3B3018",  border:"#FF3B3033",  icon:"❌" },
  kesinlesti: { label:"Kesinleşti",   color:"#7B68EE", bg:"#7B68EE18",  border:"#7B68EE33",  icon:"🔒" },
};

const PASSWORDS = { admin: "admin2026", ekip: "ekip2026", mudur: "eserdeniz" };

const INITIAL_VENUES = [
  { id:1,  name:"Mikado Restaurant",   concept:"", stock:7,  color:"#E8503A", phone:"", introVideos:[], referenceLinks:[], venueAnalysis:"", ideas:[] },
  { id:2,  name:"Harvey Burger",       concept:"", stock:3,  color:"#7B68EE", phone:"", introVideos:[], referenceLinks:[], venueAnalysis:"", ideas:[] },
  { id:3,  name:"Doğu Unlu Mamülleri", concept:"", stock:11, color:"#34C759", phone:"", introVideos:[], referenceLinks:[], venueAnalysis:"", ideas:[] },
  { id:4,  name:"Batura Cafe",         concept:"", stock:2,  color:"#F4A623", phone:"", introVideos:[], referenceLinks:[], venueAnalysis:"", ideas:[] },
  { id:5,  name:"Sultan Sofrası",      concept:"Hatay yöresel yemekler", stock:5, color:"#C0392B", phone:"", introVideos:[], referenceLinks:[], venueAnalysis:"", ideas:[] },
  { id:6,  name:"Ege Döner",           concept:"", stock:8,  color:"#48BFAB", phone:"", introVideos:[], referenceLinks:[], venueAnalysis:"", ideas:[] },
  { id:7,  name:"Kuban Kuruyemiş",     concept:"", stock:1,  color:"#E8A0BF", phone:"", introVideos:[], referenceLinks:[], venueAnalysis:"", ideas:[] },
  { id:8,  name:"Şenöz Fırın",         concept:"", stock:6,  color:"#D4871E", phone:"", introVideos:[], referenceLinks:[], venueAnalysis:"", ideas:[] },
  { id:9,  name:"Antochia Döner",      concept:"", stock:4,  color:"#9B7FBA", phone:"", introVideos:[], referenceLinks:[], venueAnalysis:"", ideas:[] },
  { id:10, name:"Sütlü Kavurma",       concept:"", stock:9,  color:"#2C3E6B", phone:"", introVideos:[], referenceLinks:[], venueAnalysis:"", ideas:[] },
  { id:11, name:"Süleyman Usta Döner", concept:"", stock:2,  color:"#8B4513", phone:"", introVideos:[], referenceLinks:[], venueAnalysis:"", ideas:[] },
  { id:12, name:"İSTE Çiftlik",        concept:"Hatay yöresel ürünler", stock:10, color:"#5C7A4E", phone:"", introVideos:[], referenceLinks:[], venueAnalysis:"", ideas:[] },
  { id:13, name:"Sezai Usta",          concept:"Kebap mangal", stock:3, color:"#E67E22", phone:"", introVideos:[], referenceLinks:[], venueAnalysis:"", ideas:[] },
  { id:14, name:"Musta Döner",         concept:"", stock:6,  color:"#4A7C8E", phone:"", introVideos:[], referenceLinks:[], venueAnalysis:"", ideas:[] },
];

function getWeekDates() {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day===0?-6:1);
  const monday = new Date(today); monday.setDate(diff);
  return DAYS.map((d,i) => {
    const date = new Date(monday); date.setDate(monday.getDate()+i);
    return { day:d, date:date.toLocaleDateString("tr-TR",{day:"2-digit",month:"2-digit"}) };
  });
}

// ── ICONS ─────────────────────────────────────────────────────────────────────
const Icon = ({ name, size=18 }) => {
  const icons = {
    camera:   <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>,
    calendar: <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    whatsapp: <svg width={size} height={size} fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
    mail:     <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
    copy:     <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
    sparkle:  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/></svg>,
    plus:     <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    trash:    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
    stock:    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    link:     <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
    check:    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>,
    warning:  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    edit:     <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    close:    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    analyze:  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>,
    phone:    <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81 19.79 19.79 0 01.06 2.18 2 2 0 012.03 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
    lock:     <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
    note:     <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    user:     <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    instagram:<svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>,
  };
  return icons[name]||null;
};

// ── STOCK BADGE ───────────────────────────────────────────────────────────────
const StockBadge = ({ stock }) => {
  const color = stock===0?"#FF3B30":stock<=3?"#FF9500":stock<=6?"#FFCC00":"#34C759";
  const label = stock===0?"KRİTİK":stock<=3?"DÜŞÜK":stock<=6?"ORTA":"YETERLİ";
  return <span style={{background:color+"22",color,border:`1px solid ${color}44`,padding:"2px 8px",borderRadius:20,fontSize:10,fontWeight:700,letterSpacing:1}}>{stock} · {label}</span>;
};

// ── STATUS BADGE ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const s = STATUS[status]||STATUS.taslak;
  return <span style={{background:s.bg,color:s.color,border:`1px solid ${s.border}`,padding:"3px 8px",borderRadius:6,fontSize:11,fontWeight:700}}>{s.icon} {s.label}</span>;
};

// ── AI CALLS ──────────────────────────────────────────────────────────────────
async function callClaude(prompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1500,messages:[{role:"user",content:prompt}]}),
  });
  const data = await res.json();
  return data.content?.map(b=>b.text||"").join("\n")||"";
}
async function callClaudeWithImages(textPrompt, frames) {
  const content=[...frames.map(f=>({type:"image",source:{type:"base64",media_type:f.mtype,data:f.data}})),{type:"text",text:textPrompt}];
  const res = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1500,messages:[{role:"user",content}]}),
  });
  const data = await res.json();
  return data.content?.map(b=>b.text||"").join("\n")||"";
}
async function extractFrames(file, count=4) {
  return new Promise(resolve=>{
    const video=document.createElement("video"),canvas=document.createElement("canvas"),ctx=canvas.getContext("2d"),url=URL.createObjectURL(file),frames=[];
    video.src=url; video.muted=true;
    video.onloadedmetadata=()=>{
      const dur=video.duration; canvas.width=480; canvas.height=Math.round(480*(video.videoHeight/video.videoWidth))||270;
      const times=Array.from({length:count},(_,i)=>Math.max(0.5,(dur/(count+1))*(i+1)));
      let done=0;
      const capture=t=>{video.currentTime=t;video.onseeked=()=>{ctx.drawImage(video,0,0,canvas.width,canvas.height);frames.push({data:canvas.toDataURL("image/jpeg",0.7).split(",")[1],mtype:"image/jpeg"});done++;done<times.length?capture(times[done]):(URL.revokeObjectURL(url),resolve(frames));};};
      capture(times[0]);
    };
    video.onerror=()=>{URL.revokeObjectURL(url);resolve([]);};
  });
}

// ── LOGIN SCREEN ──────────────────────────────────────────────────────────────
const LoginScreen = ({ onLogin }) => {
  const [pw, setPw] = useState(""); const [err, setErr] = useState(false);
  const tryLogin = () => {
    if(pw===PASSWORDS.admin){ onLogin("admin"); }
    else if(pw===PASSWORDS.ekip){ onLogin("ekip"); }
    else if(pw===PASSWORDS.mudur){ onLogin("mudur"); }
    else { setErr(true); setTimeout(()=>setErr(false),2000); }
  };
  return (
    <div style={{minHeight:"100vh",background:"#0A0A0F",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',system-ui,sans-serif"}}>
      <div style={{background:"#111118",border:"1px solid #1E1E30",borderRadius:16,padding:40,width:340,textAlign:"center"}}>
        <div style={{fontSize:28,marginBottom:8}}>🎬</div>
        <div style={{fontSize:18,fontWeight:800,color:"#fff",marginBottom:4}}>HSI Medya</div>
        <div style={{fontSize:12,color:"#555",marginBottom:28}}>Content Planner</div>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&tryLogin()} placeholder="Şifre gir..." style={{background:"#0A0A0F",border:`1px solid ${err?"#FF3B30":"#1E1E30"}`,borderRadius:8,padding:"10px 14px",color:"#E8E8F0",fontSize:14,width:"100%",outline:"none",marginBottom:12,boxSizing:"border-box"}} autoFocus/>
        {err&&<div style={{color:"#FF3B30",fontSize:12,marginBottom:10}}>Yanlış şifre</div>}
        <button onClick={tryLogin} style={{background:"#7B68EE",color:"#fff",border:"none",borderRadius:8,padding:"10px 0",width:"100%",fontSize:14,fontWeight:700,cursor:"pointer"}}>Giriş Yap</button>
        <div style={{fontSize:11,color:"#333",marginTop:16}}>Admin · Ekip · Müdür şifresi</div>
      </div>
    </div>
  );
};

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function App() {
  const [role, setRole] = useState(null); // null | "admin" | "ekip"
  const [venues, setVenues] = useState(INITIAL_VENUES);
  const [activeTab, setActiveTab] = useState("onay");
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [addModal, setAddModal] = useState(false);
  // schedule: { "Pazartesi": [{venueId, status, note, ekipNotu}], ... }
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState({});
  const [copied, setCopied] = useState(null);
  const [toast, setToast] = useState(null);
  const weekDates = getWeekDates();

  const showToast = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3500); };
  const updateVenue = (id, patch) => setVenues(prev=>prev.map(v=>v.id===id?{...v,...patch}:v));

  // ── GENERATE SCHEDULE ────────────────────────────────────────────────────────
  const generateSchedule = useCallback(() => {
    const sorted = [...venues].sort((a,b)=>a.stock-b.stock);
    const ns = {}; let idx=0;
    DAYS.forEach(day=>{
      ns[day]=[];
      for(let i=0;i<2;i++){ if(sorted[idx]){ ns[day].push({venueId:sorted[idx].id, status:"taslak", note:"", ekipNotu:""}); idx++; } }
    });
    setSchedule(ns);
    showToast("Program oluşturuldu! Ekip onay sürecini başlatabilirsiniz.");
  },[venues]);

  useEffect(()=>{ generateSchedule(); },[]);

  // ── UPDATE SLOT STATUS ───────────────────────────────────────────────────────
  const updateSlotStatus = (day, venueId, status) => {
    setSchedule(prev=>({ ...prev, [day]: prev[day].map(s=>s.venueId===venueId?{...s,status}:s) }));
  };
  const updateSlotNote = (day, venueId, field, val) => {
    setSchedule(prev=>({ ...prev, [day]: prev[day].map(s=>s.venueId===venueId?{...s,[field]:val}:s) }));
  };
  const updateSlotField = (day, venueId, field, val) => {
    setSchedule(prev=>({ ...prev, [day]: prev[day].map(s=>s.venueId===venueId?{...s,[field]:val}:s) }));
  };
  const swapVenueInSlot = (day, venueId, newVenueId) => {
    setSchedule(prev=>({ ...prev, [day]: prev[day].map(s=>s.venueId===venueId?{...s,venueId:parseInt(newVenueId),status:"taslak",note:"",ekipNotu:""}:s) }));
  };

  // ── SCHEDULE STATS ───────────────────────────────────────────────────────────
  const allSlots = Object.values(schedule).flat();
  const confirmed = allSlots.filter(s=>s.status==="kesinlesti").length;
  const approved  = allSlots.filter(s=>s.status==="onaylandi").length;
  const postponed = allSlots.filter(s=>s.status==="ertelendi").length;
  const total     = allSlots.length;
  const readyToSend = allSlots.length>0 && allSlots.every(s=>s.status==="kesinlesti"||s.status==="onaylandi");

  // ── BUILD MESSAGES ───────────────────────────────────────────────────────────
  const buildScheduleMessage = () => {
    const lines=["📅 *HAFTALIK ÇEKİM PROGRAMI*\n"];
    weekDates.forEach(({day,date})=>{
      const slots=(schedule[day]||[]).filter(s=>s.status!=="ertelendi");
      lines.push(`*${day} ${date}*`);
      slots.forEach((s,i)=>{ const v=venues.find(vv=>vv.id===s.venueId); if(v) lines.push(`  ${i+1}. ${v.name} ${STATUS[s.status]?.icon||""}`); });
      lines.push("");
    });
    const low=venues.filter(v=>v.stock<=3).map(v=>`⚠️ ${v.name}: ${v.stock} video`);
    if(low.length){ lines.push("*⚠️ DÜŞÜK STOK*"); low.forEach(l=>lines.push(l)); }
    lines.push("\n_hsi medya_");
    return lines.join("\n");
  };

  // WA message for venue owner
  const buildVenueWAMessage = (venue, day, date) =>
    `Merhaba ${venue.name}! 👋\n\nHSI Medya olarak *${day} ${date}* tarihinde size ait çekim yapmak istiyoruz.\n\nUygun olur mu? 🎬\n\n_HSI Medya Ekibi_`;

  const lowStockVenues = venues.filter(v=>v.stock<=3);
  const scheduleMsg = buildScheduleMessage();

  // ── STYLES ───────────────────────────────────────────────────────────────────
  const s = {
    app:     {minHeight:"100vh",background:"#0A0A0F",color:"#E8E8F0",fontFamily:"'DM Sans',system-ui,sans-serif",display:"flex"},
    sidebar: {width:220,background:"#0F0F1A",borderRight:"1px solid #1E1E30",padding:"24px 0",display:"flex",flexDirection:"column",flexShrink:0},
    navItem: (a)=>({display:"flex",alignItems:"center",gap:10,padding:"10px 20px",cursor:"pointer",color:a?"#fff":"#666",background:a?"#1A1A2E":"transparent",borderLeft:`3px solid ${a?"#7B68EE":"transparent"}`,fontSize:13,fontWeight:a?600:400,transition:"all 0.15s"}),
    main:    {flex:1,overflow:"auto",padding:28},
    btn:     (v="primary")=>({display:"inline-flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:8,border:"none",cursor:"pointer",fontSize:12,fontWeight:600,transition:"all 0.15s",
      ...(v==="primary"?{background:"#7B68EE",color:"#fff"}:
          v==="ghost"  ?{background:"transparent",color:"#888",border:"1px solid #2A2A3E"}:
          v==="danger" ?{background:"#FF3B3022",color:"#FF3B30",border:"1px solid #FF3B3033"}:
          v==="success"?{background:"#34C75922",color:"#34C759",border:"1px solid #34C75933"}:
          v==="warn"   ?{background:"#FF950022",color:"#FF9500",border:"1px solid #FF950033"}:
          v==="purple" ?{background:"#7B68EE22",color:"#7B68EE",border:"1px solid #7B68EE33"}:
                        {background:"#1A1A2E",color:"#aaa"})
    }),
    input:   {background:"#0A0A0F",border:"1px solid #1E1E30",borderRadius:8,padding:"8px 12px",color:"#E8E8F0",fontSize:13,width:"100%",outline:"none"},
    card:    (color)=>({background:"#111118",border:"1px solid #1E1E30",borderRadius:12,padding:18,cursor:"pointer",transition:"all 0.15s",borderTop:`3px solid ${color}`}),
  };

  // ── VENUE DETAIL MODAL ────────────────────────────────────────────────────────
  const VenueModal = ({ venue, onClose }) => {
    const [section, setSection] = useState("intro");
    const [editConcept, setEditConcept] = useState(false);
    const [conceptVal, setConceptVal] = useState(venue.concept);
    const [newLink, setNewLink] = useState(""); const [newDesc, setNewDesc] = useState("");

    const handleIntroUpload = (e) => {
      const files=Array.from(e.target.files).slice(0,5-(venue.introVideos||[]).length);
      if(!files.length){showToast("Maks 5 video","error");return;}
      updateVenue(venue.id,{introVideos:[...(venue.introVideos||[]),...files.map(f=>({id:Date.now()+Math.random(),file:f,name:f.name,url:URL.createObjectURL(f)}))]});
      showToast(`${files.length} video eklendi!`);
    };
    const handleRefUpload = (e) => {
      const files=Array.from(e.target.files);
      updateVenue(venue.id,{referenceLinks:[...(venue.referenceLinks||[]),...files.map(f=>({id:Date.now()+Math.random(),file:f,name:f.name,url:URL.createObjectURL(f),isLocal:true,desc:""}))]});
      showToast(`${files.length} referans eklendi!`);
    };
    const analyzeVenue = async () => {
      if(!(venue.introVideos||[]).length){showToast("Önce video yükle","error");return;}
      setLoading(p=>({...p,[`a_${venue.id}`]:true})); showToast("Analiz ediliyor...");
      try {
        let allFrames=[];
        for(const v of venue.introVideos.slice(0,5)){ if(v.file){ const fr=await extractFrames(v.file,3); allFrames=[...allFrames,...fr]; } }
        const analysis=allFrames.length>0
          ?await callClaudeWithImages(`Bu videolar bir restorana ait. Analiz et: 1)Mutfak türü 2)Öne çıkan yemekler 3)Mekan estetiği 4)Hedef kitle 5)Çekim tarzı 6)Marka kişiliği. Kısa yaz.`,allFrames)
          :await callClaude(`"${venue.name}" restoranı için genel analiz yap`);
        updateVenue(venue.id,{venueAnalysis:analysis});
        showToast("✅ Analiz tamamlandı!");
      } catch(e){showToast("Hata","error");}
      setLoading(p=>({...p,[`a_${venue.id}`]:false}));
    };
    const generateIdeas = async () => {
      setLoading(p=>({...p,[venue.id]:true}));
      try {
        let videoAn="";
        for(const ref of (venue.referenceLinks||[]).filter(r=>r.file)){
          const fr=await extractFrames(ref.file,3);
          if(fr.length){const a=await callClaudeWithImages("Bu viral video: çekim stili, içerik, neden viral olmuş? 3-4 cümle.",fr); videoAn+=`\n${ref.name}: ${a}`;}
        }
        const ctx=venue.venueAnalysis?`\nMekan analizi:\n${venue.venueAnalysis}`:venue.concept?`\nKonsept: ${venue.concept}`:"";
        const refCtx=videoAn?`\n\nReferans videolar:\n${videoAn}`:"";
        const result=await callClaude(`"${venue.name}" için viral Reels fikirleri üret.${ctx}${refCtx}\n\nKural: Analizdeki mutfak türüne birebir uy.\n\n5 fikir, SADECE JSON:\n[{"baslik":"","konsept":"","cekim_tarzi":"","viral_sebebi":"","muzik_trendi":"","ilham_google":"","ilham_tiktok":"","ilham_youtube":""}]\nAçıklamalar Türkçe, ilham_* İngilizce.`);
        let parsed=[];
        try{parsed=JSON.parse(result.replace(/```json|```/g,"").trim());}catch{parsed=[{baslik:"Sonuç",konsept:result,cekim_tarzi:"",viral_sebebi:"",muzik_trendi:"",ilham_google:"",ilham_tiktok:"",ilham_youtube:""}];}
        updateVenue(venue.id,{ideas:parsed}); showToast(`${parsed.length} fikir üretildi!`);
      } catch(e){showToast("Hata","error");}
      setLoading(p=>({...p,[venue.id]:false}));
    };

    const tabs=[{id:"intro",label:"📹 Tanıtım"},{id:"refs",label:"🔗 Referans"},{id:"ideas",label:"✨ Fikirler"}];
    return (
      <div style={{position:"fixed",inset:0,background:"#000b",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
        <div style={{background:"#111118",border:"1px solid #2A2A3E",borderRadius:16,maxWidth:660,width:"100%",maxHeight:"88vh",overflow:"hidden",display:"flex",flexDirection:"column"}} onClick={e=>e.stopPropagation()}>
          <div style={{padding:"18px 22px",borderBottom:"1px solid #1E1E30",display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
                <div style={{width:11,height:11,borderRadius:"50%",background:venue.color}}/>
                <div style={{fontSize:17,fontWeight:800,color:"#fff"}}>{venue.name}</div>
                <StockBadge stock={venue.stock}/>
              </div>
              {editConcept?<div style={{display:"flex",gap:8}}><input value={conceptVal} onChange={e=>setConceptVal(e.target.value)} style={{...s.input,fontSize:12}}/><button onClick={()=>{updateVenue(venue.id,{concept:conceptVal});setEditConcept(false);showToast("Güncellendi");}} style={{...s.btn("success"),padding:"6px 10px",flexShrink:0}}><Icon name="check" size={12}/></button></div>
                :<div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:12,color:"#666"}}>{venue.concept||"Konsept yok — video yükle"}</span><button onClick={()=>setEditConcept(true)} style={{background:"none",border:"none",color:"#555",cursor:"pointer",padding:2}}><Icon name="edit" size={12}/></button></div>}
            </div>
            <button onClick={onClose} style={{...s.btn("ghost"),padding:"6px 10px"}}><Icon name="close" size={13}/></button>
          </div>
          <div style={{padding:"8px 22px",borderBottom:"1px solid #1E1E30",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:11,color:"#666"}}>Stok:</span>
              <input type="number" min={0} value={venue.stock} onChange={e=>{const n=parseInt(e.target.value);if(!isNaN(n)&&n>=0)updateVenue(venue.id,{stock:n});}} style={{...s.input,width:60,padding:"4px 8px"}}/>
              <span style={{fontSize:11,color:"#555"}}>video</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}>
              <Icon name="phone" size={13}/>
              <input type="tel" value={venue.phone||""} onChange={e=>updateVenue(venue.id,{phone:e.target.value})} placeholder="Mekan sahibi telefon (905XXXXXXXXX)" style={{...s.input,padding:"4px 8px",minWidth:220}}/>
            </div>
          </div>
          <div style={{display:"flex",borderBottom:"1px solid #1E1E30",padding:"0 22px"}}>
            {tabs.map(t=><button key={t.id} onClick={()=>setSection(t.id)} style={{background:"none",border:"none",padding:"11px 14px",cursor:"pointer",fontSize:12,fontWeight:section===t.id?700:400,color:section===t.id?"#7B68EE":"#666",borderBottom:`2px solid ${section===t.id?"#7B68EE":"transparent"}`}}>{t.label}</button>)}
          </div>
          <div style={{flex:1,overflow:"auto",padding:22}}>
            {section==="intro"&&<div>
              <div style={{fontSize:12,color:"#666",lineHeight:1.6,marginBottom:14}}>3-5 mekana ait video yükle → AI analiz ederek konsepti öğrenir</div>
              {(venue.introVideos||[]).length<5&&<label style={{display:"block",background:"#0A0A0F",border:"2px dashed #2A2A3E",borderRadius:10,padding:20,textAlign:"center",cursor:"pointer",marginBottom:12}}><div style={{fontSize:28,marginBottom:6}}>🎬</div><div style={{fontSize:13,color:"#7B68EE",fontWeight:700,marginBottom:3}}>Tanıtım Videoları Yükle</div><div style={{fontSize:11,color:"#555"}}>Maks 5 video</div><input type="file" accept="video/*" multiple onChange={handleIntroUpload} style={{display:"none"}}/></label>}
              {(venue.introVideos||[]).map((v,i)=><div key={i} style={{background:"#0A0A0F",border:"1px solid #1E1E30",borderRadius:8,padding:"8px 12px",marginBottom:6,display:"flex",alignItems:"center",gap:10}}><div style={{fontSize:18}}>🎬</div><div style={{flex:1,fontSize:12,fontWeight:600,color:"#34C759"}}>{v.name}</div><button onClick={()=>updateVenue(venue.id,{introVideos:venue.introVideos.filter((_,ii)=>ii!==i)})} style={{...s.btn("danger"),padding:"4px 8px"}}><Icon name="trash" size={12}/></button></div>)}
              {(venue.introVideos||[]).length>0&&<div style={{marginTop:12}}>
                <button onClick={analyzeVenue} disabled={loading[`a_${venue.id}`]} style={s.btn(venue.venueAnalysis?"ghost":"primary")}><Icon name="analyze" size={14}/>{loading[`a_${venue.id}`]?"Analiz ediliyor...":venue.venueAnalysis?"Yeniden Analiz":"🔍 AI ile Analiz Et"}</button>
                {venue.venueAnalysis&&<div style={{background:"#0A0A0F",border:"1px solid #34C75933",borderLeft:"3px solid #34C759",borderRadius:8,padding:14,marginTop:10}}><div style={{fontSize:10,fontWeight:700,color:"#34C759",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:6}}>✅ AI Bu Mekanı Tanıyor</div><div style={{fontSize:12,color:"#bbb",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{venue.venueAnalysis}</div></div>}
              </div>}
            </div>}
            {section==="refs"&&<div>
              <label style={{display:"block",background:"#0A0A0F",border:"2px dashed #2A2A3E",borderRadius:10,padding:18,textAlign:"center",cursor:"pointer",marginBottom:12}}><div style={{fontSize:24,marginBottom:4}}>⬆️</div><div style={{fontSize:13,color:"#7B68EE",fontWeight:700}}>Viral Video Yükle</div><div style={{fontSize:11,color:"#555"}}>İndirdiğin Instagram/TikTok videoları</div><input type="file" accept="video/*" multiple onChange={handleRefUpload} style={{display:"none"}}/></label>
              <div style={{background:"#0A0A0F",border:"1px solid #1E1E30",borderRadius:10,padding:14,marginBottom:12}}>
                <input value={newLink} onChange={e=>setNewLink(e.target.value)} placeholder="Link..." style={{...s.input,marginBottom:8}}/><input value={newDesc} onChange={e=>setNewDesc(e.target.value)} placeholder="İçerik açıklaması..." style={{...s.input,marginBottom:8}}/><button onClick={()=>{if(!newLink.trim())return;updateVenue(venue.id,{referenceLinks:[...(venue.referenceLinks||[]),{id:Date.now(),url:newLink.trim(),desc:newDesc.trim()}]});setNewLink("");setNewDesc("");}} style={s.btn()}><Icon name="plus" size={14}/> Ekle</button>
              </div>
              {(venue.referenceLinks||[]).map((ref,i)=><div key={i} style={{background:"#0A0A0F",border:"1px solid #1E1E30",borderRadius:8,padding:"8px 12px",marginBottom:6,display:"flex",gap:10,alignItems:"center"}}><div style={{fontSize:16}}>{ref.isLocal?"🎬":"🔗"}</div><div style={{flex:1,overflow:"hidden"}}><div style={{fontSize:12,fontWeight:600,color:ref.isLocal?"#34C759":"#7B68EE",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ref.isLocal?ref.name:ref.url}</div>{ref.desc&&<div style={{fontSize:11,color:"#666",marginTop:2}}>{ref.desc}</div>}</div><button onClick={()=>updateVenue(venue.id,{referenceLinks:(venue.referenceLinks||[]).filter((_,ii)=>ii!==i)})} style={{...s.btn("danger"),padding:"4px 8px"}}><Icon name="trash" size={12}/></button></div>)}
            </div>}
            {section==="ideas"&&<div>
              {!venue.venueAnalysis&&<div style={{background:"#FF950012",border:"1px solid #FF950033",borderRadius:8,padding:10,fontSize:12,color:"#FF9500",marginBottom:12}}>⚠️ Tanıtım videosu yükleyip analiz ettirirsen fikirler daha isabetli olur.</div>}
              <button onClick={generateIdeas} disabled={loading[venue.id]} style={{...s.btn(),marginBottom:14}}><Icon name="sparkle" size={14}/>{loading[venue.id]?"Üretiliyor...":(venue.ideas||[]).length>0?"Yeniden Üret":"AI ile Viral Fikirler Üret"}</button>
              {(venue.ideas||[]).map((idea,i)=><div key={i} style={{background:"#0A0A0F",border:"1px solid #1E1E30",borderRadius:10,padding:14,marginBottom:8,borderLeft:"3px solid #7B68EE"}}>
                <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:8}}><span style={{color:"#7B68EE",marginRight:6}}>#{i+1}</span>{idea.baslik}</div>
                {idea.konsept&&<div style={{fontSize:12,color:"#bbb",lineHeight:1.6,marginBottom:8}}>{idea.konsept}</div>}
                <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
                  {idea.cekim_tarzi&&<span style={{fontSize:11,background:"#7B68EE18",color:"#9B8EFF",border:"1px solid #7B68EE33",borderRadius:6,padding:"2px 7px"}}>🎥 {idea.cekim_tarzi}</span>}
                  {idea.viral_sebebi&&<span style={{fontSize:11,background:"#34C75918",color:"#34C759",border:"1px solid #34C75933",borderRadius:6,padding:"2px 7px"}}>🔥 {idea.viral_sebebi}</span>}
                  {idea.muzik_trendi&&<span style={{fontSize:11,background:"#FF950018",color:"#FF9500",border:"1px solid #FF950033",borderRadius:6,padding:"2px 7px"}}>🎵 {idea.muzik_trendi}</span>}
                </div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                  {idea.ilham_google&&<a href={`https://www.google.com/search?q=${encodeURIComponent(idea.ilham_google+" instagram reels")}&tbm=vid`} target="_blank" rel="noreferrer" style={{fontSize:11,color:"#C77EE8",background:"#C77EE818",border:"1px solid #C77EE833",borderRadius:6,padding:"3px 8px",textDecoration:"none",fontWeight:600}}>📸 Google</a>}
                  {idea.ilham_tiktok&&<a href={`https://www.tiktok.com/search?q=${encodeURIComponent(idea.ilham_tiktok)}`} target="_blank" rel="noreferrer" style={{fontSize:11,color:"#69C9D0",background:"#69C9D018",border:"1px solid #69C9D033",borderRadius:6,padding:"3px 8px",textDecoration:"none",fontWeight:600}}>🎵 TikTok</a>}
                  {idea.ilham_youtube&&<a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(idea.ilham_youtube+" shorts")}`} target="_blank" rel="noreferrer" style={{fontSize:11,color:"#FF4444",background:"#FF444418",border:"1px solid #FF444433",borderRadius:6,padding:"3px 8px",textDecoration:"none",fontWeight:600}}>▶ YT Shorts</a>}
                </div>
              </div>)}
            </div>}
          </div>
        </div>
      </div>
    );
  };

  // ── ADD VENUE MODAL ───────────────────────────────────────────────────────────
  const AddVenueModal = ({ onClose }) => {
    const [name,setName]=useState(""); const [concept,setConcept]=useState(""); const [stock,setStock]=useState(0); const [color,setColor]=useState(COLORS[0]);
    return <div style={{position:"fixed",inset:0,background:"#000b",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={onClose}>
      <div style={{background:"#111118",border:"1px solid #2A2A3E",borderRadius:16,padding:28,maxWidth:460,width:"100%"}} onClick={e=>e.stopPropagation()}>
        <div style={{fontSize:17,fontWeight:800,color:"#fff",marginBottom:20}}>Yeni Mekan Ekle</div>
        <div style={{marginBottom:12}}><div style={{fontSize:11,color:"#7B68EE",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5}}>Mekan Adı *</div><input value={name} onChange={e=>setName(e.target.value)} placeholder="örn: Süleyman Usta Kebap" style={s.input} autoFocus/></div>
        <div style={{marginBottom:12}}><div style={{fontSize:11,color:"#7B68EE",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5}}>Konsept</div><input value={concept} onChange={e=>setConcept(e.target.value)} placeholder="Boş bırakabilirsin, AI videolardan öğrenir" style={s.input}/></div>
        <div style={{display:"flex",gap:16,marginBottom:20}}>
          <div><div style={{fontSize:11,color:"#7B68EE",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5}}>Stok</div><input type="number" min={0} value={stock} onChange={e=>setStock(e.target.value)} style={{...s.input,width:70}}/></div>
          <div><div style={{fontSize:11,color:"#7B68EE",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5}}>Renk</div><div style={{display:"flex",gap:5,flexWrap:"wrap",maxWidth:200}}>{COLORS.map(c=><div key={c} onClick={()=>setColor(c)} style={{width:22,height:22,borderRadius:"50%",background:c,cursor:"pointer",border:color===c?"3px solid #fff":"2px solid transparent"}}/>)}</div></div>
        </div>
        <div style={{display:"flex",gap:8}}><button onClick={()=>{if(!name.trim())return;setVenues(p=>[...p,{id:Date.now(),name:name.trim(),concept:concept.trim(),stock:parseInt(stock)||0,color,introVideos:[],referenceLinks:[],venueAnalysis:"",ideas:[]}]);showToast(`${name} eklendi!`);onClose();}} style={s.btn()} disabled={!name.trim()}><Icon name="plus" size={14}/> Ekle</button><button onClick={onClose} style={s.btn("ghost")}>İptal</button></div>
      </div>
    </div>;
  };

  // ── ONAY (SCHEDULE) PANEL ─────────────────────────────────────────────────────
  const OnayPanel = () => {
    const [noteEditing, setNoteEditing] = useState(null);
    const [noteVal, setNoteVal] = useState("");
    const [selectedIdeas, setSelectedIdeas] = useState({});

    return (
      <div>
        {/* Header */}
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <div style={{fontSize:24,fontWeight:800,color:"#fff",marginBottom:4}}>
              {role==="ekip" ? "Onay Paneli" : "Program & Onay"}
            </div>
            <div style={{fontSize:13,color:"#666"}}>
              {role==="ekip" ? "Mekanları ara, durumları güncelle" : "Haftalık çekim programı · Onay takibi"}
            </div>
          </div>
          {role==="admin" && (
            <div style={{display:"flex",gap:8}}>
              <button onClick={generateSchedule} style={s.btn("ghost")}><Icon name="sparkle" size={14}/> Yeniden Oluştur</button>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div style={{background:"#111118",border:"1px solid #1E1E30",borderRadius:12,padding:16,marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>Onay Durumu</div>
            <div style={{fontSize:12,color:"#666"}}>{confirmed+approved} / {total} tamamlandı</div>
          </div>
          <div style={{background:"#0A0A0F",borderRadius:6,height:8,overflow:"hidden",marginBottom:10}}>
            <div style={{height:"100%",background:"linear-gradient(90deg,#7B68EE,#34C759)",width:`${total?((confirmed+approved)/total)*100:0}%`,transition:"width 0.4s",borderRadius:6}}/>
          </div>
          <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            {[["🔒",confirmed,"Kesinleşti","#7B68EE"],["✅",approved,"Onaylandı","#34C759"],["❌",postponed,"Ertelendi","#FF3B30"],["⬜",total-confirmed-approved-postponed,"Bekliyor","#555"]].map(([icon,n,label,color])=>(
              <div key={label} style={{fontSize:12,color}}><span style={{fontWeight:800}}>{icon} {n}</span> <span style={{color:"#555"}}>{label}</span></div>
            ))}
          </div>
          {readyToSend && <div style={{marginTop:10,background:"#34C75918",border:"1px solid #34C75933",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#34C759",fontWeight:600}}>✅ Tüm mekanlar onaylandı! Program gönderilebilir.</div>}
        </div>

        {/* Days grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12}}>
          {weekDates.map(({day,date})=>{
            const slots=schedule[day]||[];
            return (
              <div key={day} style={{background:"#111118",border:"1px solid #1E1E30",borderRadius:12,padding:14}}>
                <div style={{fontSize:11,fontWeight:700,color:"#7B68EE",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:2}}>{day}</div>
                <div style={{fontSize:10,color:"#555",marginBottom:12}}>{date}</div>
                {slots.map((slot)=>{
                  const v=venues.find(vv=>vv.id===slot.venueId); if(!v) return null;
                  const st=STATUS[slot.status]||STATUS.taslak;
                  const isEditingNote = noteEditing===`${day}_${slot.venueId}`;
                  const waMsg = buildVenueWAMessage(v, day, date);
                  return (
                    <div key={slot.venueId} style={{background:"#0A0A0F",border:`1px solid ${v.color}33`,borderRadius:10,padding:10,marginBottom:8,borderTop:`2px solid ${v.color}`}}>
                      {/* Venue name + swap (admin only) */}
                      {role==="admin" ? (
                        <select value={slot.venueId} onChange={e=>swapVenueInSlot(day,slot.venueId,e.target.value)} style={{background:"#111118",border:"none",color:"#fff",fontSize:12,fontWeight:700,width:"100%",marginBottom:6,cursor:"pointer",outline:"none"}}>
                          {venues.map(vv=><option key={vv.id} value={vv.id}>{vv.name}</option>)}
                        </select>
                      ) : (
                        <div style={{fontSize:12,fontWeight:700,color:"#fff",marginBottom:6}}>{v.name}</div>
                      )}

                      <StockBadge stock={v.stock}/>

                      {/* Status badge */}
                      <div style={{marginTop:6,marginBottom:6}}><StatusBadge status={slot.status}/></div>

                      {/* Status buttons */}
                      <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:6}}>
                        {[
                          ["aranıyor","📞","warn"],
                          ["onaylandi","✅","success"],
                          ["ertelendi","❌","danger"],
                          ...(role==="admin"?[["kesinlesti","🔒","purple"]]:[[]])
                        ].filter(x=>x.length).map(([st2,icon,variant])=>(
                          <button key={st2} onClick={()=>updateSlotStatus(day,slot.venueId,st2)} style={{...s.btn(slot.status===st2?variant:"ghost"),padding:"3px 7px",fontSize:10,opacity:slot.status===st2?1:0.6}}>{icon}</button>
                        ))}
                      </div>

                      {/* WA to venue owner - randevu */}
                      <a href={`https://wa.me/?text=${encodeURIComponent(waMsg)}`} target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#25D366",background:"#25D36618",border:"1px solid #25D36633",borderRadius:6,padding:"3px 7px",textDecoration:"none",fontWeight:600,marginBottom:6}}>
                        <Icon name="whatsapp" size={10}/> Randevu WA
                      </a>

                      {/* ── İÇERİK GÖNDER BLOĞU ── */}
                      <div style={{borderTop:"1px solid #1E1E2E",paddingTop:8,marginTop:4}}>
                        {/* Ekip: içerik seç ve gönder */}
                        {role==="ekip" && !slot.icerikGonderildi && (
                          <div>
                            {(v.ideas||[]).length===0 ? (
                              <div style={{fontSize:10,color:"#555",fontStyle:"italic"}}>Fikir yok — admin üretmeli</div>
                            ) : (
                              <div>
                                <div style={{fontSize:10,color:"#7B68EE",fontWeight:700,marginBottom:4}}>📋 Gönderilecek içerikleri seç:</div>
                                {(v.ideas||[]).map((idea,ii)=>(
                                  <label key={ii} style={{display:"flex",alignItems:"flex-start",gap:5,marginBottom:4,cursor:"pointer"}}>
                                    <input type="checkbox" checked={(selectedIdeas[`${day}_${slot.venueId}`]||[]).includes(ii)}
                                      onChange={e=>{
                                        const key=`${day}_${slot.venueId}`;
                                        setSelectedIdeas(prev=>{
                                          const cur=prev[key]||[];
                                          return {...prev,[key]:e.target.checked?[...cur,ii]:cur.filter(x=>x!==ii)};
                                        });
                                      }}
                                      style={{marginTop:2,flexShrink:0}}
                                    />
                                    <span style={{fontSize:10,color:"#ccc",lineHeight:1.4}}>{idea.baslik}</span>
                                  </label>
                                ))}
                                {(selectedIdeas[`${day}_${slot.venueId}`]||[]).length>0 && (
                                  <button onClick={()=>{
                                    const key=`${day}_${slot.venueId}`;
                                    const idxs=selectedIdeas[key]||[];
                                    const secilen=v.ideas.filter((_,ii)=>idxs.includes(ii));
                                    const satirlar = secilen.map((id,n)=>[`${n+1}. *${id.baslik}*`,id.konsept,id.cekim_tarzi?`Cekim: ${id.cekim_tarzi}`:"",id.muzik_trendi?`Muzik: ${id.muzik_trendi}`:""].filter(Boolean).join("\n")).join("\n\n");
                                    const msg = `Merhaba ${v.name}!\n\nBu hafta planlanan icerik fikirleri:\n\n${satirlar}\n\nGoruslerinizi bekliyoruz!\n_HSI Medya_`;
                                    const waUrl=`https://wa.me/?text=${encodeURIComponent(msg)}`;
                                    window.open(waUrl,"_blank");
                                    updateSlotField(day,slot.venueId,"icerikGonderildi",true);
                                    updateSlotField(day,slot.venueId,"gonderilenIcerik",secilen.map(id=>id.baslik).join(", "));
                                    showToast(`${v.name} için içerik gönderildi!`);
                                  }} style={{...s.btn("primary"),padding:"4px 9px",fontSize:10,width:"100%",justifyContent:"center",marginTop:4}}>
                                    <Icon name="whatsapp" size={10}/> İçerikleri Gönder
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Gönderim yapıldıysa durum göster */}
                        {slot.icerikGonderildi && (
                          <div style={{background:"#25D36612",border:"1px solid #25D36633",borderRadius:6,padding:"6px 8px",marginBottom:6}}>
                            <div style={{fontSize:10,color:"#25D366",fontWeight:700,marginBottom:2}}>📤 İçerik gönderildi</div>
                            {slot.gonderilenIcerik&&<div style={{fontSize:10,color:"#888",lineHeight:1.4}}>{slot.gonderilenIcerik}</div>}
                            {/* Admin onay butonları */}
                            {role==="admin" && !slot.icerikOnaylandi && (
                              <div style={{display:"flex",gap:4,marginTop:6}}>
                                <button onClick={()=>{updateSlotField(day,slot.venueId,"icerikOnaylandi",true);showToast(`${v.name} içerik onaylandı!`);}} style={{...s.btn("success"),padding:"3px 8px",fontSize:10,flex:1,justifyContent:"center"}}>
                                  <Icon name="check" size={10}/> Onayla
                                </button>
                                <button onClick={()=>{updateSlotField(day,slot.venueId,"icerikGonderildi",false);updateSlotField(day,slot.venueId,"gonderilenIcerik","");showToast("Geri alındı, tekrar seçilebilir.");}} style={{...s.btn("danger"),padding:"3px 8px",fontSize:10,flex:1,justifyContent:"center"}}>
                                  <Icon name="close" size={10}/> Geri Al
                                </button>
                              </div>
                            )}
                            {slot.icerikOnaylandi && (
                              <div style={{marginTop:4,fontSize:10,color:"#7B68EE",fontWeight:700}}>🔒 Admin onayladı</div>
                            )}
                          </div>
                        )}

                        {/* Ekip: henüz seçim yapmadıysa ama fikir varsa küçük uyarı */}
                        {role==="admin" && !slot.icerikGonderildi && (v.ideas||[]).length>0 && (
                          <div style={{fontSize:10,color:"#555",fontStyle:"italic"}}>⏳ Ekip içerik göndermedi</div>
                        )}
                        {role==="admin" && !slot.icerikGonderildi && (v.ideas||[]).length===0 && (
                          <div style={{fontSize:10,color:"#FF3B30",fontStyle:"italic"}}>⚠️ Fikir üretilmedi</div>
                        )}
                      </div>

                      {/* Notes */}
                      {isEditingNote ? (
                        <div style={{marginTop:6}}>
                          <input value={noteVal} onChange={e=>setNoteVal(e.target.value)} placeholder="Not ekle..." style={{...s.input,fontSize:11,padding:"4px 8px",marginBottom:4}}/>
                          <div style={{display:"flex",gap:4}}>
                            <button onClick={()=>{updateSlotNote(day,slot.venueId,role==="ekip"?"ekipNotu":"note",noteVal);setNoteEditing(null);}} style={{...s.btn("success"),padding:"3px 8px",fontSize:10}}><Icon name="check" size={10}/></button>
                            <button onClick={()=>setNoteEditing(null)} style={{...s.btn("ghost"),padding:"3px 8px",fontSize:10}}><Icon name="close" size={10}/></button>
                          </div>
                        </div>
                      ) : (
                        <div style={{marginTop:4}}>
                          {slot.note&&<div style={{fontSize:10,color:"#888",marginBottom:3}}>📋 {slot.note}</div>}
                          {slot.ekipNotu&&<div style={{fontSize:10,color:"#FF9500",marginBottom:3}}>👤 {slot.ekipNotu}</div>}
                          <button onClick={()=>{setNoteEditing(`${day}_${slot.venueId}`);setNoteVal(role==="ekip"?slot.ekipNotu:slot.note);}} style={{...s.btn("ghost"),padding:"2px 7px",fontSize:10}}><Icon name="note" size={10}/> Not</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── MÜDÜR / PATRON PANEL (salt okunur) ───────────────────────────────────────
  const MudurPanel = () => {
    const allSlots2 = Object.values(schedule).flat();
    const total2 = allSlots2.length;
    const st_counts = {
      taslak:    allSlots2.filter(s=>s.status==="taslak").length,
      aranıyor:  allSlots2.filter(s=>s.status==="aranıyor").length,
      onaylandi: allSlots2.filter(s=>s.status==="onaylandi").length,
      ertelendi: allSlots2.filter(s=>s.status==="ertelendi").length,
      kesinlesti:allSlots2.filter(s=>s.status==="kesinlesti").length,
    };
    const icerikGonderilen = allSlots2.filter(s=>s.icerikGonderildi).length;
    const icerikOnaylanan  = allSlots2.filter(s=>s.icerikOnaylandi).length;
    const progressPct = total2 ? Math.round(((st_counts.onaylandi+st_counts.kesinlesti)/total2)*100) : 0;
    const icerikPct   = total2 ? Math.round((icerikOnaylanan/total2)*100) : 0;

    return (
      <div>
        {/* Header */}
        <div style={{marginBottom:24}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
            <div style={{fontSize:24,fontWeight:800,color:"#fff"}}>Haftalık Operasyon Takibi</div>
            <div style={{background:"#F4A62322",border:"1px solid #F4A62333",borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:700,color:"#F4A623"}}>👁 Salt Okunur</div>
          </div>
          <div style={{color:"#666",fontSize:13}}>{new Date().toLocaleDateString("tr-TR",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
        </div>

        {/* KPI Kartları */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:24}}>
          {[
            {val:`${progressPct}%`,  label:"Randevu Onay Oranı",     color:"#34C759", sub:`${st_counts.onaylandi+st_counts.kesinlesti}/${total2} mekan`},
            {val:`${icerikPct}%`,    label:"İçerik Onay Oranı",      color:"#7B68EE", sub:`${icerikOnaylanan}/${total2} mekan`},
            {val:st_counts.ertelendi,label:"Ertelenen Randevu",       color:"#FF3B30", sub:"bu hafta"},
            {val:venues.filter(v=>v.stock<=3).length, label:"Düşük Stok Uyarısı", color:"#FF9500", sub:"mekan"},
          ].map((k,i)=>(
            <div key={i} style={{background:"#111118",border:"1px solid #1E1E30",borderRadius:12,padding:18}}>
              <div style={{fontSize:28,fontWeight:800,color:k.color,marginBottom:4}}>{k.val}</div>
              <div style={{fontSize:12,fontWeight:600,color:"#ccc",marginBottom:2}}>{k.label}</div>
              <div style={{fontSize:11,color:"#555"}}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* İlerleme Barları */}
        <div style={{background:"#111118",border:"1px solid #1E1E30",borderRadius:12,padding:20,marginBottom:20}}>
          <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:16}}>Bu Hafta İlerleme</div>
          {[
            {label:"Randevu Onayı", pct:progressPct, color:"#34C759", detail:`${st_counts.onaylandi+st_counts.kesinlesti} onaylı, ${st_counts.aranıyor} bekliyor, ${st_counts.ertelendi} ertelendi`},
            {label:"İçerik Gönderimi", pct:total2?Math.round((icerikGonderilen/total2)*100):0, color:"#7B68EE", detail:`${icerikGonderilen} mekan sahibine gönderildi`},
            {label:"İçerik Admin Onayı", pct:icerikPct, color:"#F4A623", detail:`${icerikOnaylanan} mekan için onaylandı`},
          ].map((b,i)=>(
            <div key={i} style={{marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <div style={{fontSize:12,fontWeight:600,color:"#ccc"}}>{b.label}</div>
                <div style={{fontSize:12,fontWeight:800,color:b.color}}>{b.pct}%</div>
              </div>
              <div style={{background:"#0A0A0F",borderRadius:6,height:8,overflow:"hidden",marginBottom:3}}>
                <div style={{height:"100%",background:b.color,width:`${b.pct}%`,borderRadius:6,transition:"width 0.5s"}}/>
              </div>
              <div style={{fontSize:11,color:"#555"}}>{b.detail}</div>
            </div>
          ))}
        </div>

        {/* Haftalık Çekim Tablosu */}
        <div style={{background:"#111118",border:"1px solid #1E1E30",borderRadius:12,padding:20,marginBottom:20}}>
          <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:14}}>Haftalık Çekim Programı</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
            {weekDates.map(({day,date})=>{
              const slots=schedule[day]||[];
              return (
                <div key={day} style={{background:"#0A0A0F",borderRadius:10,padding:12}}>
                  <div style={{fontSize:10,fontWeight:700,color:"#7B68EE",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:2}}>{day}</div>
                  <div style={{fontSize:10,color:"#555",marginBottom:10}}>{date}</div>
                  {slots.map(slot=>{
                    const v=venues.find(vv=>vv.id===slot.venueId); if(!v) return null;
                    const st=STATUS[slot.status]||STATUS.taslak;
                    return (
                      <div key={slot.venueId} style={{background:v.color+"12",border:`1px solid ${v.color}22`,borderRadius:8,padding:"8px 10px",marginBottom:6}}>
                        <div style={{fontSize:11,fontWeight:700,color:v.color,marginBottom:4}}>{v.name}</div>
                        <div style={{fontSize:10,background:st.bg,color:st.color,border:`1px solid ${st.border}`,borderRadius:4,padding:"1px 5px",display:"inline-block",marginBottom:4}}>{st.icon} {st.label}</div>
                        {slot.icerikGonderildi&&(
                          <div style={{fontSize:10,color:slot.icerikOnaylandi?"#7B68EE":"#25D366",marginTop:2}}>
                            {slot.icerikOnaylandi?"🔒 İçerik onaylı":"📤 İçerik gönderildi"}
                          </div>
                        )}
                        {!slot.icerikGonderildi&&<div style={{fontSize:10,color:"#444",marginTop:2}}>⏳ İçerik bekleniyor</div>}
                        {slot.gonderilenIcerik&&<div style={{fontSize:9,color:"#555",marginTop:3,lineHeight:1.4}}>{slot.gonderilenIcerik}</div>}
                        {slot.ekipNotu&&<div style={{fontSize:9,color:"#FF9500",marginTop:3}}>💬 {slot.ekipNotu}</div>}
                        {slot.note&&<div style={{fontSize:9,color:"#888",marginTop:2}}>📋 {slot.note}</div>}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stok Durumu */}
        <div style={{background:"#111118",border:"1px solid #1E1E30",borderRadius:12,padding:20,marginBottom:20}}>
          <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:14}}>Mekan Stok Durumu</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8}}>
            {[...venues].sort((a,b)=>a.stock-b.stock).map(v=>{
              const color=v.stock===0?"#FF3B30":v.stock<=3?"#FF9500":v.stock<=6?"#FFCC00":"#34C759";
              const label=v.stock===0?"KRİTİK":v.stock<=3?"DÜŞÜK":v.stock<=6?"ORTA":"YETERLİ";
              return (
                <div key={v.id} style={{background:"#0A0A0F",border:`1px solid ${color}33`,borderRadius:8,padding:"10px 12px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:600,color:"#ccc",marginBottom:2}}>{v.name}</div>
                    <div style={{fontSize:10,color:color,fontWeight:700}}>{label}</div>
                  </div>
                  <div style={{fontSize:20,fontWeight:800,color}}>{v.stock}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Durum Özeti */}
        <div style={{background:"#111118",border:"1px solid #1E1E30",borderRadius:12,padding:20}}>
          <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:14}}>Randevu Durum Dağılımı</div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            {Object.entries(STATUS).map(([key,st])=>{
              const count=allSlots2.filter(s=>s.status===key).length;
              return (
                <div key={key} style={{background:st.bg,border:`1px solid ${st.border}`,borderRadius:10,padding:"12px 18px",minWidth:100,textAlign:"center"}}>
                  <div style={{fontSize:22,marginBottom:4}}>{st.icon}</div>
                  <div style={{fontSize:22,fontWeight:800,color:st.color}}>{count}</div>
                  <div style={{fontSize:11,color:st.color,opacity:0.8}}>{st.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // ── ANKET PANELİ (Memnuniyet) ─────────────────────────────────────────────────
  const AnketPanel = () => {
    const [anketResults, setAnketResults] = useState({});
    const [weekLabel] = useState(() => {
      const d = new Date();
      return d.toLocaleDateString("tr-TR", { day:"2-digit", month:"2-digit", year:"numeric" });
    });

    const anketMsg = (venue) => {
      const lines = [
        `Merhaba ${venue.name}! 👋`,
        ``,
        `HSI Medya olarak bu haftaki hizmetimizi değerlendirmenizi isteriz.`,
        ``,
        `Lütfen 1–5 arasında puanlayın:`,
        `1️⃣ Çok kötü`,
        `2️⃣ Kötü`,
        `3️⃣ Orta`,
        `4️⃣ İyi`,
        `5️⃣ Çok iyi`,
        ``,
        `Varsa yorumunuzu da yazabilirsiniz.`,
        ``,
        `_HSI Medya Ekibi_ 🎬`,
      ];
      return lines.join("\n");
    };

    const openWA = (venue) => {
      if (!venue.phone) { showToast(`${venue.name} için telefon numarası eklenmedi!`, "error"); return; }
      const phone = venue.phone.replace(/[^0-9]/g, "");
      const msg = anketMsg(venue);
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
      setAnketResults(prev => ({...prev, [venue.id]: {...(prev[venue.id]||{}), gonderildi: true, tarih: weekLabel}}));
      showToast(`${venue.name} için anket gönderildi!`);
    };

    const setScore = (venueId, score) => {
      setAnketResults(prev => ({...prev, [venueId]: {...(prev[venueId]||{}), puan: score}}));
    };

    const setNote = (venueId, note) => {
      setAnketResults(prev => ({...prev, [venueId]: {...(prev[venueId]||{}), yorum: note}}));
    };

    const phoneCount = venues.filter(v => v.phone).length;
    const sentCount = Object.values(anketResults).filter(r => r.gonderildi).length;
    const avgScore = (() => {
      const scores = Object.values(anketResults).map(r => r.puan).filter(Boolean);
      if (!scores.length) return null;
      return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
    })();

    return (
      <div>
        {/* Header */}
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20}}>
          <div>
            <div style={{fontSize:24,fontWeight:800,color:"#fff",marginBottom:4}}>Memnuniyet Anketi</div>
            <div style={{fontSize:13,color:"#666"}}>Mekan sahiplerine WP üzerinden haftalık anket · {weekLabel}</div>
          </div>
        </div>

        {/* Özet kartları */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
          {[
            {val:venues.length,   label:"Toplam Mekan",       color:"#7B68EE"},
            {val:phoneCount,      label:"Numara Girilmiş",    color:"#34C759"},
            {val:sentCount,       label:"Anket Gönderildi",   color:"#48BFAB"},
            {val:avgScore||"—",   label:"Haftalık Ort. Puan", color:"#FF9500"},
          ].map((k,i) => (
            <div key={i} style={{background:"#111118",border:"1px solid #1E1E30",borderRadius:12,padding:14}}>
              <div style={{fontSize:24,fontWeight:800,color:k.color,marginBottom:2}}>{k.val}</div>
              <div style={{fontSize:11,color:"#666"}}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Numara eksik uyarısı */}
        {phoneCount < venues.length && (
          <div style={{background:"#FF950018",border:"1px solid #FF950033",borderRadius:8,padding:"10px 14px",fontSize:12,color:"#FF9500",marginBottom:16}}>
            ⚠️ {venues.length - phoneCount} mekanın telefon numarası girilmemiş. Mekanlar sekmesinden her mekana girerek ekleyin.
          </div>
        )}

        {/* Toplu gönder butonu */}
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          <button onClick={() => {
            const withPhone = venues.filter(v => v.phone);
            if (!withPhone.length) { showToast("Önce mekan telefonlarını gir!", "error"); return; }
            withPhone.forEach((v, i) => setTimeout(() => openWA(v), i * 800));
            showToast(`${withPhone.length} mekana anket gönderiliyor...`);
          }} style={s.btn()}>
            <Icon name="whatsapp" size={14}/> Hepsine Gönder ({phoneCount} mekan)
          </button>
          <button onClick={() => setAnketResults({})} style={s.btn("danger")}>
            <Icon name="trash" size={14}/> Sonuçları Sıfırla
          </button>
        </div>

        {/* Mekan listesi */}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {venues.map(venue => {
            const result = anketResults[venue.id] || {};
            return (
              <div key={venue.id} style={{background:"#111118",border:`1px solid ${result.gonderildi?"#34C75933":"#1E1E30"}`,borderRadius:12,padding:16,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
                {/* Renk dot + isim */}
                <div style={{display:"flex",alignItems:"center",gap:8,minWidth:180}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:venue.color,flexShrink:0}}/>
                  <div style={{fontSize:13,fontWeight:700,color:"#fff"}}>{venue.name}</div>
                </div>

                {/* Telefon */}
                <div style={{flex:1,minWidth:200}}>
                  {venue.phone ? (
                    <div style={{fontSize:11,color:"#34C759",fontFamily:"monospace"}}>{venue.phone}</div>
                  ) : (
                    <div style={{fontSize:11,color:"#FF3B30",fontStyle:"italic"}}>Numara yok — Mekanlar sekmesinden ekle</div>
                  )}
                </div>

                {/* Gönder butonu */}
                <button onClick={() => openWA(venue)} disabled={!venue.phone} style={{...s.btn(result.gonderildi?"ghost":"primary"),padding:"6px 12px",flexShrink:0}}>
                  <Icon name="whatsapp" size={12}/>
                  {result.gonderildi ? "Tekrar Gönder" : "Anket Gönder"}
                </button>

                {/* Sonuç girişi */}
                {result.gonderildi && (
                  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                    <span style={{fontSize:11,color:"#666"}}>Puan:</span>
                    <div style={{display:"flex",gap:4}}>
                      {[1,2,3,4,5].map(n => (
                        <button key={n} onClick={() => setScore(venue.id, n)} style={{
                          width:28,height:28,borderRadius:"50%",border:"none",cursor:"pointer",fontSize:11,fontWeight:700,
                          background: result.puan===n ? "#7B68EE" : "#1A1A2E",
                          color: result.puan===n ? "#fff" : "#666",
                        }}>{n}</button>
                      ))}
                    </div>
                    <input
                      value={result.yorum||""}
                      onChange={e => setNote(venue.id, e.target.value)}
                      placeholder="Yorum..."
                      style={{...s.input,padding:"4px 8px",width:140,fontSize:11}}
                    />
                    {result.puan && (
                      <span style={{fontSize:10,background:"#34C75918",color:"#34C759",border:"1px solid #34C75933",borderRadius:6,padding:"2px 8px",fontWeight:700}}>
                        ✅ Kaydedildi
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Özet tablo - puan girilmişse */}
        {Object.values(anketResults).some(r => r.puan) && (
          <div style={{background:"#111118",border:"1px solid #1E1E30",borderRadius:12,padding:16,marginTop:20}}>
            <div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:12}}>📊 Bu Hafta Anket Sonuçları</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:8}}>
              {venues.filter(v => anketResults[v.id]?.puan).map(v => {
                const r = anketResults[v.id];
                const pColor = r.puan >= 4 ? "#34C759" : r.puan === 3 ? "#FFCC00" : "#FF3B30";
                return (
                  <div key={v.id} style={{background:"#0A0A0F",border:`1px solid ${pColor}33`,borderRadius:8,padding:"10px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:600,color:"#ccc",marginBottom:2}}>{v.name}</div>
                      {r.yorum && <div style={{fontSize:10,color:"#666",fontStyle:"italic"}}>{r.yorum}</div>}
                    </div>
                    <div style={{fontSize:22,fontWeight:800,color:pColor,flexShrink:0}}>{r.puan}/5</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ── SHARE PANEL ───────────────────────────────────────────────────────────────
  const SharePanel = () => (
    <div>
      <div style={{marginBottom:24}}>
        <div style={{fontSize:24,fontWeight:800,color:"#fff",marginBottom:4}}>Paylaş</div>
        <div style={{color:"#666",fontSize:13}}>Her Cuma — WP Grubuna & Mail</div>
      </div>
      {!readyToSend&&<div style={{background:"#FF950018",border:"1px solid #FF950033",borderRadius:10,padding:14,fontSize:13,color:"#FF9500",marginBottom:20}}>⚠️ Henüz tüm mekanlar onaylanmadı. Onay tamamlanmadan göndermemeyi öneririz.</div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        {[
          {key:"wp",icon:"whatsapp",title:"WhatsApp Grubu",sub:"Çekim Bilgilendirme",color:"#25D366",action:<a href={`https://wa.me/?text=${encodeURIComponent(scheduleMsg)}`} target="_blank" rel="noreferrer"><button style={s.btn("success")}><Icon name="whatsapp" size={14}/> WA'da Aç</button></a>},
          {key:"mail",icon:"mail",title:"E-posta",sub:"hsimedya@gmail.com",color:"#7B68EE",action:<a href={`mailto:hsimedya@gmail.com?subject=Haftalık Çekim Programı&body=${encodeURIComponent(scheduleMsg)}`}><button style={s.btn("ghost")}><Icon name="mail" size={14}/> Mail Aç</button></a>},
        ].map(({key,icon,title,sub,color,action})=>(
          <div key={key} style={{background:"#111118",border:"1px solid #1E1E30",borderRadius:14,padding:20}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}><div style={{width:34,height:34,borderRadius:10,background:color+"22",display:"flex",alignItems:"center",justifyContent:"center",color}}><Icon name={icon} size={17}/></div><div><div style={{fontWeight:700,fontSize:14}}>{title}</div><div style={{fontSize:11,color:"#666"}}>{sub}</div></div></div>
            <div style={{background:"#0A0A0F",border:"1px solid #1E1E30",borderRadius:10,padding:14,fontFamily:"monospace",fontSize:12,color:"#9BE4A0",lineHeight:1.7,whiteSpace:"pre-wrap",maxHeight:240,overflow:"auto",marginBottom:12}}>{scheduleMsg}</div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{navigator.clipboard.writeText(scheduleMsg);setCopied(key);setTimeout(()=>setCopied(null),2000);showToast("Kopyalandı!");}} style={s.btn()}>{copied===key?<><Icon name="check" size={14}/> Kopyalandı!</>:<><Icon name="copy" size={14}/> Kopyala</>}</button>
              {action}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── RENDER ────────────────────────────────────────────────────────────────────
  if(!role) return <LoginScreen onLogin={setRole}/>;

  const adminTabs = [{id:"onay",label:"Onay Takibi",icon:"calendar"},{id:"venues",label:"Mekanlar",icon:"camera"},{id:"anket",label:"Anket",icon:"instagram"},{id:"share",label:"Paylaş",icon:"whatsapp"},{id:"dashboard",label:"Dashboard",icon:"stock"}];
  const ekipTabs  = [{id:"onay",label:"Onay Paneli",icon:"phone"}];
  const mudurTabs = [{id:"mudur",label:"Genel Bakış",icon:"eye"}];
  const tabs = role==="admin" ? adminTabs : role==="mudur" ? mudurTabs : ekipTabs;

  return (
    <div style={s.app}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#0F0F1A}::-webkit-scrollbar-thumb{background:#2A2A3E;border-radius:2px}a{text-decoration:none}button:disabled{opacity:0.5;cursor:not-allowed}select option{background:#111118}`}</style>

      <div style={s.sidebar}>
        <div style={{padding:"0 20px 22px",borderBottom:"1px solid #1E1E30"}}>
          <div style={{fontSize:13,fontWeight:800,letterSpacing:"0.08em",color:"#fff",textTransform:"uppercase"}}>HSI Medya</div>
          <div style={{fontSize:10,color:"#444",letterSpacing:"0.15em",marginTop:2}}>Content Planner</div>
          <div style={{marginTop:8,background:role==="admin"?"#7B68EE22":role==="mudur"?"#F4A62322":"#34C75922",border:`1px solid ${role==="admin"?"#7B68EE33":role==="mudur"?"#F4A62333":"#34C75933"}`,borderRadius:6,padding:"3px 8px",display:"inline-flex",alignItems:"center",gap:5,fontSize:10,fontWeight:700,color:role==="admin"?"#7B68EE":role==="mudur"?"#F4A623":"#34C759"}}>
            <Icon name={role==="admin"?"lock":role==="mudur"?"eye":"user"} size={10}/>
            {role==="admin"?"Admin":role==="mudur"?"Müdür / Patron":"Ekip"}
          </div>
        </div>
        <nav style={{padding:"14px 0",flex:1}}>
          {tabs.map(t=><div key={t.id} style={s.navItem(activeTab===t.id)} onClick={()=>setActiveTab(t.id)}><Icon name={t.icon} size={15}/>{t.label}</div>)}
        </nav>
        {lowStockVenues.length>0&&(
          <div style={{margin:"0 12px 14px",padding:"10px 12px",background:"#FF950018",border:"1px solid #FF950033",borderRadius:8}}>
            <div style={{display:"flex",alignItems:"center",gap:5,color:"#FF9500",fontSize:11,fontWeight:700,marginBottom:5}}><Icon name="warning" size={11}/> {lowStockVenues.length} DÜŞÜK STOK</div>
            {lowStockVenues.map(v=><div key={v.id} style={{fontSize:11,color:"#FF9500",opacity:0.8,marginBottom:1}}>• {v.name}: {v.stock}</div>)}
          </div>
        )}
        <div style={{padding:"12px 20px",borderTop:"1px solid #1E1E30"}}>
          <button onClick={()=>setRole(null)} style={{...s.btn("ghost"),width:"100%",justifyContent:"center",fontSize:11}}>Çıkış Yap</button>
        </div>
      </div>

      <div style={s.main}>
        {activeTab==="onay"&&<OnayPanel/>}

        {activeTab==="venues"&&role==="admin"&&(
          <>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
              <div><div style={{fontSize:24,fontWeight:800,color:"#fff",marginBottom:4}}>Mekanlar</div><div style={{color:"#666",fontSize:13}}>{venues.length} mekan</div></div>
              <button onClick={()=>setAddModal(true)} style={s.btn()}><Icon name="plus" size={14}/> Mekan Ekle</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
              {venues.map(venue=>(
                <div key={venue.id} style={s.card(venue.color)} onClick={()=>setSelectedVenue(venue)}>
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,flex:1}}><div style={{width:10,height:10,borderRadius:"50%",background:venue.color,flexShrink:0,marginTop:3}}/><div style={{fontSize:14,fontWeight:700,color:"#fff"}}>{venue.name}</div></div>
                    <StockBadge stock={venue.stock}/>
                  </div>
                  <div style={{fontSize:12,color:"#888",lineHeight:1.5,marginBottom:10}}>{venue.concept||"Konsept henüz tanımlanmadı"}</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    {venue.venueAnalysis?<span style={{fontSize:10,background:"#34C75918",color:"#34C759",border:"1px solid #34C75933",borderRadius:10,padding:"2px 7px",fontWeight:700}}>✅ AI Tanıyor</span>:<span style={{fontSize:10,background:"#1A1A2E",color:"#555",borderRadius:10,padding:"2px 7px",fontWeight:700}}>Video Yükle</span>}
                    {(venue.ideas||[]).length>0&&<span style={{fontSize:10,background:"#7B68EE18",color:"#7B68EE",border:"1px solid #7B68EE33",borderRadius:10,padding:"2px 7px",fontWeight:700}}>✨ {venue.ideas.length} fikir</span>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab==="share"&&role==="admin"&&<SharePanel/>}

        {activeTab==="anket"&&role==="admin"&&<AnketPanel/>}

        {activeTab==="mudur"&&role==="mudur"&&<MudurPanel/>}

        {activeTab==="dashboard"&&role==="admin"&&(
          <>
            <div style={{marginBottom:22}}><div style={{fontSize:24,fontWeight:800,color:"#fff",marginBottom:4}}>Dashboard</div></div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:22}}>
              {[{val:venues.length,label:"Toplam Mekan",color:"#7B68EE"},{val:venues.reduce((a,v)=>a+v.stock,0),label:"Toplam Stok",color:"#34C759"},{val:venues.filter(v=>v.stock===0).length,label:"Kritik",color:"#FF3B30"},{val:venues.filter(v=>v.venueAnalysis).length,label:"AI Tanıyan",color:"#48BFAB"}].map((s2,i)=>(
                <div key={i} style={{background:"#111118",border:"1px solid #1E1E30",borderRadius:12,padding:16}}><div style={{fontSize:26,fontWeight:800,color:s2.color}}>{s2.val}</div><div style={{fontSize:11,color:"#666",marginTop:2}}>{s2.label}</div></div>
              ))}
            </div>
            <div style={{fontSize:12,fontWeight:700,color:"#555",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>Öncelik Sıralaması</div>
            {[...venues].sort((a,b)=>a.stock-b.stock).map((v,i)=>(
              <div key={v.id} style={{display:"flex",alignItems:"center",gap:12,background:"#111118",border:"1px solid #1E1E30",borderRadius:10,padding:"10px 14px",marginBottom:6,cursor:"pointer"}} onClick={()=>{setSelectedVenue(v);setActiveTab("venues");}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:v.color+"33",border:`2px solid ${v.color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:v.color}}>{i+1}</div>
                <div style={{flex:1,fontSize:13,fontWeight:600,color:"#E8E8F0"}}>{v.name}</div>
                {v.venueAnalysis&&<span style={{fontSize:10,color:"#34C759"}}>✅</span>}
                <StockBadge stock={v.stock}/>
              </div>
            ))}
          </>
        )}
      </div>

      {addModal&&<AddVenueModal onClose={()=>setAddModal(false)}/>}
      {selectedVenue&&<VenueModal venue={venues.find(v=>v.id===selectedVenue.id)||selectedVenue} onClose={()=>setSelectedVenue(null)}/>}
      {toast&&<div style={{position:"fixed",bottom:24,right:24,background:toast.type==="error"?"#FF3B30":"#34C759",color:"#fff",padding:"12px 18px",borderRadius:10,fontSize:13,fontWeight:600,zIndex:999,boxShadow:"0 8px 24px #0008",maxWidth:300}}>{toast.msg}</div>}
    </div>
  );
}

```

---

*HSI Medya Content Planner v1.1 — Mart 2026*
