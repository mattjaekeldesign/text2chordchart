import { useEffect, useRef, useCallback } from 'react';

// Simple Perlin noise implementation
class PerlinNoise {
  private perm: number[];
  
  constructor() {
    const p = [];
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    this.perm = [...p, ...p];
  }

  private fade(t: number) { return t * t * t * (t * (t * 6 - 15) + 10); }
  private lerp(a: number, b: number, t: number) { return a + t * (b - a); }
  private grad(hash: number, x: number, y: number, z: number) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  noise(x: number, y: number, z: number) {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
    x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
    const u = this.fade(x), v = this.fade(y), w = this.fade(z);
    const p = this.perm;
    const A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z;
    const B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;
    return this.lerp(
      this.lerp(
        this.lerp(this.grad(p[AA], x, y, z), this.grad(p[BA], x - 1, y, z), u),
        this.lerp(this.grad(p[AB], x, y - 1, z), this.grad(p[BB], x - 1, y - 1, z), u), v),
      this.lerp(
        this.lerp(this.grad(p[AA + 1], x, y, z - 1), this.grad(p[BA + 1], x - 1, y, z - 1), u),
        this.lerp(this.grad(p[AB + 1], x, y - 1, z - 1), this.grad(p[BB + 1], x - 1, y - 1, z - 1), u), v), w);
  }
}

const rand = (v1: number, v2: number) => Math.floor(v1 + Math.random() * (v2 - v1));

interface ParticleOrbProps {
  size?: number;
  className?: string;
}

export function ParticleOrb({ size = 280, className = '' }: ParticleOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const perlin = new PerlinNoise();
    const noiseScale = 0.009;
    let angle = Math.PI / 180 * -90;
    let time = 0;

    let l1 = rand(30, 80), l2 = rand(30, 80);

    ctx.lineWidth = 2.5;

    class Particle {
      x: number; y: number; lx: number; ly: number;
      vx = 0; vy = 0; ax = 0; ay = 0;
      hueSemen: number; hue: number; sat: number; light: number; maxSpeed: number;

      constructor(x: number, y: number) {
        this.x = x; this.y = y; this.lx = x; this.ly = y;
        this.hueSemen = Math.random();
        this.hue = 0;
        this.sat = 0;
        this.light = this.hueSemen > .5 ? l1 : l2;
        this.maxSpeed = this.hueSemen > .5 ? 0.4 : 0.25;
      }

      randomize() {
        this.hueSemen = Math.random();
        this.hue = 0;
        this.sat = 0;
        this.light = this.hueSemen > .5 ? l1 : l2;
        this.maxSpeed = this.hueSemen > .5 ? 0.4 : 0.25;
      }

      update() {
        const n = perlin.noise(this.x * noiseScale, this.y * noiseScale, time * noiseScale);
        const a = n * Math.PI * 0.5 + angle;
        this.ax += Math.cos(a);
        this.ay += Math.sin(a);

        this.vx += this.ax;
        this.vy += this.ay;
        const p = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const ang = Math.atan2(this.vy, this.vx);
        const m = Math.min(this.maxSpeed, p);
        this.vx = Math.cos(ang) * m;
        this.vy = Math.sin(ang) * m;

        this.x += this.vx;
        this.y += this.vy;
        this.ax = 0;
        this.ay = 0;

        if (this.x < 0) { this.x = size; this.lx = this.x; this.ly = this.y; }
        if (this.x > size) { this.x = 0; this.lx = this.x; this.ly = this.y; }
        if (this.y < 0) { this.y = size; this.lx = this.x; this.ly = this.y; }
        if (this.y > size) { this.y = 0; this.lx = this.x; this.ly = this.y; }
      }

      render(ctx: CanvasRenderingContext2D) {
        ctx.strokeStyle = `hsla(${this.hue}, ${this.sat}%, ${this.light}%, .5)`;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.lx, this.ly);
        ctx.stroke();
        this.lx = this.x;
        this.ly = this.y;
      }
    }

    const particles: Particle[] = [];
    const count = size < 200 ? 300 : 500;
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(Math.random() * size, Math.random() * size));
    }

    const draw = () => {
      time++;
      // Use the page background color
      const bg = getComputedStyle(document.documentElement).getPropertyValue('--background').trim();
      const [h, s, l] = bg.split(/\s+/);
      ctx.fillStyle = `hsla(${h}, ${s}, ${l}, 0.18)`;
      ctx.fillRect(0, 0, size, size);

      for (const p of particles) {
        p.update();
        p.render(ctx);
      }
      animRef.current = requestAnimationFrame(draw);
    };

    // Randomize on click
    const handleClick = () => {
      l1 = rand(30, 80); l2 = rand(30, 80);
      angle += (Math.PI / 180 * rand(30, 90)) * (Math.random() > .5 ? 1 : -1);
      for (const p of particles) p.randomize();
    };
    canvas.addEventListener('click', handleClick);

    draw();

    return () => {
      canvas.removeEventListener('click', handleClick);
      cancelAnimationFrame(animRef.current);
    };
  }, [size]);

  useEffect(() => {
    const cleanup = init();
    return () => cleanup?.();
  }, [init]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
      }}
    />
  );
}
