const { app, BrowserWindow, shell } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const net = require("net");

let mainWindow;
let nextProcess;

const isDev = !app.isPackaged;
const PORT = 3000;
const SERVER_URL = `http://localhost:${PORT}`;

function waitForPort(port, host = "localhost", timeout = 60000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const tryConnect = () => {
      const socket = new net.Socket();
      socket.setTimeout(1000);
      socket.on("connect", () => {
        socket.destroy();
        resolve();
      });
      socket.on("error", () => {
        socket.destroy();
        if (Date.now() - startTime > timeout) {
          reject(new Error(`Timed out waiting for port ${port}`));
        } else {
          setTimeout(tryConnect, 500);
        }
      });
      socket.on("timeout", () => {
        socket.destroy();
        if (Date.now() - startTime > timeout) {
          reject(new Error(`Timed out waiting for port ${port}`));
        } else {
          setTimeout(tryConnect, 500);
        }
      });
      socket.connect(port, host);
    };
    tryConnect();
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "Speed Dungeon",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.loadURL(SERVER_URL);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

async function startNextDev() {
  const nextBin = path.join(__dirname, "..", "node_modules", ".bin", "next");
  nextProcess = spawn(nextBin, ["dev", "--turbopack"], {
    cwd: path.join(__dirname, ".."),
    env: { ...process.env, NODE_ENV: "development" },
    stdio: "pipe",
  });

  nextProcess.stdout.on("data", (data) => {
    console.log(`[Next.js] ${data.toString().trim()}`);
  });
  nextProcess.stderr.on("data", (data) => {
    console.error(`[Next.js] ${data.toString().trim()}`);
  });
  nextProcess.on("error", (err) => {
    console.error("Failed to start Next.js:", err);
  });

  console.log("Waiting for Next.js dev server...");
  await waitForPort(PORT);
  console.log("Next.js dev server is ready!");
}

async function startNextProduction() {
  // In production, the standalone server.js is bundled alongside electron
  const standaloneDir = path.join(process.resourcesPath, "standalone");
  const serverJs = path.join(standaloneDir, "packages", "client", "server.js");

  nextProcess = spawn(process.execPath, [serverJs], {
    cwd: path.join(standaloneDir, "packages", "client"),
    env: {
      ...process.env,
      NODE_ENV: "production",
      PORT: String(PORT),
      HOSTNAME: "localhost",
    },
    stdio: "pipe",
  });

  nextProcess.stdout.on("data", (data) => {
    console.log(`[Next.js] ${data.toString().trim()}`);
  });
  nextProcess.stderr.on("data", (data) => {
    console.error(`[Next.js] ${data.toString().trim()}`);
  });
  nextProcess.on("error", (err) => {
    console.error("Failed to start Next.js production server:", err);
  });

  console.log("Starting Next.js production server...");
  await waitForPort(PORT);
  console.log("Next.js production server is ready!");
}

app.whenReady().then(async () => {
  if (isDev) {
    await startNextDev();
  } else {
    await startNextProduction();
  }
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (nextProcess) {
    nextProcess.kill("SIGTERM");
    nextProcess = null;
  }
});
