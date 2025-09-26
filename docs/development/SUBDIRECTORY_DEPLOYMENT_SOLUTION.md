# Subdirectory Deployment Solution

## Summary
To support deployment in subdirectories (like `staging/AgRb9epSATX7eo3DBS8p/1.2.3/`), we've implemented a solution that ensures all PNG and asset paths work correctly regardless of deployment location.

## Changes Made

### 1. **Updated `assetPaths.ts`**
- Modified `getAssetPath()` to return relative paths in production
- Added development/production path handling
- Paths are now relative to the HTML file location

### 2. **Updated `petData.ts`**
- Added path transformation when pets are retrieved
- `getPetById()`, `getAllPets()`, and `getPetsByRarity()` now return pets with properly resolved paths
- This ensures paths work in any subdirectory

### 3. **Vite Configuration**
- Already has `base: './'` which ensures all built assets use relative paths

## How It Works

1. **In Development** (`npm run dev`):
   - Paths are served from root with leading slash
   - Example: `/art/pets/muffin_portrait.png`

2. **In Production** (built files):
   - All paths are relative without leading slash
   - Example: `art/pets/muffin_portrait.png`
   - This allows them to work in any subdirectory

## Path Resolution Examples

When deployed to `https://h5-apps.staging.getreel.com/staging/AgRb9epSATX7eo3DBS8p/1.2.3/`:

- HTML location: `.../1.2.3/index.html`
- Logo in HTML: `<img src="art/love_pets_logo_transparent.png">`
- Resolves to: `.../1.2.3/art/love_pets_logo_transparent.png` ✅

- Pet portrait via JS: `getAssetPath("art/pets/muffin_portrait.png")`
- Returns: `"art/pets/muffin_portrait.png"`
- Browser resolves relative to HTML: `.../1.2.3/art/pets/muffin_portrait.png` ✅

## Testing

1. **Local File System**:
   ```bash
   cd dist
   python serve.py
   # Works at http://localhost:8000/
   ```

2. **Subdirectory Simulation**:
   ```bash
   mkdir -p test/sub/dir
   cp -r dist/* test/sub/dir/
   cd test
   python -m http.server 8000
   # Access at http://localhost:8000/sub/dir/
   ```

3. **Production Deployment**:
   - Upload dist folder contents to any subdirectory
   - All assets will load correctly

## Key Points

1. **No Absolute Paths**: All paths are relative (no leading `/`)
2. **Base Tag Not Needed**: Relative paths work without base tag
3. **Consistent Handling**: All assets use the same path resolution
4. **Framework Agnostic**: Works with any deployment setup

## Files That Reference PNGs

- **HTML**: `index.html` (logo, favicon) - ✅ Already relative
- **JSON**: `pets.json` (30 references) - ✅ Transformed at runtime
- **TypeScript**: All UI components use `getAssetPath()` - ✅ Returns relative paths

The solution ensures that whether deployed at:
- `https://example.com/`
- `https://example.com/games/petcafe/`
- `https://h5-apps.staging.getreel.com/staging/AgRb9epSATX7eo3DBS8p/1.2.3/`

All PNG files and other assets will load correctly!
