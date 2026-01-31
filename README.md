# Samildánach

**TTRPG World-Building & Game Design Studio**

A browser-based tool for tabletop RPG and board game creators to design settings, manage lore, and prototype game mechanics.

## 🚀 Live Demo

**[Launch Samildánach](https://annabellecaprine.github.io/Samildanach/)**

## ✨ Features

- **📚 Library**: Create and organize world-building entries (People, Locations, Factions, Concepts, Events, Items)
- **🔗 Wiki-Linking**: Connect entries with `[[Entry Name]]` syntax
- **🕸️ World Graph**: Visualize relationships as an interactive mind-map
- **🏠 Project Panel**: Home page with stats and export/import
- **🧪 Laboratory**: Test dice expressions, run probability simulations
- **📐 Architect**: Visual node-based rules editor
- **📤 Export**: JSON, Markdown, HTML, PDF exports

## 📦 Installation

```bash
git clone https://github.com/annabellecaprine/Samildanach.git
cd Samildanach
npm install
npm run dev
```

## 🔧 Build Commands

| Command | Description |
|:---|:---|
| `npm run dev` | Start development server |
| `npm run build` | Build to /docs for GitHub Pages |
| `npm run preview` | Preview production build |
| `npm run tauri:dev` | Run desktop app in dev mode |
| `npm run tauri:build` | Build desktop .exe/.dmg |
| `npm run cap:sync` | Sync web assets to Android |
| `npm run cap:android` | Open Android project in Android Studio |

## 🌐 GitHub Pages Deployment

1. `npm run build`
2. Commit the `docs/` folder
3. Push to GitHub
4. Settings → Pages → Deploy from `/docs`

## 🖥️ Desktop App (Tauri)

Requires [Rust toolchain](https://www.rust-lang.org/tools/install).

```bash
npm run tauri:build
```

Outputs to: `src-tauri/target/release/`

## 📱 Android App (Capacitor)

Requires [Android Studio](https://developer.android.com/studio).

```bash
npm run cap:sync
npm run cap:android
```

Build APK from Android Studio.

## 📁 Project Structure

```
Samildanach/
├── docs/           # Built files for GitHub Pages
├── src/
│   ├── core/       # State, database, utilities, exporter
│   ├── components/ # Reusable UI components
│   ├── panels/     # Main application panels
│   └── css/        # Layered stylesheets
├── src-tauri/      # Tauri desktop wrapper
├── android/        # Capacitor Android project
├── package.json
└── vite.config.js
```

## 🛠️ Tech Stack

- Vanilla JavaScript (ES Modules)
- IndexedDB via VaultDB
- Vite (build tool)
- Tauri (desktop)
- Capacitor (mobile)

## 📜 License

MIT
