import { useEffect } from 'react'
import { DEFAULT_SEASON } from '../config.js'
import { clearReminders, scheduleReminders } from '../lib/reminders.js'
import { useSchedule } from './useSchedule.js'
import { useSettings } from './useSettings.js'

// Mount once (App). Arms session reminders from the schedule + settings, and
// re-arms every 6h (setTimeout caps at ~24.8 days).
export function useReminders() {
  const settings = useSettings()
  const season = settings.defaultSeason ?? DEFAULT_SEASON
  const sched = useSchedule(season)
  const races = sched.data?.races
  const { remindersEnabled, reminderLeads } = settings

  useEffect(() => {
    if (!remindersEnabled || !races) {
      clearReminders()
      return
    }
    scheduleReminders(races, reminderLeads)
    const id = setInterval(() => scheduleReminders(races, reminderLeads), 6 * 60 * 60 * 1000)
    return () => {
      clearInterval(id)
      clearReminders()
    }
  }, [remindersEnabled, reminderLeads, races])
}
