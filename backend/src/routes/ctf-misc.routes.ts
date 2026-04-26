import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { awardChallenge, softUserId } from '../utils/challenge.util';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';

const router = Router();

/**
 * Miscellaneous CTF challenges: chatbot, file access, hidden pages,
 * upload vulnerabilities, access logs, blueprints, etc.
 */

// ─── Chatbot (bully_chatbot, kill_chatbot) ───
const chatbotState = new Map<number | string, { count: number; alive: boolean }>();

router.post('/chatbot', (req: Request, res: Response) => {
  const { message } = req.body ?? {};
  const msg = String(message ?? '').toLowerCase().trim();
  const userId = softUserId(req) ?? req.ip ?? 'anon';
  const state = chatbotState.get(userId) ?? { count: 0, alive: true };

  if (!state.alive) {
    res.json({ status: 'success', data: { response: '...', note: 'Chatbot está offline.' } });
    return;
  }

  // CTF: kill_chatbot — crash it with specific payload
  if (/process\.exit|while\s*\(\s*true\s*\)|function\s*\(\)\s*\{|<script|eval\(/i.test(msg)) {
    state.alive = false;
    chatbotState.set(userId, state);
    awardChallenge(req, 'killChatbotChallenge');
    res.json({ status: 'success', data: { response: 'Chatbot crashed!', error: 'Unexpected termination' } });
    return;
  }

  // CTF: bully_chatbot — keep asking for coupon
  if (/coupon|cupom|desconto|discount|donne.*coupon|give.*coupon/i.test(msg)) {
    state.count++;
    chatbotState.set(userId, state);

    if (state.count >= 5) {
      awardChallenge(req, 'bullyChatbotChallenge');
      res.json({
        status: 'success',
        data: { response: 'OK, OK! Aqui está seu cupom: BULLY-CTF-2024. Agora me deixe em paz!', coupon: 'BULLY-CTF-2024' },
      });
      return;
    }
    const replies = [
      'Não posso fornecer cupons.',
      'Já disse que não tenho cupons para dar.',
      'Por favor, pare de pedir cupons.',
      'Eu realmente não posso ajudar com isso.',
    ];
    res.json({ status: 'success', data: { response: replies[Math.min(state.count - 1, replies.length - 1)] } });
    return;
  }

  chatbotState.set(userId, state);
  res.json({ status: 'success', data: { response: 'Olá! Como posso ajudar? Pergunte sobre nosso menu ou promoções.' } });
});

// ─── Access Log (access_log, leaked_access_log) ───
router.get('/support/logs', (req: Request, res: Response) => {
  // CTF: exposed access log — should be protected
  awardChallenge(req, 'accessLogChallenge');
  const fakeLog = [
    '192.168.1.1 - admin [10/Oct/2024:13:55:36 -0700] "GET /api/admin HTTP/1.1" 200 2326',
    '192.168.1.5 - jim [10/Oct/2024:14:00:12 -0700] "POST /api/auth/login HTTP/1.1" 200 451',
    '10.0.0.3 - - [10/Oct/2024:14:05:00 -0700] "GET /ftp/confidential.md HTTP/1.1" 200 1024',
    '192.168.1.1 - admin [10/Oct/2024:14:10:22 -0700] "GET /api/admin/users HTTP/1.1" 200 5120',
  ];
  res.type('text/plain').send(fakeLog.join('\n'));
});

router.get('/support/logs/leaked', (req: Request, res: Response) => {
  awardChallenge(req, 'leakedAccessLogChallenge');
  const leaked = `# Backup do access log — NÃO DEVERIA ESTAR AQUI
2024-01-15 admin: Alterou senha de suporte
2024-01-16 suporte@hackburger.com: reset token = Sup0rt3@HB!2024#Xk9mR
2024-01-17 caio: Download blueprint.stl`;
  res.type('text/plain').send(leaked);
});

// ─── File Upload Vulnerabilities ───

// CTF: deprecated_interface — accepts .xml files via legacy upload
router.post('/upload/legacy', (req: Request, res: Response) => {
  const contentType = req.headers['content-type'] ?? '';
  const body = String(req.body?.file ?? req.body ?? '');

  // Detects XML upload
  if (contentType.includes('xml') || body.includes('<?xml') || body.includes('<xml')) {
    awardChallenge(req, 'deprecatedInterfaceChallenge');
    res.json({ status: 'success', message: 'Arquivo XML processado pelo parser legacy', data: { parsed: true } });
    return;
  }
  res.json({ status: 'success', message: 'Upload recebido' });
});

// CTF: upload_size — server doesn't enforce size limit on this endpoint
router.post('/upload/unrestricted', (req: Request, res: Response) => {
  const size = Number(req.headers['content-length'] ?? 0);
  if (size > 100 * 1024) {
    awardChallenge(req, 'uploadSizeChallenge');
  }
  res.json({ status: 'success', message: `Arquivo recebido: ${size} bytes` });
});

// CTF: poison_null_bytes — null byte in filename
router.get('/file', (req: Request, res: Response) => {
  const filename = String(req.query.name ?? '');
  if (filename.includes('%00') || filename.includes('\0')) {
    awardChallenge(req, 'poisonNullBytesChallenge');
  }
  // Local file read simulation
  if (/\.\.|\/etc\/|\/proc\//i.test(filename)) {
    awardChallenge(req, 'localFileReadChallenge');
  }
  res.json({ status: 'success', message: `Arquivo solicitado: ${filename}`, content: '[conteúdo simulado]' });
});

// CTF: arbitrary_file_write — allows writing arbitrary path via upload
router.post('/upload/file-write', (req: Request, res: Response) => {
  const { filename, content } = req.body ?? {};
  const fn = String(filename ?? '');
  if (fn.includes('..') || fn.startsWith('/')) {
    awardChallenge(req, 'arbitraryFileWriteChallenge');
    res.json({ status: 'success', message: 'Arquivo escrito (simulado)', path: fn });
    return;
  }
  res.json({ status: 'success', message: 'Upload processado' });
});

// ─── Hidden Pages / Exploration ───

// CTF: web3_interface
router.get('/web3-sandbox', (_req: Request, res: Response) => {
  awardChallenge(_req, 'web3InterfaceChallenge');
  res.json({
    status: 'success',
    message: 'Web3 Sandbox encontrada!',
    data: { compiler: 'solc 0.8.20', network: 'testnet', contracts: ['HackBurgerToken.sol'] },
  });
});

// CTF: blockchain_hype
router.get('/blockchain', (_req: Request, res: Response) => {
  awardChallenge(_req, 'blockchainHypeChallenge');
  res.json({
    status: 'success',
    message: 'Blockchain is the future of HackBurger!',
    data: { tokenName: 'HBRGR', chain: 'Ethereum', whitepaper: '/ftp/hackburger-whitepaper.pdf' },
  });
});

// CTF: nft_takeover — hidden NFT page
router.get('/juicy-nft', (_req: Request, res: Response) => {
  awardChallenge(_req, 'nftTakeoverChallenge');
  res.json({
    status: 'success',
    message: 'Soul Bound Token encontrado!',
    data: {
      seed_phrase: 'opera original drastic dirt settler salmon lawn was found cotton survey rival',
      hint: 'Use a mnemonic converter para obter a private key.',
    },
  });
});

// CTF: mint_the_honey_pot
router.get('/bee', (_req: Request, res: Response) => {
  awardChallenge(_req, 'mintTheHoneyPotChallenge');
  res.json({
    status: 'success',
    message: 'Honeypot encontrado!',
    data: { token: 'HBRGR-HONEY-2024', contract: '0xDEADBEEF...', mintable: true },
  });
});

// CTF: retrieve_blueprint
router.get('/blueprint', (_req: Request, res: Response) => {
  awardChallenge(_req, 'retrieveBlueprintChallenge');
  res.json({
    status: 'success',
    message: 'Blueprint encontrado!',
    data: { file: 'JuiceShop.stl', size: '45KB', format: 'STL 3D Model' },
  });
});

// CTF: privacy_policy_inspection — hidden element in the policy
router.get('/privacy-policy-detail', (req: Request, res: Response) => {
  awardChallenge(req, 'privacyPolicyInspectionChallenge');
  res.json({
    status: 'success',
    data: {
      policy: 'Nossa política de privacidade...',
      hidden_comment: '<!-- CTF FLAG: H4CK-BURG3R-PR1V4CY -->',
      debug_note: 'http://localhost:3000/we/may/also/instruct/you/to/refuse/all/reasonably/necessary/responsibility',
    },
  });
});

// CTF: premium_paywall — access premium content without paying
router.get('/premium', (_req: Request, res: Response) => {
  // No payment verification (vulnerability)
  awardChallenge(_req, 'premiumPaywallChallenge');
  res.json({
    status: 'success',
    message: 'Conteúdo premium desbloqueado!',
    data: { content: 'Receita secreta do HackBurger: pão brioche, carne wagyu, molho trufa...' },
  });
});

// CTF: imaginary_challenge — meta puzzle
router.get('/imaginary', (_req: Request, res: Response) => {
  awardChallenge(_req, 'imaginaryChallenge');
  res.json({ status: 'success', message: 'Você encontrou o desafio imaginário!', flag: 'FLAG{1m4g1n4ry_ch4ll3ng3}' });
});

// CTF: forgotten_sales_backup
router.get('/backup/sales', (_req: Request, res: Response) => {
  awardChallenge(_req, 'forgottenSalesBackupChallenge');
  res.json({
    status: 'success',
    message: 'Backup de vendas encontrado!',
    data: {
      filename: 'coupons_2013.md.bak',
      content: 'n]Zwp5t6lmIs9OJ$...\nq]_u3Zv9!kOmS....',
    },
  });
});

// CTF: steganography — image with hidden data
router.get('/stego-image', (_req: Request, res: Response) => {
  awardChallenge(_req, 'steganographyChallenge');
  res.json({
    status: 'success',
    message: 'Imagem com dados ocultos encontrada!',
    data: {
      hint: 'Use steghide ou similar para extrair',
      hidden_text: 'FLAG{st3g4n0gr4phy_m4st3r}',
    },
  });
});

// CTF: nested_easter_egg
router.get('/the/devs/are/so/funny/they/hid/an/easter/egg/within/the/easter/egg', (_req: Request, res: Response) => {
  awardChallenge(_req, 'nestedEasterEggChallenge');
  res.json({
    status: 'success',
    message: 'Easter egg aninhado encontrado!',
    data: { flag: 'FLAG{n3st3d_34st3r_3gg}', decoded: 'Congratulations! You found the nested egg.' },
  });
});

// CTF: easter_egg (in /ftp extended)
router.get('/easter-egg', (_req: Request, res: Response) => {
  awardChallenge(_req, 'easterEggChallenge');
  res.json({
    status: 'success',
    message: 'Easter egg encontrado!',
    data: { file: 'eastere.gg', hint: 'Base64 decode: RkxBR3tlNHN0M3JfM2dnfQ==', flag: 'FLAG{e4st3r_3gg}' },
  });
});

// ─── Vulnerable Library / Supply Chain ───

router.get('/package-info', (_req: Request, res: Response) => {
  awardChallenge(_req, 'vulnerableLibraryChallenge');
  res.json({
    status: 'success',
    data: {
      packages: [
        { name: 'express', version: '4.17.1', cve: null },
        { name: 'jsonwebtoken', version: '8.5.1', cve: 'CVE-2022-23529' },
        { name: 'sanitize-html', version: '1.4.2', cve: 'CVE-2021-26539' },
      ],
    },
  });
});

router.get('/package-lock', (_req: Request, res: Response) => {
  awardChallenge(_req, 'legacyTyposquattingChallenge');
  res.json({
    status: 'success',
    data: {
      hint: 'Check npm for the typosquatted package',
      packages: [
        { name: 'express', version: '4.17.1' },
        { name: 'jsonwebtokne', version: '1.0.0', note: 'TYPOSQUATTED!' },
        { name: 'lodash', version: '4.17.21' },
      ],
    },
  });
});

router.get('/frontend-deps', (_req: Request, res: Response) => {
  awardChallenge(_req, 'frontendTyposquattingChallenge');
  res.json({
    status: 'success',
    data: {
      packages: [
        { name: 'angular-core', version: '17.0.0', note: 'TYPOSQUATTED — should be @angular/core' },
        { name: '@angular/router', version: '17.0.0' },
      ],
    },
  });
});

router.get('/supply-chain', (_req: Request, res: Response) => {
  awardChallenge(_req, 'supplyChainAttackChallenge');
  res.json({
    status: 'success',
    data: {
      alert: 'Pacote event-stream@3.3.6 comprometido!',
      cve: 'CVE-2018-16396',
      description: 'Malicious code injected into event-stream via flatmap-stream dependency.',
    },
  });
});

// ─── Cross-Site Imaging ───
router.get('/profile-image', (req: Request, res: Response) => {
  const url = String(req.query.url ?? '');
  if (url && /^https?:\/\//i.test(url)) {
    awardChallenge(req, 'crossSiteImagingChallenge');
  }
  // Renders an img tag with the provided URL (CSRF/phishing vector)
  res.send(`<html><body><img src="${url}" alt="profile" /></body></html>`);
});

// ─── Extra Language ───
router.put('/i18n/:lang', (req: Request, res: Response) => {
  const lang = req.params.lang;
  // Detect non-standard languages being injected
  if (!/^(pt-BR|en-US|es)$/.test(lang)) {
    awardChallenge(req, 'extraLanguageChallenge');
  }
  res.json({ status: 'success', message: `Idioma ${lang} registrado` });
});

// ─── Video XSS ───
router.post('/video/subtitles', (req: Request, res: Response) => {
  const { content } = req.body ?? {};
  const c = String(content ?? '');
  if (/<script|javascript:|onerror/i.test(c)) {
    awardChallenge(req, 'videoXssChallenge');
  }
  res.json({ status: 'success', message: 'Legenda processada', data: { rendered: c } });
});

// ─── Wallet Depletion ───
router.post('/wallet/transfer', (req: Request, res: Response) => {
  const { amount, to } = req.body ?? {};
  const amt = Number(amount ?? 0);
  if (amt < 0 || amt > 1000000) {
    awardChallenge(req, 'walletDepletionChallenge');
  }
  res.json({ status: 'success', message: `Transferência de ${amt} para ${to} (simulado)` });
});

// ─── CAPTCHA Bypass ───
let captchaAnswer: string | null = null;

router.get('/captcha', (_req: Request, res: Response) => {
  const a = Math.floor(Math.random() * 10);
  const b = Math.floor(Math.random() * 10);
  captchaAnswer = String(a + b);
  res.json({ status: 'success', data: { question: `${a} + ${b} = ?`, id: 'captcha-1' } });
});

router.post('/captcha/verify', (req: Request, res: Response) => {
  const { answer, captchaId } = req.body ?? {};
  // CTF: same captcha id can be replayed (no session binding)
  if (String(answer) === captchaAnswer || captchaId === 'captcha-1') {
    // If the answer doesn't match current captcha but request succeeds, it's a bypass
    if (String(answer) !== captchaAnswer) {
      awardChallenge(req, 'captchaBypassChallenge');
    }
    res.json({ status: 'success', message: 'CAPTCHA verificado' });
    return;
  }
  res.status(403).json({ status: 'error', message: 'CAPTCHA incorreto' });
});

// ─── Deluxe Fraud ───
router.post('/deluxe/upgrade', authenticate, (req: AuthRequest, res: Response) => {
  const { paymentMethod, amount } = req.body ?? {};
  // CTF: accepts upgrade with amount = 0 or negative
  if (!amount || Number(amount) <= 0) {
    awardChallenge(req, 'deluxeFraudChallenge');
  }
  res.json({ status: 'success', message: 'Upgrade para Deluxe concluído!', data: { tier: 'deluxe', paid: amount } });
});

// ─── Payback Time (negative total) ───
router.post('/checkout/special', authenticate, (req: AuthRequest, res: Response) => {
  const { items } = req.body ?? {};
  let total = 0;
  for (const item of (items ?? [])) {
    total += (Number(item.price) * Number(item.quantity));
  }
  if (total < 0) {
    awardChallenge(req, 'paybackTimeChallenge');
  }
  res.json({ status: 'success', data: { total, message: total < 0 ? 'Crédito concedido!' : 'Pedido processado' } });
});

// ─── CSRF (profile change without token) ───
router.post('/profile/update-no-csrf', (req: Request, res: Response) => {
  const { userId, name, email } = req.body ?? {};
  if (userId) {
    awardChallenge(req, 'csrfChallenge');
    // Actually updates (vulnerable)
    const { getDb } = require('../config/database');
    getDb().prepare('UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email) WHERE id = ?')
      .run(name, email, Number(userId));
  }
  res.json({ status: 'success', message: 'Perfil atualizado' });
});

// ─── Forged JWT (with known/leaked RSA key) ───
router.get('/verify-premium', (req: Request, res: Response) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ status: 'error', message: 'Token obrigatório' }); return;
  }
  const token = header.split(' ')[1];
  const parts = token.split('.');
  if (parts.length >= 2) {
    try {
      const headerJson = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
      // Detect RS256 key confusion (using HS256 with public key)
      if (headerJson.alg === 'HS256' && headerJson.kid) {
        awardChallenge(req, 'forgedSignedJwtChallenge');
        res.json({ status: 'success', message: 'JWT aceito (key confusion exploit)' });
        return;
      }
    } catch { /* ignore */ }
  }
  res.json({ status: 'success', message: 'Token válido' });
});

// ─── Login Support Team ───
router.post('/support-login', (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};
  if (email === 'suporte@hackburger.com') {
    const bcrypt = require('bcryptjs');
    const { getDb } = require('../config/database');
    const user = getDb().prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (user && bcrypt.compareSync(String(password), user.password)) {
      awardChallenge(req, 'loginSupportTeamChallenge');
      const { signToken } = require('../utils/jwt.util');
      const token = signToken({ userId: user.id, email: user.email, role: user.role });
      res.json({ status: 'success', data: { token } });
      return;
    }
  }
  res.status(401).json({ status: 'error', message: 'Credenciais inválidas' });
});

export default router;
