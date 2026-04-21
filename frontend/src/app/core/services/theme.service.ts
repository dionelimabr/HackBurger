import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly themeSubject = new BehaviorSubject<Theme>(this.restore());
  readonly theme$ = this.themeSubject.asObservable();

  constructor() {
    this.apply(this.themeSubject.value);
  }

  get theme(): Theme { return this.themeSubject.value; }

  toggle(): void {
    const next: Theme = this.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', next);
    this.apply(next);
    this.themeSubject.next(next);
  }

  private apply(theme: Theme) {
    const body = document.body;
    body.classList.toggle('theme-dark', theme === 'dark');
    body.classList.toggle('theme-light', theme === 'light');
  }

  private restore(): Theme {
    const stored = (localStorage.getItem('theme') as Theme | null);
    if (stored === 'light' || stored === 'dark') return stored;
    return 'dark';
  }
}
