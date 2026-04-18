"use strict";

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  notify: (title, body) => ipcRenderer.send("hsi-notify", { title, body }),
});
