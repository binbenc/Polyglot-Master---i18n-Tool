# GitHub Actions Workflows

This directory contains the automated CI/CD workflows for Polyglot Master.

## build-electron.yml

### Triggers
- **Push events** to `main` or `master` branches
- **Pull requests** to `main` or `master` branches
- **Tagged releases** (creates GitHub releases with downloadable assets)

### Build Matrix
- **Ubuntu**: Linux AppImage builds
- **Windows**: Windows installer builds (.exe)
- **macOS**: macOS DMG builds

### Build Process
1. Sets up Node.js 18 environment with npm caching
2. Installs dependencies using `npm ci`
3. Configures Chinese npm mirrors for faster Electron downloads
4. Builds Electron main process using `scripts/build-electron.cjs`
5. Builds React application using `npm run build`
6. Creates platform-specific Electron installers using electron-builder

### Artifacts
- **Development builds**: Uploaded as GitHub Actions artifacts (30-day retention)
  - `linux-appimage`: Linux .AppImage and .zip files
  - `windows-installer`: Windows .exe and .zip files
  - `macos-dmg`: macOS .dmg and .zip files

- **Release builds**: Attached to GitHub releases (permanent)
  - All platform installers and archives

### Features
- ✅ Multi-platform builds (Linux, Windows, macOS)
- ✅ Automatic artifact uploading
- ✅ Chinese mirror support for faster builds in China
- ✅ Conditional release creation for tagged versions
- ✅ Proper caching for faster CI runs
- ✅ Clean build environment setup

## Usage

### Development Pushes
When you push to `main` or `master`, the workflow will:
1. Build the Electron application for all platforms
2. Upload build artifacts to the Actions page
3. Make them available for download from the repository's Actions tab

### Release Creation
When you create and push a tag:
```bash
git tag v1.0.0
git push origin v1.0.0
```

The workflow will:
1. Build the application for all platforms
2. Create a new GitHub release
3. Attach all platform installers to the release
4. Make them available for download from the Releases page

## Viewing Artifacts

### Development Builds
1. Go to your repository on GitHub
2. Click the "Actions" tab
3. Select the latest workflow run
4. Download artifacts from the "Artifacts" section

### Release Downloads
1. Go to your repository on GitHub
2. Click the "Releases" tab
3. Select the desired release version
4. Download platform-specific installers

## Troubleshooting

### Common Issues
- **Build timeouts**: Increase job timeout if builds take too long
- **Mirror failures**: Workflow will fall back to default npm registry if mirrors fail
- **Node.js version**: Uses Node.js 18, adjust if your project requires a different version

### Logs
Check the Actions tab for detailed build logs and error information.

### Local Testing
Test the build process locally before pushing:
```bash
npm run build:all
```