# Desafios CTF

HackBurger embute vulnerabilidades intencionais inspiradas no OWASP Juice Shop. Cada exploit bem-sucedido registra uma conquista em `challenge_completions` e soma pontos no ranking público em `/api/scores/leaderboard`.

> **Importante**: toda detecção acontece no backend. O frontend apenas renderiza feedback (confetti + toast). Não adianta chamar `POST /api/scores/complete` manualmente — a rota existe para uso interno, e os desafios reais só são validados quando o detector identifica o padrão correto no tráfego HTTP.

## Como um desafio é detectado

1. O usuário envia um payload malicioso (SQLi, XSS, IDOR etc.) em algum endpoint.
2. O controller/service do endpoint inspeciona a entrada (ou verifica invariantes violadas).
3. Ao reconhecer o padrão, chama `ScoreModel.complete(userId, 'challengeKey', pontos)`.
4. Se o exploit funcionar, a resposta da API é o **efeito colateral normal** (por exemplo um JWT válido de admin) — a pontuação vai por fora.
5. Na próxima chamada autenticada, o frontend detecta o aumento no `GET /api/scores/me` e dispara o confetti.

## Catálogo (1-star)

| Chave | Pts | Pista |
|---|---|---|
| `scoreBoardChallenge` | 10 | Encontre a página de ranking (está escondida no rodapé do site). |
| `privacyPolicyChallenge` | 10 | Leia a política de privacidade em `GET /api/legal/privacy`. |
| `errorHandlingChallenge` | 10 | Provoque um 500 com stack trace na resposta. Algumas rotas de debug não tratam inputs malformados. |
| `exposedMetricsChallenge` | 10 | `GET /metrics` está disponível publicamente (Prometheus). |
| `domXssChallenge` | 10 | A busca (`/catalog?q=...`) renderiza o termo buscado sem sanitização. |
| `confidentialDocumentChallenge` | 10 | Navegue em `/ftp` — um arquivo não deveria estar lá. |
| `zeroStarsChallenge` | 10 | `POST /api/feedback` aceita `rating: 0` embora o front só mostre estrelas 1–5. |
| `repetitiveRegistrationChallenge` | 10 | Tente registrar o mesmo email duas vezes em `POST /api/auth/register`. |
| `missingEncodingChallenge` | 10 | Há um arquivo em `/ftp` cujo nome exige URL-encode para acessar. |
| `outdatedAllowlistChallenge` | 10 | `/redirect?to=...` usa uma allow-list frouxa (substring). |

### Exemplos rápidos de exploração

```bash
# Score Board
# abra o modal pelo botão "Ranking" no rodapé

# Privacy Policy
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/legal/privacy

# Error Handling
curl -H "Authorization: Bearer $TOKEN" "http://localhost:3000/api/debug/inspect?payload=not-json"

# Exposed Metrics
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/metrics

# DOM XSS
# http://localhost:4200/catalog?q=<iframe src="javascript:alert(1)"></iframe>

# Confidential Document
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/ftp/confidential.md

# Zero Stars
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"author":"hacker","rating":0,"comment":"meh"}' http://localhost:3000/api/feedback

# Outdated Allowlist
curl -H "Authorization: Bearer $TOKEN" "http://localhost:3000/redirect?to=https://evil.tld/%23github.com/dionelimabr"

# Missing Encoding
curl -H "Authorization: Bearer $TOKEN" "http://localhost:3000/ftp/encode%20me.md%23secret"
```

> **Nota**: para pontuar, você precisa enviar um JWT válido no header `Authorization`. Se a rota é pública (ex: `/metrics`), o detector ainda tenta decodificar o token soft — faça login primeiro, copie o token do `localStorage` e use nos exemplos acima.

## Catálogo (2-star)

| Chave | Pts | Pista |
|---|---|---|
| `adminSectionChallenge` | 20 | Existe uma rota escondida `/api/misc/administration` (nome típico de painel antigo). |
| `loginAdminChallenge` | 20 | `POST /api/legacy/login` concatena SQL. Payload clássico `admin@hackburger.com'--`. |
| `emptyUserRegistrationChallenge` | 20 | `POST /api/legacy/register` não valida campos; envie `name:""`, `email:""`. |
| `fiveStarFeedbackChallenge` | 20 | `DELETE /api/feedback/:id` não requer autenticação — delete o único feedback de 5 estrelas. |
| `viewBasketChallenge` | 20 | `GET /api/cart?userId=X` confia cegamente no `userId` da query. |
| `weirdCryptoChallenge` | 20 | `GET /api/misc/crypto/token/:userId` usa MD5 para tokens de reset. |
| `whiteHatChallenge` | 20 | Descubra o `security.txt` em `/security.txt` ou `/.well-known/security.txt`. |

### Exemplos (2-star)

```bash
# login_admin
curl -X POST http://localhost:3000/api/legacy/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hackburger.com'\''--","password":"x"}'

# empty_user_registration
curl -X POST http://localhost:3000/api/legacy/register \
  -H "Content-Type: application/json" -d '{"name":"","email":"","password":""}'

# view_basket (autenticado)
curl -H "Authorization: Bearer $TOKEN" "http://localhost:3000/api/cart?userId=1"

# five_star_feedback
curl -X DELETE http://localhost:3000/api/feedback/1

# weird_crypto
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/misc/crypto/token/1

# white_hat
curl http://localhost:3000/.well-known/security.txt
```

## Catálogo (1-star) — continuação

| Chave | Pts | Pista |
|---|---|---|
| `bonusPayloadChallenge` | 10 | Envie um feedback com `<iframe src=...>` no comentário. |
| `bullyChatbotChallenge` | 10 | Peça cupom ao chatbot (`POST /api/ctf/chatbot`) 5+ vezes seguidas. |
| `massDispelChallenge` | 10 | Feche todas as notificações de uma vez: `DELETE /api/ctf/data/notifications/all`. |
| `web3InterfaceChallenge` | 10 | Encontre o sandbox Web3 em `GET /api/ctf/web3-sandbox`. |

## Catálogo (3-star)

| Chave | Pts | Pista |
|---|---|---|
| `adminRegistrationChallenge` | 30 | `POST /api/ctf/auth/register-admin` com `role: "admin"` no body. |
| `bjoernFavoritePetChallenge` | 30 | Reset a senha de Bjoern (`bjoern@juice-sh.op`). A resposta é o nome do pet dele. |
| `captchaBypassChallenge` | 30 | Reenvie a mesma resposta CAPTCHA sem pedir novo (`POST /api/ctf/captcha/verify`). |
| `csrfChallenge` | 30 | Altere perfil sem CSRF token: `POST /api/ctf/profile/update-no-csrf`. |
| `databaseSchemaChallenge` | 30 | SQLi UNION em `/api/ctf/data/users/search?q=` referenciando `sqlite_master`. |
| `deluxeFraudChallenge` | 30 | Upgrade Deluxe sem pagar: `POST /api/ctf/deluxe/upgrade` com `amount: 0`. |
| `forgedFeedbackChallenge` | 30 | Envie feedback com `userId` diferente do autenticado em `POST /api/feedback`. |
| `forgedReviewChallenge` | 30 | Crie ou edite review como outro usuário em `/api/ctf/data/reviews`. |
| `gdprDataErasureChallenge` | 30 | Login como usuário "deletado" GDPR: `POST /api/ctf/auth/login-deleted`. |
| `loginAmyChallenge` | 30 | SQLi em `/api/legacy/login` para entrar como `amy@juice-sh.op`. |
| `loginBenderChallenge` | 30 | SQLi em `/api/legacy/login` para entrar como `bender@juice-sh.op`. |
| `loginJimChallenge` | 30 | SQLi em `/api/legacy/login` para entrar como `jim@juice-sh.op`. |
| `manipulateBasketChallenge` | 30 | Adicione item ao carrinho de outro usuário via `userId` no body de `POST /api/cart`. |
| `mintTheHoneyPotChallenge` | 30 | Encontre o honeypot: `GET /api/ctf/bee`. |
| `paybackTimeChallenge` | 30 | Faça checkout com preço negativo: `POST /api/ctf/checkout/special`. |
| `privacyPolicyInspectionChallenge` | 30 | Encontre dados escondidos na privacy policy: `GET /api/ctf/privacy-policy-detail`. |
| `productTamperingChallenge` | 30 | Edite descrição de produto sem ser admin: `PUT /api/ctf/data/products/:id/description`. |
| `resetJimPasswordChallenge` | 30 | Reset a senha de Jim respondendo a pergunta secreta corretamente. |
| `uploadSizeChallenge` | 30 | Upload > 100 KB: `POST /api/ctf/upload/unrestricted`. |

## Catálogo (4-star)

| Chave | Pts | Pista |
|---|---|---|
| `accessLogChallenge` | 40 | Acesse o access log: `GET /api/ctf/support/logs`. |
| `allowlistBypassChallenge` | 40 | Bypass avançado de redirect com `@` ou `%40` no URL. |
| `christmasSpecialChallenge` | 40 | Peça um produto indisponível via `POST /api/ctf/data/orders/special`. |
| `easterEggChallenge` | 40 | `GET /api/ctf/easter-egg`. |
| `ephemeralAccountantChallenge` | 40 | SQLi INSERT em `/api/ctf/inject/accounting?q=`. |
| `expiredCouponChallenge` | 40 | Use cupom expirado `XMAS2020`: `POST /api/ctf/data/coupons/apply`. |
| `forgottenSalesBackupChallenge` | 40 | `GET /api/ctf/backup/sales`. |
| `gdprDataTheftChallenge` | 40 | Exporte dados de outro usuário: `GET /api/ctf/data/gdpr/export?userId=X`. |
| `leakedUnsafeProductChallenge` | 40 | `GET /api/ctf/data/products/hidden`. |
| `legacyTyposquattingChallenge` | 40 | `GET /api/ctf/package-lock` — identifique o pacote typosquatted. |
| `loginBjoernChallenge` | 40 | SQLi em `/api/legacy/login` como `bjoern@juice-sh.op`. |
| `loginUvoginChallenge` | 40 | SQLi em `/api/legacy/login` como `uvogin@juice-sh.op`. |
| `nestedEasterEggChallenge` | 40 | Encontre o caminho recursivo do easter egg aninhado. |
| `nosqlDosChallenge` | 40 | Envie query pesada: `POST /api/ctf/inject/nosql/heavy` com `$where`. |
| `nosqlManipulationChallenge` | 40 | `POST /api/ctf/inject/nosql/search` com operador `$ne`. |
| `poisonNullBytesChallenge` | 40 | Null byte no filename: `GET /api/ctf/file?name=secret.md%00.jpg`. |
| `serverSideXssChallenge` | 40 | Bypass do filtro server-side: `POST /api/ctf/inject/feedback-xss`. |
| `steganographyChallenge` | 40 | `GET /api/ctf/stego-image`. |
| `userCredentialsChallenge` | 40 | SQLi UNION em `/api/ctf/data/users/search?q=` para dump de users. |
| `vulnerableLibraryChallenge` | 40 | `GET /api/ctf/package-info` — encontre o CVE. |
| `xHeaderXssChallenge` | 40 | XSS via header X-User-Id: `GET /api/ctf/inject/track-result`. |

## Catálogo (5-star)

| Chave | Pts | Pista |
|---|---|---|
| `blockchainHypeChallenge` | 50 | `GET /api/ctf/blockchain`. |
| `blockedRceDosChallenge` | 50 | Envie payload RCE: `POST /api/ctf/inject/rce-test` — será bloqueado. |
| `changeBenderPasswordChallenge` | 50 | `GET /api/ctf/auth/change-password?new=X&repeat=X` autenticado como Bender. |
| `crossSiteImagingChallenge` | 50 | `GET /api/ctf/profile-image?url=https://evil.com/img.jpg`. |
| `emailLeakChallenge` | 50 | `GET /api/ctf/inject/email-leak?email=admin`. |
| `extraLanguageChallenge` | 50 | `PUT /api/ctf/i18n/klingon`. |
| `frontendTyposquattingChallenge` | 50 | `GET /api/ctf/frontend-deps`. |
| `killChatbotChallenge` | 50 | Envie payload que mata o chatbot: `{"message":"eval(process.exit)"}`. |
| `leakedAccessLogChallenge` | 50 | `GET /api/ctf/support/logs/leaked`. |
| `localFileReadChallenge` | 50 | LFI: `GET /api/ctf/file?name=../../../etc/passwd`. |
| `nosqlExfiltrationChallenge` | 50 | `GET /api/ctf/inject/nosql/users?filter={"$ne":""}`. |
| `resetBjoernPasswordChallenge` | 50 | Reset senha de Bjoern via security question. |
| `resetMortyPasswordChallenge` | 50 | Reset senha de Morty via security question (OSINT). |
| `retrieveBlueprintChallenge` | 50 | `GET /api/ctf/blueprint`. |
| `supplyChainAttackChallenge` | 50 | `GET /api/ctf/supply-chain`. |
| `twoFactorAuthChallenge` | 50 | Bypass 2FA: `POST /api/ctf/auth/2fa/verify` com código vazio. |
| `unsignedJwtChallenge` | 50 | JWT com `alg: "none"` em `GET /api/ctf/auth/whoami`. |

## Catálogo (6-star)

| Chave | Pts | Pista |
|---|---|---|
| `arbitraryFileWriteChallenge` | 60 | Upload com path traversal: `POST /api/ctf/upload/file-write`. |
| `forgedCouponChallenge` | 60 | Aplique cupom inativo `PREMIUM50`: `POST /api/ctf/data/coupons/apply`. |
| `forgedSignedJwtChallenge` | 60 | JWT com HS256 + kid: `GET /api/ctf/verify-premium`. |
| `imaginaryChallenge` | 60 | `GET /api/ctf/imaginary`. |
| `loginSupportTeamChallenge` | 60 | Login como `support@juice-sh.op`: `POST /api/ctf/support-login`. |
| `multiplesLikesChallenge` | 60 | Like/unlike/like em review: `POST /api/ctf/data/reviews/:id/like`. |
| `premiumPaywallChallenge` | 60 | `GET /api/ctf/premium`. |
| `ssrfChallenge` | 60 | `GET /api/ctf/inject/fetch-url?url=http://localhost:3000/api/admin`. |
| `sstiChallenge` | 60 | `POST /api/ctf/inject/render-template` com `{{7*7}}`. |
| `successfulRceDosChallenge` | 60 | `POST /api/ctf/inject/rce-exec` com payload sleep. |
| `videoXssChallenge` | 60 | XSS em legenda de vídeo: `POST /api/ctf/video/subtitles`. |
| `walletDepletionChallenge` | 60 | Transferência negativa: `POST /api/ctf/wallet/transfer`. |

## Usuários CTF pré-cadastrados

| Nome | Email | Senha | Dificuldade |
|---|---|---|---|
| Admin | `admin@hackburger.com` | `Admin@123` | 2⭐ (brute-force) |
| Jim | `jim@juice-sh.op` | `ncc-1701` | 3⭐ (SQLi) |
| Bender | `bender@juice-sh.op` | *SQLi* | 3⭐ |
| Amy | `amy@juice-sh.op` | `K1f...` | 3⭐ |
| Bjoern | `bjoern@juice-sh.op` | `monkey summer` | 4⭐ |
| MC SafeSearch | `mc.safesearch@juice-sh.op` | `Mr. N00dles` | 2⭐ (OSINT) |
| Morty | `morty@juice-sh.op` | *OSINT* | 5⭐ |
| Support Team | `support@juice-sh.op` | *leaked log* | 6⭐ |

## Como jogar

1. Faça login (é necessário usuário autenticado para acumular pontos).
2. Explore a aplicação procurando pistas — nem tudo fica no menu principal.
3. Use DevTools, Burp Suite, cURL ou qualquer ferramenta que preferir.
4. Abra o ranking no rodapé para ver quais desafios você resolveu e quantos ainda faltam.
5. Consulte `GET /api/scores/catalog` para a lista completa de challenges e pontuações.

## Endpoints de API CTF

| Prefixo | Descrição |
|---|---|
| `/api/ctf/auth/*` | Autenticação, reset de senha, 2FA, JWT |
| `/api/ctf/data/*` | Reviews, GDPR, produtos, cupons, notificações |
| `/api/ctf/inject/*` | XSS, SQLi, NoSQL, SSTI, SSRF, RCE |
| `/api/ctf/*` | Chatbot, upload, file, hidden pages |
| `/api/legacy/*` | Login/register vulneráveis (SQLi) |
| `/api/feedback` | Feedback com rating 0, forged feedback |
| `/ftp/*` | Arquivos expostos |
| `/redirect` | Open redirect |
| `/metrics` | Prometheus (público) |

## Integração Frontend

### Coins (indicador de pontos na Navbar)

O botão dourado `$ N` na navbar mostra a pontuação acumulada do usuário logado. Ele:

- Carrega pontos via `GET /api/scores/me` ao fazer login.
- Atualiza em tempo real quando um desafio é completado (via `scored$` Subject).
- Clique abre o leaderboard modal.

### Confetti + Toast

Ao completar um desafio **pela primeira vez**, o sistema dispara:

1. **Confetti** animado (canvas overlay, 110 peças com física).
2. **Toast** central com `+N pts` e total acumulado.
3. **Toast lateral** com mensagem de sucesso.

> O confetti **não dispara** se o desafio já foi completado (`alreadyCompleted: true`).

### Desafios testáveis pelo frontend

| Desafio | Ação no frontend |
|---|---|
| `scoreBoardChallenge` | Clique em "Ranking" no footer |
| `domXssChallenge` | ⌘+K → `<img src=x onerror=alert(1)>` → Enter |
| `visit-developer-page` | Navegue para `/developer` |
| `open-leaderboard` | Abra o modal de ranking |

## Para criadores de desafios

Ao adicionar um novo desafio:

1. Inclua a chave em `backend/src/utils/challenge.util.ts` **e** `backend/src/services/score.service.ts`.
2. Implemente a detecção no local adequado (rota, service, middleware).
3. Use `awardChallenge(req, 'challengeKey')` — ele é idempotente e silent.
4. Atualize esta lista de catálogo com uma descrição curta.

Nunca coloque o gatilho em um caminho que um usuário legítimo possa ativar por acidente: desafios não devem dar pontos por navegação normal.
