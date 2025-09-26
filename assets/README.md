# Assets Directory

This directory contains all game assets organized by type and usage.

## Directory Structure

```
assets/
├── art/                 # Visual assets
│   ├── npc/            # Character art
│   │   ├── aria/       # Aria's portraits and expressions
│   │   ├── kai/        # Kai's portraits and expressions
│   │   └── elias/      # Elias's portraits and expressions
│   ├── pets/           # Pet sprites and animations
│   ├── ui/             # UI elements and backgrounds
│   └── scenes/         # Scene backgrounds and illustrations
├── audio/              # Audio assets
│   ├── music/          # Background music tracks
│   ├── sfx/            # Sound effects
│   └── voice/          # Voice snippets (TTS generated)
└── data/               # Runtime configuration files
```

## Asset Guidelines

### Image Assets

- **Format**: WebP primary, PNG fallback for transparency
- **Sizes**: Provide 1x, 2x, and 3x variants for high-DPI displays
- **Optimization**: Compress all images for web delivery
- **Naming**: Use descriptive, consistent naming (e.g., `npc_aria_portrait.webp`)

### Audio Assets

- **Format**: OGG Vorbis primary, MP3 fallback
- **Quality**: 44.1kHz, appropriate bitrate for content type
- **Size**: Keep individual files under 5MB when possible
- **Naming**: Include content type and character (e.g., `sfx_pet_corgi_bark.ogg`)

### Animation Assets

- **Format**: Spine JSON + Atlas or sprite sequences
- **Performance**: Optimize for 60fps on mid-tier devices
- **Fallbacks**: Provide static images for low-performance mode

## Current Status

**Development Phase**: Week 1 - Placeholder assets only

All assets in this directory are placeholders for development purposes. Final art assets will be integrated during the asset integration phase (Week 8).

### Placeholder Assets

- UI mockups and wireframes
- Basic geometric shapes for pets
- Simple backgrounds for testing
- Temporary sound files

### Asset Production Pipeline

1. **Concept Art**: Initial designs and style guides
2. **Asset Creation**: Final art production
3. **Optimization**: Compression and format conversion
4. **Integration**: Implementation in game systems
5. **Testing**: Performance and visual validation

## Export Settings

### For Artists

When exporting final assets, use these settings:

#### Images
- **WebP**: Quality 80-90, lossless for UI elements
- **PNG**: 24-bit with alpha for transparency needs
- **Resolution**: Export at highest needed resolution, then scale down
- **Color Profile**: sRGB for consistent display across devices

#### Animations
- **Spine**: Use latest version compatible with runtime
- **Atlas**: Power-of-2 dimensions, packed efficiently
- **JSON**: Minified for production builds

#### Audio
- **Music**: OGG Vorbis, 192kbps, stereo
- **SFX**: OGG Vorbis, 128kbps, mono for most effects
- **Voice**: OGG Vorbis, 96kbps, mono (TTS generated)

## File Size Targets

- **Total Asset Bundle**: <100MB for mobile compatibility
- **Individual Images**: <2MB per file
- **Audio Files**: <5MB per file
- **Animation Atlases**: <4MB per atlas

## Integration Notes

Assets are referenced by stable IDs in the `/src/data/` JSON files. Never hardcode asset paths in TypeScript code - always use the data-driven approach for maintainability and localization support.

Example reference:
```json
{
  "petId": "muffin",
  "artRefs": {
    "portrait": "/assets/art/pets/muffin_portrait.webp",
    "showcase": "/assets/art/pets/muffin_showcase.webp"
  }
}
```

## Version Control

- **Include**: Final exported assets ready for production
- **Exclude**: Source files (PSD, AI, etc.) - store separately or use Git LFS
- **LFS**: Use for files >5MB to keep repository lightweight

