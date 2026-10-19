import { useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { cn } from '@/lib/utils';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%&*✦';
const SCRAMBLE_DURATION = 400;

interface BlueScrambleButtonProps {
  children?: string;
  onClick: () => void;
  className?: string;
  icon?: ReactNode;
  variant?: 'filled' | 'outline';
  title?: string;
  disabled?: boolean;
}

export function BlueScrambleButton({ 
  children = '', 
  onClick, 
  className,
  icon,
  variant = 'filled',
  title,
  disabled = false
}: BlueScrambleButtonProps) {
  const [displayText, setDisplayText] = useState(children);
  const [isHovering, setIsHovering] = useState(false);
  const frameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  
  const isIconOnly = !children && icon;

  const scrambleText = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    
    startTimeRef.current = performance.now();
    const textLength = children.length;
    
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
          result += children[i];
        } else if (children[i] === ' ') {
          result += ' ';
        } else {
          result += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      
      setDisplayText(result);
      
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayText(children);
      }
    };
    
    frameRef.current = requestAnimationFrame(animate);
  }, [children]);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    scrambleText();
  }, [scrambleText]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  // Update display text when children change
  useEffect(() => {
    setDisplayText(children);
  }, [children]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const baseStyles = "px-3 py-1.5 font-medium flex items-center gap-1.5 justify-center transition-all duration-300";
  
  const variantStyles = variant === 'filled' 
    ? cn(
        "bg-foreground text-background",
        "hover:bg-[hsl(270_100%_60%)] hover:text-white"
      )
    : cn(
        "border border-border text-foreground",
        "hover:border-[hsl(270_100%_60%)] hover:text-[hsl(270_100%_60%)]"
      );

  return (
    <button
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={title}
      disabled={disabled}
      className={cn(
        baseStyles, 
        variantStyles, 
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
    >
      {icon}
      {!isIconOnly && displayText}
    </button>
  );
}
