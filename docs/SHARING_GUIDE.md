# 📦 Sharing Love & Pets Café

## ✅ Issue Fixed!
The CORS error when opening index.html directly has been resolved by:
1. Adding `base: './'` to Vite config for relative paths
2. Including server scripts for easy local testing
3. Providing clear instructions for running the game

## 🚀 How to Share the Game

### Option 1: Share the Dist Folder (Recommended)
1. Run `npm run build` to create the dist folder
2. Zip the entire `dist` folder
3. Share the zip file
4. Recipients can unzip and use one of these methods:
   - Run `python serve.py` (Python script included)
   - Use any local web server
   - Upload to any web host

### Option 2: Share via Web Hosting
Upload the `dist` folder contents to:
- **Netlify**: Drag & drop at netlify.com
- **Vercel**: Deploy with one click
- **GitHub Pages**: Push to gh-pages branch
- **Surge.sh**: `npx surge dist`

### Option 3: Share Source + Build
1. Zip the entire project
2. Recipients run:
   ```bash
   npm install
   npm run build
   npm run serve
   ```

## 📁 What's in the Dist Folder
```
dist/
├── index.html          # Entry point
├── HOW_TO_RUN.md      # Instructions for recipients
├── serve.py           # Python server (works with Python 2 & 3)
├── assets/            # Compiled JS/CSS
│   ├── main-*.js
│   └── index-*.css
├── art/               # All game assets
│   ├── pets/
│   ├── scenes/
│   └── ui/
└── audio/             # Sound files
```

## 🖥️ Running Locally
The game CANNOT run by double-clicking index.html due to browser security (CORS).

**Quick Start (Python):**
```bash
cd dist
python serve.py
# Open http://localhost:8000
```

**Quick Start (Node.js):**
```bash
npm run serve:dist
# Open http://localhost:8080
```

## 🌐 Browser Compatibility
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support  
- Safari: ✅ Full support
- Mobile browsers: ✅ Optimized for mobile

## 📱 Mobile Testing
1. Run the server on your computer
2. Find your computer's IP address
3. On mobile, visit: `http://YOUR_IP:8000`
4. Make sure devices are on same network

## 🎮 Sharing Tips
- The `dist` folder is self-contained (7-10MB)
- No installation required for players
- Works offline once loaded
- Save data persists in browser

## ⚠️ Common Issues
1. **"Failed to load module"**: Not using a web server
2. **Assets not loading**: Missing files in dist folder
3. **Blank screen**: Check browser console for errors

The game is now fully portable and ready to share! 🎉
