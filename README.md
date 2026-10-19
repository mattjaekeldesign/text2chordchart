# 🎸 text2chordchart

Type chord progressions as plain text and get a clean chord chart. Export it to iReal Pro, PDF, MusicXML or HTML.

🌐 **Live:** https://text2chordchart.vercel.app
📖 **Full docs:** https://text2chordchart.vercel.app/docs

🔒 No accounts. No cloud. Your charts are saved in your browser.

---

## 🚀 How to Use

1. 🆕 Click **Create Chart** on the home page
2. 📝 Fill in the song title, composer, style, key and tempo (BPM)
3. ⌨️ Type your chords using the rules below
4. 👀 Watch the preview update as you type
5. 📤 Click **Export** to download `.pdf`, `.xml` (MusicXML), `.html` or `.ireal`, or copy the iReal Pro URL

🎼 MusicXML files open in MuseScore, Finale, Dorico, Sibelius and other notation apps.

### 🛠️ Editor tools

- 🔍 **find/replace**: change chords in bulk (e.g. every `D-7` to `E-7`). It matches whole chords only, so replacing `D` won't break `Dmaj7`.
- 🔠 **− / +**: change editor font size (10–20px). Your choice is remembered.
- ⏱️ **bpm**: set the tempo. It's included in iReal Pro and MusicXML exports.

---

## 📏 Rules

### 1️⃣ Bars & chords

Separate bars with `|`. Separate chords in the same bar with spaces.

```
|| Cmaj7 | Dm7 G7 | Em7 | A7 ||
```

### 2️⃣ Bar lines & repeats

| Syntax | Meaning |
|---|---|
| `\|` | ➖ Single bar line |
| `\|\|` | 🟰 Double bar line (section boundary) |
| `/` | 🔂 Repeat previous chord |
| `%` | 🔁 Repeat previous bar |
| `\|\|:` | ▶️ Repeat start |
| `:\|\|` | ◀️ Repeat end |
| `:\|\|x4` | ✖️ Repeat 4 times (any number) |

```
||: Cmaj7 | Dm7 | Em7 | G7 :||x2
```

### 3️⃣ Sections

🏷️ Put the section name on its own line, then the chords. Allowed names:
- `A`–`H`
- `Intro`, `Verse`, `Chorus`, `Bridge`, `Outro`, `Solo`, `Interlude`, `Tag`

```
A
|| Cmaj7 | Dm7 | Em7 | G7 ||
B
|| Fmaj7 | Bb7 | Cmaj7 | / ||
(A)
```

- ↩️ `(A)` repeats a section you already wrote
- ➡️ Inline also works: `A || Cmaj7 | Dm7 || B || Em7 | G7 ||`

### 4️⃣ Navigation (D.C., D.S., Coda, Fine)

🧭 Put the marker in parentheses before the chord it sits under:

| Syntax | Result |
|---|---|
| `(d.c) G` | D.C. |
| `(d.s) C` | D.S. |
| `(d.c. al coda) F7` | D.C. al Coda |
| `(d.s. al fine) Am` | D.S. al Fine |
| `(fine) C` | Fine |
| `(to coda) G7` or `(coda) G7` | To Coda |

- 𝄋 `A seg` (or `A segno`) adds a segno to section A
- 𝄌 A section named `Coda` gets the coda symbol automatically

### 5️⃣ Time signatures & endings

⏲️ Time signature at the start of a bar:

```
|| (3/4) Cmaj7 | Dm7 | Em7 ||
```

1️⃣2️⃣ First and second endings:

```
||: Cmaj7 | Dm7 | (1) Em7 | G7 :||
| (2) Fmaj7 | G7 ||
```

### 6️⃣ Chord notation

✨ Type chords normally. They're converted to the standard symbols for you.

| You type | Shows as | Chord |
|---|---|---|
| `Cmaj7` | CΔ7 | Major 7th |
| `Cmin7` / `C-7` | C-7 | Minor 7th |
| `Cø7` | Cø7 | Half-diminished |
| `Cdim` / `C°` | C° | Diminished |
| `Caug` / `C+` | C+ | Augmented |
| `C7` | C7 | Dominant 7th |
| `Csus4` | Csus4 | Suspended 4th |
| `C/E` | C/E | Slash chord |
| `N.C.` | N.C. | No chord |

⌨️ Special characters: `º` = Option+0 (Mac) / Alt+0186 (Win), `ø` = Option+O / Alt+0248. Or type `dim`, `min` or `maj` and they're converted for you.

### 7️⃣ Comments

💬 Anything after `//` is left out of the preview and every export:

```
|| Cmaj7 | Dm7 G7 || // turnaround
// TODO: add outro
```

---

## 🎶 Example

```
A seg
||: Dm7 | G7 | Cmaj7 | (coda) A7 :||
B
|| Fmaj7 | Bb7 | Em7 | (d.c) A7 ||
Coda
|| Cmaj7 | / ||
```

---

## 💻 Run Locally

```sh
npm install
npm run dev     # 🔧 dev server
npm run build   # 📦 production build
npm test        # ✅ tests
```

🧰 Built with Vite, React, TypeScript, Tailwind and shadcn/ui. Deployed on Vercel. Every push to `main` redeploys the live site.
