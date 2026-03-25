#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HSI Medya — Stok Sayım Scripti
Disk: Elements / Klasör: s/
Yapı: s/MEKAN_ADI/icerik_klasoru/ (her içerik = bir alt klasör)
Renksiz alt klasör = stok, renkli = yapılmış
"""

import os
import subprocess
import json
import urllib.request
import urllib.parse
from datetime import datetime

# ── AYARLAR ────────────────────────────────────────────────────────────────────
DISK_ADI     = "Elements"
KLASOR_ADI   = "s"
SUPABASE_URL = "https://XXXX.supabase.co"   # değiştir
SUPABASE_KEY = "eyJ..."                      # service_role key — değiştir
LOG_DOSYASI  = os.path.expanduser("~/stok_log.txt")

# Diskteki klasör adı → Supabase'deki mekan adı eşleştirmesi
# Sol taraf: ls komutuyla gördüğün EXACT klasör adı
# Sağ taraf: Supabase'deki venues tablosundaki name alanı
MEKAN_ESLESTIRME = {
    "MİKADO":                    "Mikado Restaurant",
    "HARVEY BURGER":             "Harvey Burger",
    "BATURA CAFE":               "Batura Cafe",
    "SULTAN SOFRASI":            "Sultan Sofrası",
    "EGE DÖNER":                 "Ege Döner",
    "KUBAN":                     "Kuban Kuruyemiş",
    "musta":                     "Musta Döner",
    "SÜLEYMAN USTA":             "Süleyman Usta Döner",
    "İSTE ÇİFTLİK":              "İSTE Çiftlik",
    "SEZAİ USTA":                "Sezai Usta",
    "SÜTLÜ KAVURMA":             "Sütlü Kavurma",
    "YSANTOCHİA":                "Antochia Döner",
    "ARŞİV":                     None,   # atla
    "KRAL KULLANILACAKLAR":      None,   # atla
    "Pasaport denizciler dron çekimi": None,  # atla
}

# ── RENK KONTROLÜ ──────────────────────────────────────────────────────────────
def renkli_mi(klasor_yolu):
    """
    True  = renkli → yapılmış → SAYMA
    False = renksiz → yapılmamış → STOK
    
    Mantık: xattr com.apple.FinderInfo varsa renkli
            'No such xattr' hatası verirse renksiz
    """
    result = subprocess.run(
        ['xattr', '-p', 'com.apple.FinderInfo', klasor_yolu],
        capture_output=True,
        text=True
    )
    # returncode 0 = xattr var (renkli veya başka attribute)
    # returncode 1 = 'No such xattr' (renksiz, temiz)
    return result.returncode == 0

# ── STOK SAYIMI ────────────────────────────────────────────────────────────────
def stok_say(disk_yolu):
    s_klasoru = os.path.join(disk_yolu, KLASOR_ADI)

    if not os.path.exists(s_klasoru):
        log(f"HATA: {s_klasoru} bulunamadı")
        return {}

    sonuclar = {}

    for mekan_klasoru in os.listdir(s_klasoru):
        mekan_yolu = os.path.join(s_klasoru, mekan_klasoru)

        # Gizli dosyaları atla
        if mekan_klasoru.startswith('.'):
            continue

        # Klasör değilse atla
        if not os.path.isdir(mekan_yolu):
            continue

        # Eşleştirme tablosunda yoksa atla
        if mekan_klasoru not in MEKAN_ESLESTIRME:
            log(f"  UYARI: '{mekan_klasoru}' eşleştirme tablosunda yok, atlandı")
            continue

        supabase_adi = MEKAN_ESLESTIRME[mekan_klasoru]
        if supabase_adi is None:
            log(f"  Atlandı (None): {mekan_klasoru}")
            continue

        # Alt klasörleri say
        stok      = 0
        toplam    = 0
        renkliler = []
        renksizler = []

        for icerik_adi in os.listdir(mekan_yolu):
            if icerik_adi.startswith('.'):
                continue

            icerik_yolu = os.path.join(mekan_yolu, icerik_adi)

            if not os.path.isdir(icerik_yolu):
                continue

            toplam += 1

            if renkli_mi(icerik_yolu):
                renkliler.append(icerik_adi)
            else:
                stok += 1
                renksizler.append(icerik_adi)

        sonuclar[supabase_adi] = {
            "stock":    stok,
            "toplam":   toplam,
            "yapilmis": len(renkliler),
        }

        log(f"  {mekan_klasoru} → '{supabase_adi}': {stok} stok / {toplam} toplam")
        if renksizler:
            for r in renksizler:
                log(f"    📦 STOK: {r}")

    return sonuclar

# ── SUPABASE GÜNCELLEME ────────────────────────────────────────────────────────
def supabase_guncelle(sonuclar):
    basarili = 0
    basarisiz = 0

    for mekan_adi, veri in sonuclar.items():
        try:
            url = (
                f"{SUPABASE_URL}/rest/v1/venues"
                f"?name=eq.{urllib.parse.quote(mekan_adi)}"
            )

            data = json.dumps({"stock": veri["stock"]}).encode("utf-8")

            req = urllib.request.Request(
                url,
                data=data,
                method="PATCH",
                headers={
                    "Content-Type":  "application/json",
                    "apikey":        SUPABASE_KEY,
                    "Authorization": f"Bearer {SUPABASE_KEY}",
                    "Prefer":        "return=minimal",
                },
            )

            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status in (200, 204):
                    basarili += 1
                    log(f"  ✅ Güncellendi: {mekan_adi} → {veri['stock']} stok")
                else:
                    basarisiz += 1
                    log(f"  ❌ HTTP {resp.status}: {mekan_adi}")

        except Exception as e:
            basarisiz += 1
            log(f"  ❌ HATA [{mekan_adi}]: {e}")

    log(f"Supabase: {basarili} güncellendi, {basarisiz} hata")

# ── LOG ────────────────────────────────────────────────────────────────────────
def log(mesaj):
    zaman = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    satir = f"[{zaman}] {mesaj}"
    print(satir)
    with open(LOG_DOSYASI, "a", encoding="utf-8") as f:
        f.write(satir + "\n")

# ── ANA ÇALIŞMA ────────────────────────────────────────────────────────────────
def main():
    log("=" * 60)
    log("HSI Medya stok sayımı başladı")

    disk_yolu = f"/Volumes/{DISK_ADI}"

    if not os.path.exists(disk_yolu):
        log(f"HATA: Disk bulunamadı → {disk_yolu}")
        return

    log(f"Disk bulundu: {disk_yolu}")

    sonuclar = stok_say(disk_yolu)

    if not sonuclar:
        log("Hiçbir mekan işlenmedi")
        return

    log(f"Toplam {len(sonuclar)} mekan tarandı")
    log("Supabase güncelleniyor...")
    supabase_guncelle(sonuclar)

    log("Tamamlandı")
    log("=" * 60)


if __name__ == "__main__":
    main()
