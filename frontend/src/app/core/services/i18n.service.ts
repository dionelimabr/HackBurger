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
    'footer.ranking': 'Ranking',

    'card.add': 'Adicionar',

    'auth.login.title':       'Entrar na conta',
    'auth.login.subtitle':    'Acesse sua conta para continuar.',
    'auth.login.email':       'E-mail',
    'auth.login.password':    'Senha',
    'auth.login.forgot':      'Esqueceu a senha?',
    'auth.login.submit':      'Fazer Login',
    'auth.login.noAccount':   'Não tem uma conta?',
    'auth.login.register':    'Registre-se',
    'auth.login.errorFallback': 'Credenciais inválidas',
    'auth.login.terminal':    'A gente sabe qual é o seu ponto fraco. Faça login e peça o seu favorito.',

    'auth.register.title':          'Criar conta',
    'auth.register.subtitle':       'Preencha os dados abaixo para começar.',
    'auth.register.name':           'Nome Completo',
    'auth.register.email':          'Email',
    'auth.register.password':       'Senha',
    'auth.register.confirmPassword':'Confirme a Senha',
    'auth.register.termsPrefix':    'Li e concordo com os',
    'auth.register.termsLink':      'Termos de Serviço',
    'auth.register.termsAnd':       'e a',
    'auth.register.privacyLink':    'Política de Privacidade',
    'auth.register.submit':         'Registrar-se',
    'auth.register.hasAccount':     'Já tem uma conta?',
    'auth.register.login':          'Entrar',
    'auth.register.passMismatch':   'As senhas não coincidem.',
    'auth.register.errorFallback':  'Erro ao criar conta. Tente novamente.',
    'auth.register.terminal':       'Crie sua conta e descubra o que está escondido no cardápio. O melhor está reservado para você.',
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
    'footer.ranking': 'Leaderboard',

    'card.add': 'Add',

    'auth.login.title':       'Sign in',
    'auth.login.subtitle':    'Access your account to continue.',
    'auth.login.email':       'Email',
    'auth.login.password':    'Password',
    'auth.login.forgot':      'Forgot password?',
    'auth.login.submit':      'Sign In',
    'auth.login.noAccount':   "Don't have an account?",
    'auth.login.register':    'Register',
    'auth.login.errorFallback': 'Invalid credentials',
    'auth.login.terminal':    'We know your weak spot. Sign in and order your favorite.',

    'auth.register.title':          'Create account',
    'auth.register.subtitle':       'Fill in the details below to get started.',
    'auth.register.name':           'Full Name',
    'auth.register.email':          'Email',
    'auth.register.password':       'Password',
    'auth.register.confirmPassword':'Confirm Password',
    'auth.register.termsPrefix':    'I have read and agree to the',
    'auth.register.termsLink':      'Terms of Service',
    'auth.register.termsAnd':       'and the',
    'auth.register.privacyLink':    'Privacy Policy',
    'auth.register.submit':         'Register',
    'auth.register.hasAccount':     'Already have an account?',
    'auth.register.login':          'Sign In',
    'auth.register.passMismatch':   "Passwords don't match.",
    'auth.register.errorFallback':  'Error creating account. Please try again.',
    'auth.register.terminal':       "Create your account and discover what's hidden on the menu. The best is reserved for you.",
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
