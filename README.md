# CritDock

**Get useful feedback before you ship.**

CritDock is a fast, structured feedback and validation tool for developers, indie developers, game developers, designers, creators, and technical teams.

## Current build

The current GitHub Pages build is a production-quality local-first frontend MVP:
- Create Crit Sprints from templates or scratch
- Externally hosted media only
- Anonymous reviewer flow
- Structured criteria and mandatory optional final feedback
- Results dashboard with statistics
- CSV and JSON export
- Light and dark modes
- Responsive reviewer experience
- Local persistence via localStorage
- GitHub Pages deployment workflow

The persistence layer is intentionally isolated from media hosting. A hosted database/auth layer can replace local persistence without changing the core interaction model.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
