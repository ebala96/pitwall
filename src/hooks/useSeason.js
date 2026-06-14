import { DEFAULT_SEASON } from '../config.js'
import { useSettings } from './useSettings.js'

// The active season for the main views — driven by the Settings default season,
// falling back to the app default.
export function useSeason() {
  const settings = useSettings()
  return settings.defaultSeason ?? DEFAULT_SEASON
}
