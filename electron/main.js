"use strict";

const path   = require("path");
const http   = require("http");
const fs     = require("fs");
const { spawn } = require("child_process");
const { app, BrowserWindow, Menu, shell, ipcMain, Notification } = require("electron");

// ── AYARLAR ───────────────────────────────────────────────────────────────────
const API_PORT  = 8765;
const DIST_PATH = path.join(__dirname, "..", "app", "dist");
let ROOT_PATH   = path.join(__dirname, "..");

let serverProcess = null;
let mainWindow    = null;

// ── PYTHON SERVER.PY BAŞLAT ───────────────────────────────────────────────────
function startPythonServer() {
  const script = path.join(ROOT_PATH, "server.py");
  if (!fs.existsSync(script)) { console.warn("[Electron] server.py bulunamadı:", script); return; }

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

// ── PENCERE OLUŞTUR ────────────────────────────────────────────────────────────
function createWindow() {
  const indexFile = path.join(DIST_PATH, "index.html");
  console.log("[Electron] Yükleniyor:", indexFile, "| Var mı:", fs.existsSync(indexFile));

  mainWindow = new BrowserWindow({
    width:  1440,
    height: 920,
    minWidth:  900,
    minHeight: 600,
    title: "HSI Medya",
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 14, y: 14 },
    backgroundColor: "#0E0E1C",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    show: true,
  });

  mainWindow.loadFile(indexFile);

  mainWindow.webContents.on("did-fail-load", (event, code, desc) => {
    console.error("[Electron] Sayfa yüklenemedi:", code, desc);
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

// ── SERVER.PY HAZIR OLANA KADAR BEKLE ─────────────────────────────────────────
function waitForApiServer(cb, retries = 25) {
  const req = http.get(`http://localhost:${API_PORT}/api/ping`, res => {
    if (res.statusCode === 200) { cb(); return; }
    retryWait(cb, retries);
  });
  req.on("error", () => retryWait(cb, retries));
  req.end();
}

function retryWait(cb, retries) {
  if (retries <= 0) { console.warn("[Electron] server.py hazır değil, yine de devam ediliyor..."); cb(); return; }
  setTimeout(() => waitForApiServer(cb, retries - 1), 400);
}

// ── NATIVE BİLDİRİM (renderer'dan IPC ile tetiklenir) ─────────────────────────
ipcMain.on("hsi-notify", (_event, { title, body }) => {
  if (!Notification.isSupported()) return;
  const n = new Notification({ title, body, silent: false });
  n.on("click", () => {
    if (mainWindow) { mainWindow.show(); mainWindow.focus(); }
  });
  n.show();
});

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
  // server.py zaten LaunchAgent tarafından çalışıyor olabilir —
  // onu beklemeden de pencereyi açabiliriz, çünkü uygulama file:// üzerinden yükleniyor
  waitForApiServer(createWindow);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (serverProcess) {
    serverProcess.kill("SIGTERM");
    setTimeout(() => { try { serverProcess.kill("SIGKILL"); } catch {} }, 2000);
  }
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (serverProcess) { try { serverProcess.kill("SIGTERM"); } catch {} }
});
