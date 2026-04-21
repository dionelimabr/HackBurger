import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { I18nService, Lang } from '../../../core/services/i18n.service';
import { ThemeService, Theme } from '../../../core/services/theme.service';
import { SearchPaletteComponent } from '../search-palette/search-palette.component';
import { environment } from '../../../../environments/environment';

interface NotificationItem {
  id: number;
  title: string;
  time: string;
  read: boolean;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  @ViewChild('searchPalette') searchPalette?: SearchPaletteComponent;
  @ViewChild('notifRef') notifRef?: ElementRef<HTMLElement>;

  cartItemCount = 0;
  isAuthenticated = false;
  user: any = null;

  lang: Lang = 'pt';
  theme: Theme = 'dark';
  isMac = false;

  notifOpen = false;
  notifications: NotificationItem[] = [
    { id: 1, title: 'Pedido #1024 saiu para entrega', time: '2 min', read: false },
    { id: 2, title: 'Novo combo disponível', time: '1 h', read: false },
    { id: 3, title: 'Pedido #1019 entregue', time: '3 h', read: true },
  ];

  readonly githubUrl = 'https://github.com';

  constructor(
    public i18n: I18nService,
    private themeService: ThemeService,
    private authService: AuthService,
    private cartService: CartService,
  ) {}

  ngOnInit(): void {
    this.isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform);

    this.i18n.lang$.subscribe((l) => (this.lang = l));
    this.themeService.theme$.subscribe((t) => (this.theme = t));

    this.authService.user$.subscribe((user) => {
      this.user = user;
      this.isAuthenticated = !!user;
      if (this.isAuthenticated) {
        this.cartService.getCart().subscribe((res: any) => {
          this.cartItemCount = res.data?.items?.length || 0;
        });
      } else {
        this.cartItemCount = 0;
      }
    });
  }

  t(key: string) { return this.i18n.t(key); }

  toggleLang() { this.i18n.toggle(); }
  toggleTheme() { this.themeService.toggle(); }

  openSearch() { this.searchPalette?.openPalette(); }

  toggleNotif() { this.notifOpen = !this.notifOpen; }
  closeNotif() { this.notifOpen = false; }
  markAllRead() { this.notifications.forEach((n) => (n.read = true)); }

  get unreadCount(): number { return this.notifications.filter((n) => !n.read).length; }

  avatarUrl(): string {
    if (!this.user?.avatar_url) return '';
    const url: string = this.user.avatar_url;
    if (url.startsWith('http')) return url;
    const base = environment.apiUrl.replace(/\/api$/, '');
    return `${base}${url}`;
  }

  userInitial(): string {
    return (this.user?.name || '?').charAt(0).toUpperCase();
  }

  logout() { this.authService.logout(); }

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    if (!this.notifOpen) return;
    if (this.notifRef && !this.notifRef.nativeElement.contains(ev.target as Node)) {
      this.notifOpen = false;
    }
  }
}
