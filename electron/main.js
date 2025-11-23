const { app, BrowserWindow, ipcMain, protocol, net, nativeImage, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');
const { promisify } = require('util');
const archiver = require('archiver');
const extract = require('extract-zip');

const execPromise = promisify(exec);

let mainWindow;

// Check if this is first run
function isFirstRun() {
    const configPath = path.join(app.getPath('userData'), 'storage-config.json');
    return !fs.existsSync(configPath);
}

// Show welcome dialog and storage selection
async function showFirstRunDialogs() {
    return new Promise((resolve) => {
        const welcomeWindow = new BrowserWindow({
            width: 600,
            height: 700,
            resizable: false,
            minimizable: false,
            maximizable: false,
            fullscreenable: false,
            title: '환영합니다',
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                nodeIntegration: false,
                contextIsolation: true
            }
        });

        welcomeWindow.loadFile(path.join(__dirname, 'welcome.html'));

        // Remove menu bar
        welcomeWindow.setMenuBarVisibility(false);

        welcomeWindow.on('closed', () => {
            resolve();
        });
    });
}

async function createWindow() {
    // Check for first run and show dialogs
    if (isFirstRun()) {
        await showFirstRunDialogs();
    }

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        titleBarStyle: 'hidden', // Hidden titlebar allows custom drag region
        backgroundColor: '#1e293b', // slate-800 to match dark theme
        vibrancy: 'dark', // macOS dark vibrancy effect
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false // DEBUG: Disable webSecurity to allow local resources
        },
    });

    const startUrl = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, '../out/index.html')}`;
    mainWindow.loadURL(startUrl);

    if (process.env.ELECTRON_START_URL) {
        // Development mode
    }

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}



app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

// IPC Handlers for File System
const BASE_DIR = path.join(app.getPath('documents'), 'KeyVault');
const DATA_FILE_NAME = 'license-manager-data.json';
const DATA_PATH = path.join(BASE_DIR, DATA_FILE_NAME);
const OLD_DATA_PATH = path.join(app.getPath('documents'), DATA_FILE_NAME);

// Migrate old data location to new location if needed
// Migrate old data location to new location if needed
function migrateOldData() {
    try {
        // If old data exists and new data doesn't, migrate it
        if (fs.existsSync(OLD_DATA_PATH) && !fs.existsSync(DATA_PATH)) {
            // Ensure new directory exists
            if (!fs.existsSync(BASE_DIR)) {
                fs.mkdirSync(BASE_DIR, { recursive: true });
            }

            // Copy data file
            fs.copyFileSync(OLD_DATA_PATH, DATA_PATH);
        }
    } catch (error) {
        console.error('Migration failed:', error);
    }
}

// Run migration on startup
migrateOldData();

ipcMain.handle('load-licenses', async () => {
    try {
        const basePath = getStorageBasePath();
        const dataPath = path.join(basePath, 'license-manager-data.json');

        if (fs.existsSync(dataPath)) {
            const data = fs.readFileSync(dataPath, 'utf-8');
            return JSON.parse(data);
        }
        return [];
    } catch (error) {
        console.error('Failed to load licenses:', error);
        return [];
    }
});

ipcMain.handle('save-licenses', async (event, licenses) => {
    try {
        const basePath = getStorageBasePath();
        const dataPath = path.join(basePath, 'license-manager-data.json');

        // Ensure directory exists
        if (!fs.existsSync(basePath)) {
            fs.mkdirSync(basePath, { recursive: true });
        }

        fs.writeFileSync(dataPath, JSON.stringify(licenses, null, 2), 'utf-8');
        return { success: true };
    } catch (error) {
        console.error('Failed to save licenses:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('load-categories', async () => {
    try {
        const basePath = getStorageBasePath();
        const categoriesPath = path.join(basePath, 'categories.json');

        if (fs.existsSync(categoriesPath)) {
            const data = fs.readFileSync(categoriesPath, 'utf-8');
            return JSON.parse(data);
        }

        // Return defaults if file doesn't exist
        const defaultCategories = [
            'Development', 'Design', 'Productivity', 'Utility', 'Office',
            'Social', 'Entertainment', 'Education', 'Finance',
            'Game', 'Music', 'Video', 'Other'
        ];
        return defaultCategories;
    } catch (error) {
        console.error('Failed to load categories:', error);
        return [];
    }
});

ipcMain.handle('save-categories', async (event, categories) => {
    try {
        const basePath = getStorageBasePath();
        const categoriesPath = path.join(basePath, 'categories.json');

        // Ensure directory exists
        if (!fs.existsSync(basePath)) {
            fs.mkdirSync(basePath, { recursive: true });
        }

        fs.writeFileSync(categoriesPath, JSON.stringify(categories, null, 2), 'utf-8');
        return { success: true };
    } catch (error) {
        console.error('Failed to save categories:', error);
        return { success: false, error: error.message };
    }
});

// File Operation Handlers
ipcMain.handle('open-path', async (event, path) => {
    try {
        const result = await shell.openPath(path);
        if (result) {
            return { success: false, error: result };
        }
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('show-item-in-folder', async (event, path) => {
    try {
        shell.showItemInFolder(path);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('execute-terminal-command', async (event, command) => {
    try {
        // Execute command in macOS Terminal
        const appleScript = `
            tell application "Terminal"
                activate
                do script "${command.replace(/"/g, '\\"')}"
            end tell
        `;

        await execPromise(`osascript -e '${appleScript.replace(/'/g, "'\\''")}'`);
        return { success: true };
    } catch (error) {
        console.error('Failed to execute terminal command:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('open-external', async (event, url) => {
    try {
        await shell.openExternal(url);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// Check for updates from GitHub
ipcMain.handle('check-for-updates', async () => {
    try {
        const https = require('https');

        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.github.com',
                path: '/repos/hjm79/keyvault/releases/latest',
                headers: {
                    'User-Agent': 'KeyVault-App'
                }
            };

            https.get(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const release = JSON.parse(data);
                        resolve({
                            success: true,
                            data: {
                                tagName: release.tag_name,
                                htmlUrl: release.html_url,
                                name: release.name
                            }
                        });
                    } catch (error) {
                        resolve({ success: false, error: 'Failed to parse response' });
                    }
                });
            }).on('error', (error) => {
                resolve({ success: false, error: error.message });
            });
        });
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('copy-file', async (event, sourcePath) => {
    try {
        const basePath = getStorageBasePath();
        const FILES_DIR = path.join(basePath, 'Files');

        if (!fs.existsSync(FILES_DIR)) {
            fs.mkdirSync(FILES_DIR, { recursive: true });
        }

        const ext = path.extname(sourcePath);
        const name = path.basename(sourcePath, ext);
        let destPath = path.join(FILES_DIR, `${name}${ext}`);
        let counter = 1;

        while (fs.existsSync(destPath)) {
            destPath = path.join(FILES_DIR, `${name}_${counter}${ext}`);
            counter++;
        }

        fs.copyFileSync(sourcePath, destPath);
        return { success: true, path: destPath };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

const plist = require('plist');


app.whenReady().then(() => {
    createWindow();
});

// ... (rest of the code)

ipcMain.handle('get-app-info', async (event, appPath) => {
    try {
        let name = path.basename(appPath, '.app');
        let version = '';
        let category = 'Other';
        let icon = '';
        let info = null;

        // Strategy 1: Try reading Info.plist
        const infoPlistPath = path.join(appPath, 'Contents', 'Info.plist');
        if (fs.existsSync(infoPlistPath)) {
            try {
                const plistContent = fs.readFileSync(infoPlistPath, 'utf-8');
                if (plistContent.trim().startsWith('bplist')) {
                    throw new Error('Binary plist detected');
                }
                info = plist.parse(plistContent);
            } catch (e) {
                // Try using plutil to convert binary plist to XML
                try {
                    const { execSync } = require('child_process');
                    const xmlContent = execSync(`plutil -convert xml1 -o - "${infoPlistPath}"`).toString();
                    info = plist.parse(xmlContent);
                } catch (plutilError) {
                    console.error('Failed to parse plist with plutil:', plutilError);
                }
            }
        }

        if (info) {
            name = info.CFBundleDisplayName || info.CFBundleName || name;
            version = info.CFBundleShortVersionString || info.CFBundleVersion || '';
            const categoryRaw = info.LSApplicationCategoryType || '';

            // Map macOS category
            const catLower = (categoryRaw || '').toLowerCase();
            if (catLower.includes('developer') || catLower.includes('development')) category = 'Development';
            else if (catLower.includes('graphics') || catLower.includes('design') || catLower.includes('photo') || catLower.includes('image')) category = 'Design';
            else if (catLower.includes('productivity') || catLower.includes('task') || catLower.includes('mind')) category = 'Productivity';
            else if (catLower.includes('office') || catLower.includes('word') || catLower.includes('excel') || catLower.includes('presentation')) category = 'Office';
            else if (catLower.includes('utilities') || catLower.includes('utility') || catLower.includes('system') || catLower.includes('tool')) category = 'Utility';
            else if (catLower.includes('social') || catLower.includes('chat') || catLower.includes('communication')) category = 'Social';
            else if (catLower.includes('entertainment') || catLower.includes('media')) category = 'Entertainment';
            else if (catLower.includes('education') || catLower.includes('learn') || catLower.includes('reference')) category = 'Education';
            else if (catLower.includes('finance') || catLower.includes('money')) category = 'Finance';
            else if (catLower.includes('game')) category = 'Game';
            else if (catLower.includes('music') || catLower.includes('audio')) category = 'Music';
            else if (catLower.includes('video') || catLower.includes('movie')) category = 'Video';
        }

        // Strategy 2: Use mdls as fallback if info is missing
        if (!version || name === path.basename(appPath, '.app')) {
            try {
                const { execSync } = require('child_process');
                // Get display name and version using mdls
                const mdlsOutput = execSync(`mdls -name kMDItemDisplayName -name kMDItemVersion -name kMDItemKind "${appPath}"`).toString();

                const nameMatch = mdlsOutput.match(/kMDItemDisplayName\s*=\s*"([^"]+)"/);
                const versionMatch = mdlsOutput.match(/kMDItemVersion\s*=\s*"([^"]+)"/);

                if (nameMatch && nameMatch[1]) name = nameMatch[1];
                if (versionMatch && versionMatch[1]) version = versionMatch[1];
            } catch (e) {
                console.error('mdls fallback failed:', e);
            }
        }

        // Get Icon
        // Try to find icon file from already parsed info
        let iconFileName = info ? (info.CFBundleIconFile || info.CFBundleIconName) : '';

        if (iconFileName) {
            // Remove .icns extension if present
            iconFileName = iconFileName.replace(/\.icns$/, '');
            const iconPath = path.join(appPath, 'Contents', 'Resources', `${iconFileName}.icns`);

            if (fs.existsSync(iconPath)) {
                try {
                    const tmpPngPath = path.join(os.tmpdir(), `icon-${Date.now()}.png`);
                    await execPromise(`sips -s format png "${iconPath}" --out "${tmpPngPath}" --resampleWidth 256`);
                    const image = nativeImage.createFromPath(tmpPngPath);
                    if (!image.isEmpty()) {
                        icon = image.toDataURL();
                    }
                    fs.unlinkSync(tmpPngPath);
                } catch (e) { }
            }
        }

        // Fallback: search for any .icns file
        if (!icon) {
            const resourcesPath = path.join(appPath, 'Contents', 'Resources');
            if (fs.existsSync(resourcesPath)) {
                const files = fs.readdirSync(resourcesPath);
                const icnsFile = files.find(f => f.endsWith('.icns'));
                if (icnsFile) {
                    const altPath = path.join(resourcesPath, icnsFile);
                    try {
                        const tmpPngPath = path.join(os.tmpdir(), `icon-${Date.now()}.png`);
                        await execPromise(`sips -s format png "${altPath}" --out "${tmpPngPath}" --resampleWidth 256`);
                        const image = nativeImage.createFromPath(tmpPngPath);
                        if (!image.isEmpty()) {
                            icon = image.toDataURL();
                        }
                        fs.unlinkSync(tmpPngPath);
                    } catch (e) { }
                }
            }
        }

        return {
            success: true,
            data: {
                name,
                version,
                category,
                icon
            }
        };
    } catch (error) {
        console.error('Failed to get app info:', error);
        return { success: false, error: error.message };
    }
});
// ============ Storage Location Management ============

// Helper: Get iCloud Drive path if available
function getICloudPath() {
    const iCloudPath = path.join(os.homedir(), 'Library', 'Mobile Documents', 'com~apple~CloudDocs', 'KeyVault');
    const iCloudRoot = path.join(os.homedir(), 'Library', 'Mobile Documents', 'com~apple~CloudDocs');
    return fs.existsSync(iCloudRoot) ? iCloudPath : null;
}

// Helper: Get current storage location (iCloud or local)
function getStorageBasePath() {
    const configPath = path.join(app.getPath('userData'), 'storage-config.json');
    let useICloud = false;

    if (fs.existsSync(configPath)) {
        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            useICloud = config.useICloud;
        } catch (e) {
            console.error('Failed to read storage config:', e);
        }
    }

    if (useICloud) {
        const iCloudPath = getICloudPath();
        if (iCloudPath) return iCloudPath;
    }

    return path.join(app.getPath('documents'), 'KeyVault');
}

// Get storage location info
ipcMain.handle('get-storage-location', async () => {
    const iCloudPath = path.join(os.homedir(), 'Library', 'Mobile Documents', 'com~apple~CloudDocs', 'KeyVault');
    const localPath = path.join(app.getPath('documents'), 'KeyVault');

    // Check iCloud availability
    let iCloudAvailable = false;
    try {
        const iCloudRoot = path.join(os.homedir(), 'Library', 'Mobile Documents', 'com~apple~CloudDocs');
        if (fs.existsSync(iCloudRoot)) {
            iCloudAvailable = true;
        }
    } catch (e) {
        console.log('iCloud check failed:', e);
    }

    // Determine current path
    const configPath = path.join(app.getPath('userData'), 'storage-config.json');
    let currentPath = localPath;
    let useICloud = false;

    try {
        if (fs.existsSync(configPath)) {
            const configData = fs.readFileSync(configPath, 'utf8');
            const config = JSON.parse(configData);
            if (config.useICloud && iCloudAvailable) {
                currentPath = iCloudPath;
                useICloud = true;
            }
        }
    } catch (e) {
        console.error('Error reading storage config:', e);
    }

    return {
        currentPath,
        useICloud,
        iCloudAvailable
    };
});

// Set storage location (local or iCloud)
ipcMain.handle('set-storage-location', async (event, useICloud) => {
    try {
        const configPath = path.join(app.getPath('userData'), 'storage-config.json');
        fs.writeFileSync(configPath, JSON.stringify({ useICloud }, null, 2));

        const newBasePath = getStorageBasePath();

        // Explicitly create the directory if it doesn't exist
        if (!fs.existsSync(newBasePath)) {
            try {
                fs.mkdirSync(newBasePath, { recursive: true });
                console.log('Created storage directory:', newBasePath);
            } catch (err) {
                console.error('Failed to create storage directory:', err);
                // If iCloud creation fails, it might be permissions, but we return the path anyway
            }
        }

        return { success: true, path: newBasePath };
    } catch (error) {
        console.error('Error setting storage location:', error);
        return { success: false, error: error.message };
    }
});

// ============ Export/Import Handlers ============

// Export licenses as JSON
ipcMain.handle('export-licenses-json', async () => {
    try {
        const result = await dialog.showSaveDialog({
            title: 'Export Licenses as JSON',
            defaultPath: `licenses-export-${new Date().toISOString().split('T')[0]}.json`,
            filters: [{ name: 'JSON', extensions: ['json'] }]
        });

        if (result.canceled) {
            return { success: false, canceled: true };
        }

        const basePath = getStorageBasePath();
        const dataPath = path.join(basePath, 'license-manager-data.json');

        if (!fs.existsSync(dataPath)) {
            return { success: false, error: 'No licenses found to export' };
        }

        const licenses = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        fs.writeFileSync(result.filePath, JSON.stringify(licenses, null, 2));

        return { success: true, path: result.filePath, count: licenses.length };
    } catch (error) {
        console.error('Export JSON failed:', error);
        return { success: false, error: error.message };
    }
});

// Export full backup as ZIP (data + files)
ipcMain.handle('export-licenses-zip', async () => {
    try {
        const result = await dialog.showSaveDialog({
            title: 'Export Full Backup',
            defaultPath: `license-backup-${new Date().toISOString().split('T')[0]}.zip`,
            filters: [{ name: 'ZIP Archive', extensions: ['zip'] }]
        });

        if (result.canceled) {
            return { success: false, canceled: true };
        }

        const basePath = getStorageBasePath();
        const dataPath = path.join(basePath, 'license-manager-data.json');
        const filesDir = path.join(basePath, 'Files');

        if (!fs.existsSync(dataPath)) {
            return { success: false, error: 'No licenses found to export' };
        }

        const output = fs.createWriteStream(result.filePath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        // Read licenses and convert file paths to relative
        const licenses = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        const exportLicenses = licenses.map(license => ({
            ...license,
            licenseFile: license.licenseFile ? path.basename(license.licenseFile) : null
        }));

        archive.append(JSON.stringify(exportLicenses, null, 2), { name: 'licenses.json' });

        // Add files directory if exists
        if (fs.existsSync(filesDir)) {
            archive.directory(filesDir, 'files');
        }

        archive.pipe(output);

        return new Promise((resolve) => {
            output.on('close', () => {
                resolve({ success: true, path: result.filePath, count: licenses.length });
            });
            archive.on('error', (err) => {
                resolve({ success: false, error: err.message });
            });
            archive.finalize();
        });
    } catch (error) {
        console.error('Export ZIP failed:', error);
        return { success: false, error: error.message };
    }
});

// Export licenses as Excel
ipcMain.handle('export-licenses-excel', async () => {
    try {
        const result = await dialog.showSaveDialog({
            title: 'Export Licenses as Excel',
            defaultPath: `licenses-export-${new Date().toISOString().split('T')[0]}.xlsx`,
            filters: [{ name: 'Excel Workbook', extensions: ['xlsx'] }]
        });

        if (result.canceled) {
            return { success: false, canceled: true };
        }

        const basePath = getStorageBasePath();
        const dataPath = path.join(basePath, 'license-manager-data.json');

        if (!fs.existsSync(dataPath)) {
            return { success: false, error: 'No licenses found to export' };
        }

        const licenses = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

        // Convert to flat structure for Excel
        const excelData = licenses.map(l => ({
            Name: l.name,
            Category: l.category,
            Version: l.version || '',
            URL: l.url || '',
            'License Key': l.licenseKey || '',
            'Purchase Date': l.purchaseDate || '',
            'Expiry Date': l.expiryDate || '',
            Price: l.price || '',
            Owner: l.owner || '',
            Notes: l.memo || '',
            'Brew Command': l.brewCaskCommand || '',
            Tags: l.tags ? l.tags.join(', ') : ''
        }));

        const xlsx = require('xlsx');
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(excelData);

        // Auto-adjust column widths (approximate)
        const colWidths = [
            { wch: 20 }, // Name
            { wch: 15 }, // Category
            { wch: 10 }, // Version
            { wch: 30 }, // URL
            { wch: 25 }, // License Key
            { wch: 12 }, // Purchase Date
            { wch: 12 }, // Expiry Date
            { wch: 10 }, // Price
            { wch: 15 }, // Owner
            { wch: 30 }, // Notes
            { wch: 25 }, // Brew Command
            { wch: 20 }  // Tags
        ];
        worksheet['!cols'] = colWidths;

        xlsx.utils.book_append_sheet(workbook, worksheet, 'Licenses');
        xlsx.writeFile(workbook, result.filePath);

        return { success: true, path: result.filePath, count: licenses.length };
    } catch (error) {
        console.error('Export Excel failed:', error);
        return { success: false, error: error.message };
    }
});

// Import licenses (supports both JSON and ZIP)
ipcMain.handle('import-licenses', async () => {
    try {
        const result = await dialog.showOpenDialog({
            title: 'Import Licenses',
            filters: [
                { name: 'All Supported', extensions: ['json', 'zip'] },
                { name: 'JSON', extensions: ['json'] },
                { name: 'ZIP Archive', extensions: ['zip'] }
            ],
            properties: ['openFile']
        });

        if (result.canceled || !result.filePaths.length) {
            return { success: false, canceled: true };
        }

        const filePath = result.filePaths[0];
        const ext = path.extname(filePath).toLowerCase();

        const basePath = getStorageBasePath();
        const dataPath = path.join(basePath, 'license-manager-data.json');
        const filesDir = path.join(basePath, 'Files');

        // Ensure directories exist
        if (!fs.existsSync(basePath)) {
            fs.mkdirSync(basePath, { recursive: true });
        }
        if (!fs.existsSync(filesDir)) {
            fs.mkdirSync(filesDir, { recursive: true });
        }

        let importedLicenses = [];

        if (ext === '.json') {
            // Import JSON
            importedLicenses = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        } else if (ext === '.zip') {
            // Import ZIP
            const tempDir = path.join(app.getPath('temp'), 'license-import-' + Date.now());
            await extract(filePath, { dir: tempDir });

            // Read licenses.json
            const licensesJsonPath = path.join(tempDir, 'licenses.json');
            if (!fs.existsSync(licensesJsonPath)) {
                fs.rmSync(tempDir, { recursive: true, force: true });
                return { success: false, error: 'Invalid backup file: licenses.json not found' };
            }

            importedLicenses = JSON.parse(fs.readFileSync(licensesJsonPath, 'utf-8'));

            // Copy files
            const importFilesDir = path.join(tempDir, 'files');
            if (fs.existsSync(importFilesDir)) {
                const files = fs.readdirSync(importFilesDir);
                files.forEach(file => {
                    const sourcePath = path.join(importFilesDir, file);
                    const destPath = path.join(filesDir, file);

                    // Handle file name conflicts
                    let finalPath = destPath;
                    let counter = 1;
                    while (fs.existsSync(finalPath)) {
                        const ext = path.extname(file);
                        const name = path.basename(file, ext);
                        finalPath = path.join(filesDir, `${name}_${counter}${ext}`);
                        counter++;
                    }

                    fs.copyFileSync(sourcePath, finalPath);
                });
            }

            // Update file paths to absolute
            importedLicenses = importedLicenses.map(license => ({
                ...license,
                licenseFile: license.licenseFile ? path.join(filesDir, license.licenseFile) : null
            }));

            // Cleanup temp directory
            fs.rmSync(tempDir, { recursive: true, force: true });
        } else {
            return { success: false, error: 'Unsupported file format' };
        }

        // Load existing licenses
        let existingLicenses = [];
        if (fs.existsSync(dataPath)) {
            existingLicenses = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        }

        // Merge licenses (skip duplicates by ID)
        const existingIds = new Set(existingLicenses.map(l => l.id));
        const newLicenses = importedLicenses.filter(l => !existingIds.has(l.id));
        const mergedLicenses = [...existingLicenses, ...newLicenses];

        // Save merged data
        fs.writeFileSync(dataPath, JSON.stringify(mergedLicenses, null, 2));

        return {
            success: true,
            imported: newLicenses.length,
            skipped: importedLicenses.length - newLicenses.length,
            total: mergedLicenses.length
        };
    } catch (error) {
        console.error('Import failed:', error);
        return { success: false, error: error.message };
    }
});
