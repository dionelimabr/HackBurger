import { ChangeDetectorRef, OnDestroy, Pipe, PipeTransform } from '@angular/core';
import { Subscription } from 'rxjs';
import { I18nService } from '../../core/services/i18n.service';

@Pipe({ name: 't', pure: false })
export class TranslatePipe implements PipeTransform, OnDestroy {
  private lastKey = '';
  private lastValue = '';
  private sub: Subscription;

  constructor(private i18n: I18nService, private cdr: ChangeDetectorRef) {
    this.sub = this.i18n.lang$.subscribe(() => {
      this.lastKey = '';
      this.cdr.markForCheck();
    });
  }

  transform(key: string): string {
    if (!key) return '';
    if (key === this.lastKey) return this.lastValue;
    this.lastKey = key;
    this.lastValue = this.i18n.t(key);
    return this.lastValue;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
