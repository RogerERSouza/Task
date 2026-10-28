# Histórico de versões

## 0.3.0 — 2026-10-28

### Alterado

- Lembretes agora usam calendário próprio, centralizado e integrado ao visual do Tomohu.
- Eventos podem ser marcados como dia todo ou configurados com horário de início e fim.
- Cartões de lembrete mostram um contador até o evento, com formato automático ou escolhido pelo usuário.
- Dados de lembretes antigos continuam funcionando após a atualização.

## 0.2.0 — 2026-10-27

### Alterado

- Checkboxes de listas agora usam o visual da paleta do Tomohu, com estado concluído mais claro.
- Ordenação ganhou controles próprios para Recentes e A–Z, sem o seletor padrão do navegador.
- Seções e subseções aceitam qualquer cor pelo seletor cromático, além das cores sugeridas.
- Botões e navegação entre seções receberam transições leves em navegadores compatíveis.

## 0.1.1 — 2026-10-26

### Alterado

- Removida a barra lateral; navegação inferior compacta com Início e Ajustes.
- Título principal da página inicial simplificado para Lembretes.
- Removidos slogans, mensagens decorativas, rodapé, avatar e cabeçalho redundante.
- Lembretes mostram apenas a data e o conteúdo; sem cartão de exemplo quando não há registros.
- Exportação e número da versão ficam em Ajustes.
- Conteúdo ocupa a largura central, sem coluna reservada à navegação.
- Mantidos os dados existentes e as funcionalidades da versão anterior.

## 0.1.0 — 2026-10-26

Primeira versão funcional para validação local, ainda sem commit ou tag.

### Adicionado

- Interface responsiva azul-escura com lembretes em cartões de papel.
- Página inicial com pesquisa de seções e ordenação por nome ou criação.
- Criação e edição de seções/subseções, com nome, emoji e cor.
- Menu de três pontinhos para configurar seções existentes.
- Navegação por endereço e caminho de seções; suporte ao botão voltar do navegador.
- Criação de notas, checklists, tutoriais e contadores.
- Página própria para editar e interagir com cada conteúdo.
- Listas com conclusão, edição, adição, exclusão e reordenação de itens.
- Contadores com ações rápidas e histórico de data/hora e anotação opcional.
- Lembretes com data/horário, edição e conclusão.
- Salvamento local, aviso em caso de erro e exportação JSON.
- Tipos discriminados, componentes separados e testes de regras de domínio.

### Próximas etapas previstas

- Recuperação de exclusões e organização entre seções.
- Importação de cópias e melhoria das ferramentas de organização.
- Datas recorrentes, login, sincronização e acesso offline completo.
