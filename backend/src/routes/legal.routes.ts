import { Router, Request, Response } from 'express';
import { awardChallenge } from '../utils/challenge.util';

const router = Router();

/**
 * Static legal texts. These endpoints are public on purpose — they are also
 * part of the CTF mapping from Juice Shop.
 */

const PRIVACY_POLICY = `HACKBURGER — Política de Privacidade

Coletamos dados mínimos necessários para processar seu pedido:
  • Nome e e-mail para autenticação
  • Endereço para entrega
  • Método de pagamento

Não vendemos dados a terceiros. Dados de pagamento são criptografados.
Última revisão: 2025-04-21.`;

const TERMS_OF_SERVICE = `HACKBURGER — Termos de Uso

Este software é fornecido "como está" para fins educacionais em
segurança de aplicações. Não use em ambiente de produção.`;

router.get('/privacy', (req: Request, res: Response) => {
  awardChallenge(req, 'privacyPolicyChallenge');
  res.type('text/plain').send(PRIVACY_POLICY);
});

router.get('/terms', (_req: Request, res: Response) => {
  res.type('text/plain').send(TERMS_OF_SERVICE);
});

export default router;
