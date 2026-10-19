import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, X, ChevronRight, ArrowUpDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { getAllCharts, deleteChart, updateChart, SavedChart, ChartStatus } from '@/lib/storage';

const PANEL_STATE_KEY = 'chartcraft-panel-open';
const SORT_KEY = 'chartcraft-sort';

type SortMode = 'recent' | 'title' | 'artist' | 'status';

interface ProjectsPanelProps {
  onSelectChart: (chart: SavedChart) => void;
  activeChartId: string | null;
  refreshTrigger?: number;
}

function loadPanelState(): boolean {
  try {
    return localStorage.getItem(PANEL_STATE_KEY) === 'true';
  } catch {
    return false;
  }
}

function savePanelState(open: boolean) {
  try {
    localStorage.setItem(PANEL_STATE_KEY, String(open));
  } catch {
    // Ignore
  }
}

function loadSortMode(): SortMode {
  try {
    const val = localStorage.getItem(SORT_KEY);
    if (val === 'title' || val === 'artist') return val;
  } catch { /* */ }
  return 'recent';
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - timestamp;
  
  if (diff < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const SORT_LABELS: Record<SortMode, string> = {
  recent: 'Recent',
  title: 'Title',
  artist: 'Artist',
  status: 'Status',
};

const SORT_CYCLE: SortMode[] = ['recent', 'title', 'artist', 'status'];

export function ProjectsPanel({ onSelectChart, activeChartId, refreshTrigger }: ProjectsPanelProps) {
  const [isOpen, setIsOpen] = useState(loadPanelState);
  const [charts, setCharts] = useState<SavedChart[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>(loadSortMode);

  const loadCharts = async () => {
    try {
      const allCharts = await getAllCharts();
      setCharts(allCharts);
    } catch (error) {
      console.error('Failed to load charts:', error);
    }
  };

  useEffect(() => {
    loadCharts();
  }, [refreshTrigger]);

  useEffect(() => {
    savePanelState(isOpen);
  }, [isOpen]);

  useEffect(() => {
    try { localStorage.setItem(SORT_KEY, sortMode); } catch { /* */ }
  }, [sortMode]);

  const sortedCharts = useMemo(() => {
    const sorted = [...charts];
    if (sortMode === 'title') {
      sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortMode === 'artist') {
      sorted.sort((a, b) => (a.composer || '').localeCompare(b.composer || ''));
    } else if (sortMode === 'status') {
      sorted.sort((a, b) => {
        const sa = a.status || 'incomplete';
        const sb = b.status || 'incomplete';
        if (sa === sb) return 0;
        return sa === 'incomplete' ? -1 : 1;
      });
    }
    return sorted;
  }, [charts, sortMode]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteChart(id);
      await loadCharts();
    } catch (error) {
      console.error('Failed to delete chart:', error);
    }
  };

  const handleToggleStatus = async (e: React.MouseEvent, chart: SavedChart) => {
    e.stopPropagation();
    const newStatus: ChartStatus = (chart.status || 'incomplete') === 'incomplete' ? 'complete' : 'incomplete';
    try {
      await updateChart(chart.id, { status: newStatus });
      await loadCharts();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const cycleSortMode = () => {
    const idx = SORT_CYCLE.indexOf(sortMode);
    setSortMode(SORT_CYCLE[(idx + 1) % SORT_CYCLE.length]);
  };

  return (
    <div className="relative">
      {/* Floating folder button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            onClick={() => setIsOpen(true)}
            className="absolute right-4 top-4 z-40 p-2 bg-background border border-border rounded-lg shadow-lg hover:bg-secondary transition-colors"
            title="Open Projects"
          >
            <Folder className="w-4 h-4 text-muted-foreground" />
            {charts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[9px] rounded-full flex items-center justify-center">
                {charts.length}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Sliding panel */}
      <motion.div
        className="fixed right-0 top-12 bottom-0 w-[200px] z-30 border-l border-border bg-background flex flex-col shadow-xl"
        initial={false}
        animate={{ x: isOpen ? 0 : 220 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-border flex-shrink-0">
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-secondary rounded transition-colors"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
          <div className="flex items-center gap-1.5">
            <button
              onClick={cycleSortMode}
              className="flex items-center gap-1 px-1.5 py-0.5 text-[9px] text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
              title={`Sort by: ${SORT_LABELS[sortMode]}`}
            >
              <ArrowUpDown className="w-2.5 h-2.5" />
              {SORT_LABELS[sortMode]}
            </button>
            <Folder className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        {/* Chart list */}
        <ScrollArea className="flex-1">
          {sortedCharts.length === 0 ? (
            <div className="p-4 text-xs text-muted-foreground/60 text-center">
              No saved charts yet
            </div>
          ) : (
            <div className="p-1">
              {sortedCharts.map((chart) => {
                const status = chart.status || 'incomplete';
                return (
                  <div
                    key={chart.id}
                    onClick={() => {
                      onSelectChart(chart);
                      setIsOpen(false);
                    }}
                    onMouseEnter={() => setHoveredId(chart.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={cn(
                      "px-2 py-1.5 cursor-pointer transition-colors group relative",
                      activeChartId === chart.id
                        ? "bg-secondary"
                        : "hover:bg-secondary/50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => handleToggleStatus(e, chart)}
                            className="flex-shrink-0"
                            title={status === 'complete' ? 'Mark incomplete' : 'Mark complete'}
                          >
                            <span
                              className={cn(
                                "block w-2 h-2 rounded-full transition-colors",
                                status === 'complete'
                                  ? "bg-green-500"
                                  : "bg-yellow-500"
                              )}
                            />
                          </button>
                          <p className="text-xs font-medium truncate">
                            {chart.title || 'Untitled'}
                          </p>
                          <span className="text-[9px] text-muted-foreground/60 font-mono flex-shrink-0">
                            v{chart.version || 1}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate pl-3.5">
                          {chart.composer || 'Unknown'}
                        </p>
                      </div>
                      <AnimatePresence>
                        {hoveredId === chart.id && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.1 }}
                            onClick={(e) => handleDelete(e, chart.id)}
                            className="p-0.5 hover:bg-destructive/20 hover:text-destructive rounded transition-colors flex-shrink-0"
                          >
                            <X className="w-3 h-3" />
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                    <p className="text-[9px] text-muted-foreground/50 mt-0.5 pl-3.5">
                      {formatDate(chart.updatedAt)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </motion.div>
    </div>
  );
}
