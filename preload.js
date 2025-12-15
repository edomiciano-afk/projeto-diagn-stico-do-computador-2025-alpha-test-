const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  salvarPDF: (relatorio, chartData) => ipcRenderer.invoke("salvar-pdf", relatorio, chartData),
  listarADB: () => ipcRenderer.invoke("listar-adb")
});
