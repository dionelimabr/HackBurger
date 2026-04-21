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

    'home.priceFrom': 'A PARTIR DE',
    'home.new': 'NOVO',
    'home.burger': 'BURGER',
    'home.artisan': 'ARTESANAL',
    'home.heroDesc':
      'Experimente o sabor perfeito. Nosso novo burger é suculento, recheado com ingredientes frescos, cebolas crocantes, carne premium e um pão que derrete na boca. Um sabor tão bom que você não vai querer dividir.',
    'home.orderNow': 'PEÇA AGORA',
    'home.featuredTitle': 'NOSSOS BURGERS INSANOS',
    'home.featuredDesc':
      'Prepare-se para uma explosão de sabores. Nossos burgers insanos vêm carregados de carnes suculentas, coberturas ousadas e molhos irresistíveis, tudo em um pão perfeitamente tostado.',
    'home.addToCart': 'Adicionar',
    'home.appTitle': 'BAIXE O APP MOBILE E',
    'home.appHighlight': 'ECONOMIZE ATÉ 20%',
    'home.appDesc':
      'Curta seus burgers favoritos em qualquer lugar. Baixe nosso app e tenha ofertas exclusivas, pedido fácil e 20% de desconto na primeira compra.',

    'footer.tagline': 'Hambúrgueres artesanais entregues rápido, do jeito que você pediu.',
    'footer.support': 'Atendimento',
    'footer.hours': 'Seg a Dom · 18h às 23h',
    'footer.links': 'Links',
    'footer.menu': 'Cardápio',
    'footer.account': 'Minha conta',
    'footer.rights': 'Todos os direitos reservados.',
    'footer.docs': 'Documentação',
    'footer.developer': 'Desenvolvedor',

    'card.add': 'Adicionar',
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

    'home.priceFrom': 'STARTING AT',
    'home.new': 'NEW',
    'home.burger': 'BURGER',
    'home.artisan': 'ARTISAN',
    'home.heroDesc':
      "Savor the perfect bite. Our new burger is juicy and flavor-packed, layered with fresh, crispy onions, premium beef and a melt-in-your-mouth bun. A taste so good you won't want to share.",
    'home.orderNow': 'ORDER NOW',
    'home.featuredTitle': 'OUR CRAZY BURGERS',
    'home.featuredDesc':
      "Get ready for a wild ride of flavors. Our crazy burgers are loaded with juicy patties, bold toppings and irresistible sauces on a perfectly toasted bun.",
    'home.addToCart': 'Add',
    'home.appTitle': 'DOWNLOAD THE MOBILE APP AND',
    'home.appHighlight': 'SAVE UP TO 20%',
    'home.appDesc':
      'Enjoy your favorite burgers anywhere. Download our app for exclusive deals, easy ordering and 20% off your first purchase.',

    'footer.tagline': 'Artisan burgers delivered fast, exactly the way you ordered.',
    'footer.support': 'Support',
    'footer.hours': 'Mon–Sun · 6pm to 11pm',
    'footer.links': 'Links',
    'footer.menu': 'Menu',
    'footer.account': 'My account',
    'footer.rights': 'All rights reserved.',
    'footer.docs': 'Documentation',
    'footer.developer': 'Developer',

    'card.add': 'Add',
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
