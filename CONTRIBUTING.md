# Contributing to G&F Elektro Portal

Thank you for your interest in contributing to the G&F Elektro Portal desktop application! This document provides guidelines for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Requests](#pull-requests)
- [Release Process](#release-process)

---

## Code of Conduct

We are committed to providing a welcoming and inclusive experience for everyone. Please be respectful and constructive in all interactions.

## Getting Started

### Prerequisites

- Node.js v18 or later
- Git
- A GitHub account with access to this repository

### Setup

```bash
# Fork and clone the repository
git clone https://github.com/your-username/gf-elektro-portal.git
cd gf-elektro-portal

# Install dependencies
npm install

# Start the development server
npm start
```

### Project Architecture

```
src/
├── main.js       # Electron main process — window, tray, permissions
└── preload.js    # Preload script — safe API bridge for renderer
```

- **`main.js`** — Controls the application lifecycle, window management, system tray, and notification handling
- **`preload.js`** — Exposes a minimal, safe API to the web content via `contextBridge`

## Development Workflow

### Branching Strategy

We follow a simplified Git Flow:

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code, always stable |
| `develop` | Integration branch for next release |
| `feature/<name>` | New features |
| `fix/<name>` | Bug fixes |
| `hotfix/<name>` | Urgent production fixes |

### Creating a Feature

```bash
# Create a feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# Make your changes
# ...

# Push and create a Pull Request
git push origin feature/my-feature
```

## Coding Standards

### JavaScript

- Use **ES2022+** syntax (const/let, arrow functions, async/await, optional chaining)
- Use **CommonJS** `require()` for Electron modules (Electron doesn't support ESM in main process by default)
- Follow the existing code style — consistent indentation (2 spaces), semicolons, single quotes
- Comment complex logic with `// ── Section Name ──` style headers

### Security

- **Never** enable `nodeIntegration` in web-facing windows
- **Always** use `contextIsolation: true`
- **Never** expose Node.js APIs directly to renderer
- **Always** validate URLs before navigation
- Review the [Electron Security Checklist](https://www.electronjs.org/docs/tutorial/security)

### File Organization

- Main process code goes in `src/main.js`
- Preload scripts go in `src/preload.js`
- Build assets go in `build/`
- Utility scripts go in `scripts/`

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, no logic change) |
| `refactor` | Code refactoring |
| `perf` | Performance improvements |
| `chore` | Build, CI, or tooling changes |
| `security` | Security improvements |

### Examples

```
feat(tray): add notification count badge to tray icon
fix(window): prevent white flash on startup
docs(readme): update installation instructions
chore(deps): bump electron to v35
```

## Pull Requests

### Before Submitting

- [ ] Ensure the app runs without errors (`npm start`)
- [ ] Test on Windows (primary platform)
- [ ] Update `CHANGELOG.md` with your changes under `[Unreleased]`
- [ ] Follow the coding standards above
- [ ] Write a clear PR description

### PR Template

```markdown
## Description
Brief description of the changes.

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Security fix

## Testing
Describe how you tested the changes.

## Screenshots (if applicable)
Add screenshots for UI changes.
```

### Review Process

1. Submit a PR against `develop` (or `main` for hotfixes)
2. At least one maintainer must approve the PR
3. All CI checks must pass
4. PRs are squash-merged to keep a clean history

## Release Process

### Version Bumping

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (`x.0.0`) — Breaking changes
- **MINOR** (`0.x.0`) — New features, backward-compatible
- **PATCH** (`0.0.x`) — Bug fixes, backward-compatible

### Steps

1. Update version in `package.json`
2. Update `CHANGELOG.md` — move `[Unreleased]` items to the new version
3. Build the installer: `npm run make`
4. Create a GitHub Release with the installer attached
5. Tag the release: `git tag v1.x.x`

---

## Questions?

If you have questions about contributing, reach out to the development team at **dev@gfelektro.com**.

---

<p align="center">
  <sub>G&F Elektro s.r.o. — <a href="https://www.gfelektro.com">www.gfelektro.com</a></sub>
</p>
