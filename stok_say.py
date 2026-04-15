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
import ssl
import unicodedata
from datetime import datetime

# macOS Python SSL sertifika sorunu için
ssl_ctx = ssl.create_default_context()
try:
    import certifi
    ssl_ctx = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    ssl_ctx.check_hostname = False
    ssl_ctx.verify_mode = ssl.CERT_NONE

# ── .env OKUYUCU ────────────────────────────────────────────────────────────────
def env_oku():
    """app/.env dosyasından değerleri okur. Bulunamazsa boş dict döner."""
    env_yolu = os.path.join(os.path.dirname(__file__), "app", ".env")
    degiskenler = {}
    if not os.path.exists(env_yolu):
        return degiskenler
    with open(env_yolu, encoding="utf-8") as f:
        for satir in f:
            satir = satir.strip()
            if not satir or satir.startswith("#") or "=" not in satir:
                continue
            anahtar, _, deger = satir.partition("=")
            degiskenler[anahtar.strip()] = deger.strip()
    return degiskenler

_ENV = env_oku()

# ── AYARLAR ────────────────────────────────────────────────────────────────────
DISK_ADI     = "Elements"
KLASOR_ADI   = "s"
SUPABASE_URL = _ENV.get("VITE_SUPABASE_URL", "")    # app/.env → VITE_SUPABASE_URL
SUPABASE_KEY = _ENV.get("SUPABASE_SERVICE_KEY", "") or _ENV.get("VITE_SUPABASE_ANON_KEY", "") # app/.env → SUPABASE_SERVICE_KEY
LOG_DOSYASI  = os.path.expanduser("~/stok_log.txt")

# Diskteki klasör adı → Supabase'deki mekan adı eşleştirmesi
# Sol taraf: ls komutuyla gördüğün EXACT klasör adı
# Sağ taraf: Supabase'deki venues tablosundaki name alanı
_RAW_ESLESTIRME = {
    "MİKADO":                         "Mikado Restaurant",
    "HARVEY BURGER":                   "Harvey Burger",
    "BATURA CAFE":                     None,
    "SULTAN SOFRASI":                  "Sultan Sofrası",
    "EGE DÖNER":                       "Ege Döner",
    "EGE BÜFE":                        "Ege Büfe",
    "KUBAN":                           "Kuban Kuruyemiş",
    "MUSTA":                           "Musta Döner",
    "SÜLEYMAN USTA":                   "Süleyman Usta Döner",
    "İSTE ÇİFTLİK":                    "İSTE Çiftlik",
    "SEZAİ USTA":                      "Sezai Usta",
    "SÜTLÜ KAVURMA":                   "Sütlü Kavurma",
    "YSANTOCHİA":                      "YSANTOCHİA",
    "SİNAN ÖZDEMİR":                   "Sinan Özdemir",
    "HATAY DÖNER":                     None,
    "MERCAN":                          None,
    "CAFE MAKARİNA":                   None,
    "KRAL DÖNER":                      None,
    "ES DÖNER":                        None,
    "GAZİANTEP KASAP MANGAL":          None,
    "PASAPORT PİZZA":                  None,
    "ARŞİV":                           None,
    "KRAL KULLANILACAKLAR":            None,
    "PASAPORT DENİZCİLER DRON ÇEKİMİ": None,
    "ŞENÖZ":                           "Şenöz",
    "SAUDADE":                         "Saudade",
}

def _nfc(s):
    return unicodedata.normalize("NFC", s.strip().upper())

MEKAN_ESLESTIRME = {_nfc(k): v for k, v in _RAW_ESLESTIRME.items()}

# ── RENK KONTROLÜ ──────────────────────────────────────────────────────────────
def renkli_mi(klasor_yolu):
    """
    True  = gerçek renk var (label 1-7) → yapılmış → SAYMA
    False = renksiz veya default (label 0) → yapılmamış → STOK

    macOS FinderInfo (32 byte): frFlags UInt16 big-endian, byte offset 8-9.
    Label = (byte9 >> 1) & 0x07  — sıfır ise renk yok.
    """
    result = subprocess.run(
        ['xattr', '-px', 'com.apple.FinderInfo', klasor_yolu],
        capture_output=True,
        text=True
    )
    if result.returncode != 0:
        return False  # xattr yok → renksiz
    hex_str = result.stdout.replace(' ', '').replace('\n', '').strip()
    if len(hex_str) < 20:
        return False
    try:
        # frFlags 2 byte (offset 8-9); endianness'e göre label hangi byte'ta
        # olduğu değişebilir — her ikisini kontrol et (bits 1-3).
        b8 = int(hex_str[16:18], 16)
        b9 = int(hex_str[18:20], 16)
        label = ((b8 >> 1) & 0x07) | ((b9 >> 1) & 0x07)
        return label != 0
    except Exception:
        return False

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

        # Eşleştirme tablosunda yoksa atla (NFC normalize ederek karşılaştır)
        anahtar = _nfc(mekan_klasoru)
        if anahtar not in MEKAN_ESLESTIRME:
            log(f"  UYARI: '{mekan_klasoru}' eşleştirme tablosunda yok, atlandı")
            continue

        supabase_adi = MEKAN_ESLESTIRME[anahtar]
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
    """
    Upsert kullanır: satır yoksa INSERT, varsa stock günceller.
    PATCH yerine POST + on_conflict=name + Prefer: resolution=merge-duplicates
    """
    basarili = 0
    basarisiz = 0

    for mekan_adi, veri in sonuclar.items():
        try:
            # Upsert: name çakışırsa stock alanını güncelle
            url = f"{SUPABASE_URL}/rest/v1/venues?on_conflict=name"

            data = json.dumps({"name": mekan_adi, "stock": veri["stock"]}).encode("utf-8")

            req = urllib.request.Request(
                url,
                data=data,
                method="POST",
                headers={
                    "Content-Type":  "application/json",
                    "apikey":        SUPABASE_KEY,
                    "Authorization": f"Bearer {SUPABASE_KEY}",
                    "Prefer":        "resolution=merge-duplicates,return=minimal",
                },
            )

            with urllib.request.urlopen(req, timeout=10, context=ssl_ctx) as resp:
                if resp.status in (200, 201, 204):
                    basarili += 1
                    log(f"  ✅ Upsert: {mekan_adi} → {veri['stock']} stok")
                else:
                    basarisiz += 1
                    log(f"  ❌ HTTP {resp.status}: {mekan_adi}")

        except Exception as e:
            basarisiz += 1
            log(f"  ❌ HATA [{mekan_adi}]: {e}")

    log(f"Supabase: {basarili} upsert edildi, {basarisiz} hata")

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

    if not SUPABASE_URL or not SUPABASE_KEY:
        log("HATA: Supabase credentials eksik — app/.env içine VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY ekle")
        return

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
