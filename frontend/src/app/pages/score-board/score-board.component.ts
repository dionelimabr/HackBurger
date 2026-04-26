import { Component, OnInit } from '@angular/core';
import { ScoreService } from '../../core/services/score.service';

export interface ChallengeCard {
  key: string;
  title: string;
  description: string;
  category: string;
  stars: number;
  points: number;
  solved: boolean;
}

const CHALLENGE_META: Record<string, { title: string; description: string; category: string }> = {
  // ── 1-star ──
  scoreBoardChallenge:              { title: 'Score Board',                category: 'Miscellaneous',          description: 'Encontre a página oculta de ranking desta plataforma.' },
  privacyPolicyChallenge:           { title: 'Privacy Policy',             category: 'Miscellaneous',          description: 'Leia a política de privacidade completa da plataforma.' },
  errorHandlingChallenge:           { title: 'Error Handling',             category: 'Miscellaneous',          description: 'Provoque um erro que exponha a stack trace da aplicação.' },
  exposedMetricsChallenge:          { title: 'Exposed Metrics',            category: 'Observability Failures', description: 'Encontre o endpoint de métricas exposto publicamente.' },
  domXssChallenge:                  { title: 'DOM XSS',                    category: 'XSS',                   description: 'Execute um ataque XSS via DOM usando o campo de busca.' },
  confidentialDocumentChallenge:    { title: 'Confidential Document',      category: 'Sensitive Data Exposure',description: 'Acesse um documento confidencial exposto no servidor.' },
  zeroStarsChallenge:               { title: 'Zero Stars',                 category: 'Improper Input Validation', description: 'Envie um feedback com avaliação de zero estrelas.' },
  repetitiveRegistrationChallenge:  { title: 'Repetitive Registration',    category: 'Improper Input Validation', description: 'Registre o mesmo usuário mais de uma vez.' },
  missingEncodingChallenge:         { title: 'Missing Encoding',           category: 'Improper Input Validation', description: 'Acesse um arquivo cujo nome exige URL encoding correto.' },
  outdatedAllowlistChallenge:       { title: 'Outdated Allowlist',         category: 'Unvalidated Redirects',  description: 'Bypasseie uma allowlist desatualizada no redirect.' },
  bonusPayloadChallenge:            { title: 'Bonus Payload',              category: 'XSS',                   description: 'Use o payload bônus de XSS com iframe no feedback.' },
  bullyChatbotChallenge:            { title: 'Bully Chatbot',              category: 'Shenanigans',            description: 'Force o chatbot a revelar um cupom após insistência.' },
  massDispelChallenge:              { title: 'Mass Dispel',                category: 'Broken Access Control',  description: 'Feche todas as notificações de uma só vez.' },
  web3InterfaceChallenge:           { title: 'Web3 Sandbox',               category: 'Miscellaneous',          description: 'Encontre o sandbox de contratos Web3 implantados acidentalmente.' },

  // ── 2-star ──
  adminSectionChallenge:            { title: 'Admin Section',              category: 'Broken Access Control',  description: 'Acesse a seção de administração da aplicação.' },
  loginAdminChallenge:              { title: 'Login Admin',                category: 'SQLi',                  description: 'Faça login como administrador usando injeção de SQL.' },
  emptyUserRegistrationChallenge:   { title: 'Empty User Registration',    category: 'Improper Input Validation', description: 'Registre um usuário sem nenhum dado válido.' },
  fiveStarFeedbackChallenge:        { title: '5-Star Feedback',            category: 'Broken Access Control',  description: 'Delete o único feedback de 5 estrelas sem autenticação.' },
  viewBasketChallenge:              { title: 'View Basket',                category: 'Broken Access Control',  description: 'Visualize o carrinho de outro usuário via IDOR.' },
  weirdCryptoChallenge:             { title: 'Weird Crypto',               category: 'Cryptographic Issues',   description: 'Descubra o uso inadequado de MD5 em tokens.' },
  whiteHatChallenge:                { title: 'White Hat',                  category: 'Miscellaneous',          description: 'Encontre o arquivo security.txt da aplicação.' },
  deprecatedInterfaceChallenge:     { title: 'Deprecated Interface',       category: 'Security Misconfiguration', description: 'Explore uma interface legada ainda ativa.' },
  loginMcSafeSearchChallenge:       { title: 'Login MC SafeSearch',        category: 'Security Misconfiguration', description: 'Faça login como MC SafeSearch sem saber a senha.' },
  metaGeostakingChallenge:          { title: 'Meta Geo Stalking',          category: 'Sensitive Data Exposure',description: 'Determine a localização de um usuário via metadados de imagem.' },
  nftTakeoverChallenge:             { title: 'NFT Takeover',               category: 'Broken Access Control',  description: 'Acesse a carteira NFT de outro usuário.' },
  passwordStrengthChallenge:        { title: 'Password Strength',          category: 'Security Misconfiguration', description: 'Faça login como admin descobrindo a senha fraca.' },
  reflectedXssChallenge:            { title: 'Reflected XSS',              category: 'XSS',                   description: 'Execute um XSS refletido via parâmetro de URL.' },
  visualGeostakingChallenge:        { title: 'Visual Geo Stalking',        category: 'Sensitive Data Exposure',description: 'Identifique localização de usuário por fotos do perfil.' },

  // ── 3-star ──
  adminRegistrationChallenge:       { title: 'Admin Registration',         category: 'Broken Access Control',  description: 'Registre um novo usuário com role de administrador.' },
  bjoernFavoritePetChallenge:       { title: "Bjoern's Favorite Pet",      category: 'Security Misconfiguration', description: 'Resete a senha de Bjoern respondendo sua pergunta secreta.' },
  captchaBypassChallenge:           { title: 'CAPTCHA Bypass',             category: 'Broken Anti Automation', description: 'Envie múltiplos feedbacks sem resolver o CAPTCHA.' },
  csrfChallenge:                    { title: 'CSRF',                       category: 'Broken Access Control',  description: 'Altere dados de usuário sem token CSRF válido.' },
  databaseSchemaChallenge:          { title: 'Database Schema',            category: 'SQLi',                  description: 'Exfiltre o schema do banco de dados via SQL injection.' },
  deluxeFraudChallenge:             { title: 'Deluxe Fraud',               category: 'Improper Input Validation', description: 'Obtenha a assinatura Deluxe sem pagar.' },
  forgedFeedbackChallenge:          { title: 'Forged Feedback',            category: 'Broken Access Control',  description: 'Envie feedback em nome de outro usuário.' },
  forgedReviewChallenge:            { title: 'Forged Review',              category: 'Broken Access Control',  description: 'Crie ou edite uma review como outro usuário.' },
  gdprDataErasureChallenge:         { title: 'GDPR Data Erasure',          category: 'Miscellaneous',          description: 'Faça login como um usuário que solicitou exclusão GDPR.' },
  loginAmyChallenge:                { title: 'Login Amy',                  category: 'SQLi',                  description: 'Faça login como Amy via SQL injection.' },
  loginBenderChallenge:             { title: 'Login Bender',               category: 'SQLi',                  description: 'Faça login como Bender via SQL injection.' },
  loginJimChallenge:                { title: 'Login Jim',                  category: 'SQLi',                  description: 'Faça login como Jim via SQL injection.' },
  manipulateBasketChallenge:        { title: 'Manipulate Basket',          category: 'Broken Access Control',  description: 'Adicione itens ao carrinho de outro usuário via IDOR.' },
  mintTheHoneyPotChallenge:         { title: 'Mint the Honey Pot',         category: 'Miscellaneous',          description: 'Interaja com o endpoint honeypot escondido.' },
  paybackTimeChallenge:             { title: 'Payback Time',               category: 'Improper Input Validation', description: 'Faça um pedido com preço negativo e receba dinheiro.' },
  privacyPolicyInspectionChallenge: { title: 'Privacy Policy Inspection',  category: 'Miscellaneous',          description: 'Encontre dados escondidos na política de privacidade.' },
  productTamperingChallenge:        { title: 'Product Tampering',          category: 'Broken Access Control',  description: 'Edite a descrição de um produto sem ser administrador.' },
  resetJimPasswordChallenge:        { title: 'Reset Jim Password',         category: 'Security Misconfiguration', description: 'Resete a senha de Jim respondendo sua pergunta secreta.' },
  uploadSizeChallenge:              { title: 'Upload Size',                category: 'Improper Input Validation', description: 'Faça upload de um arquivo maior que o limite permitido.' },

  // ── 4-star ──
  accessLogChallenge:               { title: 'Access Log',                 category: 'Sensitive Data Exposure',description: 'Acesse os logs do servidor que não deveriam ser públicos.' },
  allowlistBypassChallenge:         { title: 'Allowlist Bypass',           category: 'Unvalidated Redirects',  description: 'Contorne a allowlist de redirecionamento.' },
  christmasSpecialChallenge:        { title: 'Christmas Special',          category: 'SQLi',                  description: 'Encomende o produto especial de Natal removido do catálogo.' },
  easterEggChallenge:               { title: 'Easter Egg',                 category: 'Miscellaneous',          description: 'Encontre o Easter egg escondido na aplicação.' },
  ephemeralAccountantChallenge:     { title: 'Ephemeral Accountant',       category: 'SQLi',                  description: 'Faça login como o contador efêmero via SQL injection.' },
  expiredCouponChallenge:           { title: 'Expired Coupon',             category: 'Improper Input Validation', description: 'Use um cupom expirado com sucesso.' },
  forgottenSalesBackupChallenge:    { title: 'Forgotten Sales Backup',     category: 'Sensitive Data Exposure',description: 'Encontre o backup de vendas esquecido no servidor.' },
  gdprDataTheftChallenge:           { title: 'GDPR Data Theft',            category: 'Sensitive Data Exposure',description: 'Exfiltre dados GDPR de outro usuário.' },
  leakedUnsafeProductChallenge:     { title: 'Leaked Unsafe Product',      category: 'Sensitive Data Exposure',description: 'Encontre o produto vazado considerado inseguro.' },
  legacyTyposquattingChallenge:     { title: 'Legacy Typosquatting',       category: 'Miscellaneous',          description: 'Encontre o pacote npm usado por typosquatting.' },
  loginBjoernChallenge:             { title: 'Login Bjoern',               category: 'Security Misconfiguration', description: 'Faça login como Bjoern sem força bruta ou SQLi.' },
  loginUvoginChallenge:             { title: 'Login Uvogin',               category: 'Security Misconfiguration', description: 'Faça login como Uvogin decifrandosua senha.' },
  nestedEasterEggChallenge:         { title: 'Nested Easter Egg',          category: 'Miscellaneous',          description: 'Decodifique o Easter egg para encontrar um segundo.' },
  nosqlDosChallenge:                { title: 'NoSQL DoS',                  category: 'NoSQL Injection',        description: 'Cause negação de serviço via injeção NoSQL.' },
  nosqlManipulationChallenge:       { title: 'NoSQL Manipulation',         category: 'NoSQL Injection',        description: 'Manipule a query NoSQL para alterar resultados.' },
  poisonNullBytesChallenge:         { title: 'Poison Null Bytes',          category: 'Improper Input Validation', description: 'Contorne restrições de acesso com null bytes.' },
  serverSideXssChallenge:           { title: 'Server-Side XSS Protection', category: 'XSS',                   description: 'Bypasseie a proteção XSS do lado servidor.' },
  steganographyChallenge:           { title: 'Steganography',              category: 'Sensitive Data Exposure',description: 'Encontre dados ocultos em imagens via esteganografia.' },
  userCredentialsChallenge:         { title: 'User Credentials',           category: 'SQLi',                  description: 'Exfiltre as credenciais de todos os usuários via SQLi.' },
  vulnerableLibraryChallenge:       { title: 'Vulnerable Library',         category: 'Vulnerable Components', description: 'Identifique uma biblioteca front-end com vulnerabilidade.' },
  xHeaderXssChallenge:              { title: 'X-Header XSS',               category: 'XSS',                   description: 'Execute XSS via um cabeçalho HTTP customizado.' },

  // ── 5-star ──
  blockchainHypeChallenge:          { title: 'Blockchain Hype',            category: 'Miscellaneous',          description: 'Implante um contrato inteligente malicioso.' },
  blockedRceDosChallenge:           { title: 'Blocked RCE DoS',            category: 'Injection',             description: 'Cause DoS usando um payload RCE bloqueado.' },
  changeBenderPasswordChallenge:    { title: "Change Bender's Password",   category: 'Broken Access Control',  description: 'Mude a senha de Bender sem conhecer a senha atual.' },
  crossSiteImagingChallenge:        { title: 'Cross-Site Imaging',         category: 'Sensitive Data Exposure',description: 'Exfiltre dados sensíveis via carregamento de imagem cross-origin.' },
  emailLeakChallenge:               { title: 'Email Leak',                 category: 'Sensitive Data Exposure',description: 'Vaze os endereços de e-mail de todos os usuários.' },
  extraLanguageChallenge:           { title: 'Extra Language',             category: 'Miscellaneous',          description: 'Explore a plataforma em um idioma não suportado.' },
  frontendTyposquattingChallenge:   { title: 'Frontend Typosquatting',     category: 'Vulnerable Components', description: 'Identifique o pacote front-end com nome suspeito.' },
  killChatbotChallenge:             { title: 'Kill Chatbot',               category: 'Miscellaneous',          description: 'Destrua o chatbot com um único comando de parada.' },
  leakedAccessLogChallenge:         { title: 'Leaked Access Log',          category: 'Sensitive Data Exposure',description: 'Acesse o log de acesso vazado do servidor.' },
  localFileReadChallenge:           { title: 'Local File Read (LFI)',       category: 'Injection',             description: 'Leia arquivos locais do servidor via path traversal.' },
  nosqlExfiltrationChallenge:       { title: 'NoSQL Exfiltration',         category: 'NoSQL Injection',        description: 'Exfiltre todos os dados via operadores NoSQL.' },
  resetBjoernPasswordChallenge:     { title: 'Reset Bjoern Password',      category: 'Security Misconfiguration', description: 'Resete a senha de Bjoern explorando recuperação fraca.' },
  resetMortyPasswordChallenge:      { title: 'Reset Morty Password',       category: 'Security Misconfiguration', description: 'Resete a senha de Morty via OSINT.' },
  retrieveBlueprintChallenge:       { title: 'Retrieve Blueprint',         category: 'Sensitive Data Exposure',description: 'Recupere o blueprint do produto principal.' },
  supplyChainAttackChallenge:       { title: 'Supply Chain Attack',        category: 'Vulnerable Components', description: 'Comprometa a cadeia de suprimentos de software.' },
  twoFactorAuthChallenge:           { title: '2FA Bypass',                 category: 'Security Misconfiguration', description: 'Bypasse a autenticação de dois fatores.' },
  unsignedJwtChallenge:             { title: 'Unsigned JWT',               category: 'Security Misconfiguration', description: 'Forje um JWT usando o algoritmo "none".' },

  // ── 6-star ──
  arbitraryFileWriteChallenge:      { title: 'Arbitrary File Write',       category: 'Injection',             description: 'Escreva arquivos arbitrários no servidor via path traversal.' },
  forgedCouponChallenge:            { title: 'Forged Coupon',              category: 'Cryptographic Issues',   description: 'Forje e aplique um cupom de desconto inativo.' },
  forgedSignedJwtChallenge:         { title: 'Forged Signed JWT',          category: 'Security Misconfiguration', description: 'Forje um JWT assinado para acessar área premium.' },
  imaginaryChallenge:               { title: 'Imaginary Challenge',        category: 'Miscellaneous',          description: 'Resolva o desafio que teoricamente não pode ser resolvido.' },
  loginSupportTeamChallenge:        { title: 'Login Support Team',         category: 'Security Misconfiguration', description: 'Faça login como o time de suporte via log vazado.' },
  multiplesLikesChallenge:          { title: 'Multiple Likes',             category: 'Broken Anti Automation', description: 'Curta a mesma review mais de uma vez.' },
  premiumPaywallChallenge:          { title: 'Premium Paywall',            category: 'Broken Access Control',  description: 'Acesse conteúdo premium sem assinar.' },
  ssrfChallenge:                    { title: 'SSRF',                       category: 'Injection',             description: 'Faça o servidor acessar recursos internos via SSRF.' },
  sstiChallenge:                    { title: 'SSTI',                       category: 'Injection',             description: 'Execute código via injeção em template server-side.' },
  successfulRceDosChallenge:        { title: 'Successful RCE DoS',         category: 'Injection',             description: 'Execute código remoto causando negação de serviço.' },
  videoXssChallenge:                { title: 'Video XSS',                  category: 'XSS',                   description: 'Execute XSS via legendas de vídeo.' },
  walletDepletionChallenge:         { title: 'Wallet Depletion',           category: 'Improper Input Validation', description: 'Esvazie a carteira de outro usuário com valor negativo.' },

  // ── Meta ──
  'visit-developer-page':           { title: 'Visit Developer Page',       category: 'Miscellaneous',          description: 'Visite a página oculta do desenvolvedor.' },
  'first-purchase':                 { title: 'First Purchase',             category: 'Miscellaneous',          description: 'Realize sua primeira compra na plataforma.' },
};

const CATEGORY_COLORS: Record<string, string> = {
  'XSS':                          '#e74c3c',
  'SQLi':                         '#e67e22',
  'Injection':                    '#c0392b',
  'NoSQL Injection':              '#d35400',
  'Broken Access Control':        '#8e44ad',
  'Security Misconfiguration':    '#2980b9',
  'Sensitive Data Exposure':      '#16a085',
  'Cryptographic Issues':         '#1abc9c',
  'Improper Input Validation':    '#27ae60',
  'Unvalidated Redirects':        '#f39c12',
  'Miscellaneous':                '#7f8c8d',
  'Observability Failures':       '#2c3e50',
  'Broken Anti Automation':       '#6c3483',
  'Vulnerable Components':        '#148f77',
  'Shenanigans':                  '#884ea0',
};

@Component({
  selector: 'app-score-board',
  templateUrl: './score-board.component.html',
  styleUrls: ['./score-board.component.scss'],
})
export class ScoreBoardComponent implements OnInit {
  allChallenges: ChallengeCard[] = [];
  filtered: ChallengeCard[] = [];
  loading = true;
  error = '';

  filterStars = 0;
  filterCategory = '';
  filterSolved: 'all' | 'solved' | 'unsolved' = 'all';
  searchTerm = '';

  myPoints = 0;
  solvedCount = 0;
  totalCount = 0;

  categories: string[] = [];

  constructor(private scoreService: ScoreService) {}

  ngOnInit(): void {
    this.scoreService.tryComplete('scoreBoardChallenge');
    this.load();
  }

  private load(): void {
    this.loading = true;
    let catalogDone = false;
    let meDone = false;
    const completedKeys = new Set<string>();

    const tryMerge = () => {
      if (!catalogDone || !meDone) return;
      this.allChallenges.forEach(c => { c.solved = completedKeys.has(c.key); });
      this.totalCount = this.allChallenges.length;
      this.solvedCount = this.allChallenges.filter(c => c.solved).length;
      this.categories = [...new Set(this.allChallenges.map(c => c.category))].sort();
      this.applyFilters();
      this.loading = false;
    };

    this.scoreService.catalog().subscribe({
      next: (res: any) => {
        const items: { key: string; points: number }[] = res?.data ?? res ?? [];
        this.allChallenges = items.map(({ key, points }) => {
          const meta = CHALLENGE_META[key] ?? { title: key, description: '', category: 'Miscellaneous' };
          const stars = points <= 10 ? 1 : points <= 20 ? 2 : points <= 30 ? 3 : points <= 40 ? 4 : points <= 50 ? 5 : 6;
          return { key, title: meta.title, description: meta.description, category: meta.category, stars, points, solved: false };
        });
        this.allChallenges.sort((a, b) => a.stars - b.stars || a.title.localeCompare(b.title));
        catalogDone = true;
        tryMerge();
      },
      error: () => { this.error = 'Não foi possível carregar os desafios.'; this.loading = false; },
    });

    this.scoreService.me().subscribe({
      next: (res: any) => {
        this.myPoints = res?.data?.points ?? 0;
        (res?.data?.completions ?? []).forEach((c: any) => completedKeys.add(c.key));
        meDone = true;
        tryMerge();
      },
      error: () => { meDone = true; tryMerge(); },
    });
  }

  applyFilters(): void {
    this.filtered = this.allChallenges.filter(c => {
      if (this.filterStars && c.stars !== this.filterStars) return false;
      if (this.filterCategory && c.category !== this.filterCategory) return false;
      if (this.filterSolved === 'solved' && !c.solved) return false;
      if (this.filterSolved === 'unsolved' && c.solved) return false;
      if (this.searchTerm) {
        const q = this.searchTerm.toLowerCase();
        return c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
      }
      return true;
    });
  }

  resetFilters(): void {
    this.filterStars = 0;
    this.filterCategory = '';
    this.filterSolved = 'all';
    this.searchTerm = '';
    this.applyFilters();
  }

  categoryColor(cat: string): string {
    return CATEGORY_COLORS[cat] ?? '#7f8c8d';
  }

  starsArray(n: number): number[] { return Array.from({ length: n }); }

  get progress(): number {
    return this.totalCount ? Math.round((this.solvedCount / this.totalCount) * 100) : 0;
  }
}
