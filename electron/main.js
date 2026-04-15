"use strict";

const path   = require("path");
const http   = require("http");
const fs     = require("fs");
const { spawn } = require("child_process");
const { app, BrowserWindow, Menu, shell } = require("electron");

// ── AYARLAR ───────────────────────────────────────────────────────────────────
const API_PORT  = 8765;
const APP_PORT  = 4173;
const DIST_PATH = path.join(__dirname, "..", "app", "dist");
let ROOT_PATH   = path.join(__dirname, "..");

let serverProcess = null;
let staticServer  = null;
let mainWindow    = null;

// ── PYTHON SERVER.PY BAŞLAT ───────────────────────────────────────────────────
function startPythonServer() {
  const script   = path.join(ROOT_PATH, "server.py");
  const py_paths = [
    "/Library/Frameworks/Python.framework/Versions/3.13/bin/python3",
    "/Library/Frameworks/Python.framework/Versions/3.12/bin/python3",
    "/usr/local/bin/python3",
    "python3",
  ];
  const py = py_paths.find(p => p === "python3" || fs.existsSync(p)) || "python3";

  console.log("[Electron] server.py başlatılıyor:", script);

  serverProcess = spawn(py, [script], {
    cwd: ROOT_PATH,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, PYTHONUNBUFFERED: "1" },
  });

  serverProcess.stdout.on("data", d => console.log("[server.py]", d.toString().trim()));
  serverProcess.stderr.on("data", d => console.error("[server.py]", d.toString().trim()));
  serverProcess.on("exit", code => console.log("[server.py] çıktı, kod:", code));
}

// ── STATIK DOSYA + API PROXY SUNUCUSU ─────────────────────────────────────────
function startStaticServer() {
  const MIME = {
    ".html": "text/html; charset=utf-8",
    ".js":   "application/javascript",
    ".css":  "text/css",
    ".svg":  "image/svg+xml",
    ".png":  "image/png",
    ".ico":  "image/x-icon",
    ".json": "application/json",
    ".woff2":"font/woff2",
    ".woff": "font/woff",
  };

  staticServer = http.createServer((req, res) => {
    // /api/* → server.py proxy
    if (req.url.startsWith("/api/")) {
      const opts = {
        hostname: "localhost",
        port: API_PORT,
        path: req.url,
        method: req.method,
        headers: { ...req.headers, host: `localhost:${API_PORT}` },
      };
      const proxy = http.request(opts, pRes => {
        res.writeHead(pRes.statusCode, pRes.headers);
        pRes.pipe(res, { end: true });
      });
      proxy.on("error", err => {
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "server.py ulaşılamıyor: " + err.message }));
      });
      req.pipe(proxy, { end: true });
      return;
    }

    // Statik dosya
    let filePath = path.join(DIST_PATH, req.url === "/" ? "index.html" : req.url);
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(DIST_PATH, "index.html");
    }

    const ext  = path.extname(filePath);
    const mime = MIME[ext] || "application/octet-stream";

    try {
      res.writeHead(200, { "Content-Type": mime });
      fs.createReadStream(filePath).pipe(res);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  });

  staticServer.listen(APP_PORT, "localhost", () => {
    console.log(`[Electron] Uygulama sunucusu: http://localhost:${APP_PORT}`);
  });
}

// ── SERVER.PY HAZIR OLANA KADAR BEKLE ─────────────────────────────────────────
function waitForApiServer(cb, retries = 30) {
  const req = http.get(`http://localhost:${API_PORT}/api/ping`, res => {
    if (res.statusCode === 200) { cb(); return; }
    retry(cb, retries);
  });
  req.on("error", () => retry(cb, retries));
  req.end();
}

function retry(cb, retries) {
  if (retries <= 0) { console.warn("[Electron] server.py hazır değil, devam ediliyor..."); cb(); return; }
  setTimeout(() => waitForApiServer(cb, retries - 1), 400);
}

// ── PENCERE OLUŞTUR ────────────────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width:  1440,
    height: 920,
    minWidth:  1100,
    minHeight: 700,
    title: "HSI Medya",
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 14, y: 14 },
    backgroundColor: "#0E0E1C",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
  });

  mainWindow.once("ready-to-show", () => mainWindow.show());
  mainWindow.loadURL(`http://localhost:${APP_PORT}`);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

// ── MAC MENÜ ───────────────────────────────────────────────────────────────────
function buildMenu() {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {
      label: "HSI Medya",
      submenu: [
        { label: "Hakkında", role: "about" },
        { type: "separator" },
        { label: "Gizle", role: "hide" },
        { label: "Diğerlerini Gizle", role: "hideOthers" },
        { type: "separator" },
        { label: "Çıkış", role: "quit" },
      ],
    },
    {
      label: "Düzenle",
      submenu: [
        { label: "Geri Al", role: "undo" },
        { label: "Yinele", role: "redo" },
        { type: "separator" },
        { label: "Kes", role: "cut" },
        { label: "Kopyala", role: "copy" },
        { label: "Yapıştır", role: "paste" },
        { label: "Tümünü Seç", role: "selectAll" },
      ],
    },
    {
      label: "Görünüm",
      submenu: [
        { label: "Yenile", role: "reload" },
        { type: "separator" },
        { label: "Tam Ekran", role: "togglefullscreen" },
        { label: "Geliştirici Araçları", role: "toggleDevTools" },
      ],
    },
    {
      label: "Pencere",
      submenu: [
        { label: "Küçült", role: "minimize" },
        { label: "Yakınlaştır", role: "zoom" },
        { type: "separator" },
        { label: "Öne Getir", role: "front" },
      ],
    },
  ]));
}

// ── UYGULAMA YAŞAM DÖNGÜSÜ ────────────────────────────────────────────────────
app.whenReady().then(() => {
  if (app.isPackaged) ROOT_PATH = process.resourcesPath;
  buildMenu();
  startPythonServer();
  startStaticServer();
  waitForApiServer(createWindow);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (staticServer) staticServer.close();
  if (serverProcess) {
    serverProcess.kill("SIGTERM");
    setTimeout(() => { try { serverProcess.kill("SIGKILL"); } catch {} }, 2000);
  }
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (serverProcess) { try { serverProcess.kill("SIGTERM"); } catch {} }
});
