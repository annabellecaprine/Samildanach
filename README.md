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
- **🧪 Laboratory**: Test dice expressions and mechanics
- **📐 Architect**: Visual node-based editor (prototype)

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/annabellecaprine/Samildanach.git
cd Samildanach

# Install dependencies
npm install

# Run development server
npm run dev
```

## 🔧 Building for Production

```bash
# Build to /docs folder for GitHub Pages
npm run build

# Preview the production build
npm run preview
```

## 🌐 GitHub Pages Deployment

1. Build the project: `npm run build`
2. Commit the `docs/` folder
3. Push to GitHub
4. Go to **Settings → Pages**
5. Set source to **Deploy from a branch**
6. Select **main** branch and **/docs** folder
7. Save

## 📁 Project Structure

```
Samildanach/
├── docs/           # Built files for GitHub Pages
├── src/
│   ├── core/       # State, database, utilities
│   ├── components/ # Reusable UI components
│   ├── panels/     # Main application panels
│   └── css/        # Layered stylesheets
├── package.json
└── vite.config.js
```

## 🛠️ Tech Stack

- Vanilla JavaScript (ES Modules)
- IndexedDB via VaultDB
- Vite (build tool)
- No frameworks — pure web platform

## 📜 License

MIT
