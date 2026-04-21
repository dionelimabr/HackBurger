# Como Contribuir

Obrigado por querer contribuir. Este guia resume as convenções adotadas no projeto e o fluxo esperado de um Pull Request.

## Fluxo de trabalho

1. Faça o fork do repositório.
2. Crie uma branch a partir de `main` com prefixo por tipo: `feature/`, `fix/`, `docs/`, `refactor/`, `chore/`.
3. Rode os testes localmente antes de abrir o PR.
4. Abra o Pull Request descrevendo *o que* mudou e *por quê*. Se fizer sentido, inclua capturas de tela.
5. Marque pelo menos um revisor e aguarde aprovação.

## Convenções de commit

Seguimos [Conventional Commits](https://www.conventionalcommits.org/). O tipo determina a seção no changelog.

| Tipo | Quando usar |
|---|---|
| `feat` | Nova funcionalidade visível ao usuário |
| `fix` | Correção de bug |
| `docs` | Alteração apenas em documentação |
| `refactor` | Mudança interna sem alterar comportamento |
| `test` | Novo teste ou ajuste em testes existentes |
| `chore` | Configuração, dependências, build |

Exemplos válidos:

```
feat(cart): permitir remover item com quantidade zero
fix(auth): devolver 401 quando token expirou
docs(api): atualizar payload de checkout
```

## Estilo de código

### Backend (TypeScript)

- `strict: true` no `tsconfig`. Não desative.
- Sem `any` implícito. Use tipos explícitos nas assinaturas públicas.
- Services ficam puros quando possível: recebem parâmetros, devolvem valores, não dependem de `req`/`res`.
- Nomes em inglês; mensagens de erro visíveis ao usuário em pt-BR.

### Frontend (Angular)

- Componentes pequenos e focados. Se um componente passar de 300 linhas de template, divida.
- Services com `providedIn: 'root'` sempre que possível.
- Observables com sufixo `$` (ex: `user$`).
- SCSS escopado ao componente; estilos globais apenas em `src/styles/`.

## Testes

- Backend: Jest. Cada service deve ter pelo menos um teste de caminho feliz e um de erro.
- Frontend: Jasmine/Karma para unit, Cypress para e2e. Componentes críticos (checkout, login) devem ter e2e.
- Nenhum PR que reduza cobertura existente será aprovado sem justificativa.

## Revisão de código

O revisor se concentra em:

- Correção: o código faz o que o PR diz que faz?
- Clareza: alguém que não participou da conversa consegue entender?
- Segurança: validação de entrada, permissões, dados sensíveis.
- Performance: há chamada de banco em loop? Há N+1?
- Testes: o comportamento novo está coberto?

## Issues

Ao abrir uma issue de bug, inclua:

- Passos para reproduzir.
- Comportamento esperado e observado.
- Ambiente (OS, navegador, versão do Node).
- Logs relevantes.

## Código de conduta

Respeito em primeiro lugar. Discussões técnicas não justificam ataques pessoais. Divergências se resolvem com argumento e, quando necessário, com o benefício da dúvida.
