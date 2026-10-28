import { useEffect, useState } from 'react'
import { createInitialNotebook } from '../data/initialNotebook'
import { parseNotebookBackup, STORAGE_KEY } from '../lib/notebook'
import type { Notebook } from '../types'

function loadNotebook(): {
  notebook: Notebook
  error: string
  blocked: boolean
} {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored)
      return { notebook: createInitialNotebook(), error: '', blocked: false }
    const parsed = parseNotebookBackup(stored)
    return { notebook: parsed, error: '', blocked: false }
  } catch {
    return {
      notebook: createInitialNotebook(),
      error:
        'Não foi possível carregar os dados deste navegador. O salvamento foi pausado para preservar o que já existia. Exporte suas alterações antes de fechar.',
      blocked: true,
    }
  }
}

export function useNotebook() {
  const [initial] = useState(loadNotebook)
  const [notebook, setNotebook] = useState(initial.notebook)
  const [storageError, setStorageError] = useState(initial.error)

  function replaceNotebook(nextNotebook: Notebook): boolean {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextNotebook))
      setNotebook(nextNotebook)
      setStorageError('')
      return true
    } catch {
      setStorageError(
        'Não foi possível importar. O armazenamento pode estar cheio ou bloqueado.',
      )
      return false
    }
  }

  useEffect(() => {
    if (initial.blocked) return
    let active = true
    const reportError = (message: string) =>
      queueMicrotask(() => {
        if (active) setStorageError(message)
      })
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notebook))
      reportError('')
    } catch {
      reportError(
        'Não foi possível salvar. O armazenamento pode estar cheio ou bloqueado. Exporte uma cópia antes de fechar.',
      )
    }
    return () => {
      active = false
    }
  }, [notebook, initial.blocked])

  return { notebook, setNotebook, replaceNotebook, storageError }
}
