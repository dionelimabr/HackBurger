import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hue: number;
}

@Component({
  selector: 'app-developer',
  templateUrl: './developer.component.html',
  styleUrls: ['./developer.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DeveloperComponent implements AfterViewInit, OnDestroy {
  @ViewChild('bgCanvas', { static: true }) bgCanvas!: ElementRef<HTMLCanvasElement>;

  year = new Date().getFullYear();

  certifications = [
    {
      code: 'CNSE',
      name: 'Certified Network Security Expert',
      desc: 'Ênfase em defesa e segurança de redes, hardening e monitoramento contínuo.',
      icon: 'shield',
    },
    {
      code: 'CEH v12',
      name: 'Certified Ethical Hacker',
      desc: 'Hacking ético, identificação de vulnerabilidades e técnicas ofensivas controladas.',
      icon: 'target',
    },
    {
      code: 'CSAE',
      name: 'Certified Security Architecture Expert',
      desc: 'Arquitetura de sistemas seguros, resilientes e por padrão (security by design).',
      icon: 'layers',
    },
    {
      code: 'CPTE',
      name: 'Certified Penetration Testing Expert',
      desc: 'Simulação de ataques reais, pentest avançado e relatórios executivos.',
      icon: 'zap',
    },
  ];

  specialties = [
    { name: 'Segurança Ofensiva (Red Team)', level: 95 },
    { name: 'Defesa e Proteção (Blue Team)', level: 88 },
    { name: 'Arquitetura de Segurança (Green Team)', level: 90 },
    { name: 'Testes de Penetração', level: 95 },
    { name: 'Análise de Vulnerabilidades', level: 92 },
  ];

  tech = [
    'Node.js', 'TypeScript', 'Angular', 'Express', 'SQLite',
    'Docker', 'JWT', 'OWASP', 'Kali Linux', 'Burp Suite',
  ];

  private ctx!: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private rafId = 0;
  private width = 0;
  private height = 0;
  private mouse = { x: -9999, y: -9999 };

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    this.setupCanvas();
    this.setupReveal();
    this.zone.runOutsideAngular(() => this.animate());
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
  }

  @HostListener('window:resize')
  onResize() {
    this.resizeCanvas();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }

  private setupCanvas() {
    const canvas = this.bgCanvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
    const count = Math.min(90, Math.floor((this.width * this.height) / 22000));
    this.particles = Array.from({ length: count }, () => this.makeParticle());
  }

  private makeParticle(): Particle {
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 1 + Math.random() * 1.4,
      hue: 10 + Math.random() * 35, // 10-45 = red → amber (HackBurger palette)
    };
  }

  private resizeCanvas() {
    const canvas = this.bgCanvas.nativeElement;
    const dpr = window.devicePixelRatio || 1;
    this.width = canvas.clientWidth;
    this.height = canvas.clientHeight;
    canvas.width = this.width * dpr;
    canvas.height = this.height * dpr;
    if (this.ctx) this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private animate = () => {
    const { ctx, width, height, particles, mouse } = this;
    ctx.clearRect(0, 0, width, height);

    // draw particles
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 70%, 55%, .75)`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // connect close particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 120 * 120) {
          const alpha = 1 - d2 / (120 * 120);
          ctx.strokeStyle = `hsla(${(a.hue + b.hue) / 2}, 65%, 50%, ${alpha * 0.3})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      // mouse interaction line
      const dmx = particles[i].x - mouse.x;
      const dmy = particles[i].y - mouse.y;
      const dm2 = dmx * dmx + dmy * dmy;
      if (dm2 < 140 * 140) {
        const alpha = 1 - dm2 / (140 * 140);
        ctx.strokeStyle = `hsla(${particles[i].hue}, 70%, 60%, ${alpha * 0.5})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }

    this.rafId = requestAnimationFrame(this.animate);
  };

  private setupReveal() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    setTimeout(() => {
      document.querySelectorAll('.dev-page .reveal').forEach((el) => observer.observe(el));
    }, 0);
  }

  scrollTo(anchor: string) {
    const el = document.getElementById(anchor);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
