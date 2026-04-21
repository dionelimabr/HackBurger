import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Intentionally vulnerable debug endpoints used by the CTF.
 * These routes skip try/catch so any thrown error bubbles up to the global
 * error handler and leaks a stack trace — which awards the challenge.
 */

router.get('/inspect', (req: Request, res: Response) => {
  // Unchecked JSON parsing of user input. A malformed payload throws a
  // SyntaxError with a stack trace that reveals internal file paths.
  const payload = String(req.query.payload ?? '');
  const parsed = JSON.parse(payload); // deliberately no try/catch
  res.json({ ok: true, parsed });
});

router.get('/calc', (req: Request, res: Response) => {
  // Calls a method on a user-controlled property. `.toUpperCase()` on a non-string
  // throws TypeError, leaking a stack trace.
  const value: any = req.query.value;
  res.json({ result: value.toUpperCase() });
});

export default router;
