# Roadmap do Tomohu

Este arquivo é o organizador geral do projeto. Antes de começar uma funcionalidade, ela deve entrar aqui; depois de entregue, recebe uma versão e muda para **Concluído**.

## Como organizamos as entregas

| Tipo | Quando usar | Exemplo |
| --- | --- | --- |
| **Mini patch** (`x.y.1`) | Correção ou pequeno ajuste visual, sem mudar uma função importante. | Trocar o seletor de ordenação por um único dropdown. |
| **Update** (`x.y.0`) | Uma função nova ou evolução relevante de algo existente. | Melhorar lembretes com calendário e horários. |
| **Marco** (`x.0.0`) | Base madura do app ou uma mudança grande de arquitetura. | Dados em nuvem, contas de usuário e versão estável. |

Uma entrega pode ter vários commits. A versão só sobe quando a função estiver testada e pronta para uso.

## Agora — próxima update

### `0.3.0` · Lembretes e eventos

- [ ] Calendário próprio, centralizado e no estilo do Tomohu.
- [ ] Separar claramente o botão **Hoje** da ação de salvar o lembrete.
- [ ] Evento de dia inteiro ou evento com intervalo de início e fim.
- [ ] Contador até o evento, com formatos adequados ao tempo restante.
- [ ] Base preparada para notificações futuras.

## Mini patches planejados

- [ ] Trocar os controles atuais de ordenação por um único botão dropdown.
- [ ] Melhorar fluidez ao entrar em sessões, abrir conteúdos e executar ações.
- [ ] Pequenos ajustes de acessibilidade, textos, espaçamentos e responsividade que surgirem nos testes.

## Updates planejadas

### Organização e uso diário

- [ ] Progresso visual em listas e coleções: quantidade e porcentagem concluída.
- [ ] Favoritar/fixar seções importantes no topo.
- [ ] Busca global por seções, conteúdos, notas, itens e lembretes.
- [ ] Tags para organizar por assunto, como `escola`, `pessoal` e `trabalho`.
- [ ] Arquivar sessões e conteúdos concluídos sem apagar.
- [ ] Repetição de eventos: diária, semanal, mensal e personalizada.
- [ ] Tipo de conteúdo de coleção/tracker, útil para coisas como times Pokémon.

### Personalização

- [x] Checkboxes estilizadas com a paleta do app. — `0.2.0`
- [x] Cores livres para seções e subseções. — `0.2.0`
- [ ] Tema claro e escuro.
- [ ] Seletor de idioma do app, começando por português e inglês, com textos centralizados para facilitar novos idiomas.
- [ ] Mais opções de personalização visual sem perder a identidade do Tomohu.

### Dados, backup e dispositivos

- [ ] Importar backup JSON pela interface, complementando a exportação já existente.
- [ ] Passar o projeto para uma **PWA** instalável: abrir como app no PC/celular e ter suporte offline onde for possível.
- [ ] Definir corretamente a estratégia de armazenamento antes de dados sensíveis ou contas.

### Contas, privacidade e segurança

- [ ] Login de usuários.
- [ ] Dados, alterações e backups ligados à conta correta.
- [ ] Sessões privadas protegidas por senha.
- [ ] Criptografia real para conteúdo privado e proteção adequada de dados sensíveis.
- [ ] Notificações e alarmes de eventos, configuráveis como em calendários.
- [ ] Lembrete flash: criação instantânea com apenas um campo de texto; ao adicionar, já começa a avisar a cada 10 minutos por padrão. Configurações como intervalo, notificação/alarme, concluir e adiar ficam opcionais, disponíveis somente para quem quiser detalhar.

## Visão de marco

- [ ] `1.0.0`: Tomohu estável, instalável, com backup/importação confiáveis e uma base de organização madura.
- [ ] Depois da base estável: sincronização por conta, privacidade avançada e notificações completas.

## Saúde do código — regra principal

Qualidade de vida do código vem antes de velocidade de entrega.

- Fazer **uma funcionalidade principal por update**; não juntar várias mudanças grandes na mesma entrega.
- Antes de modificar, entender onde a função atual está ligada. Ao remover algo, remover também dependências e código morto.
- Preservar dados existentes: mudanças no formato salvo precisam manter compatibilidade ou ter migração.
- Evitar atalhos que deixem partes do app dependentes de um componente que pode sumir sem substituição.
- Rodar `lint`, formatação, testes e build antes de cada entrega.
- Testar manualmente os fluxos afetados no navegador, inclusive criar, editar, salvar, recarregar e excluir quando aplicável.
- Fazer commits pequenos e descritivos; uma atualização pode conter vários commits saudáveis.
- Se uma ideia exigir backend, autenticação ou segurança, planejar primeiro em vez de improvisar no front-end.
