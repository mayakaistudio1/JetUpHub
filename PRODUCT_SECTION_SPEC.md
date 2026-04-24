# JetUP Landing — Product Section ("Ecosystem") Specification

## Overview

This section presents the JetUP product ecosystem as an interactive, explorable hub.
The user doesn't read a list of products — they navigate a connected system.

**Core concept:** TAG Markets is NOT a separate product card. It is the invisible foundation layer — every product runs on top of TAG Markets. The hub shows 3 products (Copy-X, 24x Amplify, IB Portal) orbiting around the JetUP center.

---

## Architecture: 3 Layers of Depth

### Layer 1 — Overview (visible immediately)
- Section label: "ECOSYSTEM" (uppercase, purple accent, small)
- Headline: gradient text, large, bold — "One platform. Every tool you need."
- Subtext: 1 line, muted — "Tap any product to explore. Everything is connected."
- **Hub diagram** (SVG, interactive):
  - Center: JetUP logo/text with pulsing ring animation
  - 3 nodes around it: Copy-X (green), 24x Amplify (amber), IB Portal (pink)
  - Dashed lines connect each node to center
  - Nodes are clickable circles with emoji icon + label below
- **Fallback state** (nothing selected): 3 mini glass-cards in a row, each showing icon + name + tagline. Invitation text: "Select a product to explore"

### Layer 2 — Product Detail (on click/tap)
When user clicks a hub node:
- Other nodes dim, active node highlights (border color, solid connection line)
- Pulsing ring changes to product's brand color
- **Detail panel** slides in (right side on desktop, below on mobile):
  - Product icon in colored rounded square
  - Product label (uppercase, colored)
  - Tagline (large white text, bold)
  - Description (2-3 lines, muted)
  - Feature tags (pill badges in product color)
  - **AI concierge bubble**: typewriter-animated explanation, purple gradient avatar with "✦"
  - CTA button: "Start with [Product Name] →" (gradient, with shadow)

### Layer 3 — Deep Dive (from detail panel)
Inside the expanded detail panel, below the AI bubble:
- **"Watch how it works"** — video thumbnail/play button, opens inline video player or modal
- **"See live results"** — link to performance data / strategy showcase (for Copy-X)
- **"Calculate your potential"** — interactive calculator or slider (for 24x Amplify: input deposit → show amplified capital)
- **"Explore your dashboard"** — screenshot/animation of the IB Portal dashboard
- These are product-specific deep-dive elements, not generic. Each product gets its own Layer 3 content.

---

## Products Data

### Copy-X (color: #10B981)
```
id: "copyx"
icon: "🔄"
label: "Copy-X"
tagline: "Mirror top performers."
description: "Automated copy-trading platform. Choose a strategy, set your risk — Copy-X does the rest. No experience required."
features: ["Auto-Copy", "Risk Control", "Verified Strategies"]
aiLine: "Copy-X is perfect if you want results without screen time. Pick a strategy and let it run."
hubAngle: -60 (degrees, top-left position)
layer3:
  - type: "video"
    label: "Watch how it works"
  - type: "live-stats"
    label: "See live strategy results"
```

### 24x Amplify (color: #F59E0B)
```
id: "amplify"
icon: "⚡"
label: "24x Amplify"
tagline: "Scale your capital."
description: "Funded trading program. Prove your skill in evaluation, get up to $200K in trading capital. Keep up to 80% of profits."
features: ["Up to $200K Capital", "80% Profit Split", "Fast Payouts"]
aiLine: "24x Amplify gives skilled traders real capital. Pass the challenge, trade with our money."
hubAngle: 0 (degrees, right position)
layer3:
  - type: "calculator"
    label: "Calculate your amplified capital"
    mechanic: slider (deposit 50-500 USD → show 24x result)
  - type: "video"
    label: "How the challenge works"
```

### IB Portal (color: #EC4899)
```
id: "ib"
icon: "🤝"
label: "IB Portal"
tagline: "Build your network."
description: "Introducing Broker program with real-time analytics, multi-tier commissions, and a personal CRM to manage your team."
features: ["Multi-Tier Commissions", "Real-Time Analytics", "Personal CRM"]
aiLine: "The IB Portal turns your network into recurring income. Track everything in real time."
hubAngle: 60 (degrees, bottom-right position)
layer3:
  - type: "dashboard-preview"
    label: "Explore your dashboard"
    mechanic: animated screenshot or interactive demo
  - type: "video"
    label: "See the partner journey"
```

---

## TAG Markets — Base Layer (NOT a product card)

TAG Markets is the regulated broker infrastructure everything runs on. It should be communicated subtly:

- In the hub center, beneath "JetUP" text, add a small muted line: "Powered by TAG Markets"
- Or show it as the foundation ring/platform the hub sits on (a wider, very subtle circle behind the hub)
- When AI concierge explains any product, it can reference TAG Markets naturally: "...all running on your TAG Markets account"
- TAG Markets details can appear in a tooltip or footer note — NOT as a selectable product card

---

## Desktop Layout (1280px+)

```
┌──────────────────────────────────────────────────────┐
│  ECOSYSTEM                                            │
│  One platform.                                        │
│  Every tool you need.                                 │
│  Tap any product to explore...                        │
│                                                       │
│  ┌─────────────┐    ┌──────────────────────────────┐  │
│  │             │    │  🔄 COPY-X                   │  │
│  │   [Copy-X]  │    │  Mirror top performers.      │  │
│  │      ↑      │    │                              │  │
│  │  [JetUP]──→ │    │  Description text...         │  │
│  │      ↓      │    │                              │  │
│  │  [Amplify]  │    │  [Auto-Copy] [Risk] [Verified]│  │
│  │  [IB Portal]│    │                              │  │
│  │             │    │  ✦ AI: "Copy-X is perfect..." │  │
│  │  SVG Hub    │    │                              │  │
│  └─────────────┘    │  ▶ Watch how it works         │  │
│                     │  📊 See live results           │  │
│                     │                              │  │
│                     │  [Start with Copy-X →]        │  │
│                     └──────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

## Mobile Layout (390px)

```
┌──────────────────────┐
│  ECOSYSTEM           │
│  One platform.       │
│  Every tool you need.│
│                      │
│  ●──●──●  (mini hub) │
│                      │
│  ┌──────────────────┐│
│  │ 🔄 Copy-X       ▾││
│  │ Mirror top...     ││
│  │                   ││
│  │ Description...    ││
│  │ [tags]            ││
│  │ ✦ AI bubble       ││
│  │ ▶ Watch video     ││
│  │ [Explore →]       ││
│  └──────────────────┘│
│  ┌──────────────────┐│
│  │ ⚡ 24x Amplify   ▸││
│  └──────────────────┘│
│  ┌──────────────────┐│
│  │ 🤝 IB Portal     ▸││
│  └──────────────────┘│
└──────────────────────┘
```

---

## Design System

### Colors
```
Background: #060612
Surface glass: rgba(255,255,255,0.04)
Glass border: rgba(255,255,255,0.08)
Text primary: rgba(255,255,255,0.95)
Text secondary: rgba(255,255,255,0.55)
Text muted: rgba(255,255,255,0.35)
Accent primary: #7C3AED
Accent secondary: #A855F7
```

### Product Colors
```
Copy-X: #10B981 (green)
24x Amplify: #F59E0B (amber)
IB Portal: #EC4899 (pink)
```

### Typography
```
Font: Inter (or system fallback)
Section label: 11px, 700, 0.15em spacing, uppercase, ACCENT2
Headline: 36px desktop / 28px mobile, 800, gradient fill
Subtext: 15px desktop / 14px mobile, 400, muted
Product label: 11px, 700, 0.1em spacing, uppercase, product color
Product tagline: 22px desktop / 18px mobile, 700, white
Description: 14px / 13px, 400, secondary text
Feature tags: 12px / 11px, 600, product color on product-tinted bg
AI bubble text: 14px / 13px, 400, 0.8 white
CTA button: 15px / 14px, 700, white on gradient
```

### Animations (framer-motion)
```
Hub pulsing ring: r 24→50, opacity 0.4→0, duration 2s, infinite
Node activation: scale + border color transition, 0.3s
Detail panel enter: opacity 0→1, y 20→0, duration 0.4s, ease [0.16, 1, 0.3, 1]
Detail panel exit: opacity 1→0, y 0→-10, duration 0.3s
AI typewriter: 20ms per character, cursor blink animation
Feature tags: stagger appear, 50ms delay each
Layer 3 elements: fade in after AI text completes
CTA button: whileHover scale 1.04, whileTap scale 0.96
Mobile accordion: height 0→auto, opacity 0→1, duration 0.35s
```

### Glassmorphism
```
Glass card: bg rgba(255,255,255,0.04), border 1px rgba(255,255,255,0.08), border-radius 14-20px
AI bubble: bg rgba(255,255,255,0.03), border rgba(255,255,255,0.06), border-radius 16px
Hover state: border transitions to product-color at 25% opacity
Active state: bg tinted with product-color at 8%, border at 30%
```

---

## AI Concierge Integration

The AI avatar (purple gradient circle with ✦) appears inside each product's detail panel. It types a short contextual message about the product. Rules:
- Max 1-2 sentences
- Speaks about the product in context of the user's journey
- Uses casual, confident tone
- References TAG Markets naturally when relevant
- After typing completes, Layer 3 elements fade in

---

## Interaction Flow

1. User arrives at section → sees hub diagram with 3 products + headline
2. User clicks/taps a product → hub animates, detail panel appears with Layer 2 content
3. AI types explanation → Layer 3 deep-dive elements fade in below
4. User can:
   - Watch a video (inline or modal)
   - Use a calculator/interactive element
   - Click CTA to proceed
   - Click another product (current one closes, new one opens)
   - Click same product again to collapse

---

## Reference Code

Working prototype code is attached below. It implements Layers 1-2.
Layer 3 (video, calculator, dashboard preview) needs to be added.

### Desktop Component
File: `ProductSection.tsx`
- Uses SVG for hub diagram with framer-motion animated nodes
- AnimatePresence for detail panel transitions
- Typewriter hook for AI text
- 400x400 SVG viewBox for hub, detail panel fills remaining space

### Mobile Component  
File: `ProductSectionMobile.tsx`
- Horizontal mini-hub (SVG 320x60) at top
- Expandable card stack (motion.div with layout animation)
- Each card expands on tap with accordion animation
- AI typewriter triggers on card activation

### Layer 3 — Video & Deep Dive Implementation
The prototype now includes Layer 3:
- After AI typewriter finishes, a row of deep-dive buttons fades in (delay 0.3s)
- Each product has 2 buttons (e.g., "Watch how it works" + "See live results")
- Clicking the video button replaces the deep-dive row with an inline video player
- Video player: 16:9 aspect ratio, dark bg with product-color gradient tint, pulsing play button, title, duration, close button
- Close button (✕) hides video and restores the deep-dive row
- On mobile: same flow inside the accordion card, video appears inline below AI bubble
- Video player is a placeholder/thumbnail — in production, embed actual YouTube/Vimeo iframe or HTML5 video

### Key Implementation Notes
- `useTypewriter` custom hook: takes text, speed (ms per char), trigger boolean
- Hub uses polar coordinates: angle in degrees → converted to radians for x/y positioning
- `PulsingRing` component: two concentric circles animating outward with staggered delay
- Product colors used for: node stroke, detail panel accents, feature tag bg/border, CTA gradient
- Glass effect: rgba backgrounds with low-opacity borders, no actual backdrop-filter (for performance)
- `aiDone` state: tracks when AI typewriter finishes, triggers Layer 3 appearance
- `showVideo` state: toggles between deep-dive buttons and inline video player
- Both states reset when switching products or closing accordion
