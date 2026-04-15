#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HSI Medya — Lokal Stok API Sunucusu
Çalıştır: python3 server.py
Vite bu sunucuyu /api/* üzerinden proxy'ler.
"""
import json
import sys
import os
from http.server import HTTPServer, BaseHTTPRequestHandler

# stok_say.py'yi aynı dizinden import et
sys.path.insert(0, os.path.dirname(__file__))
import stok_say as ss

# ── İÇERİK KONTROL ────────────────────────────────────────────────────────────
YAPIM_KEYWORDS = [
    "yapım", "yapim", "usulü", "usulu", "tarif", "hazırlık", "hazirlik",
    "nasıl", "antakya usulü", "usta usulü", "imal", "üretim",
]
AKIM_KEYWORDS = [
    "ısırık", "isirık", "isırık", "minyatür", "minyatur",
    "acı bizi", "bizi bozmaz", "challenge", "akım", "akim",
    "porsiyon", "adet tane",
]

def _siniflandir(ad):
    t = ad.lower()
    if any(k in t for k in YAPIM_KEYWORDS):
        return "yapim"
    if any(k in t for k in AKIM_KEYWORDS):
        return "akim"
    return "diger"

def icerik_tara(disk_yolu):
    s_klasoru = os.path.join(disk_yolu, ss.KLASOR_ADI)
    if not os.path.exists(s_klasoru):
        return []
    mekanlar = []
    for mekan_klasoru in sorted(os.listdir(s_klasoru)):
        if mekan_klasoru.startswith('.'):
            continue
        mekan_yolu = os.path.join(s_klasoru, mekan_klasoru)
        if not os.path.isdir(mekan_yolu):
            continue
        anahtar = ss._nfc(mekan_klasoru)
        if anahtar not in ss.MEKAN_ESLESTIRME:
            continue
        supabase_adi = ss.MEKAN_ESLESTIRME[anahtar]
        if supabase_adi is None:
            continue
        yapim, akim, diger = [], [], []
        try:
            icerikler = sorted(os.listdir(mekan_yolu))
        except PermissionError:
            continue
        for icerik_adi in icerikler:
            if icerik_adi.startswith('.'):
                continue
            icerik_yolu = os.path.join(mekan_yolu, icerik_adi)
            if not os.path.isdir(icerik_yolu):
                continue
            renkli = ss.renkli_mi(icerik_yolu)
            item = {"ad": icerik_adi, "renkli": renkli}
            tur = _siniflandir(icerik_adi)
            if tur == "yapim":
                yapim.append(item)
            elif tur == "akim":
                akim.append(item)
            else:
                diger.append(item)
        if yapim or akim or diger:
            mekanlar.append({
                "disk_klasoru": mekan_klasoru,
                "supabase_adi": supabase_adi,
                "yapim": yapim,
                "akim":  akim,
                "diger": diger,
            })
    return mekanlar


class StokHandler(BaseHTTPRequestHandler):

    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors()
        self.end_headers()

    def do_GET(self):
        if self.path == "/api/ping":
            self._json(200, {"ok": True, "msg": "HSI Stok API çalışıyor"})
        elif self.path == "/api/icerik-tara":
            try:
                disk_yolu = f"/Volumes/{ss.DISK_ADI}"
                if not os.path.exists(disk_yolu):
                    self._json(200, {"ok": True, "disk_var": False, "mekanlar": []})
                    return
                mekanlar = icerik_tara(disk_yolu)
                self._json(200, {"ok": True, "disk_var": True, "mekanlar": mekanlar})
            except Exception as e:
                self._json(500, {"ok": False, "error": str(e)})
        else:
            self._json(404, {"ok": False, "error": "Endpoint bulunamadı"})

    def do_POST(self):
        if self.path == "/api/stok-say":
            try:
                disk_yolu = f"/Volumes/{ss.DISK_ADI}"

                if not os.path.exists(disk_yolu):
                    self._json(400, {"ok": False, "error": f"Disk bulunamadı: {disk_yolu}"})
                    return

                if not ss.SUPABASE_URL or not ss.SUPABASE_KEY:
                    self._json(400, {"ok": False, "error": "Supabase credentials eksik (app/.env)"})
                    return

                sonuclar = ss.stok_say(disk_yolu)
                if not sonuclar:
                    self._json(400, {"ok": False, "error": "Hiçbir mekan işlenmedi"})
                    return

                ss.supabase_guncelle(sonuclar)

                self._json(200, {
                    "ok": True,
                    "guncellenen": len(sonuclar),
                    "stoklar": {k: v["stock"] for k, v in sonuclar.items()},
                })
            except Exception as e:
                self._json(500, {"ok": False, "error": str(e)})
        else:
            self._json(404, {"ok": False, "error": "Endpoint bulunamadı"})

    def _json(self, status, data):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self._cors()
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        print(f"[API] {self.address_string()} {fmt % args}")


if __name__ == "__main__":
    port = 8765
    server = HTTPServer(("localhost", port), StokHandler)
    print(f"✅ HSI Stok API: http://localhost:{port}")
    print(f"   Disk: /Volumes/{ss.DISK_ADI}")
    print("   Durdurmak için: Ctrl+C")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nSunucu durduruldu.")
