# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Polyglot Master is a cross-platform internationalization (i18n) resource management tool built as an Electron desktop application with a React frontend. It allows users to import translation data from Excel files or source files, manage translations, and export resources for multiple platforms (Android, iOS, Flutter).

## Development Commands

### Web Development
```bash
# Start web development server
npm run dev

# Build web application only
npm run build:web

# Preview web build
npm run preview
```

### Electron Desktop Development
```bash
# Start Electron in development mode (includes Vite dev server)
npm run electron:dev

# Build Electron application (all platforms)
npm run electron:build

# Build for specific platforms
npm run electron:build:win    # Windows
npm run electron:build:mac    # macOS
npm run electron:build:linux  # Linux

# Multi-platform build scripts
npm run build:all             # All platforms
npm run build:mac             # macOS only
npm run build:win             # Windows only
npm run build:linux           # Linux only
```

### Build Process Notes
- Uses Chinese npm mirrors for Electron dependencies by default
- `scripts/build-electron.cjs` compiles Electron main process files to CommonJS
- `scripts/build-all.sh` handles multi-platform builds with proper mirroring
- Web builds go to `dist/`, Electron builds go to `dist-electron/`
- Final installers are output to `release/` directory

## Architecture Overview

### Core Structure
- **React App**: Single-page application in `App.tsx` with main UI and logic
- **Electron Main Process**: `electron/main.ts` handles window management, menus, and file operations
- **Electron Preload**: `electron/preload.ts` provides secure IPC bridge to renderer
- **Unified API**: `utils/electronAPI.ts` abstracts file operations for web/Electron environments

### Key Data Types (`types.ts`)
- `I18nProject`: Main project structure with columns metadata and translation data
- `ColumnMetadata`: Language configuration for different platforms (Android/iOS/Flutter)
- `TranslationRow`: Individual translation key-value pairs
- `Platform`: Enum for Android, iOS, Flutter platforms

### Utility Modules
- `utils/excelParser.ts`: Excel file parsing and generation using XLSX library
- `utils/sourceParser.ts`: Parse platform-specific source files (XML, strings, ARB)
- `utils/generators.ts`: Generate platform-specific resource files and ZIP packages
- `services/gemini.ts`: Google Gemini API integration for AI-powered translations

### Electron Integration
- **IPC Communication**: Secure context isolation with preload script
- **File System**: Native file dialogs for open/save operations in desktop app
- **Menu System**: Complete application menu with keyboard shortcuts
- **Project Management**: Save/load project files as JSON in desktop environment

## Key Features Implementation

### Dual Environment Support
The application seamlessly runs in both web and Electron environments:
- `electronAPI.ts` provides unified interface that detects environment
- Web mode uses browser file APIs and downloads
- Electron mode uses native file dialogs and file system operations

### Import/Export Functionality
- **Excel Import**: Parses `.xlsx` files with translation data
- **Source File Import**: Supports Android XML, iOS strings, and Flutter ARB files
- **ZIP Export**: Generates platform-specific file structure for all languages
- **Excel Export**: Creates translation spreadsheets for collaboration

### AI Translation Integration
- Google Gemini API for automated translation
- Batch processing of missing translations
- Error handling and user feedback for API failures

## Development Guidelines

### Environment Variables
- `GEMINI_API_KEY`: Required for AI translation features
- `ELECTRON`: Set to `true` when building for Electron environment
- Vite config properly handles environment-specific builds

### File Structure Patterns
- Platform file paths follow conventions:
  - Android: `values-{lang}/strings.xml`
  - iOS: `{lang}.lproj/Localizable.strings`
  - Flutter: `lib/l10n/app_{lang}.arb`

### Electron-Specific Considerations
- Main process compiled to CommonJS (`build-electron.cjs`)
- Preload script provides secure API exposure
- Window configured with proper security settings (contextIsolation: true)
- Development uses localhost:3001, production loads built HTML file

### Build Configuration
- Vite handles React application bundling
- Electron Builder packages desktop applications
- Platform-specific settings in `package.json` build section
- Icons and assets properly configured for each platform

## Testing and Debugging

### Development Mode
- Web: `npm run dev` (localhost:3000)
- Electron: `npm run electron:dev` (includes DevTools by default)
- F12 opens developer tools in Electron development mode

### Common Issues
- Port conflicts: Vite auto-selects available ports
- Build failures: Ensure dependencies installed and mirrors accessible
- Electron packaging: Check `dist-electron/` output and build logs

### File Operations
- Web environment limited to browser file APIs
- Electron provides full file system access via IPC
- Error handling accounts for both environments in electronAPI.ts