// iReal Pro format encoder/decoder utilities

export interface Song {
  id: string;
  title: string;
  composer: string;
  style: string;
  key: string;
  chordText: string;
  tempo?: number;
  createdAt: Date;
  folderId?: string;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: Date;
}

export interface ParsedChord {
  root: string;
  quality: string;
  bass?: string;
}

export interface ParsedMeasure {
  chords: string[];
  parsedChords: ParsedChord[];
  isRepeatStart: boolean;
  isRepeatEnd: boolean;
  isDoubleBar: boolean;
  timeSignature?: string;
  repeatCount?: number;
  ending?: number; // 1 for first ending, 2 for second ending, etc.
  navigation?: string; // d.c., d.s., fine, etc.
}

export interface ParsedSection {
  name: string;
  measures: ParsedMeasure[];
  rows: ParsedMeasure[][];
  isReference: boolean;
  referenceTo?: string;
  hasSegno?: boolean;
  hasCoda?: boolean;
}

export interface ParsedChart {
  sections: ParsedSection[];
}

// Normalize chord notation - replace maj/min with symbols
export function normalizeChord(chord: string): string {
  return chord
    .replace(/maj7/gi, 'Δ7')
    .replace(/maj9/gi, 'Δ9')
    .replace(/maj13/gi, 'Δ13')
    .replace(/maj/gi, 'Δ')
    .replace(/min7/gi, '-7')
    .replace(/min9/gi, '-9')
    .replace(/min11/gi, '-11')
    .replace(/min/gi, '-');
}

// Parse a chord into root and quality
export function parseChord(chord: string): ParsedChord {
  const normalized = normalizeChord(chord);
  
  // Handle N.C. (no chord) - case insensitive
  if (normalized.toLowerCase() === 'n.c.' || normalized.toLowerCase() === 'nc') {
    return { root: 'N.C.', quality: '' };
  }
  
  // Match root note (with optional sharp/flat)
  const rootMatch = normalized.match(/^([A-G][#b♯♭]?)/);
  if (!rootMatch) {
    return { root: normalized, quality: '' };
  }
  
  const root = rootMatch[1];
  let remaining = normalized.slice(root.length);
  
  // Check for slash bass note
  let bass: string | undefined;
  const slashIndex = remaining.lastIndexOf('/');
  if (slashIndex !== -1) {
    bass = remaining.slice(slashIndex + 1);
    remaining = remaining.slice(0, slashIndex);
  }
  
  return { root, quality: remaining, bass };
}

// Parse user-friendly text notation into structured measures
export function parseChordText(text: string): ParsedChart {
  const sections: ParsedSection[] = [];
  const sectionMap: Map<string, ParsedSection> = new Map();
  
  // Section name patterns: A-H, or common form names (with optional modifiers like "seg", "segno", "coda")
  const sectionNamePattern = /^([A-H]|Intro|Verse|Chorus|Bridge|Outro|Pre-Chorus|Prechorus|Interlude|Solo|Coda|Tag)(?:\s+(seg|segno|coda))?$/i;
  
  // Helper to parse section name with modifiers
  const parseSectionName = (name: string): { name: string; hasSegno: boolean; hasCoda: boolean } | null => {
    const match = name.trim().match(sectionNamePattern);
    if (!match) return null;
    
    const baseName = match[1];
    const modifier = match[2]?.toLowerCase();
    
    let normalizedName = baseName.charAt(0).toUpperCase() + baseName.slice(1).toLowerCase();
    if (baseName.length === 1) {
      normalizedName = baseName.toUpperCase();
    }
    
    return {
      name: normalizedName,
      hasSegno: modifier === 'seg' || modifier === 'segno',
      hasCoda: baseName.toLowerCase() === 'coda' || modifier === 'coda',
    };
  };
  
  // Check if this is an inline format (section names before ||)
  // Pattern: "A ||..." or "B seg ||..."
  const inlinePattern = /(?:^|(?<=\|\|)\s*)([A-H]|Intro|Verse|Chorus|Bridge|Outro|Pre-Chorus|Prechorus|Interlude|Solo|Coda|Tag)(?:\s+(seg|segno))?\s*\|\|/i;
  // Strip comments before checking for inline sections
  const textWithoutComments = text.split('\n').map(l => l.replace(/\/\/.*$/, '')).join('\n');
  const hasInlineSections = inlinePattern.test(textWithoutComments);
  
  if (hasInlineSections) {
    // Split by || to find section boundaries
    // First strip comments and normalize line breaks
    const fullText = text.split('\n').map(l => l.replace(/\/\/.*$/, '')).join(' ').replace(/\s+/g, ' ').trim();
    
    // Split by || (double bar)
    const parts = fullText.split(/\|\|/);
    
    let currentSectionName = '';
    let currentHasSegno = false;
    let currentHasCoda = false;
    let currentContent = '';
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      
      if (!part) continue;
      
      // Check if this part is a section name (possibly with modifiers)
      const sectionInfo = parseSectionName(part);
      
      if (sectionInfo) {
        // This is a section name - save current content if any
        if (currentContent) {
          const measures = parseLine('||' + currentContent + '||');
          if (measures.length > 0) {
            const rows: ParsedMeasure[][] = [];
            for (let j = 0; j < measures.length; j += 4) {
              rows.push(measures.slice(j, j + 4));
            }
            sections.push({
              name: currentSectionName,
              measures,
              rows,
              isReference: false,
              hasSegno: currentHasSegno,
              hasCoda: currentHasCoda,
            });
            if (currentSectionName.match(/^[A-H]$/)) {
              sectionMap.set(currentSectionName, sections[sections.length - 1]);
            }
          }
        }
        
        // Start new section
        currentSectionName = sectionInfo.name;
        currentHasSegno = sectionInfo.hasSegno;
        currentHasCoda = sectionInfo.hasCoda;
        currentContent = '';
      } else {
        // This is chord content - accumulate it
        if (currentContent) {
          currentContent += ' || ' + part;
        } else {
          currentContent = part;
        }
      }
    }
    
    // Don't forget the last section
    if (currentContent) {
      const measures = parseLine('||' + currentContent + '||');
      if (measures.length > 0) {
        const rows: ParsedMeasure[][] = [];
        for (let j = 0; j < measures.length; j += 4) {
          rows.push(measures.slice(j, j + 4));
        }
        sections.push({
          name: currentSectionName,
          measures,
          rows,
          isReference: false,
          hasSegno: currentHasSegno,
          hasCoda: currentHasCoda,
        });
        if (currentSectionName.match(/^[A-H]$/)) {
          sectionMap.set(currentSectionName, sections[sections.length - 1]);
        }
      }
    }
    
    return { sections };
  }
  
  // Fall back to line-by-line parsing for backwards compatibility
  // Strip comments (// ...) from each line before processing
  const lines = text.split('\n').map(l => l.replace(/\/\/.*$/, ''));
  let pendingSectionName: string | null = null;
  let pendingHasSegno: boolean = false;
  let pendingHasCoda: boolean = false;
  
  for (let i = 0; i < lines.length; i++) {
    // Strip trailing repeat counts like "x3" that might have been left over
    const trimmedLine = lines[i].trim().replace(/^x\d+\s*/, '');
    if (!trimmedLine) continue;
    
    // Check if this is a section reference like (A)
    const refMatch = trimmedLine.match(/^\(([A-H])\)$/i);
    if (refMatch) {
      const refName = refMatch[1].toUpperCase();
      const referencedSection = sectionMap.get(refName);
      
      if (referencedSection) {
        sections.push({
          name: refName,
          measures: [...referencedSection.measures],
          rows: [...referencedSection.rows],
          isReference: true,
          referenceTo: refName,
        });
      }
      pendingSectionName = null;
      pendingHasSegno = false;
      pendingHasCoda = false;
      continue;
    }
    
    // Check if this line is a section name (with optional modifiers)
    const sectionMatch = trimmedLine.match(sectionNamePattern);
    if (sectionMatch) {
      const parsed = parseSectionName(trimmedLine);
      if (parsed) {
        // If there's already a pending section name without chords, flush it as an empty section
        if (pendingSectionName) {
          // Check if it's a reference to a previously defined section
          const referencedSection = sectionMap.get(pendingSectionName);
          if (referencedSection) {
            sections.push({
              name: pendingSectionName,
              measures: [...referencedSection.measures],
              rows: [...referencedSection.rows],
              isReference: true,
              referenceTo: pendingSectionName,
              hasSegno: pendingHasSegno,
              hasCoda: pendingHasCoda,
            });
          } else {
            // Empty section with no chords
            sections.push({
              name: pendingSectionName,
              measures: [],
              rows: [],
              isReference: false,
              hasSegno: pendingHasSegno,
              hasCoda: pendingHasCoda,
            });
          }
        }
        pendingSectionName = parsed.name;
        pendingHasSegno = parsed.hasSegno;
        pendingHasCoda = parsed.hasCoda;
      }
      continue;
    }
    
    // Parse measures from this line
    const measures = parseLine(trimmedLine);
    
    if (measures.length > 0) {
      const rows: ParsedMeasure[][] = [];
      for (let j = 0; j < measures.length; j += 4) {
        rows.push(measures.slice(j, j + 4));
      }
      
      const section: ParsedSection = {
        name: pendingSectionName || '',
        measures,
        rows,
        isReference: false,
        hasSegno: pendingHasSegno,
        hasCoda: pendingHasCoda,
      };
      
      sections.push(section);
      if (pendingSectionName && pendingSectionName.match(/^[A-H]$/)) {
        sectionMap.set(pendingSectionName, section);
      }
      pendingSectionName = null;
      pendingHasSegno = false;
      pendingHasCoda = false;
    }
  }
  
  // Flush any remaining pending section name without chords
  if (pendingSectionName) {
    const referencedSection = sectionMap.get(pendingSectionName);
    if (referencedSection) {
      sections.push({
        name: pendingSectionName,
        measures: [...referencedSection.measures],
        rows: [...referencedSection.rows],
        isReference: true,
        referenceTo: pendingSectionName,
        hasSegno: pendingHasSegno,
        hasCoda: pendingHasCoda,
      });
    } else {
      sections.push({
        name: pendingSectionName,
        measures: [],
        rows: [],
        isReference: false,
        hasSegno: pendingHasSegno,
        hasCoda: pendingHasCoda,
      });
    }
  }
  
  return { sections };
}

function parseLine(line: string): ParsedMeasure[] {
  const measures: ParsedMeasure[] = [];
  
  // Normalize the line - ensure spaces around bar lines for consistent parsing
  let normalized = line.trim();
  
  // Add spaces around bar lines so |Dmaj| and | Dmaj | parse the same
  normalized = normalized.replace(/\|/g, ' | ');
  // Clean up multiple spaces
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  // Handle repeat markers with optional repeat count (x2, x4, etc.)
  // ||: is repeat start, :|| is repeat end, :||x4 means repeat 4 times
  // Be lenient about spacing because we normalize bars by inserting spaces.
  normalized = normalized.replace(/\|\s*\|\s*:/g, '| REPEAT_START |');
  normalized = normalized.replace(/:\s*\|\s*\|\s*x(\d+)/gi, '| REPEAT_END_$1 |');
  normalized = normalized.replace(/:\s*\|\s*\|/g, '| REPEAT_END |');
  normalized = normalized.replace(/\|\s*:/g, '| REPEAT_START |');
  normalized = normalized.replace(/:\s*\|\s*x(\d+)/gi, '| REPEAT_END_$1 |');
  normalized = normalized.replace(/:\s*\|/g, '| REPEAT_END |');
  
  // Split by bar lines
  const tokens = normalized.split(/\|/).map(t => t.trim()).filter(t => t.length > 0);
  
  let isRepeatStart = false;
  let pendingRepeatEnd = false;
  let pendingRepeatCount: number | undefined = undefined;
  let isDoubleBar = false;
  let pendingTimeSignature: string | undefined = undefined;
  let pendingEnding: number | undefined = undefined;
  
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    
    // Check for double bar (empty token between two bars means ||)
    if (token === '') {
      isDoubleBar = true;
      continue;
    }
    if (token === 'REPEAT_START') {
      isRepeatStart = true;
      continue;
    }
    // Check for repeat end with count (e.g., REPEAT_END_4)
    const repeatEndMatch = token.match(/^REPEAT_END(?:_(\d+))?$/);
    if (repeatEndMatch) {
      const count = repeatEndMatch[1] ? parseInt(repeatEndMatch[1], 10) : undefined;
      // Apply to previous measure
      if (measures.length > 0) {
        measures[measures.length - 1].isRepeatEnd = true;
        if (count) measures[measures.length - 1].repeatCount = count;
      } else {
        pendingRepeatEnd = true;
        pendingRepeatCount = count;
      }
      continue;
    }
    
    // Check for time signature pattern like (2/4), (6/8), etc.
    let contentToProcess = token;
    const timeSigMatch = token.match(/^\((\d+\/\d+)\)\s*/);
    if (timeSigMatch) {
      pendingTimeSignature = timeSigMatch[1];
      contentToProcess = token.slice(timeSigMatch[0].length);
    }
    
    // Check for ending markers like (1), (2), etc.
    const endingMatch = contentToProcess.match(/^\((\d)\)\s*/);
    if (endingMatch) {
      pendingEnding = parseInt(endingMatch[1], 10);
      contentToProcess = contentToProcess.slice(endingMatch[0].length);
    }
    
    // Check for navigation markers - both at end and in parentheses at start
    let navigation: string | undefined = undefined;
    
    // Helper to normalize navigation text
    const normalizeNavigation = (raw: string): string | undefined => {
      raw = raw.toLowerCase().replace(/\s+/g, ' ');
      if (raw.includes('d') && raw.includes('c') && raw.includes('coda')) {
        return 'D.C. al Coda';
      } else if (raw.includes('d') && raw.includes('c') && raw.includes('fine')) {
        return 'D.C. al Fine';
      } else if (raw.includes('d') && raw.includes('s') && raw.includes('coda')) {
        return 'D.S. al Coda';
      } else if (raw.includes('d') && raw.includes('s') && raw.includes('fine')) {
        return 'D.S. al Fine';
      } else if (raw.includes('d') && raw.includes('c')) {
        return 'D.C.';
      } else if (raw.includes('d') && raw.includes('s')) {
        return 'D.S.';
      } else if (raw === 'fine') {
        return 'Fine';
      } else if (raw === 'coda' || raw === 'to coda') {
        return 'To Coda';
      } else if (raw === 'segno') {
        return 'Segno';
      }
      return undefined;
    };
    
    // Check for parenthesized navigation at the start: (d.c), (d.s. al coda), etc.
    const parenNavPattern = /^\(([^)]+)\)\s*/i;
    const parenNavMatch = contentToProcess.match(parenNavPattern);
    if (parenNavMatch) {
      const normalized = normalizeNavigation(parenNavMatch[1]);
      if (normalized) {
        navigation = normalized;
        contentToProcess = contentToProcess.slice(parenNavMatch[0].length);
      }
    }
    
    // Also check for navigation markers at the end (without parentheses)
    if (!navigation) {
      const navPattern = /\s*(d\.?c\.?\s*al\s*coda|d\.?c\.?\s*al\s*fine|d\.?s\.?\s*al\s*coda|d\.?s\.?\s*al\s*fine|d\.?c\.?|d\.?s\.?|fine|coda|to\s*coda|segno)$/i;
      const navMatch = contentToProcess.match(navPattern);
      if (navMatch) {
        navigation = normalizeNavigation(navMatch[1]);
        if (navigation) {
          contentToProcess = contentToProcess.slice(0, -navMatch[0].length).trim();
        }
      }
    }
    
    // This is chord content
    const chords = contentToProcess.split(/\s+/).filter(c => c.length > 0).map(normalizeChord);
    const parsedChords = chords.map(parseChord);
    
    if (chords.length > 0) {
      measures.push({
        chords,
        parsedChords,
        isRepeatStart,
        isRepeatEnd: pendingRepeatEnd,
        repeatCount: pendingRepeatCount,
        isDoubleBar,
        timeSignature: pendingTimeSignature,
        ending: pendingEnding,
        navigation,
      });
      isRepeatStart = false;
      pendingRepeatEnd = false;
      pendingRepeatCount = undefined;
      isDoubleBar = false;
      pendingTimeSignature = undefined;
      pendingEnding = undefined;
    }
  }
  
  return measures;
}

// Convert chord to iReal encoding format
function encodeChordForIReal(chord: string): string {
  // Handle repeat slash - in iReal 'p' is the slash symbol (repeat previous chord)
  if (chord === '/') {
    return 'p'; // iReal's slash symbol for "repeat previous chord"
  }
  
  // Handle '%' and 'x' as repeat measure symbol
  if (chord === '%' || chord === 'x') {
    return 'x'; // iReal's "repeat one measure" symbol (shows as %)
  }
  
  // Handle N.C. (no chord)
  if (chord.toLowerCase() === 'n.c.' || chord.toLowerCase() === 'nc') {
    return 'n'; // iReal's no chord symbol
  }
  
  let encoded = chord
    // Major variations → ^
    .replace(/maj7/gi, '^7')
    .replace(/maj9/gi, '^9')
    .replace(/maj13/gi, '^13')
    .replace(/maj/gi, '^')
    .replace(/Δ7/g, '^7')
    .replace(/Δ9/g, '^9')
    .replace(/Δ13/g, '^13')
    .replace(/Δ/g, '^')
    // Minor variations → -
    .replace(/min7/gi, '-7')
    .replace(/min9/gi, '-9')
    .replace(/min11/gi, '-11')
    .replace(/min13/gi, '-13')
    .replace(/min/gi, '-')
    // Half-diminished → h
    .replace(/ø/g, 'h')
    .replace(/half-dim/gi, 'h')
    // Diminished → o
    .replace(/dim7/gi, 'o7')
    .replace(/dim/gi, 'o')
    .replace(/°/g, 'o')
    .replace(/º/g, 'o')
    // Augmented → +
    .replace(/aug/gi, '+')
    // Accidentals
    .replace(/♯/g, '#')
    .replace(/♭/g, 'b');
  
  return encoded;
}

// Generate iReal Pro URL format (irealbook:// protocol)
export function generateIRealURL(song: Song): string {
  const { title, composer, style, key, chordText } = song;
  
  // Parse the chord text
  const parsed = parseChordText(chordText);
  
  // Build the chord progression string in iReal format
  let chordData = '';
  
  let isFirstSection = true;
  let measureCount = 0;
  let endsWithRepeat = false;
  
  for (let sectionIdx = 0; sectionIdx < parsed.sections.length; sectionIdx++) {
    const section = parsed.sections[sectionIdx];

    // iReal Pro format:
    // - `[` and `]` are double bar lines (not line breaks)
    // - `LZ` is used as a "new line" bar marker in many iReal parsers/renderers
    // - `{` and `}` are repeat brackets
    // - `|` is a single bar line
    // - `Z` is the final bar
    
    if (isFirstSection) {
      // Start the chart with opening double bar
      chordData += '[T44';
      isFirstSection = false;
    } else {
      // Properly end the previous section and start a new one to avoid overlap
      // between ending double bars and repeat signs.
      // Handle different endings:
      // - If ends with }| (repeat end + bar): keep }, add LZ[ (don't add ] after })
      // - If ends with | (regular bar): replace with ]LZ[
      // - Otherwise: just add LZ[
      if (chordData.endsWith('}|')) {
        chordData = chordData.slice(0, -1); // Remove just the |, keep the }
        chordData += 'LZ['; // Line break + open new section (no ] needed after })
      } else if (chordData.endsWith('|')) {
        chordData = chordData.slice(0, -1); // Remove trailing bar
        chordData += ']LZ['; // Close section + line break + open new section
      } else {
        chordData += 'LZ['; // Just add line break + open new section
      }
      measureCount = 0;
    }

    // Add segno symbol if section has it
    if (section.hasSegno) {
      chordData += 'S';
    }
    
    // Add coda symbol if section is coda
    if (section.hasCoda) {
      chordData += 'Q';
    }

    // Add section rehearsal mark if named (A-H become *A-*H, others become *V for verse, etc.)
    if (section.name) {
      const sectionMark = getSectionMark(section.name);
      if (sectionMark) {
        chordData += sectionMark;
      }
    }

    // Time signature at the start of each section
    if (sectionIdx > 0) chordData += 'T44';
    
    for (let i = 0; i < section.measures.length; i++) {
      const measure = section.measures[i];
      const isLastMeasure = (sectionIdx === parsed.sections.length - 1) && (i === section.measures.length - 1);
      
      // Time signature (before bar line content)
      if (measure.timeSignature) {
        const ts = measure.timeSignature.replace('/', '');
        chordData += `T${ts}`;
      }
      
      // Ending marker (volta bracket)
      if (measure.ending) {
        chordData += `N${measure.ending}`;
      }
      
      // Opening repeat
      if (measure.isRepeatStart) {
        chordData += '{';
      }
      
      // Add navigation marker as staff text BEFORE the chord (iReal format)
      if (measure.navigation) {
        chordData += `<${measure.navigation}>`;
      }
      
      // Add chords - each measure should be exactly 4 spaces for clean 16-space systems
      // (4 measures × 4 spaces = 16 spaces per line = neat, square chart)
      const encodedChords = measure.chords.map((c) => encodeChordForIReal(c));
      const chordContent = encodedChords.join(' ');
      // Pad to 4 spaces: each chord takes 1 space, spaces between chords count too
      // For n chords joined with spaces, we have n + (n-1) = 2n-1 characters worth of "space units"
      // But in iReal, each chord = 1 space unit. So n chords = n space units.
      const spacesUsed = encodedChords.length;
      const paddingNeeded = Math.max(0, 4 - spacesUsed);
      chordData += chordContent + ' '.repeat(paddingNeeded);
      
      // Add repeat count as staff text if specified
      if (measure.repeatCount && measure.repeatCount > 2) {
        chordData += `<${measure.repeatCount}x>`;
      }
      
      // Closing repeat and bar line handling
      if (measure.isRepeatEnd) {
        // If a chart ends with :||, iReal expects the final bar to be `}Z`.
        chordData += isLastMeasure ? '}Z' : '}|';
        endsWithRepeat = isLastMeasure;
      } else {
        chordData += '|';
        if (isLastMeasure) endsWithRepeat = false;
      }
      
      measureCount++;
    }
  }
  
  // Final bar (only if not already ended with repeat)
  if (!endsWithRepeat) {
    chordData += 'Z';
  }
  
  // Format: Title=LastName FirstName=Style=Key=n=ChordProgression
  // Composer: try to split into "LastName FirstName" format
  const formattedComposer = formatComposerName(composer);
  
  // Build the URL (no obfuscation needed for irealbook:// scheme)
  // The 'n' field encodes tempo if provided
  const tempoField = song.tempo ? String(song.tempo) : 'n';
  const urlContent = `${title}=${formattedComposer}=${style}=${key}=${tempoField}=${chordData}`;
  
  // Percent-encode for safe browser use
  return `irealbook://${encodeURIComponent(urlContent).replace(/%3D/g, '=')}`;
}

// Get iReal section mark from section name
function getSectionMark(name: string): string {
  const upper = name.toUpperCase();
  if (upper.match(/^[A-D]$/)) return `*${upper}`;
  if (upper === 'VERSE') return '*V';
  if (upper === 'INTRO') return '*i';
  if (upper === 'CHORUS') return '*A'; // Map chorus to A section
  if (upper === 'BRIDGE') return '*B'; // Map bridge to B section
  return '';
}

// Format composer name as "LastName FirstName"
function formatComposerName(composer: string): string {
  if (!composer || composer === 'Unknown') return 'Unknown';
  const parts = composer.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  // Assume last word is last name
  const lastName = parts.pop()!;
  return `${lastName} ${parts.join(' ')}`;
}

// Generate HTML file content for download
export function generateIRealHTML(song: Song): string {
  const url = generateIRealURL(song);
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${song.title} - iReal Pro</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 2rem; background: #1b2730; color: #e6e3da; }
    a { color: #94d5ff; font-size: 1.2rem; }
    .help { font-size: 0.875rem; color: #999; margin-top: 2rem; }
  </style>
</head>
<body>
  <h2><a href="${url}">${song.title}</a></h2>
  <p>${song.composer} · ${song.style} · ${song.key}</p>
  <p class="help">
    iOS: Tap the link above to open in iReal Pro<br>
    Mac: Drag this file onto the iReal Pro icon in the dock
  </p>
  <p style="margin-top: 2rem; font-size: 0.75rem; color: #666;">Made with ChartCraft</p>
</body>
</html>`;
}

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
