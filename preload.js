const { contextBridge, ipcRenderer } = require('electron');

// Securely expose a global API to your renderer process (the UI)
contextBridge.exposeInMainWorld('electronAPI', {
    // --- Window Controls (Unchanged) ---
    closeWindow: () => ipcRenderer.send('close-window'),
    minimizeWindow: () => ipcRenderer.send('minimize-window'),
    maximizeWindow: () => ipcRenderer.send('maximize-window'),

    // --- Project Space Functions (Updated for Bulb) ---
    // FIX: Renamed the exposed function to match App.jsx, and updated the channel name.
    getProjectList: () => ipcRenderer.invoke('get-project-list'), 
    
    // Existing channels used for content loading/saving/managing project spaces
    getNoteContent: (notePath) => ipcRenderer.invoke('get-note-content', notePath),
    saveNoteContent: (note) => ipcRenderer.invoke('save-note-content', note),
    updateNoteTitle: (item) => ipcRenderer.invoke('update-note-title', item),
    createCanvas: (parentPath, canvasName) => ipcRenderer.invoke('create-canvas', parentPath, canvasName),
    deleteNote: (itemPath, type) => ipcRenderer.invoke('delete-note', itemPath, type),
    
    // Removed: getNotesList, createNote, createFolder (These were removed from main.js for the Bulb app)

    // --- Reminders/Notification (Kept for compatibility) ---
    loadReminders: () => ipcRenderer.invoke('load-reminders'),
    saveReminders: (reminders) => ipcRenderer.send('save-reminders', reminders),
    showNotification: (title, desc) => ipcRenderer.send('show-notification', title, desc)
});