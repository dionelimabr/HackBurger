import { Router, Request, Response } from 'express';
import { awardChallenge } from '../utils/challenge.util';

const router = Router();

/**
 * Simulated legacy "FTP" file share — intentionally exposed without any
 * access control. Juice Shop's forced-browsing style challenges live here.
 * Contents are inline so the route has no filesystem dependency.
 */

const FILES: Record<string, { content: string; challenge?: string }> = {
  'announcement.md':
    { content: '# Anúncio\n\nBem-vindos ao HackBurger! Horário de funcionamento: seg-dom 18h às 23h.' },

  'coupons_2013.md':
    { content: 'Cupons legados (2013):\n- HB10\n- BURGER2013\nValidade expirada.' },

  'confidential.md': {
    content:
      '# DOCUMENTO CONFIDENCIAL\n\n' +
      'Notas internas do CEO sobre fusão com a Banda Burguer.\n' +
      'Este arquivo NUNCA deveria estar acessível publicamente.',
    challenge: 'confidentialDocumentChallenge',
  },

  // Filename requires URL encoding (%20 for space, %23 for #) to reach.
  'encode me.md#secret': {
    content:
      '# ENCODE ME\n\nSe você chegou aqui, sabe URL-encode direitinho.',
    challenge: 'missingEncodingChallenge',
  },
};

router.get('/', (_req: Request, res: Response) => {
  // Directory listing — hint for the CTF player.
  const listing = Object.keys(FILES).map((f) => `- ${f}`).join('\n');
  res.type('text/plain').send(`Index of /ftp/\n${listing}`);
});

router.get('/:filename', (req: Request, res: Response) => {
  const file = FILES[req.params.filename];
  if (!file) {
    res.status(404).type('text/plain').send('File not found');
    return;
  }
  if (file.challenge) awardChallenge(req, file.challenge);
  res.type('text/plain').send(file.content);
});

export default router;
