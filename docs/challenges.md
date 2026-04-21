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

| Chave | Pts | Resumo |
|---|---|---|
| `scoreBoardChallenge` | 10 | Encontre a página de ranking (está no rodapé). |
| `privacyPolicyChallenge` | 10 | Leia a política de privacidade (`/privacy`). |
| `errorHandlingChallenge` | 10 | Provoque um 500 que vaze stack trace. |
| `exposedMetricsChallenge` | 10 | Acesse `/metrics` sem autenticação. |
| `domXssChallenge` | 10 | Execute `alert(xss)` via busca (`/catalog?q=<iframe src=...>`). |
| `confidentialDocumentChallenge` | 10 | Baixe um arquivo confidencial em `/ftp/*`. |
| `zeroStarsChallenge` | 10 | Publique uma avaliação de 0 estrelas. |
| `repetitiveRegistrationChallenge` | 10 | Registre o mesmo email duas vezes. |
| `missingEncodingChallenge` | 10 | Recupere um arquivo com caracteres especiais. |
| `outdatedAllowlistChallenge` | 10 | Use um open redirect para um domínio não permitido. |

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
