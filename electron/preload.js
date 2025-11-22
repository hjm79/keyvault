const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    loadLicenses: () => ipcRenderer.invoke('load-licenses'),
    saveLicenses: (licenses) => ipcRenderer.invoke('save-licenses', licenses),
    getAppInfo: (path) => ipcRenderer.invoke('get-app-info', path),
    getFilePath: (file) => webUtils.getPathForFile(file),
    openPath: (path) => ipcRenderer.invoke('open-path', path),
    showItemInFolder: (path) => ipcRenderer.invoke('show-item-in-folder', path),
    copyFile: (path) => ipcRenderer.invoke('copy-file', path),

    // Export/Import APIs
    exportLicensesJSON: () => ipcRenderer.invoke('export-licenses-json'),
    exportLicensesZIP: () => ipcRenderer.invoke('export-licenses-zip'),
    importLicenses: () => ipcRenderer.invoke('import-licenses'),

    // Storage Location APIs
    getStorageLocation: () => ipcRenderer.invoke('get-storage-location'),
    setStorageLocation: (useICloud) => ipcRenderer.invoke('set-storage-location', useICloud),

    // Category APIs
    loadCategories: () => ipcRenderer.invoke('load-categories'),
    saveCategories: (categories) => ipcRenderer.invoke('save-categories', categories),

    // Open external URL
    openExternal: (url) => ipcRenderer.invoke('open-external', url),

    // Execute terminal command
    executeTerminalCommand: (command) => ipcRenderer.invoke('execute-terminal-command', command),
});
