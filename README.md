# KeyVault – License Management Desktop App

**KeyVault** is a focused desktop application for storing, organizing, and managing software licenses. It is built with **Electron** (for the native window) and **Next.js** (for the UI) and follows a dark‑mode design.

## Why this app?
- **Drag‑able window** – Users can move the app by dragging the top bar or the sidebar, thanks to a custom `-webkit-app-region: drag` implementation.
- **Consistent spacing** – The UI layout (sidebar, list, detail panel) has been tuned so that elements are not cramped, even when the detail view is empty.
- **Rich license details** – Owner, website, license key, attached file, purchase/expiry dates, price, and Brew cask command are displayed in a compact, readable panel.
- **Tag autocomplete & keyboard navigation** – Fast search with arrow‑key navigation and instant selection.
- **Import / Export** – JSON‑based backup/restore for easy migration.
- **Dark theme** – Unified dark appearance across the Electron window and the React UI.

## Features
- Window dragging via top bar and sidebar
- Dark‑mode UI with custom title‑bar styling
- License list with search, tag filtering, and category navigation
- Detail panel with all license metadata and actions (edit, delete, execute Brew command)
- Tag autocomplete with keyboard support (↑/↓/Enter/Escape)
- Import / Export JSON data
- Responsive layout with optimized spacing for dense information display

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
