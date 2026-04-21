import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { switchMap, takeUntil, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { marked } from 'marked';
import hljs from 'highlight.js/lib/common';

interface TocItem { id: string; text: string; level: number; }

@Component({
  selector: 'app-docs-page',
  templateUrl: './docs-page.component.html',
  styleUrls: ['./docs-page.component.scss'],
})
export class DocsPageComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('content') content?: ElementRef<HTMLElement>;

  html = '';
  toc: TocItem[] = [];
  loading = true;
  notFound = false;
  activeId = '';
  slug = '';

  private destroy$ = new Subject<void>();
  private scrollHandler = () => this.updateActive();

  constructor(private route: ActivatedRoute, private http: HttpClient) {
    marked.setOptions({ gfm: true, breaks: false });
    marked.use({
      renderer: {
        code({ text, lang }: { text: string; lang?: string }) {
          const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
          const highlighted = hljs.highlight(text, { language }).value;
          return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
        },
      },
    });
  }

  ngOnInit(): void {
    this.route.params
      .pipe(
        takeUntil(this.destroy$),
        switchMap((p) => {
          this.slug = p['slug'] || 'index';
          this.loading = true;
          this.notFound = false;
          return this.http.get(`assets/docs/${this.slug}.md`, { responseType: 'text' }).pipe(
            catchError(() => {
              this.notFound = true;
              return of('');
            }),
          );
        }),
      )
      .subscribe((md) => {
        this.render(md);
        this.loading = false;
        queueMicrotask(() => window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }));
      });

    window.addEventListener('scroll', this.scrollHandler, { passive: true });
  }

  private render(md: string) {
    if (!md) { this.html = ''; this.toc = []; return; }

    const raw = marked.parse(md) as string;

    const container = document.createElement('div');
    container.innerHTML = raw;

    const toc: TocItem[] = [];
    container.querySelectorAll('h2, h3').forEach((el) => {
      const text = el.textContent || '';
      const id = this.slugify(text);
      el.setAttribute('id', id);
      toc.push({ id, text, level: el.tagName === 'H3' ? 3 : 2 });
    });

    this.toc = toc;
    this.html = container.innerHTML;
  }

  private slugify(s: string): string {
    return s
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  ngAfterViewChecked(): void { this.updateActive(); }

  scrollTo(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  private updateActive() {
    if (!this.toc.length) return;
    const y = window.scrollY + 120;
    let current = this.toc[0].id;
    for (const t of this.toc) {
      const el = document.getElementById(t.id);
      if (el && el.offsetTop <= y) current = t.id;
    }
    if (current !== this.activeId) this.activeId = current;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('scroll', this.scrollHandler);
  }
}
