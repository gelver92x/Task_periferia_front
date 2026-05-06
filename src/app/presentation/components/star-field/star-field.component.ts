import { Component, NgZone, OnDestroy, OnInit, ElementRef, ViewChild } from '@angular/core';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
}

@Component({
  selector: 'app-star-field',
  standalone: true,
  template: `<canvas #canvas style="position:fixed;inset:0;z-index:0;pointer-events:none;"></canvas>`,
})
export class StarFieldComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private animFrame = 0;
  private readonly COUNT   = 80;
  private readonly CONNECT = 120;

  constructor(private zone: NgZone) {}

  ngOnInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resize(canvas);

    this.zone.runOutsideAngular(() => {
      window.addEventListener('resize', () => this.resize(canvas));
      this.loop();
    });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animFrame);
    window.removeEventListener('resize', () => this.resize(this.canvasRef.nativeElement));
  }

  private resize(canvas: HTMLCanvasElement): void {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    this.particles = Array.from({ length: this.COUNT }, () => this.createParticle(canvas));
  }

  private createParticle(canvas: HTMLCanvasElement): Particle {
    return {
      x:       Math.random() * canvas.width,
      y:       Math.random() * canvas.height,
      vx:      (Math.random() - 0.5) * 0.5,
      vy:      (Math.random() - 0.5) * 0.5,
      radius:  Math.random() * 1.8 + 0.6,
      opacity: Math.random() * 0.5 + 0.3,
    };
  }

  private loop(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx    = this.ctx;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(167,139,250,${p.opacity})`;
      ctx.shadowBlur   = 6;
      ctx.shadowColor  = 'rgba(124,58,237,0.6)';
      ctx.fill();
    }

    ctx.shadowBlur = 0;

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const a = this.particles[i];
        const b = this.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.CONNECT) {
          const alpha = (1 - dist / this.CONNECT) * 0.25;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(124,58,237,${alpha})`;
          ctx.lineWidth   = 0.7;
          ctx.stroke();
        }
      }
    }

    this.animFrame = requestAnimationFrame(() => this.loop());
  }
}
