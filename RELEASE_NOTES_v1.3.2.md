# KeyVault v1.3.2 Release Notes

Release Date: November 23, 2024

## 🎉 New Features

### 🔐 Touch ID Auto-Unlock
- **Automatic Prompt**: Touch ID dialog appears automatically when the login screen loads
- **Seamless Experience**: No need to click a button - just use your fingerprint
- **Password Fallback**: Password input remains available if Touch ID fails or is unavailable
- **macOS Native**: Uses system `LocalAuthentication` framework for maximum security

### 📅 License Expiry Notifications
- **7-Day Warning**: Automatically notifies you when a license is expiring within 7 days
- **Native Notifications**: Uses macOS system notifications for seamless integration
- **Smart Alerts**: Shows each expiring license only once per session to avoid notification spam
- **Permission Handling**: Requests notification permission on first run

### 🔢 Total License Count Badge
- **At-a-Glance Count**: Displays total number of licenses next to "All Keys" in sidebar
- **Real-Time Updates**: Badge updates automatically when licenses are added or removed
- **Dark Mode**: Styled to match the app's dark theme (zinc-900 sidebar)

## 🎨 UI Improvements

### Final Dark Mode Polish
- **Sidebar**: Dark zinc-900 background for a professional look
- **Main Panels**: Zinc-800 background with subtle contrast from sidebar
- **VS Code Inspired**: Color scheme matches popular development tools
- **Consistent Theming**: All panels use unified color palette

## 📝 Technical Changes

### Modified Files
- `electron/main.js` - Added Touch ID IPC handler using systemPreferences
- `electron/preload.js` - Exposed promptTouchID API to renderer process
- `src/types/index.ts` - Added promptTouchID to ElectronAPI interface
- `src/components/LoginScreen.tsx` - Implemented Touch ID button and auto-prompt logic
- `src/components/LicenseManager.tsx` - Added expiry notification checking
- `src/components/Sidebar.tsx` - Added total count badge to "All Keys" navigation
- `src/lib/translations.ts` - Added translation keys for new features

### Dependencies
- No new dependencies added
- Utilizes existing Electron APIs (systemPreferences, Notification)

## 🐛 Bug Fixes
- Fixed missing Fingerprint icon import in LoginScreen
- Improved notification permission handling

## 📦 Distribution

**File**: `KeyVault-1.3.2-arm64-mac.zip`
**Size**: ~150MB (Electron framework included)
**Platform**: macOS (Apple Silicon - arm64)

### Installation Instructions
1. Download and extract `KeyVault-1.3.2-arm64-mac.zip`
2. Move `KeyVault.app` to your Applications folder
3. Run the following command in Terminal to bypass Gatekeeper:
   ```bash
   xattr -dr com.apple.quarantine /Applications/KeyVault.app
   ```
4. Launch KeyVault from Applications

> **Note**: The app is not code-signed. For distribution without Terminal commands, an Apple Developer ID certificate is required ($99/year).

## 🎯 What's Next

### Planned for Future Releases
- Apple Developer ID code signing for seamless installation
- DMG installer (currently using ZIP due to hdiutil issues)
- Automatic update checker
- Additional cloud backup options

## 🙏 Feedback

Found a bug or have a feature request? Please open an issue on [GitHub](https://github.com/hjm79/keyvault).

---

**Full Changelog**: https://github.com/hjm79/keyvault/compare/v1.3.0...v1.3.2
