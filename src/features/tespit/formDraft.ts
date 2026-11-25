import type { TespitFormuInsert } from '../../types/database'

/** Yeni kayıt formu taslağı — sadece bu cihazda, localStorage */
const DRAFT_KEY = 'uk-tespit-form-draft-v1'

export interface NewFormDraft {
  form: TespitFormuInsert
  yakinlikSecim: string
  yakinlikDiger: string
  savedAt: string
}

export function loadNewFormDraft(): NewFormDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as NewFormDraft
    if (!parsed?.form || typeof parsed.form !== 'object') return null
    return parsed
  } catch {
    return null
  }
}

export function saveNewFormDraft(
  form: TespitFormuInsert,
  yakinlikSecim: string,
  yakinlikDiger: string,
): void {
  try {
    const payload: NewFormDraft = {
      form,
      yakinlikSecim,
      yakinlikDiger,
      savedAt: new Date().toISOString(),
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify(payload))
  } catch {
    // kota / gizli mod — sessizce geç
  }
}

export function clearNewFormDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {
    // ignore
  }
}
