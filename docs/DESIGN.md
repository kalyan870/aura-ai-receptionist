# Design System & UX Specification (`DESIGN.md`)

## 1. Visual Language
- **Theme**: Executive Dark Glassmorphism (`#05080F` deep canvas, `#0F172A/75` frosted panels, `1px solid rgba(255,255,255,0.08)` borders).
- **Accent Palette**: Cyan (`#06B6D4`), Indigo (`#6366F1`), Emerald (`#10B981` for confirmed/active), Amber (`#F59E0B` for warnings), Rose (`#F43F5E` for emergency).
- **Typography**: `Plus Jakarta Sans` for UI & headings; `JetBrains Mono` for badge codes, ticket IDs, and telemetry.

## 2. Motion Choreography (Anime.js v4)
- **Cinematic Landing**: Staggered word blur-to-sharp reveal (`createTimeline` + `stagger(75)`), cascading CTAs, continuous floating holographic orb (`inOutSine`), and rotating telemetry ring.
- **Avatar Visualizer**: HTML5 Canvas particle orbit + equalizer bars reflecting `idle`, `listening`, `thinking`, and `speaking` states.

## 3. Multimodal Interaction Patterns
- **Hold-to-Speak (Push-to-Talk)**: Pointer-down starts continuous speech recognition with live interim transcript; pointer-up finalizes and dispatches to `/api/chat`.
- **Super Chatbot Action Cards**: Bot replies include clickable suggestion chips, inline ticket creation triggers, and CSAT thumbs-up/down feedback.
- **Print-First Visitor Badge**: Dedicated `@media print` stylesheet isolates `#printable-badge` for physical badge printers.
