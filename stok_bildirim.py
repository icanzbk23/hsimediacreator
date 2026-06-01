#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HSI Medya — Disk Otomasyonu
My Passport takılınca otomatik çalışır:
  1. /Volumes/My Passport/s/ klasörünü tarar
  2. macOS bildirimi gönderir
  3. Supabase müsaitse günceller (erişilmezse sessizce geçer)
"""
import os, sys, time, subprocess, fcntl

ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ROOT)

DISK_YOLU = "/Volumes/My Passport"
S_YOLU    = os.path.join(DISK_YOLU, "s")
LOCK_FILE = "/tmp/hsi_stok_bildirim.lock"

# ── Çift çalışmayı önle ────────────────────────────────────────────────────────
lock_fd = open(LOCK_FILE, "w")
try:
    fcntl.flock(lock_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
except BlockingIOError:
    sys.exit(0)

# ── Disk kontrolü ──────────────────────────────────────────────────────────────
if not os.path.exists(S_YOLU):
    sys.exit(0)

time.sleep(2)  # disk tam mount olsun
if not os.path.exists(S_YOLU):
    sys.exit(0)

# ── Stok say ──────────────────────────────────────────────────────────────────
import stok_say as ss

try:
    sonuclar = ss.stok_say(DISK_YOLU)
except Exception as e:
    subprocess.run(["osascript", "-e",
        f'display notification "Sayım hatası: {e}" with title "HSI Medya Hata"'])
    sys.exit(1)

if not sonuclar:
    subprocess.run(["osascript", "-e",
        'display notification "Eşleşen mekan bulunamadı." with title "HSI Medya"'])
    sys.exit(0)

# ── Supabase güncelle (isteğe bağlı, erişilmezse geç) ─────────────────────────
try:
    ss.supabase_guncelle(sonuclar)
except Exception:
    pass

# ── Bildirim hazırla ───────────────────────────────────────────────────────────
def emoji(stok):
    if stok == 0: return "🔴"
    if stok <= 3: return "🟠"
    if stok <= 7: return "🟡"
    return "🟢"

toplam_stok = sum(v["stock"] for v in sonuclar.values())
sirali = sorted(sonuclar.items(), key=lambda x: x[1]["stock"])

# Kritik (0-3 stok) olanları göster, sonra düşük olanlar
kritik = [(n, v["stock"]) for n, v in sirali if v["stock"] <= 3][:5]
goster = kritik if kritik else [(n, v["stock"]) for n, v in sirali[:4]]

mesaj  = "  ".join(f"{emoji(s)} {n}: {s}" for n, s in goster)
baslik = f"My Passport — {len(sonuclar)} mekan, {toplam_stok} stok"

subprocess.run([
    "osascript", "-e",
    f'display notification "{mesaj}" with title "{baslik}" sound name "Glass"'
])
