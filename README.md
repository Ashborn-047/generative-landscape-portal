# Generative Art - Insta Frame

An interactive generative landscape art piece featuring dynamic noise-based terrain layers with a captivating central portal effect.

![Preview](preview.png)

## Features

- 🎨 **4 Beautiful Themes**: Midnight, Ocean, Sand Dunes, and Forest
- 📐 **Multiple Formats**: 9:16 Vertical (Instagram Stories/Reels) and 16:9 Cinematic
- 🖱️ **Interactive**: Mouse/touch movement influences the landscape
- 🎬 **Video Recording**: Export 6-second loops as WebM videos
- ⏯️ **Pause/Play**: Control the animation at any time

## Live Demo

View the live demo at: `https://[your-username].github.io/[repo-name]/`

## Local Development

Simply open `index.html` in a modern web browser. No build process required!

```bash
# Using Python (if available)
python -m http.server 8000
# Then visit http://localhost:8000

# Using Node.js (if available)
npx serve .
# Then visit http://localhost:3000
```

## GitHub Pages Deployment

1. Push this repository to GitHub
2. Go to **Settings** → **Pages**
3. Under **Source**, select **Deploy from a branch**
4. Choose **main** branch and **/ (root)** folder
5. Click **Save**
6. Your site will be live at `https://[your-username].github.io/[repo-name]/`

## How It Works

The art uses **Simplex Noise** to generate smooth, organic mountain-like terrain layers. The central circular "portal" shows the same landscape in an inverted color scheme, creating a negative/positive film effect.

### Key Technologies
- HTML5 Canvas
- Simplex Noise (for procedural generation)
- CSS Backdrop Filters (glassmorphism UI)
- MediaRecorder API (video export)

## Customization

Edit `app.js` to customize:
- `config.layerCount` - Number of terrain layers (default: 12)
- `config.speed` - Animation speed (default: 0.0025)
- `config.circleRadiusRatio` - Portal size (default: 0.35)
- `themes` object - Add or modify color themes

## License

MIT License - Feel free to use, modify, and share!
