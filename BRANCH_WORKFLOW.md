# Fluxo de branches do Tomohu

O Tomohu usa um fluxo simples: a `main` contém somente uma versão estável, e cada trabalho relevante acontece em uma branch temporária.

| Tipo de trabalho    | Prefixo     | Exemplo                     |
| ------------------- | ----------- | --------------------------- |
| Nova funcionalidade | `feature/`  | `feature/global-search`     |
| Correção            | `fix/`      | `fix/search-focus`          |
| Refatoração interna | `refactor/` | `refactor/notebook-storage` |

## Passo a passo

1. Atualize a `main` e crie a branch:

   ```bash
   git switch main
   git pull --ff-only
   git switch -c feature/nome-curto
   ```

2. Faça commits pequenos e claros durante o trabalho.
3. Antes de integrar, rode `npm run lint`, `npm run format:check`, `npm test` e `npm run build`.
4. Volte para a `main`, atualize e integre a branch:

   ```bash
   git switch main
   git pull --ff-only
   git merge --ff-only feature/nome-curto
   git push
   ```

5. Apague a branch que já foi integrada:

   ```bash
   git branch -d feature/nome-curto
   ```

Para ajustes muito pequenos, feitos e testados de uma vez, um commit direto na `main` continua aceitável. O objetivo é ter organização sem criar burocracia.
