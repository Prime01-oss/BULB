"use strict";
const { app, BrowserWindow, ipcMain, Notification, session } = require("electron");
const path = require("path");
const fs = require("fs").promises;
const crypto = require("node:crypto");
const userDataPath = app.getPath("userData");
const notesDir = path.join(userDataPath, "ProjectSpaces");
const remindersFilePath = path.join(userDataPath, "reminders.json");
async function ensureNotesDirExists() {
  try {
    await fs.stat(notesDir);
  } catch (err) {
    await fs.mkdir(notesDir, { recursive: true });
  }
}
async function scanNotesDir(currentPath, baseDir) {
  const entries = await fs.readdir(currentPath, { withFileTypes: true });
  const tree = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const fullPath = path.join(currentPath, entry.name);
    const relativePath = path.relative(baseDir, fullPath);
    if (entry.isFile() && entry.name.endsWith(".canvas.json")) {
      try {
        const fileData = await fs.readFile(fullPath, "utf8");
        const project = JSON.parse(fileData);
        tree.push({
          id: project.id,
          title: project.title,
          type: "canvas",
          // Type remains 'canvas' for drawing space
          path: relativePath,
          createdAt: project.createdAt || null,
          updatedAt: project.updatedAt || null
        });
      } catch (err) {
        console.error(`Error reading project file ${entry.name} at ${relativePath}:`, err);
      }
    }
  }
  return tree.sort((a, b) => b.title.localeCompare(a.title));
}
let mainWindow;
function createWindow() {
  const preloadScript = app.isPackaged ? path.join(__dirname, "../preload/preload.js") : path.join(__dirname, "preload.js");
  mainWindow = new BrowserWindow({
    width: 1300,
    height: 1e3,
    // ADJUSTED height for dedicated app size
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: preloadScript
    },
    frame: false,
    transparent: true,
    titleBarStyle: "hidden",
    vibrancy: "ultra-dark",
    backgroundColor: "#00000000",
    show: false
  });
  const devServerURL = "http://localhost:5173";
  if (!app.isPackaged) {
    console.log("[DEBUG] Loading Dev Server URL: " + devServerURL);
    mainWindow.loadURL(devServerURL);
  } else {
    console.log("[DEBUG] Loading Production File");
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  ipcMain.on("show-notification", (event, title, description) => {
    const iconPath = app.isPackaged ? path.join(__dirname, "../renderer/notezone.png") : path.join(__dirname, "public/notezone.png");
    const notification = new Notification({
      title,
      body: description,
      icon: iconPath
    });
    notification.show();
  });
  ipcMain.on("close-window", () => {
    if (mainWindow) mainWindow.close();
  });
  ipcMain.on("minimize-window", () => {
    if (mainWindow) mainWindow.minimize();
  });
  ipcMain.on("maximize-window", () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) mainWindow.unmaximize();
      else mainWindow.maximize();
    }
  });
  ipcMain.handle("get-project-list", async () => {
    await ensureNotesDirExists();
    return scanNotesDir(notesDir, notesDir);
  });
  ipcMain.handle("get-note-content", async (event, projectPath) => {
    await ensureNotesDirExists();
    const fullPath = path.join(notesDir, projectPath);
    try {
      const fileData = await fs.readFile(fullPath, "utf8");
      const project = JSON.parse(fileData);
      let content;
      try {
        content = JSON.parse(project.content);
      } catch (e) {
        content = project.content;
      }
      return {
        ...project,
        content,
        createdAt: project.createdAt || (content?.createdAt ?? null),
        updatedAt: project.updatedAt || null
      };
    } catch (err) {
      console.error(`Error reading project at ${projectPath}:`, err);
      return null;
    }
  });
  ipcMain.handle("save-note-content", async (event, { id, path: projectPath, content }) => {
    await ensureNotesDirExists();
    const fullPath = path.join(notesDir, projectPath);
    try {
      const fileData = await fs.readFile(fullPath, "utf8");
      const project = JSON.parse(fileData);
      project.content = typeof content === "string" ? content : JSON.stringify(content);
      project.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      await fs.writeFile(fullPath, JSON.stringify(project, null, 2));
      return { success: true, path: projectPath, updatedAt: project.updatedAt };
    } catch (err) {
      console.error(`Error saving project at ${projectPath}:`, err);
      return { success: false, error: err.message };
    }
  });
  ipcMain.handle("update-note-title", async (event, { id, path: oldPath, newTitle }) => {
    await ensureNotesDirExists();
    const oldFullPath = path.join(notesDir, oldPath);
    newTitle = newTitle.replace(/[^a-zA-Z0-9\s-_.]/g, "").trim() || "Untitled Project";
    try {
      const fileData = await fs.readFile(oldFullPath, "utf8");
      const project = JSON.parse(fileData);
      project.title = newTitle;
      project.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
      await fs.writeFile(oldFullPath, JSON.stringify(project, null, 2));
    } catch (err) {
      console.error(`Error updating title for project ${id}:`, err);
    }
  });
  ipcMain.handle("create-canvas", async (event, parentPath = ".", projectName = "New Project") => {
    await ensureNotesDirExists();
    const fullDirPath = notesDir;
    const safeTitle = (projectName || "New Project").trim();
    const createdAt = (/* @__PURE__ */ new Date()).toISOString();
    const id = crypto.randomUUID();
    const newProject = {
      id,
      title: safeTitle,
      type: "canvas",
      createdAt,
      updatedAt: createdAt,
      content: JSON.stringify({ store: {}, createdAt })
      // Empty tldraw state
    };
    const fileName = `${id}.canvas.json`;
    const filePath = path.join(fullDirPath, fileName);
    try {
      await fs.mkdir(fullDirPath, { recursive: true });
      await fs.writeFile(filePath, JSON.stringify(newProject, null, 2));
      const relativePath = path.relative(notesDir, filePath);
      return { success: true, newItem: { id: newProject.id, title: newProject.title, type: "canvas", path: relativePath, createdAt } };
    } catch (err) {
      console.error("Error creating new project:", err);
      return null;
    }
  });
  ipcMain.handle("delete-note", async (event, itemPath, type) => {
    await ensureNotesDirExists();
    const fullPath = path.join(notesDir, itemPath);
    try {
      if (type === "canvas") {
        await fs.unlink(fullPath);
      }
    } catch (err) {
      console.error(`Error deleting item at ${itemPath}:`, err);
    }
  });
  ipcMain.handle("load-reminders", async () => {
    try {
      const data = await fs.readFile(remindersFilePath, "utf8");
      return JSON.parse(data);
    } catch (err) {
      await fs.writeFile(remindersFilePath, JSON.stringify([]));
      return [];
    }
  });
  ipcMain.on("save-reminders", async (event, reminders) => {
    await fs.writeFile(remindersFilePath, JSON.stringify(reminders));
  });
  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}
app.on("ready", () => {
  session.defaultSession.clearCache();
  if (!app.isPackaged) {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          "Content-Security-Policy": [
            "default-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: http://localhost:5173 ws://localhost:5173 https://cdn.tldraw.com https://unpkg.com https://esm.sh; script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:5173 https://esm.sh https://unpkg.com; style-src 'self' 'unsafe-inline' blob: data: https://unpkg.com https://esm.sh; font-src 'self' data: blob: https://cdn.tldraw.com https://unpkg.com https://esm.sh; img-src 'self' data: blob: https://cdn.tldraw.com https://unpkg.com https://esm.sh; connect-src 'self' http://localhost:5173 ws://localhost:5173 https://cdn.tldraw.com https://unpkg.com https://esm.sh;"
          ]
        }
      });
    });
  }
  ensureNotesDirExists();
  createWindow();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
