import {
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-search-palette',
  templateUrl: './search-palette.component.html',
  styleUrls: ['./search-palette.component.scss'],
})
export class SearchPaletteComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  open = false;
  query = '';
  results: any[] = [];
  loading = false;
  isMac = false;

  private input$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform);

    this.input$
      .pipe(
        debounceTime(220),
        distinctUntilChanged(),
        switchMap((q) => {
          if (!q.trim()) {
            this.loading = false;
            return Promise.resolve({ data: [] } as any);
          }
          this.loading = true;
          return this.productService.search(q);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (res: any) => {
          this.results = res?.data ?? [];
          this.loading = false;
        },
        error: () => (this.loading = false),
      });
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    const mod = e.metaKey || e.ctrlKey;
    if (mod && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      this.toggle();
      return;
    }
    if (this.open && e.key === 'Escape') {
      e.preventDefault();
      this.close();
    }
  }

  toggle() { this.open ? this.close() : this.openPalette(); }

  openPalette() {
    this.open = true;
    setTimeout(() => this.searchInput?.nativeElement.focus(), 30);
  }

  close() {
    this.open = false;
    this.query = '';
    this.results = [];
  }

  onInput(value: string) {
    this.query = value;
    this.input$.next(value);
  }

  go(product: any) {
    this.router.navigate(['/catalog', product.slug]);
    this.close();
  }

  submitFull() {
    if (!this.query.trim()) return;
    this.router.navigate(['/catalog'], { queryParams: { q: this.query } });
    this.close();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
