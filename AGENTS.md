# Regras de desenvolvimento do Tomohu

Estas regras devem ser seguidas antes, durante e depois de qualquer alteração no projeto. O objetivo é evoluir o Tomohu sem introduzir regressões, dados inválidos ou código difícil de manter.

## Antes de alterar

1. Ler `ROADMAP.md` e confirmar que a tarefa cabe na entrega atual.
2. Inspecionar os arquivos que usam a funcionalidade afetada antes de editar. Procurar tipos, funções, componentes, estilos, testes e armazenamento relacionados.
3. Declarar o menor escopo possível: uma funcionalidade principal por update.
4. Nunca apagar ou substituir código sem entender quem o utiliza. Se algo precisar sair, remover também referências, estilos e testes obsoletos.

## Durante a implementação

1. Fazer mudanças pequenas, coesas e fáceis de revisar; não misturar refatoração ampla com uma funcionalidade nova sem necessidade.
2. Manter TypeScript estrito: não usar `any`, supressões de erro ou conversões forçadas para esconder problemas de tipo.
3. Reutilizar os tipos e funções de domínio existentes; não duplicar regras de negócio em componentes diferentes.
4. Preservar dados já salvos em `localStorage`. Se o formato mudar, validar dados antigos e criar uma migração ou valores padrão compatíveis.
5. Tratar entradas vazias, datas inválidas, itens ausentes e ações repetidas sem quebrar a tela.
6. Manter textos da interface em português e código em inglês, seguindo o padrão atual de nomes e componentes.
7. Não adicionar dependências externas se HTML, CSS, React ou uma função pequena já resolverem o problema.
8. Para login, armazenamento remoto, senhas, criptografia ou notificações, planejar a arquitetura e segurança antes de escrever a implementação.

## Revisão obrigatória antes de entregar

1. Revisar o diff completo e confirmar que cada linha alterada é necessária.
2. Rodar, nesta ordem:

   ```powershell
   npm.cmd run lint
   npm.cmd run format:check
   npm.cmd test
   npm.cmd run build
   ```

3. Testar no navegador os fluxos afetados: criar, editar, salvar, recarregar a página e excluir/concluir quando aplicável.
4. Verificar que a alteração não remove dados anteriores nem quebra a página inicial, sessões, conteúdos, lembretes ou Ajustes.
5. Se algum teste falhar, corrigir a causa. Nunca entregar um patch com falhas conhecidas sem explicar e pedir decisão.
6. Gerar o patch somente depois da validação e testar sua aplicação em uma cópia limpa do repositório.

## Git e entregas

- Usar commits pequenos, claros e compatíveis com o tipo de mudança: `feat:`, `fix:`, `refactor:`, `test:` ou `docs:`.
- Arquivos `.patch` são temporários e não devem entrar no commit.
- Arquivos permanentes de documentação, código, testes e configurações devem entrar no commit quando fizerem parte da alteração.
- Antes de aplicar qualquer patch novo, atualizar a `main` e conferir `git status`.

## Critério de qualidade

Uma alteração só está pronta quando é legível, removível ou evoluível sem efeito escondido, mantém os dados antigos funcionando e passa validações automáticas e manuais. Segurança e estabilidade valem mais do que entregar rápido.
