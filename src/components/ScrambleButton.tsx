import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Check, Link } from 'lucide-react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%&*✦';
const DEFAULT_TEXT = '.ireal url';
const HOVER_TEXT = 'fill in title & chords';
const SCRAMBLE_DURATION = 600;

interface ScrambleButtonProps {
  canExport: boolean;
  copied: boolean;
  onCopy: () => void;
}

export function ScrambleButton({ canExport, copied, onCopy }: ScrambleButtonProps) {
  const [displayText, setDisplayText] = useState(DEFAULT_TEXT);
  const [isHovering, setIsHovering] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  const scrambleToText = useCallback((targetText: string) => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    
    startTimeRef.current = performance.now();
    const textLength = targetText.length;
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / SCRAMBLE_DURATION, 1);
      
      // Smooth ease-out curve
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      
      // How many characters should be revealed
      const revealedCount = Math.floor(easedProgress * textLength);
      
      let result = '';
      for (let i = 0; i < textLength; i++) {
        if (i < revealedCount) {
          result += targetText[i];
        } else if (targetText[i] === ' ') {
          result += ' ';
        } else {
          result += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      
      setDisplayText(result);
      
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayText(targetText);
      }
    };
    
    frameRef.current = requestAnimationFrame(animate);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    if (!canExport) {
      setShowWarning(true);
      scrambleToText(HOVER_TEXT);
    } else {
      scrambleToText(DEFAULT_TEXT);
    }
  }, [canExport, scrambleToText]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    if (!canExport) {
      setShowWarning(false);
      scrambleToText(DEFAULT_TEXT);
    }
  }, [canExport, scrambleToText]);

  const handleClick = useCallback(() => {
    if (canExport) {
      onCopy();
    } else {
      setShowWarning(true);
      scrambleToText(HOVER_TEXT);
    }
  }, [canExport, onCopy, scrambleToText]);

  // Reset text when canExport changes
  useEffect(() => {
    if (canExport && !copied) {
      setDisplayText(DEFAULT_TEXT);
      setShowWarning(false);
    }
  }, [canExport, copied]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  if (copied) {
    return (
      <button
        className="px-3 py-1.5 font-medium flex items-center gap-1.5 bg-foreground text-background transition-all duration-300"
      >
        <Check className="w-3.5 h-3.5" />
        copied
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "px-2 py-1.5 font-medium flex items-center gap-1 justify-center",
        "transition-all duration-300",
        showWarning
          ? "bg-[hsl(300_30%_90%)] text-[hsl(300_30%_40%)]"
          : "bg-foreground text-background hover:bg-[hsl(270_100%_60%)] hover:text-white"
      )}
    >
      <Link className="w-3.5 h-3.5" />
      {displayText}
    </button>
  );
}
