
---
name: dsa-map
description: A custom skill documenting how to build interactive 3-level SVG Mind Maps, pattern-details trace simulations, and dark theme variables.
---

# DSA Mind Map & Visual Tracer Skill

This skill documents the patterns and implementation standards for building highly interactive SVG-based Mind Maps and step-by-step algorithms trace visualizers.

## 1. 3-Level SVG Hierarchy
To create complex, authentic graphs resembling `dsamindmap.com`:
- **Level 1 (Categories)**: Direct branches radiating from the center coordinate (e.g. `cx = 590`, `cy = 465`).
- **Level 2 (Sub-categories)**: Nested sub-branches radiating from the parent Category's `(x, y)` coordinate.
- **Level 3 (Leaf Patterns)**: Specific algorithmic techniques radiating from the Level 2 node's coordinate.
- Use cubic bezier curves (`M x1 y1 C midX y1, midX y2, x2 y2`) to connect links smoothly.

## 2. Animation Guidelines
- Use CSS keyframes for flowing dash link paths to make the graph look alive:
  ```css
  @keyframes dashFlow {
    to {
      stroke-dashoffset: -120;
    }
  }
  ```
- Use SVG filters (e.g. `<filter id="glow">`) to draw glowing neon highlights around selected nodes.

## 3. Dark Theme Variables (Absolute Pitch-Black Theme)
To maintain visual consistency across all panels and background scopes:
- `--bg-base`: `#000000` (Absolute pitch black)
- `--bg-surface`: `#080808` (Dark gray background panels)
- `--bg-elevated`: `#121212` (Cards and floating description panels)
- `--accent`: `#FCA311` (Gold-orange neon indicator)
