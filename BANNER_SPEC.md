# Event Banner Specification (1200x660 px)

## Layout (Absolute Positioning)
The export template uses fixed coordinates to ensure consistent rendering across browsers and environments.

### 1. Left Content Area (Common)
- **Background**: Purple-to-White gradient.
- **Logo**: `Top: 60px`, `Left: 40px`, `Height: 48px`.
- **"Zoom Call" text**: `Top: 200px`, `Left: 40px`, `Font: 32px Bold`.
- **Title**: Below Zoom Call, `Font: 36-48px Extra-Bold` (size adapts to title length).
- **Date/Time**: `Top: 420px`, `Left: 40px`. Includes calendar icon (28px height).
- **Slogan (Bottom)**: `Top: 590px`, `Left: 40px`. Words separated by 9px purple dots, flexbox with gap.

### 2. Right Content Area (Speaker)
- **Speaker Photo**: Circular, `340px x 340px`, positioned at `Left: 720px`, `Top: 100px`.
- **Border**: 4px purple semi-transparent ring around photo.
- **Name Box**: White background with padding, centered text, below photo.

## Technical Notes
- **html-to-image**: Uses `toPng()` with `pixelRatio: 2` for high resolution (2400x1320 output). Renders via SVG foreignObject — preserves browser layout 1:1.
- **Image CrossOrigin**: All images (logo, speaker) must support anonymous CORS.
- **Fonts**: Montserrat and Inter must be loaded in the system.
