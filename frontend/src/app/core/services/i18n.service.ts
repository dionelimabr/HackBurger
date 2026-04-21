import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Lang = 'pt' | 'en';

const DICT: Record<Lang, Record<string, string>> = {
  pt: {
    'nav.home': 'INÍCIO',
    'nav.menu': 'CARDÁPIO',
    'nav.shop': 'LOJA',
    'nav.contact': 'CONTATO',
    'nav.login': 'Entrar',
    'nav.profile': 'Perfil',
    'nav.logout': 'Sair',
    'nav.search': 'Buscar produtos...',
    'nav.searchHint': 'Buscar',
    'nav.notifications': 'Notificações',
    'nav.cart': 'Carrinho',
    'nav.theme': 'Alternar tema',
    'nav.language': 'Alternar idioma',
  },
  en: {
    'nav.home': 'HOME',
    'nav.menu': 'MENU',
    'nav.shop': 'SHOP',
    'nav.contact': 'CONTACT',
    'nav.login': 'Login',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',
    'nav.search': 'Search products...',
    'nav.searchHint': 'Search',
    'nav.notifications': 'Notifications',
    'nav.cart': 'Cart',
    'nav.theme': 'Toggle theme',
    'nav.language': 'Toggle language',
  },
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly langSubject = new BehaviorSubject<Lang>(this.restore());
  readonly lang$ = this.langSubject.asObservable();

  get lang(): Lang { return this.langSubject.value; }

  t(key: string): string {
    return DICT[this.lang][key] ?? key;
  }

  toggle(): void {
    const next: Lang = this.lang === 'pt' ? 'en' : 'pt';
    localStorage.setItem('lang', next);
    this.langSubject.next(next);
  }

  private restore(): Lang {
    const stored = (localStorage.getItem('lang') as Lang | null) ?? 'pt';
    return stored === 'en' ? 'en' : 'pt';
  }
}
