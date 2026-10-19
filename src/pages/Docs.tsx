import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Docs() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="flex-1" />
          <h1 className="font-serif text-lg italic">text2chordchart Docs</h1>
        </div>
      </header>

      {/* Layout with sidebar */}
      <div className="max-w-6xl mx-auto flex">
        {/* Sidebar - Table of Contents (desktop only) */}
        <aside className="hidden lg:block w-56 flex-shrink-0 border-r border-border">
          <nav className="sticky top-16 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Contents</h2>
            <ul className="space-y-2 text-sm">
              <li><a href="#getting-started" className="text-muted-foreground hover:text-foreground transition-colors underline decoration-dotted underline-offset-4">Getting Started</a></li>
              <li><a href="#basic-syntax" className="text-muted-foreground hover:text-foreground transition-colors underline decoration-dotted underline-offset-4">Basic Syntax</a></li>
              <li><a href="#bar-lines" className="text-muted-foreground hover:text-foreground transition-colors underline decoration-dotted underline-offset-4">Bar Lines & Repeats</a></li>
              <li><a href="#sections" className="text-muted-foreground hover:text-foreground transition-colors underline decoration-dotted underline-offset-4">Sections</a></li>
              <li><a href="#navigation" className="text-muted-foreground hover:text-foreground transition-colors underline decoration-dotted underline-offset-4">Navigation Markers</a></li>
              <li><a href="#time-signatures" className="text-muted-foreground hover:text-foreground transition-colors underline decoration-dotted underline-offset-4">Time Signatures & Endings</a></li>
              <li><a href="#chord-notation" className="text-muted-foreground hover:text-foreground transition-colors underline decoration-dotted underline-offset-4">Chord Notation</a></li>
              <li><a href="#special-characters" className="text-muted-foreground hover:text-foreground transition-colors underline decoration-dotted underline-offset-4">Special Characters</a></li>
              <li><a href="#comments" className="text-muted-foreground hover:text-foreground transition-colors underline decoration-dotted underline-offset-4">Comments</a></li>
              <li><a href="#editor-tools" className="text-muted-foreground hover:text-foreground transition-colors underline decoration-dotted underline-offset-4">Editor Tools</a></li>
              <li><a href="#examples" className="text-muted-foreground hover:text-foreground transition-colors underline decoration-dotted underline-offset-4">Full Examples</a></li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-6 py-12 min-w-0">
          {/* Title */}
          <div className="mb-12">
            <h1 className="text-4xl font-serif italic mb-4">Documentation</h1>
            <p className="text-muted-foreground text-lg">
              Learn how to write chord charts using the text2chordchart syntax.
            </p>
          </div>

          {/* Mobile Table of Contents */}
          <nav className="mb-12 p-4 border border-border lg:hidden">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">Contents</h2>
            <ul className="space-y-2 text-sm">
              <li><a href="#getting-started" className="text-muted-foreground hover:text-foreground transition-colors underline decoration-dotted underline-offset-4">Getting Started</a></li>
              <li><a href="#basic-syntax" className="text-muted-foreground hover:text-foreground transition-colors underline decoration-dotted underline-offset-4">Basic Syntax</a></li>
              <li><a href="#bar-lines" className="text-muted-foreground hover:text-foreground transition-colors underline decoration-dotted underline-offset-4">Bar Lines & Repeats</a></li>
              <li><a href="#sections" className="text-muted-foreground hover:text-foreground transition-colors underline decoration-dotted underline-offset-4">Sections</a></li>
              <li><a href="#navigation" className="text-muted-foreground hover:text-foreground transition-colors underline decoration-dotted underline-offset-4">Navigation Markers</a></li>
              <li><a href="#time-signatures" className="text-muted-foreground hover:text-foreground transition-colors underline decoration-dotted underline-offset-4">Time Signatures & Endings</a></li>
              <li><a href="#chord-notation" className="text-muted-foreground hover:text-foreground transition-colors underline decoration-dotted underline-offset-4">Chord Notation</a></li>
              <li><a href="#special-characters" className="text-muted-foreground hover:text-foreground transition-colors underline decoration-dotted underline-offset-4">Special Characters</a></li>
              <li><a href="#comments" className="text-muted-foreground hover:text-foreground transition-colors underline decoration-dotted underline-offset-4">Comments</a></li>
              <li><a href="#editor-tools" className="text-muted-foreground hover:text-foreground transition-colors underline decoration-dotted underline-offset-4">Editor Tools</a></li>
              <li><a href="#examples" className="text-muted-foreground hover:text-foreground transition-colors underline decoration-dotted underline-offset-4">Full Examples</a></li>
            </ul>
          </nav>

        {/* Sections */}
        <div className="space-y-16">
          
          {/* Getting Started */}
          <section id="getting-started">
            <h2 className="text-2xl font-serif italic mb-4 pb-2 border-b border-border">Getting Started</h2>
            <div className="prose prose-invert max-w-none space-y-4 text-muted-foreground">
              <p>
                text2chordchart converts plain text chord notation into iReal Pro format. Simply type your chords 
                using the syntax below, and export to iReal Pro with a single click.
              </p>
              <p>
                Charts can also be exported as <strong className="text-foreground">.pdf</strong> (with Comic Sans styling), <strong className="text-foreground">.xml (MusicXML)</strong> for import into any music notation software — including MuseScore, Finale, Dorico, Sibelius, and more.
              </p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Click <strong className="text-foreground">"Create Chart"</strong> on the home page</li>
                <li>Fill in the song title, composer, style, and key</li>
                <li>Type your chord progression using the syntax below</li>
                <li>Preview updates in real-time as you type</li>
                <li>Click <strong className="text-foreground">"Export"</strong> to download as .pdf, .xml, .html, or .ireal, or copy the iReal URL</li>
              </ol>
            </div>
          </section>

          {/* Basic Syntax */}
          <section id="basic-syntax">
            <h2 className="text-2xl font-serif italic mb-4 pb-2 border-b border-border">Basic Syntax</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Write chords separated by bar lines. Use spaces between chords within the same measure.
              </p>
              <div className="bg-secondary/30 border border-border p-4 font-mono text-sm">
                <code className="text-foreground">|| Cmaj7 | Dm7 G7 | Em7 | A7 ||</code>
              </div>
              <p className="text-sm">
                This creates 4 measures: C major 7, then D minor 7 and G7 in the same bar, E minor 7, and A7.
              </p>
            </div>
          </section>

          {/* Bar Lines & Repeats */}
          <section id="bar-lines">
            <h2 className="text-2xl font-serif italic mb-4 pb-2 border-b border-border">Bar Lines & Repeats</h2>
            <div className="space-y-6">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-semibold">Syntax</th>
                    <th className="text-left py-2 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4"><code className="text-foreground">|</code></td>
                    <td className="text-muted-foreground">Single bar line</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4"><code className="text-foreground">||</code></td>
                    <td className="text-muted-foreground">Double bar line (section boundary)</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4"><code className="text-foreground">/</code></td>
                    <td className="text-muted-foreground">Repeat previous chord</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4"><code className="text-foreground">%</code></td>
                    <td className="text-muted-foreground">Repeat previous measure</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4"><code className="text-foreground">||:</code></td>
                    <td className="text-muted-foreground">Repeat start</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4"><code className="text-foreground">:||</code></td>
                    <td className="text-muted-foreground">Repeat end</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4"><code className="text-foreground">:||x4</code></td>
                    <td className="text-muted-foreground">Repeat 4 times (any number)</td>
                  </tr>
                </tbody>
              </table>
              
              <div className="bg-secondary/30 border border-border p-4 font-mono text-sm">
                <p className="text-muted-foreground mb-2"># Example with repeats:</p>
                <code className="text-foreground">||: Cmaj7 | Dm7 | Em7 | G7 :||x2</code>
              </div>
            </div>
          </section>

          {/* Sections */}
          <section id="sections">
            <h2 className="text-2xl font-serif italic mb-4 pb-2 border-b border-border">Sections</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Define sections by writing the section name on its own line, followed by the chords.
              </p>
              
              <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">Section Names</h3>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><code className="font-mono text-foreground">A</code>, <code className="font-mono text-foreground">B</code>, <code className="font-mono text-foreground">C</code>... (single letters A-H)</li>
                <li><code className="font-mono text-foreground">Intro</code>, <code className="font-mono text-foreground">Verse</code>, <code className="font-mono text-foreground">Chorus</code>, <code className="font-mono text-foreground">Bridge</code>, <code className="font-mono text-foreground">Outro</code></li>
                <li><code className="font-mono text-foreground">Solo</code>, <code className="font-mono text-foreground">Interlude</code>, <code className="font-mono text-foreground">Tag</code></li>
              </ul>
              
              <div className="bg-secondary/30 border border-border p-4 font-mono text-sm space-y-1">
                <p className="text-muted-foreground"># Section example:</p>
                <code className="text-foreground block">A</code>
                <code className="text-foreground block">|| Cmaj7 | Dm7 | Em7 | G7 ||</code>
                <code className="text-foreground block mt-2">B</code>
                <code className="text-foreground block">|| Fmaj7 | Bb7 | Cmaj7 | / ||</code>
              </div>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">Inline Sections</h3>
              <p className="text-sm">
                You can also write section names inline before the double bar:
              </p>
              <div className="bg-secondary/30 border border-border p-4 font-mono text-sm">
                <code className="text-foreground">A || Cmaj7 | Dm7 || B || Em7 | G7 ||</code>
              </div>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">Section References</h3>
              <p className="text-sm">
                Repeat a previously defined section using parentheses:
              </p>
              <div className="bg-secondary/30 border border-border p-4 font-mono text-sm space-y-1">
                <code className="text-foreground block">A</code>
                <code className="text-foreground block">|| Cmaj7 | Dm7 ||</code>
                <code className="text-foreground block mt-2">B</code>
                <code className="text-foreground block">|| Em7 | G7 ||</code>
                <code className="text-foreground block mt-2">(A)</code>
                <p className="text-muted-foreground text-xs mt-1"># Repeats section A</p>
              </div>
            </div>
          </section>

          {/* Navigation Markers */}
          <section id="navigation">
            <h2 className="text-2xl font-serif italic mb-4 pb-2 border-b border-border">Navigation Markers</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Add navigation text like D.C., D.S., Fine, etc. using parentheses before the chord.
              </p>
              
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-semibold">Syntax</th>
                    <th className="text-left py-2 font-semibold">Result</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4"><code className="text-foreground">(d.c) Gmaj</code></td>
                    <td className="text-muted-foreground">D.C. text under Gmaj</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4"><code className="text-foreground">(d.s) Cmaj</code></td>
                    <td className="text-muted-foreground">D.S. text under Cmaj</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4"><code className="text-foreground">(d.c. al coda) F7</code></td>
                    <td className="text-muted-foreground">D.C. al Coda text under F7</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4"><code className="text-foreground">(d.s. al fine) Am</code></td>
                    <td className="text-muted-foreground">D.S. al Fine text under Am</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4"><code className="text-foreground">(fine) Cmaj</code></td>
                    <td className="text-muted-foreground">Fine text under Cmaj</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4"><code className="text-foreground">(to coda) G7</code></td>
                    <td className="text-muted-foreground">To Coda text under G7</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4"><code className="text-foreground">(coda) G7</code></td>
                    <td className="text-muted-foreground">To Coda text under G7 (shorthand)</td>
                  </tr>
                </tbody>
              </table>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">Segno & Coda Symbols</h3>
              <p className="text-sm">
                Add segno (𝄋) or coda (𝄌) symbols to sections:
              </p>
              <div className="bg-secondary/30 border border-border p-4 font-mono text-sm space-y-1">
                <code className="text-foreground block">A seg</code>
                <p className="text-muted-foreground text-xs"># or "A segno" - adds segno symbol</p>
                <code className="text-foreground block mt-2">|| Cmaj7 | Dm7 ||</code>
                <code className="text-foreground block mt-4">Coda</code>
                <p className="text-muted-foreground text-xs"># automatically adds coda symbol</p>
                <code className="text-foreground block">|| Fmaj7 | G7 ||</code>
              </div>
            </div>
          </section>

          {/* Time Signatures & Endings */}
          <section id="time-signatures">
            <h2 className="text-2xl font-serif italic mb-4 pb-2 border-b border-border">Time Signatures & Endings</h2>
            <div className="space-y-4 text-muted-foreground">
              
              <h3 className="text-lg font-semibold text-foreground mb-2">Time Signatures</h3>
              <p className="text-sm">
                Set the time signature at the start of a measure using parentheses:
              </p>
              <div className="bg-secondary/30 border border-border p-4 font-mono text-sm">
                <code className="text-foreground">|| (3/4) Cmaj7 | Dm7 | Em7 ||</code>
              </div>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">Numbered Endings (Volta Brackets)</h3>
              <p className="text-sm">
                Create first and second endings using numbered parentheses:
              </p>
              <div className="bg-secondary/30 border border-border p-4 font-mono text-sm space-y-1">
                <code className="text-foreground block">||: Cmaj7 | Dm7 | (1) Em7 | G7 :||</code>
                <code className="text-foreground block">| (2) Fmaj7 | G7 ||</code>
              </div>
            </div>
          </section>

          {/* Chord Notation */}
          <section id="chord-notation">
            <h2 className="text-2xl font-serif italic mb-4 pb-2 border-b border-border">Chord Notation</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Write chords naturally - they'll be converted to standard symbols automatically.
              </p>
              
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-semibold">You Type</th>
                    <th className="text-left py-2 pr-4 font-semibold">Displays As</th>
                    <th className="text-left py-2 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4"><code className="text-foreground">Cmaj7</code></td>
                    <td className="py-2 pr-4">CΔ7</td>
                    <td className="text-muted-foreground">Major 7th</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4"><code className="text-foreground">Cmin7</code> or <code className="text-foreground">C-7</code></td>
                    <td className="py-2 pr-4">C-7</td>
                    <td className="text-muted-foreground">Minor 7th</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4"><code className="text-foreground">Cø7</code></td>
                    <td className="py-2 pr-4">Cø7</td>
                    <td className="text-muted-foreground">Half-diminished</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4"><code className="text-foreground">Cdim</code> or <code className="text-foreground">C°</code></td>
                    <td className="py-2 pr-4">C°</td>
                    <td className="text-muted-foreground">Diminished</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4"><code className="text-foreground">Caug</code> or <code className="text-foreground">C+</code></td>
                    <td className="py-2 pr-4">C+</td>
                    <td className="text-muted-foreground">Augmented</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4"><code className="text-foreground">C7</code></td>
                    <td className="py-2 pr-4">C7</td>
                    <td className="text-muted-foreground">Dominant 7th</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4"><code className="text-foreground">Csus4</code></td>
                    <td className="py-2 pr-4">Csus4</td>
                    <td className="text-muted-foreground">Suspended 4th</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4"><code className="text-foreground">C/E</code></td>
                    <td className="py-2 pr-4">C/E</td>
                    <td className="text-muted-foreground">Slash chord (C over E bass)</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4"><code className="text-foreground">N.C.</code></td>
                    <td className="py-2 pr-4 italic">N.C.</td>
                    <td className="text-muted-foreground">No chord</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Special Characters */}
          <section id="special-characters">
            <h2 className="text-2xl font-serif italic mb-4 pb-2 border-b border-border">Special Characters</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Some chord symbols use special characters. Here's how to type them on your keyboard:
              </p>
              
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-semibold">Symbol</th>
                    <th className="text-left py-2 pr-4 font-semibold">Mac</th>
                    <th className="text-left py-2 pr-4 font-semibold">Windows</th>
                    <th className="text-left py-2 font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4 text-foreground text-lg">º</td>
                    <td className="py-2 pr-4"><code className="text-foreground">Option + 0</code></td>
                    <td className="py-2 pr-4"><code className="text-foreground">Alt + 0186</code></td>
                    <td className="text-muted-foreground text-sm">Degree (diminished)</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4 text-foreground text-lg">ø</td>
                    <td className="py-2 pr-4"><code className="text-foreground">Option + O</code></td>
                    <td className="py-2 pr-4"><code className="text-foreground">Alt + 0248</code></td>
                    <td className="text-muted-foreground text-sm">Half-diminished</td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-2 pr-4 text-foreground text-lg">Δ</td>
                    <td className="py-2 pr-4" colSpan={2}><span className="text-muted-foreground">Type <code className="text-foreground">maj</code> — auto-converts to Δ</span></td>
                    <td className="text-muted-foreground text-sm">Major (triangle)</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-sm">
                Tip: You can always type <code className="text-foreground font-mono">dim</code>, <code className="text-foreground font-mono">min</code>, or <code className="text-foreground font-mono">maj</code> instead — they will be automatically converted to the correct symbols.
              </p>
            </div>
          </section>

          {/* Comments */}
          <section id="comments">
            <h2 className="text-2xl font-serif italic mb-4 pb-2 border-b border-border">Comments</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Add comments to your chord charts using <code className="text-foreground font-mono">//</code>. Everything after <code className="text-foreground font-mono">//</code> on a line is ignored in the preview and all exports.
              </p>
              <div className="bg-secondary/30 border border-border p-4 font-mono text-sm space-y-1">
                <code className="text-foreground block">A</code>
                <code className="text-foreground block">|| Cmaj7 | Dm7 G7 || // turnaround</code>
                <code className="text-foreground block mt-2">B // bridge section</code>
                <code className="text-foreground block">|| Fmaj7 | Bb7 ||</code>
                <code className="text-foreground block mt-2">// TODO: add outro</code>
              </div>
              <p className="text-sm">
                Comments are useful for leaving notes, TODOs, or annotations that won't appear in the rendered chart or any export format (.ireal, .xml, .html).
              </p>
            </div>
          </section>

          {/* Editor Tools */}
          <section id="editor-tools">
            <h2 className="text-2xl font-serif italic mb-4 pb-2 border-b border-border">Editor Tools</h2>
            <div className="space-y-4 text-muted-foreground">
              
              <h3 className="text-lg font-semibold text-foreground mb-2">Find & Replace</h3>
              <p className="text-sm">
                Click <code className="text-foreground font-mono">find/replace</code> above the text editor to toggle the search bar. 
                This is useful for bulk chord changes — for example, transposing all <code className="text-foreground font-mono">D-7</code> chords to <code className="text-foreground font-mono">E-7</code>. 
                The replacement uses strict token-boundary matching so replacing <code className="text-foreground font-mono">D</code> with <code className="text-foreground font-mono">E</code> won't corrupt <code className="text-foreground font-mono">Dmaj7</code> or <code className="text-foreground font-mono">D-7</code>.
              </p>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">Font Size</h3>
              <p className="text-sm">
                Use the <code className="text-foreground font-mono">−</code> and <code className="text-foreground font-mono">+</code> buttons in the top-right of the editor to adjust the text size (10px–20px). Your preference is saved locally.
              </p>

              <h3 className="text-lg font-semibold text-foreground mt-6 mb-2">Tempo (BPM)</h3>
              <p className="text-sm">
                Enter a tempo value in the <code className="text-foreground font-mono">bpm</code> input next to the key selector. This value is included in both iReal Pro and MusicXML exports.
              </p>
            </div>
          </section>

          {/* Full Examples */}
          <section id="examples">
            <h2 className="text-2xl font-serif italic mb-4 pb-2 border-b border-border">Full Examples</h2>
            <div className="space-y-6 text-muted-foreground">
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Simple Jazz Standard</h3>
                <div className="bg-secondary/30 border border-border p-4 font-mono text-sm space-y-1">
                  <code className="text-foreground block">A</code>
                  <code className="text-foreground block">|| Cmaj7 | Dm7 G7 | Cmaj7 | / ||</code>
                  <code className="text-foreground block mt-2">B</code>
                  <code className="text-foreground block">|| Fmaj7 | Bb7 | Cmaj7 | A7 ||</code>
                  <code className="text-foreground block mt-2">(A)</code>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Song with Navigation</h3>
                <div className="bg-secondary/30 border border-border p-4 font-mono text-sm space-y-1">
                  <code className="text-foreground block">A seg</code>
                  <code className="text-foreground block">||: Dm7 | G7 | Cmaj7 | (coda) A7 :||</code>
                  <code className="text-foreground block mt-2">B</code>
                  <code className="text-foreground block">|| Fmaj7 | Bb7 | Em7 | (d.c) A7 ||</code>
                  <code className="text-foreground block mt-2">Coda</code>
                  <code className="text-foreground block">|| Cmaj7 | / ||</code>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Inline Format</h3>
                <div className="bg-secondary/30 border border-border p-4 font-mono text-sm">
                  <code className="text-foreground">A ||Dmaj | Cmaj || B seg ||Dmaj | Fmaj || C ||Cmaj | (d.c) G#- || Coda ||Fmaj | D- ||</code>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Complex: "Dimitri" by Hiatus Kaiyote</h3>
                <p className="text-sm mb-3">
                  Demonstrates changing time signatures, section references, and N.C. (no chord):
                </p>
                <div className="bg-secondary/30 border border-border p-4 font-mono text-sm space-y-1">
                  <code className="text-foreground block">A</code>
                  <code className="text-foreground block">||: Fsus Gsus | Fsus C- Bb- C- |(2/4)  |(5/4) Fsus D- Gsus C- |(3/4) Dbmaj C- Bb- |(4/4) Fsus Bb- C- :||</code>
                  <code className="text-foreground block mt-2">B</code>
                  <code className="text-foreground block">||: Gbmaj Dbmaj |(2/4) Fsus :||</code>
                  <code className="text-foreground block mt-2">C</code>
                  <code className="text-foreground block">||(2/4) n.c ||</code>
                  <code className="text-foreground block">||(12/8) Amaj9 Abmaj9 F-7 E-7 |(8/8) F-7 E-7 C#-9 C- A |(6/8) Bb- Abmaj |(8/8) F- |(12/8) Db- C- F- E- |(8/8) F- E- C#- C- A |(6/8) Bb- Abmaj |(6/8) Csus ||</code>
                  <code className="text-foreground block mt-2">(A)</code>
                  <code className="text-foreground block">(B)</code>
                  <code className="text-foreground block">(C)</code>
                  <code className="text-foreground block">(B)</code>
                </div>
              </div>

            </div>
          </section>

        </div>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>text2chordchart · No accounts. No cloud. Just local processing.</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
