import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SongEditor } from '@/components/SongEditor';
import { ProjectsPanel } from '@/components/ProjectsPanel';
import { BlueScrambleButton } from '@/components/BlueScrambleButton';
import { Menu, X, BookOpen } from 'lucide-react';

import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/hooks/use-theme';
import { useIsMobile } from '@/hooks/use-mobile';
import { SavedChart } from '@/lib/storage';
import { ParticleOrb } from '@/components/ParticleOrb';

const Index = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedChart, setSelectedChart] = useState<SavedChart | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();

  const handleSelectChart = useCallback((chart: SavedChart) => {
    setSelectedChart(chart);
    setIsEditing(true);
  }, []);

  const handleChartSaved = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const handleStartNew = useCallback(() => {
    setSelectedChart(null);
    setIsEditing(true);
    setMobileMenuOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 flex-shrink-0 bg-background">
        <div className="container flex items-center justify-between h-12 px-4">
          <button 
            onClick={() => setIsEditing(false)}
            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" />
            </svg>
            <h1 className="font-serif text-xl italic tracking-tight">text2chordchart</h1>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-[10px]">☀</span>
              <Switch 
                checked={theme === 'dark'} 
                onCheckedChange={toggleTheme}
                className="scale-75"
              />
              <span className="text-muted-foreground text-[10px]">☾</span>
            </div>
            <Link 
              to="/docs"
              className="text-muted-foreground hover:text-foreground transition-colors underline decoration-dotted underline-offset-4"
            >
              Docs
            </Link>
            <BlueScrambleButton 
              onClick={handleStartNew}
              className="text-xs"
            >
              ✦ create chart
            </BlueScrambleButton>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground hover:text-foreground/70 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile slide-in panel */}
      <AnimatePresence>
        {mobileMenuOpen && isMobile && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed top-0 right-0 z-50 h-full w-64 bg-background border-l border-border shadow-lg flex flex-col"
            >
              <div className="flex items-center justify-between h-12 px-4 border-b border-border">
                <span className="font-serif italic text-sm">Menu</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-foreground hover:text-foreground/70 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Theme</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-[10px]">☀</span>
                    <Switch 
                      checked={theme === 'dark'} 
                      onCheckedChange={toggleTheme}
                      className="scale-75"
                    />
                    <span className="text-muted-foreground text-[10px]">☾</span>
                  </div>
                </div>
                <Link 
                  to="/docs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors underline decoration-dotted underline-offset-4"
                >
                  Docs
                </Link>
                <BlueScrambleButton 
                  onClick={handleStartNew}
                  className="text-sm w-full justify-center"
                >
                  ✦ create chart
                </BlueScrambleButton>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="container px-4 py-4 flex-1 flex gap-4 overflow-hidden">
            {/* Main Content */}
            <main className="flex-1 min-w-0 flex flex-col overflow-hidden">
              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.div
                    key="editor"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="flex-1 flex flex-col overflow-hidden"
                  >
                    {/* Back button */}
                    <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                      <button 
                        onClick={() => {
                          setIsEditing(false);
                          setSelectedChart(null);
                        }}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                      >
                        ← back
                      </button>
                    </div>
                    <SongEditor 
                      onBack={() => setIsEditing(false)} 
                      initialChart={selectedChart}
                      onChartSaved={handleChartSaved}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="welcome"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden"
                  >
                    {/* Corner text pinned to edges of section */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-3 left-3 md:top-4 md:left-4 text-left">
                        <p className="text-[10px] md:text-xs font-mono text-muted-foreground/40 uppercase tracking-[0.15em]">Plaintext → iReal Pro</p>
                        <p className="text-[10px] md:text-xs font-mono text-muted-foreground/30">v1.0</p>
                      </div>
                      
                      <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4 text-left">
                        <p className="text-[10px] md:text-xs font-mono text-muted-foreground/40 uppercase tracking-[0.15em]">No accounts · No cloud</p>
                        <p className="text-[10px] md:text-xs font-mono text-muted-foreground/30">Local processing only</p>
                      </div>
                      
                      <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 text-right">
                        <p className="text-[10px] md:text-xs font-mono text-muted-foreground/30">iReal · MusicXML</p>
                      </div>
                    </div>

                    {/* Centered content */}
                    <div className="relative flex flex-col items-center justify-center px-6">
                      {/* Particle orb - off to the left */}
                      <div className="absolute -left-32 sm:-left-24 md:-left-36 lg:-left-44 top-1/2 -translate-y-1/2 opacity-60 pointer-events-auto hidden md:block z-0">
                        <ParticleOrb size={220} />
                      </div>

                      {/* Large geometric typography - lowercase */}
                      <div className="mb-8 flex flex-col items-center gap-0 relative z-10">
                        <h2 
                          className="font-mono text-5xl sm:text-7xl md:text-[7rem] lg:text-[9rem] font-extralight text-center leading-[0.95] tracking-tighter"
                        >
                          <span className="bg-gradient-to-b from-foreground to-foreground/30 bg-clip-text text-transparent">text</span><span className="dirty-glyph" style={{ fontFamily: 'Dirtyline, sans-serif', fontSize: '1.8em', verticalAlign: 'middle', lineHeight: 0, display: 'inline-block', transform: 'translateY(-5%)' }}>2</span>
                        </h2>
                        <h2 
                          className="font-mono text-3xl sm:text-5xl md:text-[4.5rem] lg:text-[5.5rem] font-extralight text-foreground text-center leading-[0.9] tracking-tight -mt-1 md:-mt-2 lg:-mt-3"
                        >
                          cho<span className="dirty-glyph" style={{ fontFamily: 'Dirtyline, sans-serif' }}>R</span>d<span className="font-serif italic font-light tracking-wider">ch</span><span className="dirty-glyph" style={{ fontFamily: 'Dirtyline, sans-serif' }}>A</span><span className="font-serif italic font-light tracking-wider">rt</span>
                        </h2>
                      </div>
                      
                      <p className="text-muted-foreground/50 text-xs md:text-sm max-w-sm mb-8 font-mono tracking-wide relative z-10">
                        type chords as plaintext · export anywhere
                      </p>
                    
                      {/* Buttons */}
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <BlueScrambleButton 
                          onClick={handleStartNew}
                          className="px-8 py-3 text-sm"
                          icon={
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" />
                            </svg>
                          }
                        >
                          Create chart
                        </BlueScrambleButton>
                      
                        <Link 
                          to="/docs"
                          className="inline-flex items-center gap-2 px-6 py-3 text-sm border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all font-mono"
                        >
                          <BookOpen className="w-4 h-4" />
                          Instructions
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </div>
        </div>
        
        {/* Projects Panel - Right Side */}
        <ProjectsPanel 
          onSelectChart={handleSelectChart}
          activeChartId={selectedChart?.id ?? null}
          refreshTrigger={refreshTrigger}
        />
      </div>
    </div>
  );
};

export default Index;
