# KeyVault – License Management Desktop App

**KeyVault** is a streamlined desktop application designed to store, organize, and manage software licenses.  
Built with **Electron** (native window) and **Next.js** (UI), it features a fully integrated dark-mode design.

## Why This App?

- **Automatic license metadata extraction**  
  Dragging an application file into KeyVault automatically detects and fills in the app name, version, icon, and category — minimizing manual work.

- **Consistent spacing**  
  The UI layout (sidebar, list, detail panel) maintains comfortable spacing, even when the detail view is empty.

- **Rich license details**  
  Owner, website, license key, attachment, purchase/expiry dates, price, and Brew cask command are displayed in a clean and compact panel.

- **Tag autocomplete & keyboard navigation**  
  Fast tag search with ↑/↓/Enter/Escape support.

- **Import / Export**  
  JSON-based backup/restore for quick migration.

- **Excel Export**  
  Export license entries to `.xlsx` for external tracking or reporting.

- **Dark theme**  
  A unified dark UI across Electron and the React-based interface.

## Features

- Automatic extraction of app metadata (name, version, icon, category)
- Custom dark-mode UI with styled title-bar
- License list with search, tag filtering, and category navigation
- Detail panel with full metadata and actions (edit, delete, execute Brew command)
- Tag autocomplete with keyboard controls (↑/↓/Enter/Escape)
- JSON import/export for backups
- Excel export to `.xlsx`
- Responsive layout optimized for dense information

![keyvaul_scrrenshot](https://github.com/user-attachments/assets/63a7df48-b5f0-41bd-a6c7-72451e49f92f)


## Getting Started
```bash
# Clone the repository
git clone https://github.com/hjm79/keyvault.git
cd keyvault

# Install dependencies
npm install

# Run the UI in development mode
npm run dev   # Next.js dev server
npm start      # Launch Electron (macOS)
```

## Build for Production
```bash
npm run dist   # Generates a DMG and zip in the ./dist folder
```

## Contributing
Feel free to open issues or submit pull requests. Please run `npm run lint` before committing and follow the existing code style.

---
*Generated with Antigravity – your AI coding assistant.*
