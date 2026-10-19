// MusicXML generator for chord charts
// Generates MusicXML 4.0 partwise format compatible with MuseScore and other notation software

import { parseChordText, ParsedMeasure, ParsedSection, ParsedChord } from './ireal-parser';

interface MusicXMLOptions {
  title: string;
  composer: string;
  key: string;
  chordText: string;
  tempo?: number;
}

// Convert key signature to MusicXML fifths value
function keyToFifths(key: string): number {
  // Remove minor indicator
  const isMinor = key.endsWith('-');
  const root = key.replace(/-$/, '');
  
  // Map of major keys to fifths (minor keys use relative major)
  const majorFifths: Record<string, number> = {
    'C': 0, 'G': 1, 'D': 2, 'A': 3, 'E': 4, 'B': 5, 'F#': 6, 'Gb': -6,
    'Db': -5, 'Ab': -4, 'Eb': -3, 'Bb': -2, 'F': -1,
    'C#': 7, // Enharmonic with Db
  };
  
  // Minor keys - map to their relative major (add 3 sharps/subtract 3 flats)
  const minorFifths: Record<string, number> = {
    'A': 0, 'E': 1, 'B': 2, 'F#': 3, 'C#': 4, 'G#': 5, 'D#': 6, 'Eb': -6,
    'Bb': -5, 'F': -4, 'C': -3, 'G': -2, 'D': -1,
  };
  
  if (isMinor) {
    return minorFifths[root] ?? 0;
  }
  return majorFifths[root] ?? 0;
}

// Convert chord quality to MusicXML kind
function qualityToKind(quality: string): { kind: string; text: string } {
  const q = quality.toLowerCase();
  
  // Major variations
  if (q === '' || q === 'maj' || q === 'Δ') {
    return { kind: 'major', text: '' };
  }
  if (q === '^7' || q === 'Δ7' || q === 'maj7') {
    return { kind: 'major-seventh', text: 'maj7' };
  }
  if (q === '^9' || q === 'Δ9' || q === 'maj9') {
    return { kind: 'major-ninth', text: 'maj9' };
  }
  if (q === '^13' || q === 'Δ13' || q === 'maj13') {
    return { kind: 'major-13th', text: 'maj13' };
  }
  
  // Minor variations
  if (q === '-' || q === 'm' || q === 'min') {
    return { kind: 'minor', text: 'm' };
  }
  if (q === '-7' || q === 'm7' || q === 'min7') {
    return { kind: 'minor-seventh', text: 'm7' };
  }
  if (q === '-9' || q === 'm9' || q === 'min9') {
    return { kind: 'minor-ninth', text: 'm9' };
  }
  if (q === '-11' || q === 'm11' || q === 'min11') {
    return { kind: 'minor-11th', text: 'm11' };
  }
  if (q === '-6' || q === 'm6' || q === 'min6') {
    return { kind: 'minor-sixth', text: 'm6' };
  }
  
  // Dominant
  if (q === '7') {
    return { kind: 'dominant', text: '7' };
  }
  if (q === '9') {
    return { kind: 'dominant-ninth', text: '9' };
  }
  if (q === '11') {
    return { kind: 'dominant-11th', text: '11' };
  }
  if (q === '13') {
    return { kind: 'dominant-13th', text: '13' };
  }
  if (q === '7sus4' || q === '7sus') {
    return { kind: 'suspended-fourth', text: '7sus4' };
  }
  if (q === '7#9') {
    return { kind: 'dominant', text: '7#9' };
  }
  if (q === '7b9') {
    return { kind: 'dominant', text: '7b9' };
  }
  if (q === '7#5' || q === '7+5') {
    return { kind: 'augmented-seventh', text: '7#5' };
  }
  if (q === '7b5') {
    return { kind: 'dominant', text: '7b5' };
  }
  if (q === '7alt') {
    return { kind: 'dominant', text: '7alt' };
  }
  
  // Half-diminished
  if (q === 'ø' || q === 'ø7' || q === 'h' || q === 'h7' || q === '-7b5' || q === 'm7b5') {
    return { kind: 'half-diminished', text: 'ø' };
  }
  
  // Diminished
  if (q === 'dim' || q === 'o' || q === '°') {
    return { kind: 'diminished', text: 'dim' };
  }
  if (q === 'dim7' || q === 'o7' || q === '°7') {
    return { kind: 'diminished-seventh', text: 'dim7' };
  }
  
  // Augmented
  if (q === '+' || q === 'aug') {
    return { kind: 'augmented', text: 'aug' };
  }
  if (q === '+7') {
    return { kind: 'augmented-seventh', text: '+7' };
  }
  
  // Suspended
  if (q === 'sus4' || q === 'sus') {
    return { kind: 'suspended-fourth', text: 'sus4' };
  }
  if (q === 'sus2') {
    return { kind: 'suspended-second', text: 'sus2' };
  }
  
  // Sixth chords
  if (q === '6') {
    return { kind: 'major-sixth', text: '6' };
  }
  if (q === '69' || q === '6/9') {
    return { kind: 'major-sixth', text: '6/9' };
  }
  
  // Add chords
  if (q === 'add9') {
    return { kind: 'major', text: 'add9' };
  }
  if (q === 'add11') {
    return { kind: 'major', text: 'add11' };
  }
  
  // Power chord
  if (q === '5') {
    return { kind: 'power', text: '5' };
  }
  
  // Default - return the quality as-is
  return { kind: 'major', text: quality };
}

// Parse root note for MusicXML
function parseRoot(root: string): { step: string; alter?: number } {
  const step = root.charAt(0).toUpperCase();
  const accidental = root.slice(1);
  
  let alter: number | undefined;
  if (accidental === '#' || accidental === '♯') {
    alter = 1;
  } else if (accidental === 'b' || accidental === '♭') {
    alter = -1;
  }
  
  return { step, alter };
}

// Get duration type name based on beat count
function getDurationTypeName(beats: number): string {
  switch (beats) {
    case 4: return 'whole';
    case 2: return 'half';
    case 1: return 'quarter';
    case 0.5: return 'eighth';
    default: return 'quarter';
  }
}

// Generate MusicXML for a single harmony element
function generateHarmony(chord: ParsedChord, offset: number): string {
  // Handle N.C. (no chord)
  if (chord.root === 'N.C.' || chord.root.toLowerCase() === 'nc') {
    return ''; // No harmony element for N.C.
  }
  
  const rootInfo = parseRoot(chord.root);
  const kindInfo = qualityToKind(chord.quality);
  
  let harmonyXml = `      <harmony>
        <root>
          <root-step>${rootInfo.step}</root-step>${rootInfo.alter !== undefined ? `
          <root-alter>${rootInfo.alter}</root-alter>` : ''}
        </root>
        <kind text="${kindInfo.text}">${kindInfo.kind}</kind>`;
  
  // Add bass note if present
  if (chord.bass) {
    const bassInfo = parseRoot(chord.bass);
    harmonyXml += `
        <bass>
          <bass-step>${bassInfo.step}</bass-step>${bassInfo.alter !== undefined ? `
          <bass-alter>${bassInfo.alter}</bass-alter>` : ''}
        </bass>`;
  }
  
  // Add offset for chord placement within measure
  if (offset > 0) {
    harmonyXml += `
        <offset>${offset}</offset>`;
  }
  
  harmonyXml += `
      </harmony>`;
  
  return harmonyXml;
}

// Generate MusicXML document
export function generateMusicXML(options: MusicXMLOptions): string {
  const { title, composer, key, chordText } = options;
  const parsed = parseChordText(chordText);
  
  const fifths = keyToFifths(key);
  const mode = key.endsWith('-') ? 'minor' : 'major';
  
  let measureNumber = 1;
  let currentTimeBeats = 4;
  let currentTimeBeatType = 4;
  let needsAttributes = true;
  
  // Collect all measures from all sections
  const allMeasures: { measure: ParsedMeasure; sectionName?: string; isFirstInSection?: boolean }[] = [];
  
  for (const section of parsed.sections) {
    let isFirst = true;
    for (const measure of section.measures) {
      allMeasures.push({
        measure,
        sectionName: isFirst ? section.name : undefined,
        isFirstInSection: isFirst,
      });
      isFirst = false;
    }
  }
  
  // Generate measures
  let measuresXml = '';
  let previousChord: ParsedChord | null = null;
  
  for (const { measure, sectionName, isFirstInSection } of allMeasures) {
    // Check for time signature change
    if (measure.timeSignature) {
      const [beats, beatType] = measure.timeSignature.split('/').map(Number);
      if (beats !== currentTimeBeats || beatType !== currentTimeBeatType) {
        currentTimeBeats = beats;
        currentTimeBeatType = beatType;
        needsAttributes = true;
      }
    }
    
    let measureXml = `    <measure number="${measureNumber}">`;
    
    // Add attributes (key, time, clef) on first measure or when time sig changes
    if (needsAttributes) {
      measureXml += `
      <attributes>
        <divisions>4</divisions>
        <key>
          <fifths>${fifths}</fifths>
          <mode>${mode}</mode>
        </key>
        <time>
          <beats>${currentTimeBeats}</beats>
          <beat-type>${currentTimeBeatType}</beat-type>
        </time>
        <clef>
          <sign>G</sign>
          <line>2</line>
        </clef>
      </attributes>`;
      needsAttributes = false;
    }
    
    // Add tempo marking on the very first measure
    if (measureNumber === 1 && options.tempo) {
      measureXml += `
      <direction placement="above">
        <direction-type>
          <metronome>
            <beat-unit>quarter</beat-unit>
            <per-minute>${options.tempo}</per-minute>
          </metronome>
        </direction-type>
        <sound tempo="${options.tempo}"/>
      </direction>`;
    }

    // Add section marker (rehearsal mark)
    if (sectionName && isFirstInSection) {
      measureXml += `
      <direction placement="above">
        <direction-type>
          <rehearsal default-x="-25" default-y="25" font-size="14" font-weight="bold">${escapeXml(sectionName)}</rehearsal>
        </direction-type>
      </direction>`;
    }
    
    // Add repeat barline at start
    if (measure.isRepeatStart) {
      measureXml += `
      <barline location="left">
        <bar-style>heavy-light</bar-style>
        <repeat direction="forward"/>
      </barline>`;
    }
    
    // Calculate chord placement - distribute evenly across the measure
    const chordCount = measure.chords.length;
    const totalBeats = currentTimeBeats;
    const divisionsPerBeat = 4; // We set divisions=4
    const totalDivisions = totalBeats * divisionsPerBeat;
    
    // Duration per chord slot
    const divisionsPerChord = Math.floor(totalDivisions / Math.max(chordCount, 1));
    
    // Generate harmonies for each chord
    for (let i = 0; i < chordCount; i++) {
      const chordStr = measure.chords[i];
      let parsedChord = measure.parsedChords[i];
      
      // Handle repeat slash and % (measure repeat) - use previous chord
      if ((chordStr === '/' || chordStr === '%') && previousChord) {
        parsedChord = previousChord;
      }
      
      if (parsedChord && parsedChord.root !== 'N.C.') {
        // Offset is the beat position within the measure (in divisions)
        const offset = i > 0 ? i * divisionsPerChord : 0;
        measureXml += generateHarmony(parsedChord, offset > 0 ? offset : 0);
        previousChord = parsedChord;
      }
    }
    
    // Add a hidden rest to establish measure duration
    // For lead sheets, we typically use invisible rests or a single whole rest
    const restDuration = totalDivisions;
    measureXml += `
      <note>
        <rest measure="yes"/>
        <duration>${restDuration}</duration>
      </note>`;
    
    // Add navigation directions
    if (measure.navigation) {
      const navText = measure.navigation;
      measureXml += `
      <direction placement="below">
        <direction-type>
          <words font-style="italic">${escapeXml(navText)}</words>
        </direction-type>
      </direction>`;
    }
    
    // Add repeat barline at end
    if (measure.isRepeatEnd) {
      measureXml += `
      <barline location="right">
        <bar-style>light-heavy</bar-style>
        <repeat direction="backward"${measure.repeatCount ? ` times="${measure.repeatCount}"` : ''}/>
      </barline>`;
    }
    
    // Add ending markers (1st/2nd endings)
    if (measure.ending) {
      measureXml += `
      <barline location="left">
        <ending number="${measure.ending}" type="start"/>
      </barline>`;
    }
    
    measureXml += `
    </measure>`;
    
    measuresXml += measureXml + '\n';
    measureNumber++;
  }
  
  // Final barline
  if (allMeasures.length > 0) {
    measuresXml += `    <measure number="${measureNumber}">
      <barline location="right">
        <bar-style>light-heavy</bar-style>
      </barline>
    </measure>`;
  }
  
  // Build the complete MusicXML document
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="4.0">
  <work>
    <work-title>${escapeXml(title)}</work-title>
  </work>
  <identification>
    <creator type="composer">${escapeXml(composer || 'Unknown')}</creator>
    <encoding>
      <software>ChartCraft</software>
      <encoding-date>${new Date().toISOString().split('T')[0]}</encoding-date>
    </encoding>
  </identification>
  <part-list>
    <score-part id="P1">
      <part-name>Lead Sheet</part-name>
    </score-part>
  </part-list>
  <part id="P1">
${measuresXml}  </part>
</score-partwise>`;
  
  return xml;
}

// Escape special XML characters
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
