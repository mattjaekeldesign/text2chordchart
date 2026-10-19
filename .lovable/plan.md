

# Implementation Plan

This is a batch of changes spanning the editor, exports, docs, styling, mobile UX, service worker, and favicon. Here is each task broken down:

---

## 1. Add Tempo Input (BPM)

Add a numeric "bpm" input field to the editor metadata row. Store it in the draft, saved chart, and pass it through to both iReal and MusicXML exports.

- Add `tempo` field to `SavedChart` interface and `Song` interface
- Add a small numeric input (e.g. placeholder "bpm") next to the key selector in the editor
- Include tempo in the iReal URL encoding (iReal Pro supports tempo in its protocol)
- Include tempo in MusicXML output via `<sound tempo="X"/>` direction element

---

## 2. Change Hover/Click Color from Blue to Bright Purple

Replace all instances of `hsl(210 100% 45%)` (the blue accent) with a bright purple, e.g. `hsl(270 100% 60%)`.

**Files affected:**
- `src/components/BlueScrambleButton.tsx` (hover styles)
- `src/components/SongEditor.tsx` (export button, URL button, find/replace hover states)
- Any other references to `210 100% 45%`

---

## 3. Remove Side Panel Toggle on Mobile

Currently on mobile the layout toggle button (PanelLeft/PanelBottom) is shown. Hide it so mobile users only ever see the vertical (editor-only) layout.

- Wrap the layout toggle button in the `Header` section with a condition to hide on mobile (`!isMobile`)

---

## 4. Mobile Export: Only Show .xml and .html

On mobile devices, filter the export dropdown to only show `.xml (MusicXML)` and `.html (Mobile)` options, hiding `.ireal` file download and copy URL.

---

## 5. Docs Updates

### 5a. Mention MusicXML / XML export
Add a note in the "Getting Started" section that charts can be exported as `.xml` (MusicXML) for import into notation software like MuseScore, Finale, Dorico, etc.

### 5b. Special Symbol Key Commands
Add a new section or subsection in the docs with keyboard shortcuts for typing special characters:
- `º` (degree): Mac: Option+0, Windows: Alt+0186
- `ø` (half-dim): Mac: Option+O, Windows: Alt+0248
- `Δ` (triangle): mention that typing `maj` auto-converts

### 5c. Mention Find & Replace and Font Size
Add a subsection in docs about the editor tools: find/replace for bulk chord changes and the font size adjuster.

### 5d. Add "Dimitri" by Hiatus Kaiyote Example
Add a new example in the "Full Examples" section with the provided chord chart for "Dimitri", demonstrating complex time signatures, section references, and N.C.

### 5e. Add new TOC entries
Update the sidebar and mobile TOC to include new sections (e.g., "Editor Tools", "Special Characters").

---

## 6. Service Worker for Offline Support

- Create `public/sw.js` with install event that pre-caches the app shell (index.html, JS, CSS assets)
- Use cache-first strategy for static assets
- Add a simple offline fallback
- Register the service worker in `index.html` or `src/main.tsx`

---

## 7. Use FileMusic Icon as Favicon

The `.xml` export option uses the `FileMusic` icon from lucide-react. Create an SVG favicon based on this icon and update `index.html` to reference it, replacing the current `favicon.ico`.

---

## Technical Details

### Storage Schema Change (tempo)
The `SavedChart` interface gets a new optional `tempo?: number` field. The IndexedDB store doesn't need a version bump since IndexedDB is schemaless for object stores - new fields are just added to stored objects.

### iReal Tempo Encoding
iReal Pro URL format supports tempo as part of the song metadata string: `title=composer=style=key=n=body` -- the `n` field can encode tempo. This will be integrated into the existing `generateIRealURL` function.

### MusicXML Tempo
Add a `<direction>` element with `<sound tempo="X"/>` in the first measure of the MusicXML output.

### Service Worker Strategy
```text
Install -> Cache app shell (index.html, /assets/*.js, /assets/*.css, fonts)
Fetch -> Cache first for static assets, network first for navigation
Fallback -> Serve cached index.html for offline navigation requests
```

### Files to Create
- `public/sw.js` (service worker)
- `public/favicon.svg` (FileMusic-based SVG favicon)

### Files to Modify
- `src/lib/storage.ts` (add tempo field)
- `src/lib/ireal-parser.ts` (Song interface + tempo in URL encoding)
- `src/lib/musicxml-generator.ts` (tempo support)
- `src/components/SongEditor.tsx` (tempo input, mobile export filtering, hide layout toggle on mobile, purple color)
- `src/components/BlueScrambleButton.tsx` (purple color)
- `src/pages/Docs.tsx` (new sections + example)
- `src/main.tsx` or `index.html` (SW registration)
- `index.html` (favicon update)

