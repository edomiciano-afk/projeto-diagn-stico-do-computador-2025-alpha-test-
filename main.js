const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const path = require("path");
const adb = require("adbkit");
const client = adb.createClient();

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js")
    }
  });

  win.loadFile("index.html");

  win.webContents.on('did-fail-load', () => {
    console.error("Erro ao carregar a interface. Verifique o index.html!");
  });
}

// PDF seguro
ipcMain.handle("salvar-pdf", async (event, relatorio, chartData) => {
  try {
    const result = await dialog.showSaveDialog({
      title: "Salvar relatório em PDF",
      defaultPath: `relatorio_app_reparo_${Date.now()}.pdf`,
      filters: [{ name: "PDF", extensions: ["pdf"] }]
    });

    if (result.canceled || !result.filePath) return false;
    const filePath = result.filePath;

    const doc = new PDFDocument({ margin: 30 });
    const writeStream = fs.createWriteStream(filePath);

    writeStream.on('error', (err) => console.error("Erro ao escrever PDF:", err));

    doc.pipe(writeStream);

    doc.fontSize(16).text("APP REPAIR TOOL — RELATÓRIO AVANÇADO", { align: "center" });
    doc.moveDown();
    doc.fontSize(11).text(relatorio);
    doc.moveDown();

    if (chartData) {
      const base64Data = chartData.replace(/^data:image\/png;base64,/, "");
      const imgPath = path.join(__dirname, "chart_tmp.png");
      fs.writeFileSync(imgPath, base64Data, "base64");
      doc.image(imgPath, { width: 400, align: "center" });
    }

    doc.end();

    return new Promise((resolve) => {
      writeStream.on('finish', () => resolve(true));
    });

  } catch (err) {
    console.error("Erro ao salvar PDF:", err);
    return false;
  }
});

// Lista dispositivos ADB
ipcMain.handle("listar-adb", async () => {
  try {
    let devices = await client.listDevices();
    if (!devices) devices = [];
    return devices;
  } catch (e) {
    console.error("Erro ADB:", e);
    return [];
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
