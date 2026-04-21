import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { ScoreService, ScoreEvent } from '../../../core/services/score.service';
import { ToastService } from '../../../core/services/toast.service';

interface ConfettiPiece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vrot: number;
  color: string;
  shape: 'rect' | 'circle';
  life: number;
}

@Component({
  selector: 'app-confetti-overlay',
  template: `
    <canvas #c class="confetti-canvas" aria-hidden="true"></canvas>
    <div class="score-toast" *ngIf="toast" [class.show]="toast">
      <span class="icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      </span>
      <div class="text">
        <strong>+{{ toast.earned }} pts</strong>
        <span>Total: {{ toast.totalPoints }}</span>
      </div>
    </div>
  `,
  styles: [`
    :host {
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 100vh;
      pointer-events: none;
      z-index: 9999;
    }
    .confetti-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
    .score-toast {
      position: absolute;
      top: 84px;
      left: 50%;
      transform: translateX(-50%) translateY(-12px);
      display: inline-flex;
      align-items: center;
      gap: .65rem;
      padding: .65rem 1.1rem;
      background: rgba(30,30,30,.96);
      color: #ECF0F1;
      border-radius: 999px;
      border: 1px solid rgba(243,156,18,.35);
      box-shadow: 0 10px 32px rgba(0,0,0,.35);
      font-family: 'Inter', system-ui, sans-serif;
      opacity: 0;
      transition: opacity .25s ease, transform .25s cubic-bezier(.2,.9,.2,1);
    }
    .score-toast.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    .score-toast .icon { color: #F39C12; display: inline-flex; }
    .score-toast .text { display: flex; flex-direction: column; line-height: 1.1; }
    .score-toast strong { font-size: 1rem; color: #F39C12; }
    .score-toast span  { font-size: .7rem; color: rgba(236,240,241,.65); }
  `],
})
export class ConfettiOverlayComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('c', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  toast: ScoreEvent | null = null;

  private ctx!: CanvasRenderingContext2D;
  private pieces: ConfettiPiece[] = [];
  private rafId = 0;
  private width = 0;
  private height = 0;
  private subs = new Subscription();
  private toastTimer: any;

  private readonly colors = ['#F39C12', '#C0392B', '#2C3E50', '#ECF0F1', '#E67E22', '#F1C40F'];

  constructor(
    private scoreService: ScoreService,
    private toastService: ToastService,
    private zone: NgZone,
  ) {}

  ngOnInit(): void {
    this.subs.add(this.scoreService.scored$.subscribe((ev) => this.onScored(ev)));
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    cancelAnimationFrame(this.rafId);
    clearTimeout(this.toastTimer);
  }

  @HostListener('window:resize')
  onResize(): void { this.resize(); }

  private resize(): void {
    const canvas = this.canvasRef.nativeElement;
    const dpr = window.devicePixelRatio || 1;
    this.width = canvas.clientWidth;
    this.height = canvas.clientHeight;
    canvas.width = this.width * dpr;
    canvas.height = this.height * dpr;
    if (this.ctx) this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private onScored(ev: ScoreEvent): void {
    this.toast = ev;
    this.toastService.success(`+${ev.earned} pontos! 🎉`);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => (this.toast = null), 2800);
    this.burst();
  }

  /** Trigger confetti burst from around the navbar area. */
  private burst(count = 110): void {
    const originY = 56; // navbar height approx
    const originXs = [this.width * 0.25, this.width * 0.5, this.width * 0.75];

    for (let i = 0; i < count; i++) {
      const ox = originXs[i % originXs.length];
      const angle = (-Math.PI / 2) + (Math.random() - 0.5) * (Math.PI * 0.9);
      const speed = 6 + Math.random() * 6;
      this.pieces.push({
        x: ox,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 5 + Math.random() * 6,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.3,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        shape: Math.random() > 0.4 ? 'rect' : 'circle',
        life: 1,
      });
    }

    if (!this.rafId) {
      this.zone.runOutsideAngular(() => this.animate());
    }
  }

  private animate = () => {
    const { ctx, width, height } = this;
    ctx.clearRect(0, 0, width, height);

    const gravity = 0.22;
    const friction = 0.992;

    for (const p of this.pieces) {
      p.vy += gravity;
      p.vx *= friction;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;
      p.life -= 0.005;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life));

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size / 1.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // remove dead pieces
    this.pieces = this.pieces.filter((p) => p.life > 0 && p.y < height + 40);

    if (this.pieces.length > 0) {
      this.rafId = requestAnimationFrame(this.animate);
    } else {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
      ctx.clearRect(0, 0, width, height);
    }
  };
}
