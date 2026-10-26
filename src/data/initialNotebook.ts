import type { Notebook } from '../types'

export function createInitialNotebook(): Notebook {
  return {
    schemaVersion: 1,
    sections: [
      {
        id: 'learning',
        parentId: null,
        title: 'Coisas para aprender',
        emoji: '📚',
        color: '#a7bcec',
      },
      {
        id: 'violets',
        parentId: 'learning',
        title: 'Cultivar violetas',
        emoji: '🌸',
        color: '#c5a5dc',
      },
      {
        id: 'personal',
        parentId: null,
        title: 'Registros pessoais',
        emoji: '✍️',
        color: '#b4cbb3',
      },
      {
        id: 'task',
        parentId: null,
        title: 'Projeto Task',
        emoji: '💡',
        color: '#edcf94',
      },
    ],
    contents: [
      {
        id: 'about',
        sectionId: 'violets',
        kind: 'note',
        title: 'Sobre a planta',
        text: 'Meu espaço para aprender sobre a violeta-africana.\n\nQuero registrar o que descobrir e acompanhar meus primeiros plantios. Os cuidados reais ainda serão pesquisados.',
      },
      {
        id: 'materials',
        sectionId: 'violets',
        kind: 'checklist',
        title: 'Materiais necessários',
        items: [
          { id: 'pot', text: 'Vaso pequeno', completed: false },
          {
            id: 'soil',
            text: 'Substrato adequado — pesquisar',
            completed: false,
          },
          { id: 'plant', text: 'Muda de violeta', completed: false },
        ],
      },
      {
        id: 'planting',
        sectionId: 'violets',
        kind: 'tutorial',
        title: 'Como plantar',
        text: 'Roteiro de pesquisa de exemplo. Ainda não é uma instrução de cultivo.',
        items: [
          {
            id: 'step-1',
            text: 'Pesquisar o vaso e o substrato adequados.',
            completed: false,
          },
          {
            id: 'step-2',
            text: 'Anotar o procedimento de plantio verificado.',
            completed: false,
          },
          {
            id: 'step-3',
            text: 'Registrar os cuidados após o plantio.',
            completed: false,
          },
        ],
      },
      {
        id: 'plants',
        sectionId: 'violets',
        kind: 'counter',
        title: 'Violetas plantadas',
        entries: [],
      },
      {
        id: 'ideas',
        sectionId: 'task',
        kind: 'note',
        title: 'Ideias para o Task',
        text: 'Um lugar para organizar o que quero aprender, fazer e lembrar.\n\nExperimente criar uma seção e adicionar seu próprio conteúdo.',
      },
    ],
    reminders: [],
  }
}
