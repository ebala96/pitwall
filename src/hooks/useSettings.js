import { useSyncExternalStore } from 'react'

const KEY = 'pitwall-settings'

const DEFAULTS = {
  favoriteDriver: null,
  favoriteConstructor: null,
  reminderLeads: [60, 10],
  remindersEnabled: false,
  defaultSeason: null,
  theme: 'dark',
}

function load() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }
  } catch {
    return { ...DEFAULTS }
  }
}

let state = load()
const listeners = new Set()

export function getSettings() {
  return state
}

export function setSettings(patch) {
  state = { ...state, ...patch }
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // ignore quota / privacy-mode errors
  }
  listeners.forEach((l) => l())
}

function subscribe(l) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useSettings() {
  return useSyncExternalStore(subscribe, getSettings, getSettings)
}
