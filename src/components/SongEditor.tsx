import { useState, useEffect, useRef, useCallback } from 'react';
import jsPDF from 'jspdf';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'react-router-dom';
import { Song, generateIRealHTML, generateIRealURL } from '@/lib/ireal-parser';
import { generateMusicXML } from '@/lib/musicxml-generator';
import { ChartDisplay } from './ChartDisplay';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { BlueScrambleButton } from './BlueScrambleButton';
import { PanelBottom, PanelLeft, ExternalLink, Save, Link2, FileMusic, ChevronDown, Download } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { saveChart, updateChart, SavedChart, ChartStatus } from '@/lib/storage';

interface SongEditorProps {
  onBack?: () => void;
  initialChart?: SavedChart | null;
  onChartSaved?: () => void;
}

const STYLES = [
  'Bossa Nova', 'Swing', 'Ballad', 'Latin', 'Funk', 'Blues', 
  'Rock', 'Pop', 'Jazz Waltz', 'Medium Swing', 'Up Tempo', 'Afro Cuban'
];

const KEYS = [
  'Unknown',
  'C', 'C-', 'C#', 'C#-', 'Db', 'Db-',
  'D', 'D-', 'D#', 'D#-', 'Eb', 'Eb-',
  'E', 'E-',
  'F', 'F-', 'F#', 'F#-', 'Gb', 'Gb-',
  'G', 'G-', 'G#', 'G#-', 'Ab', 'Ab-',
  'A', 'A-', 'A#', 'A#-', 'Bb', 'Bb-',
  'B', 'B-'
];

const STORAGE_KEY = 'chartcraft-draft';
const LAYOUT_KEY = 'chartcraft-layout';

type LayoutMode = 'bottom' | 'side';

interface DraftData {
  title: string;
  composer: string;
  style: string;
  key: string;
  chordText: string;
  tempo?: number;
}

function loadDraft(): DraftData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load draft:', e);
  }
  return { title: '', composer: '', style: 'Swing', key: 'C', chordText: '', tempo: undefined };
}

function saveDraft(data: DraftData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save draft:', e);
  }
}

function loadLayout(): LayoutMode {
  try {
    const saved = localStorage.getItem(LAYOUT_KEY);
    if (saved === 'side' || saved === 'bottom') return saved;
  } catch (e) {
    console.warn('Failed to load layout:', e);
  }
  return 'bottom';
}

function saveLayout(layout: LayoutMode) {
  try {
    localStorage.setItem(LAYOUT_KEY, layout);
  } catch (e) {
    console.warn('Failed to save layout:', e);
  }
}

const FONT_SIZE_KEY = 'chartcraft-fontsize';

function loadFontSize(): number {
  try {
    const saved = localStorage.getItem(FONT_SIZE_KEY);
    if (saved) return parseInt(saved, 10);
  } catch (e) {
    console.warn('Failed to load font size:', e);
  }
  return 12;
}

export function SongEditor({ onBack, initialChart, onChartSaved }: SongEditorProps) {
  const isMobile = useIsMobile();
  const draft = loadDraft();
  const [title, setTitle] = useState(initialChart?.title ?? draft.title);
  const [composer, setComposer] = useState(initialChart?.composer ?? draft.composer);
  const [style, setStyle] = useState(initialChart?.style ?? draft.style);
  const [key, setKey] = useState(initialChart?.key ?? draft.key);
  const [chordText, setChordText] = useState(initialChart?.chordText ?? draft.chordText);
  const [tempo, setTempo] = useState<number | undefined>(initialChart?.tempo ?? draft.tempo);
  const [activeChartId, setActiveChartId] = useState<string | null>(initialChart?.id ?? null);
  const [editorSize, setEditorSize] = useState(280);
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>(loadLayout);
  const [fontSize, setFontSize] = useState(loadFontSize);
  const [isSaving, setIsSaving] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [sourceUrl, setSourceUrl] = useState(initialChart?.sourceUrl ?? '');
  const [status, setStatus] = useState<ChartStatus>(initialChart?.status ?? 'incomplete');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const canExport = Boolean(title.trim() && chordText.trim());

  // Update state when initialChart changes (loading a saved chart)
  useEffect(() => {
    if (initialChart) {
      setTitle(initialChart.title);
      setComposer(initialChart.composer);
      setStyle(initialChart.style);
      setKey(initialChart.key);
      setChordText(initialChart.chordText);
      setSourceUrl(initialChart.sourceUrl ?? '');
      setTempo(initialChart.tempo);
      setActiveChartId(initialChart.id);
    }
  }, [initialChart]);

  // Save draft whenever fields change
  useEffect(() => {
    saveDraft({ title, composer, style, key, chordText, tempo });
  }, [title, composer, style, key, chordText, tempo]);

  // Save layout when it changes
  useEffect(() => {
    saveLayout(layoutMode);
  }, [layoutMode]);

  // Save font size when it changes
  useEffect(() => {
    localStorage.setItem(FONT_SIZE_KEY, fontSize.toString());
  }, [fontSize]);

  const adjustFontSize = (delta: number) => {
    setFontSize(prev => Math.max(10, Math.min(20, prev + delta)));
  };

  const handleFindReplace = () => {
    if (!findText) {
      toast.error('Enter text to find');
      return;
    }
    // Escape special regex chars and match only when NOT followed by chord-continuing characters
    const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped + '(?![a-zA-Z0-9#b♯♭øΔ+])', 'g');
    const matches = chordText.match(regex);
    const count = matches ? matches.length : 0;
    if (count === 0) {
      toast.error(`"${findText}" not found as a complete chord`);
      return;
    }
    const newText = chordText.replace(regex, replaceText);
    setChordText(newText);
    toast.success(`Replaced ${count} occurrence${count > 1 ? 's' : ''}`);
    setFindText('');
    setReplaceText('');
  };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      
      if (layoutMode === 'bottom') {
        // Vertical resize for bottom panel
        const newHeight = containerRect.bottom - e.clientY;
        const maxHeight = containerRect.height * 0.85;
        const clampedHeight = Math.max(120, Math.min(maxHeight, newHeight));
        setEditorSize(clampedHeight);
      } else {
        // Horizontal resize for side panel
        const newWidth = e.clientX - containerRect.left;
        const maxWidth = containerRect.width * 0.6;
        const clampedWidth = Math.max(280, Math.min(maxWidth, newWidth));
        setEditorSize(clampedWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = layoutMode === 'bottom' ? 'row-resize' : 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, layoutMode]);

  const handleDownloadHTML = () => {
    if (!title.trim() || !chordText.trim()) {
      toast.error('Please fill in the title and chords first');
      return;
    }
    
    const songData: Song = {
      id: 'temp',
      title: title.trim(),
      composer: composer.trim() || 'Unknown',
      style,
      key,
      tempo,
      chordText: chordText.trim(),
      createdAt: new Date(),
    };
    
    const html = generateIRealHTML(songData);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Chart downloaded!');
  };

  const handleDownloadIReal = () => {
    if (!title.trim() || !chordText.trim()) {
      toast.error('Please fill in the title and chords first');
      return;
    }
    
    const songData: Song = {
      id: 'temp',
      title: title.trim(),
      composer: composer.trim() || 'Unknown',
      style,
      key,
      tempo,
      chordText: chordText.trim(),
      createdAt: new Date(),
    };
    
    const irealUrl = generateIRealURL(songData);
    const blob = new Blob([irealUrl], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.ireal`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('iReal file saved!');
  };

  const handleDownloadMusicXML = () => {
    if (!title.trim() || !chordText.trim()) {
      toast.error('Please fill in the title and chords first');
      return;
    }
    
    const xml = generateMusicXML({
      title: title.trim(),
      composer: composer.trim() || 'Unknown',
      key,
      tempo,
      chordText: chordText.trim(),
    });
    
    const blob = new Blob([xml], { type: 'application/vnd.recordare.musicxml+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.musicxml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('MusicXML file saved!');
  };

  const handleDownloadPDF = () => {
    if (!title.trim() || !chordText.trim()) {
      toast.error('Please fill in the title and chords first');
      return;
    }

    const cleanedText = chordText
      .split('\n')
      .map(l => l.replace(/\/\/.*$/, ''))
      .join('\n');

    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 50;
    const maxWidth = pageWidth - margin * 2;
    let y = margin;

    // Title
    doc.setFont('courier', 'bold');
    doc.setFontSize(24);
    doc.text(title.trim(), margin, y);
    y += 28;

    // Meta
    doc.setFont('courier', 'normal');
    doc.setFontSize(12);
    const meta = `${composer.trim() || 'Unknown'} - ${style} - ${key}${tempo ? ` - ${tempo} bpm` : ''}`;
    doc.setTextColor(100);
    doc.text(meta, margin, y);
    doc.setTextColor(0);
    y += 30;

    // Content
    doc.setFontSize(18);
    const lines = cleanedText.split('\n');
    const lineHeight = 18 * 1.7;

    for (const line of lines) {
      if (y + lineHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      if (line.trim()) {
        const wrapped = doc.splitTextToSize(line, maxWidth);
        for (const wl of wrapped) {
          if (y + lineHeight > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }
          doc.text(wl, margin, y);
          y += lineHeight;
        }
      } else {
        y += lineHeight;
      }
    }

    doc.save(`${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
    toast.success('PDF downloaded!');
  };

  const handleCopyURL = () => {
    if (!title.trim() || !chordText.trim()) {
      toast.error('Please fill in the title and chords first');
      return;
    }
    
    const songData: Song = {
      id: 'temp',
      title: title.trim(),
      composer: composer.trim() || 'Unknown',
      style,
      key,
      tempo,
      chordText: chordText.trim(),
      createdAt: new Date(),
    };
    
    const url = generateIRealURL(songData);
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('iReal URL copied to clipboard!');
    
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleLayout = () => {
    setLayoutMode(prev => prev === 'bottom' ? 'side' : 'bottom');
    // Reset size when switching layouts
    setEditorSize(layoutMode === 'bottom' ? 360 : 280);
  };

  const handleStartNew = () => {
    setTitle('');
    setComposer('');
    setStyle('Swing');
    setKey('C');
    setChordText('');
    setTempo(undefined);
    setActiveChartId(null);
    toast.success('Started new chart');
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please add a title before saving');
      return;
    }
    
    setIsSaving(true);
    try {
      const chartData = {
        title: title.trim(),
        composer: composer.trim() || 'Unknown',
        style,
        key,
        chordText: chordText.trim(),
        sourceUrl: sourceUrl.trim() || undefined,
        tempo,
        status,
      };
      
      if (activeChartId) {
        await updateChart(activeChartId, chartData);
        toast.success('Chart updated');
      } else {
        const newId = await saveChart(chartData);
        setActiveChartId(newId);
        toast.success('Chart saved');
      }
      onChartSaved?.();
    } catch (error) {
      console.error('Failed to save chart:', error);
      toast.error('Failed to save chart');
    } finally {
      setIsSaving(false);
    }
  };

  // Editor input panel content (shared between layouts)
  const EditorPanel = (
    <div className="flex-1 flex flex-col gap-3 overflow-hidden">
      {/* Metadata */}
      <div className={cn(
        "gap-2 flex-shrink-0",
        layoutMode === 'bottom' 
          ? "grid grid-cols-2 md:grid-cols-5" 
          : "grid grid-cols-1"
      )}>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="title"
          className="bg-transparent border-border h-8 text-xs"
        />
        <Input
          value={composer}
          onChange={(e) => setComposer(e.target.value)}
          placeholder="composer"
          className="bg-transparent border-border h-8 text-xs"
        />
        <div className="flex gap-2">
          <Select value={style} onValueChange={setStyle}>
            <SelectTrigger className="bg-transparent border-border h-8 text-xs flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STYLES.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => setStatus(v as ChartStatus)}>
            <SelectTrigger className="bg-transparent border-border h-8 text-xs w-10 justify-center [&>svg]:hidden">
              <span className={cn(
                "w-2.5 h-2.5 rounded-full",
                status === 'complete' ? "bg-green-500" : "bg-yellow-500"
              )} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="incomplete">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-yellow-500" />
                  Incomplete
                </div>
              </SelectItem>
              <SelectItem value="complete">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Complete
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Select value={key} onValueChange={setKey}>
            <SelectTrigger className="bg-transparent border-border h-8 text-xs flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KEYS.map(k => (
                <SelectItem key={k} value={k}>{k}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            value={tempo ?? ''}
            onChange={(e) => setTempo(e.target.value ? parseInt(e.target.value, 10) : undefined)}
            placeholder="bpm"
            className="bg-transparent border-border h-8 text-xs w-16"
            min={20}
            max={400}
          />
        </div>
      </div>

      {/* Chord Input */}
      <div className="flex-1 min-h-0 flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
          <button
            onClick={() => setShowFindReplace(!showFindReplace)}
            className={cn(
              "px-2 h-5 border border-border hover:border-foreground hover:text-foreground transition-colors font-mono",
              showFindReplace && "border-foreground text-foreground"
            )}
          >
            find/replace
          </button>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => adjustFontSize(-1)}
              className="w-5 h-5 border border-border hover:border-foreground hover:text-foreground transition-colors flex items-center justify-center"
            >
              −
            </button>
            <span className="w-6 text-center tabular-nums">{fontSize}</span>
            <button 
              onClick={() => adjustFontSize(1)}
              className="w-5 h-5 border border-border hover:border-foreground hover:text-foreground transition-colors flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>
        
        {showFindReplace && (
          <div className="flex items-center gap-2 text-xs">
            <Input
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              placeholder="find"
              className="bg-transparent border-border h-7 text-xs flex-1"
            />
            <span className="text-muted-foreground">→</span>
            <Input
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="replace"
              className="bg-transparent border-border h-7 text-xs flex-1"
            />
            <button
              onClick={handleFindReplace}
              className="px-2 h-7 border border-border hover:border-foreground hover:text-foreground transition-colors font-mono text-[10px]"
            >
              go
            </button>
          </div>
        )}
        <Textarea
          value={chordText}
          onChange={(e) => setChordText(e.target.value)}
          placeholder={"A\n|| Cmaj7 | / | F7 | / ||\n\nB\n||: Dø | G7 | Cmin7 | / :||x2"}
          className="font-mono bg-transparent border-border resize-none h-full"
          style={{ fontSize: `${fontSize}px`, lineHeight: '160%' }}
        />
      </div>
    </div>
  );

  const Header = (
    <div className="flex flex-col gap-3 mb-6">
      {/* Title and metadata row */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" />
          </svg>
        </div>
        <div className="flex-1">
          <h2 className="font-serif text-2xl italic">
            {title || 'Untitled'}
          </h2>
          <p className="text-xs text-muted-foreground">
            {composer || 'Unknown'} · {style} · {key}{tempo ? ` · ${tempo} bpm` : ''}
          </p>
        </div>
      </div>
      
      {/* Actions row */}
      <div className="flex items-center gap-1 text-xs">
        <BlueScrambleButton 
          onClick={handleSave}
          variant="outline"
          className="text-xs"
          disabled={isSaving || !title.trim()}
          icon={<Save className="w-3 h-3" />}
        >
          {activeChartId ? 'update' : 'save'}
        </BlueScrambleButton>
        <BlueScrambleButton 
          onClick={handleStartNew}
          variant="outline"
          className="text-xs"
        >
          new
        </BlueScrambleButton>
        {!isMobile && (
          <BlueScrambleButton 
            onClick={toggleLayout}
            variant="outline"
            className="text-xs px-2"
            title={layoutMode === 'bottom' ? 'Switch to side panel' : 'Switch to bottom panel'}
            icon={layoutMode === 'bottom' ? (
              <PanelLeft className="w-3.5 h-3.5" />
            ) : (
              <PanelBottom className="w-3.5 h-3.5" />
            )}
          />
        )}
        <Popover open={showUrlInput} onOpenChange={setShowUrlInput}>
          <PopoverTrigger asChild>
            <button 
              onClick={() => {
                if (sourceUrl.trim()) {
                  navigator.clipboard.writeText(sourceUrl.trim());
                  toast.success('Source URL copied!');
                } else {
                  setShowUrlInput(true);
                }
              }}
              className={cn(
                "border transition-colors px-2 h-7 text-xs font-mono flex items-center gap-1",
                sourceUrl.trim() 
                  ? "border-[hsl(270_100%_60%)] text-[hsl(270_100%_60%)] hover:bg-[hsl(270_100%_60%)]/10" 
                  : "border-border text-foreground hover:border-[hsl(270_100%_60%)] hover:text-[hsl(270_100%_60%)]"
              )}
              title={sourceUrl.trim() ? 'Click to copy source URL' : 'Add source URL'}
            >
              <Link2 className="w-3 h-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="end">
            <div className="space-y-2">
              <label className="text-xs font-semibold">Source URL</label>
              <Input
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://..."
                className="bg-transparent border-border h-8 text-xs"
              />
              <p className="text-[10px] text-muted-foreground">
                Link to the original chart source (saved with project)
              </p>
            </div>
          </PopoverContent>
        </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <button className="border border-border text-foreground hover:border-[hsl(270_100%_60%)] hover:text-[hsl(270_100%_60%)] transition-colors px-2 h-7 text-xs font-mono">
                ?
              </button>
            </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="end">
            <div className="space-y-2 text-xs">
              <h4 className="font-semibold mb-2">Quick Reference</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono">
                <span><code className="text-foreground">|</code> bar</span>
                <span><code className="text-foreground">||</code> double bar</span>
                <span><code className="text-foreground">/</code> repeat chord</span>
                <span><code className="text-foreground">||:</code> repeat start</span>
                <span><code className="text-foreground">:||</code> repeat end</span>
                <span><code className="text-foreground">:||x4</code> repeat 4x</span>
                <span><code className="text-foreground">(3/4)</code> time sig</span>
                <span><code className="text-foreground">A seg</code> segno</span>
              </div>
              <div className="border-t border-border pt-2 mt-2">
                <p className="text-muted-foreground mb-1">Navigation:</p>
                <p className="font-mono">(d.c) Gmaj · (d.s. al coda) F7</p>
              </div>
              <div className="border-t border-border pt-2 mt-2">
                <p className="text-muted-foreground mb-1">Sections:</p>
                <p className="font-mono">A, B, C... or Verse, Chorus</p>
              </div>
              <div className="border-t border-border pt-2 mt-2">
                <Link 
                  to="/docs" 
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors underline decoration-dotted underline-offset-4"
                >
                  View Full Guide <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              disabled={!canExport}
              className={cn(
                "px-2 py-1.5 font-medium flex items-center gap-1 justify-center transition-all duration-300 text-xs",
                canExport 
                  ? "bg-foreground text-background hover:bg-[hsl(270_100%_60%)] hover:text-white" 
                  : "bg-foreground/50 text-background/50 cursor-not-allowed"
              )}
            >
              <Download className="w-3 h-3" />
              export
              <ChevronDown className="w-3 h-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={handleDownloadPDF} className="text-xs font-mono gap-2">
              <Download className="w-3.5 h-3.5" />
              .pdf
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownloadMusicXML} className="text-xs font-mono gap-2">
              <FileMusic className="w-3.5 h-3.5" />
              .xml (MusicXML)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownloadHTML} className="text-xs font-mono gap-2">
              <Download className="w-3.5 h-3.5" />
              .html (Mobile)
            </DropdownMenuItem>
            {!isMobile && (
              <>
                <DropdownMenuItem onClick={handleDownloadIReal} className="text-xs font-mono gap-2">
                  <Download className="w-3.5 h-3.5" />
                  .ireal
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyURL} className="text-xs font-mono gap-2">
                  <Link2 className="w-3.5 h-3.5" />
                  {copied ? 'copied!' : 'copy .ireal url'}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  if (layoutMode === 'side') {
    return (
      <div className="flex h-full" ref={containerRef}>
        {/* Side Editor Panel */}
        <div 
          className="border-r border-border bg-background flex flex-col h-full"
          style={{ width: editorSize }}
        >
          <div className="p-4 flex-1 flex flex-col overflow-hidden">
            {EditorPanel}
          </div>
        </div>

        {/* Drag handle (vertical) */}
        <div
          onMouseDown={handleMouseDown}
          className={cn(
            "w-2 flex items-center justify-center cursor-col-resize group transition-colors hover:bg-secondary/50",
            isDragging && "bg-secondary"
          )}
        >
          <div className={cn(
            "text-muted-foreground/50 group-hover:text-muted-foreground transition-colors text-xs writing-mode-vertical",
            isDragging && "text-foreground"
          )}
          style={{ writingMode: 'vertical-rl' }}
          >
            ═
          </div>
        </div>

        {/* Main Preview Area */}
        <div className="flex-1 overflow-auto px-6 py-3">
          {Header}
          <div className="border border-border overflow-hidden min-h-[200px]">
            <ChartDisplay chordText={chordText} />
          </div>
        </div>
      </div>
    );
  }

  // Mobile layout - editor only, no preview, fully expanded
  if (isMobile) {
    return (
      <div className="flex flex-col h-full min-h-0" ref={containerRef}>
        {Header}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden px-0">
          {EditorPanel}
        </div>
      </div>
    );
  }

  // Bottom layout (default)
  return (
    <div className="flex flex-col h-full" ref={containerRef}>
      {/* Main Preview Area */}
      <div className="flex-1 overflow-auto pb-4">
        {Header}
        <div className="border border-border overflow-hidden min-h-[200px]">
          <ChartDisplay chordText={chordText} />
        </div>
      </div>

      {/* Fixed Bottom Input Panel */}
      <div 
        className="border-t border-border bg-background -mx-6 -mb-6 px-6 pb-4 flex flex-col"
        style={{ height: editorSize }}
      >
        {/* Drag handle (horizontal) */}
        <div
          onMouseDown={handleMouseDown}
          className={cn(
            "flex items-center justify-center py-2 cursor-row-resize group transition-colors",
            isDragging && "bg-secondary"
          )}
        >
          <div className={cn(
            "text-muted-foreground/50 group-hover:text-muted-foreground transition-colors text-xs",
            isDragging && "text-foreground"
          )}>
            ═══
          </div>
        </div>

        {EditorPanel}
      </div>
    </div>
  );
}
