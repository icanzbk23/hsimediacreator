# Harddisk Stok Otomasyonu
## macOS Launch Agent — Disk Takılınca Otomatik Stok Sayımı

---

## Ne Yapacak?

Harici disk Mac'e takıldığında otomatik olarak tetiklenir. `S/` klasöründeki her mekan klasörünü tarar. **Renksiz (default) dosyaları stok olarak sayar**, renklendirilmiş dosyaları (yapılmış videolar) atlar. Sonucu Supabase'e yazar. Uygulama bir sonraki açılışında stoklar güncel gelir.

---

## Renk Mantığı

| Dosya Durumu | macOS Finder Rengi | Yapılacak |
|---|---|---|
| Henüz çekilmemiş | **Renksiz (default)** | ✅ STOK olarak say |
| Çekildi / teslim edildi | **Herhangi bir renk** | ❌ Atla, sayma |

Script dosyanın içeriğine, ismine veya başka özelliğine **hiç bakmaz**. Tek kriter: renk etiketi var mı, yok mu.

---

## Klasör Yapısı

```
S/                          ← harici diskteki ana klasör
  Mikado Restaurant/
    video_1.mp4             ← renksiz → STOK
    video_2.mp4             ← renksiz → STOK
    video_3.mp4             ← 🟢 yeşil (teslim edildi) → atla
  Harvey Burger/
    video_1.mp4             ← renksiz → STOK
    ...
  Doğu Unlu Mamülleri/
  ...
```

**Kritik kural:** Klasör isimleri Supabase'deki mekan isimleriyle **birebir aynı** olmalı — büyük/küçük harf dahil.

---

## Python Script — `stok_say.py`

```python
import os
import subprocess
import json
import urllib.request
import urllib.error
from datetime import datetime

# ── AYARLAR ────────────────────────────────────────────────────────────────────
DISK_ADI = "HSI_MEDYA"          # Finder'da görünen disk adı (değiştir)
KLASOR_ADI = "S"                # Disk içindeki ana klasör adı
SUPABASE_URL = "https://XXXX.supabase.co"     # Supabase proje URL (değiştir)
SUPABASE_KEY = "eyJ..."         # Supabase service_role key (değiştir)
LOG_DOSYASI = os.path.expanduser("~/stok_log.txt")

# ── RENK KONTROLÜ ──────────────────────────────────────────────────────────────
def renk_var_mi(filepath):
    """
    macOS Finder renk etiketini kontrol eder.
    True  = renkli → yapılmış → atla
    False = renksiz → henüz yapılmamış → STOK
    """
    try:
        result = subprocess.run(
            ['xattr', '-p', 'com.apple.FinderInfo', filepath],
            capture_output=True, text=True
        )
        if result.returncode != 0:
            return False  # etiket yok = renksiz = stok
        
        # FinderInfo hex çıktısının 9. byte'ı (index 8) renk bilgisini tutar
        # 0x00 = renksiz, diğer değerler = renkli
        hex_output = result.stdout.strip().replace(' ', '')
        if len(hex_output) >= 18:
            renk_byte = int(hex_output[16:18], 16)
            return renk_byte != 0
        return False
    except Exception:
        return False

# ── STOK SAYIMI ────────────────────────────────────────────────────────────────
def stok_say(disk_yolu):
    """Disk yolundaki S/ klasörünü tarar, mekan bazında renksiz dosyaları sayar."""
    s_klasoru = os.path.join(disk_yolu, KLASOR_ADI)
    
    if not os.path.exists(s_klasoru):
        log(f"HATA: {s_klasoru} bulunamadı")
        return {}
    
    sonuclar = {}
    video_uzantilari = ('.mp4', '.mov', '.MP4', '.MOV')
    
    for mekan_adi in os.listdir(s_klasoru):
        mekan_yolu = os.path.join(s_klasoru, mekan_adi)
        
        if not os.path.isdir(mekan_yolu):
            continue
        if mekan_adi.startswith('.'):
            continue
        
        stok = 0
        toplam = 0
        
        for dosya_adi in os.listdir(mekan_yolu):
            if not dosya_adi.endswith(video_uzantilari):
                continue
            
            toplam += 1
            dosya_yolu = os.path.join(mekan_yolu, dosya_adi)
            
            if not renk_var_mi(dosya_yolu):
                stok += 1  # renksiz = yapılmamış = stok
        
        sonuclar[mekan_adi] = {
            "stock": stok,
            "toplam_video": toplam,
            "yapilmis": toplam - stok
        }
        log(f"  {mekan_adi}: {stok} stok / {toplam} toplam")
    
    return sonuclar

# ── SUPABASE GÜNCELLEME ────────────────────────────────────────────────────────
def supabase_guncelle(sonuclar):
    """Her mekan için Supabase'deki stock alanını günceller."""
    basarili = 0
    basarisiz = 0
    
    for mekan_adi, veri in sonuclar.items():
        try:
            # Mekanı ismine göre bul ve stok'unu güncelle
            url = f"{SUPABASE_URL}/rest/v1/venues?name=eq.{urllib.parse.quote(mekan_adi)}"
            
            data = json.dumps({"stock": veri["stock"]}).encode('utf-8')
            
            req = urllib.request.Request(
                url,
                data=data,
                method='PATCH',
                headers={
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_KEY,
                    'Authorization': f'Bearer {SUPABASE_KEY}',
                    'Prefer': 'return=minimal'
                }
            )
            
            with urllib.request.urlopen(req, timeout=10) as response:
                if response.status in (200, 204):
                    basarili += 1
                    
        except Exception as e:
            basarisiz += 1
            log(f"  HATA [{mekan_adi}]: {e}")
    
    log(f"Supabase: {basarili} güncellendi, {basarisiz} hata")

# ── LOG ────────────────────────────────────────────────────────────────────────
def log(mesaj):
    zaman = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    satir = f"[{zaman}] {mesaj}"
    print(satir)
    with open(LOG_DOSYASI, 'a', encoding='utf-8') as f:
        f.write(satir + '\n')

# ── ANA ÇALIŞMA ────────────────────────────────────────────────────────────────
def main():
    log("=" * 50)
    log("Stok sayımı başladı")
    
    # Disk yolunu bul
    disk_yolu = f"/Volumes/{DISK_ADI}"
    
    if not os.path.exists(disk_yolu):
        log(f"HATA: Disk bulunamadı → {disk_yolu}")
        log("Disk takılı mı? DISK_ADI değişkenini kontrol et.")
        return
    
    log(f"Disk bulundu: {disk_yolu}")
    
    # Stok say
    sonuclar = stok_say(disk_yolu)
    
    if not sonuclar:
        log("Hiçbir mekan bulunamadı, çıkılıyor")
        return
    
    log(f"Toplam {len(sonuclar)} mekan tarandı")
    
    # Supabase'e yaz
    log("Supabase güncelleniyor...")
    supabase_guncelle(sonuclar)
    
    log("Tamamlandı")
    log("=" * 50)

if __name__ == "__main__":
    import urllib.parse
    main()
```

---

## Launch Agent — `com.hsimedya.stok.plist`

Bu dosya macOS'a "disk takılınca bu scripti çalıştır" komutunu verir.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.hsimedya.stok</string>

    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>/Users/KULLANICI_ADI/stok_say.py</string>
    </array>

    <key>WatchPaths</key>
    <array>
        <string>/Volumes</string>
    </array>

    <key>RunAtLoad</key>
    <false/>

    <key>StandardOutPath</key>
    <string>/Users/KULLANICI_ADI/stok_stdout.log</string>

    <key>StandardErrorPath</key>
    <string>/Users/KULLANICI_ADI/stok_stderr.log</string>
</dict>
</plist>
```

**`KULLANICI_ADI`** yerine Mac kullanıcı adını yaz (terminalde `whoami` ile öğrenebilirsin).

---

## Kurulum Adımları

### 1. Script dosyasını kaydet

```bash
# stok_say.py dosyasını ana klasöre koy:
/Users/KULLANICI_ADI/stok_say.py

# Dosyayı düzenle — şu 4 değeri değiştir:
DISK_ADI = "HSI_MEDYA"       # Finder'da diskin adı ne görünüyor?
SUPABASE_URL = "https://..."  # Supabase proje URL
SUPABASE_KEY = "eyJ..."       # service_role key
```

### 2. Scripti test et (disk takılıyken)

```bash
python3 ~/stok_say.py
```

Çıktı şöyle görünmeli:
```
[2026-03-25 10:00:00] Stok sayımı başladı
[2026-03-25 10:00:00] Disk bulundu: /Volumes/HSI_MEDYA
[2026-03-25 10:00:01]   Mikado Restaurant: 4 stok / 7 toplam
[2026-03-25 10:00:01]   Harvey Burger: 2 stok / 5 toplam
...
[2026-03-25 10:00:03] Supabase: 14 güncellendi, 0 hata
[2026-03-25 10:00:03] Tamamlandı
```

### 3. Launch Agent dosyasını kur

```bash
# plist dosyasını doğru yere koy:
cp com.hsimedya.stok.plist ~/Library/LaunchAgents/

# macOS'a yükle:
launchctl load ~/Library/LaunchAgents/com.hsimedya.stok.plist

# Kontrol et (hata yoksa sessiz kalır):
launchctl list | grep hsimedya
```

### 4. Test et

Diski çıkar, tekrar tak. `~/stok_log.txt` dosyasını aç — otomatik çalıştığını görmelisin.

---

## Sorun Giderme

| Sorun | Kontrol |
|---|---|
| Disk bulunamadı | `ls /Volumes/` yaz, diskin tam adını gör |
| Mekan bulunamadı | Klasör adları Supabase'deki isimlerle birebir eşleşmeli |
| Supabase hatası | `service_role` key kullandığından emin ol (`anon` key yetmez) |
| Launch Agent çalışmıyor | `launchctl list \| grep hsimedya` — loaded görünüyor mu? |
| Script manuel çalışıyor ama otomasyon çalışmıyor | plist'teki `KULLANICI_ADI` ve script yolunu kontrol et |

---

## Notlar

- Script her disk takılışında çalışır, günde birden fazla çalışması sorun değil
- Log dosyası `~/stok_log.txt` — her çalışmayı kayıt altına alır
- Internet bağlantısı yoksa Supabase'e yazamaz; script hata verir ama Mac'i etkilemez
- Supabase entegrasyonu tamamlanmadan önce script'i test etmek için Supabase satırlarını yorum satırına al, sadece sayım çıktısını gözlemle

---

*HSI Medya — Stok Otomasyonu — Mart 2026*
