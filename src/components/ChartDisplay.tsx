import { parseChordText, ParsedMeasure, ParsedChord } from '@/lib/ireal-parser';
import { cn } from '@/lib/utils';

interface ChartDisplayProps {
  chordText: string;
  className?: string;
}

function ChordDisplay({ chord, parsed }: { chord: string; parsed: ParsedChord }) {
  if (chord === '/') {
    return <span className="text-muted-foreground">/</span>;
  }
  
  // Handle % (repeat measure)
  if (chord === '%') {
    return <span className="text-muted-foreground text-2xl">%</span>;
  }
  
  // Handle N.C. (no chord)
  if (parsed.root === 'N.C.') {
    return <span className="chart-chord text-muted-foreground italic">N.C.</span>;
  }
  
  return (
    <span className="chart-chord">
      <span>{parsed.root}</span>
      {parsed.quality && (
        <sup className="text-[0.75em] ml-0.5 align-super font-semibold">
          {parsed.quality}
        </sup>
      )}
      {parsed.bass && (
        <span className="text-muted-foreground">
          /<span>{parsed.bass}</span>
        </span>
      )}
    </span>
  );
}

function TimeSignature({ signature }: { signature: string }) {
  const [top, bottom] = signature.split('/');
  return (
    <div className="absolute left-1 top-1/2 -translate-y-1/2 flex flex-col items-center leading-none font-bold text-foreground text-sm">
      <span>{top}</span>
      <span>{bottom}</span>
    </div>
  );
}

function MeasureCell({ measure, isFirst, isLast }: { 
  measure: ParsedMeasure; 
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div
      className={cn(
        "chart-measure relative flex-1 min-w-0 flex flex-col",
        measure.isRepeatStart && "chart-repeat-start",
        measure.isRepeatEnd && "chart-repeat-end",
        isFirst && measure.isDoubleBar && "border-l-2 border-l-foreground",
        isLast && "border-r-2 border-r-foreground",
        measure.timeSignature && "pl-6"
      )}
    >
      {/* Ending marker (volta bracket) */}
      {measure.ending && (
        <div className="absolute left-1 top-0 text-[10px] font-bold border-l border-t border-foreground px-1">
          {measure.ending}.
        </div>
      )}
      
      {/* Time signature */}
      {measure.timeSignature && (
        <TimeSignature signature={measure.timeSignature} />
      )}
      
      {/* Main chord content - centered vertically */}
      <div className="flex-1 flex items-center justify-center gap-3 flex-wrap font-mono font-semibold text-lg tracking-wide">
        {measure.chords.map((chord, i) => (
          <ChordDisplay 
            key={i} 
            chord={chord} 
            parsed={measure.parsedChords[i]} 
          />
        ))}
      </div>
      
      {/* Navigation marker (D.C., D.S., Fine) - shown below chords */}
      {measure.navigation && (
        <div className="text-[10px] font-bold italic text-muted-foreground text-center pb-1">
          {measure.navigation}
        </div>
      )}
      
      {/* Repeat dots */}
      {measure.isRepeatStart && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
          <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
        </div>
      )}
      {measure.isRepeatEnd && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <div className="flex flex-col gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
            <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
          </div>
          {measure.repeatCount && (
            <span className="text-xs font-mono font-bold ml-1">x{measure.repeatCount}</span>
          )}
        </div>
      )}
    </div>
  );
}

export function ChartDisplay({ chordText, className }: ChartDisplayProps) {
  const parsed = parseChordText(chordText);
  
  const totalMeasures = parsed.sections.reduce((sum, s) => sum + s.measures.length, 0);
  
  if (totalMeasures === 0) {
    return (
      <div className={cn("border border-dashed border-border p-8 text-center", className)}>
        <p className="text-muted-foreground text-xs">
          Enter chord notation to preview
        </p>
        <p className="text-muted-foreground/60 text-xs mt-2 font-mono">
          || C- | / | F7 | / ||
        </p>
      </div>
    );
  }
  
  return (
    <div className={cn("space-y-4 animate-fade-in", className)}>
      {parsed.sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="space-y-0">
          {/* Section header - only show if section has a name or special markers */}
          {(section.name || section.hasSegno || section.hasCoda) && (
            <div className="flex items-center gap-2 mb-2 px-1">
              {section.hasSegno && (
                <span className="text-sm font-bold" title="Segno">𝄋</span>
              )}
              {section.hasCoda && (
                <span className="text-sm font-bold" title="Coda">𝄌</span>
              )}
              {section.name && (
                <span className="text-xs font-semibold border border-foreground px-2 py-0.5">
                  {section.name}
                </span>
              )}
              {section.isReference && section.referenceTo && (
                <span className="text-xs text-muted-foreground">
                  → {section.referenceTo}
                </span>
              )}
            </div>
          )}
          
          {/* Measures */}
          {section.rows.map((row, rowIndex) => (
            <div key={rowIndex} className="chart-row">
              {row.map((measure, measureIndex) => (
                <MeasureCell
                  key={measureIndex}
                  measure={measure}
                  isFirst={measureIndex === 0}
                  isLast={measureIndex === row.length - 1 && rowIndex === section.rows.length - 1}
                />
              ))}
              {/* Fill empty cells if row is incomplete */}
              {row.length < 4 && Array(4 - row.length).fill(null).map((_, i) => (
                <div key={`empty-${i}`} className="chart-measure flex-1 min-w-0 opacity-30" />
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}