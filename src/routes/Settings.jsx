import { useState } from 'react'
import { queryClient } from '../data/queryClient.js'
import { clearPersistedCache } from '../data/persist.js'
import { DEFAULT_SEASON, TELEMETRY_FIRST_SEASON } from '../config.js'
import { setSettings, useSettings } from '../hooks/useSettings.js'
import { useDataSourceHealth } from '../hooks/useHealth.js'
import { useConstructorStandings, useDriverStandings } from '../hooks/useStandings.js'

const LEAD_PRESETS = [120, 60, 30, 15, 10, 5]

export default function Settings() {
  const settings = useSettings()
  const health = useDataSourceHealth()
  const drivers = useDriverStandings(DEFAULT_SEASON)
  const constructors = useConstructorStandings(DEFAULT_SEASON)
  const [cleared, setCleared] = useState(false)

  const seasons = []
  for (let y = DEFAULT_SEASON; y >= TELEMETRY_FIRST_SEASON; y--) seasons.push(y)

  async function toggleReminders() {
    if (settings.remindersEnabled) {
      setSettings({ remindersEnabled: false })
      return
    }
    if (typeof Notification === 'undefined') return
    const perm =
      Notification.permission === 'granted'
        ? 'granted'
        : await Notification.requestPermission()
    setSettings({ remindersEnabled: perm === 'granted' })
  }

  function toggleLead(min) {
    const has = settings.reminderLeads.includes(min)
    const next = has
      ? settings.reminderLeads.filter((x) => x !== min)
      : [...settings.reminderLeads, min].sort((a, b) => b - a)
    setSettings({ reminderLeads: next })
  }

  async function clearCache() {
    await clearPersistedCache()
    queryClient.clear()
    setCleared(true)
  }

  return (
    <section style={{ maxWidth: 560 }}>
      <h1 style={{ margin: '0 0 16px', fontSize: 20 }}>Settings</h1>

      <Card title="Favorites">
        <Field label="Driver">
          <select
            value={settings.favoriteDriver ?? ''}
            onChange={(e) => setSettings({ favoriteDriver: e.target.value || null })}
            style={select}
          >
            <option value="">None</option>
            {(drivers.data?.rows ?? []).map((r) => (
              <option key={r.driverId} value={r.driverId}>
                {r.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Team">
          <select
            value={settings.favoriteConstructor ?? ''}
            onChange={(e) => setSettings({ favoriteConstructor: e.target.value || null })}
            style={select}
          >
            <option value="">None</option>
            {(constructors.data?.rows ?? []).map((r) => (
              <option key={r.constructorId} value={r.constructorId}>
                {r.constructorName}
              </option>
            ))}
          </select>
        </Field>
      </Card>

      <Card title="Reminders">
        <Field label="Enabled">
          <button onClick={toggleReminders} style={toggle(settings.remindersEnabled)}>
            {settings.remindersEnabled ? 'On' : 'Off'}
          </button>
        </Field>
        <Field label="Lead times">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {LEAD_PRESETS.map((m) => {
              const on = settings.reminderLeads.includes(m)
              return (
                <button key={m} onClick={() => toggleLead(m)} style={chip(on)}>
                  {m}m
                </button>
              )
            })}
          </div>
        </Field>
        {typeof Notification !== 'undefined' && Notification.permission === 'denied' && (
          <div style={{ color: 'var(--bad)', fontSize: 12 }}>
            Browser notifications blocked — allow them in site settings.
          </div>
        )}
      </Card>

      <Card title="Defaults">
        <Field label="Season">
          <select
            value={settings.defaultSeason ?? DEFAULT_SEASON}
            onChange={(e) => setSettings({ defaultSeason: Number(e.target.value) })}
            style={select}
          >
            {seasons.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </Field>
      </Card>

      <Card title="Data sources">
        <Pill name="jolpica" info={health.jolpica} />
        <Pill name="openf1" info={health.openf1} />
      </Card>

      <Card title="Cache">
        <button onClick={clearCache} style={{ ...toggle(false), borderColor: 'var(--accent)' }}>
          Clear cached data
        </button>
        {cleared && <span style={{ marginLeft: 10, color: 'var(--green)', fontSize: 13 }}>Cleared.</span>}
      </Card>
    </section>
  )
}

function Card({ title, children }) {
  return (
    <div
      style={{
        background: 'var(--panel)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: 14,
        marginBottom: 12,
      }}
    >
      <div style={{ color: 'var(--text-faint)', fontSize: 11, textTransform: 'uppercase', marginBottom: 10 }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
      <span style={{ color: 'var(--text-dim)' }}>{label}</span>
      {children}
    </div>
  )
}

function Pill({ name, info }) {
  const color =
    info.status === 'up' ? 'var(--ok)' : info.status === 'checking' ? 'var(--warn)' : 'var(--bad)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <span style={{ width: 8, height: 8, borderRadius: 4, background: color }} />
      <span style={{ flex: 1 }}>{name}</span>
      <span className="tnum" style={{ color: 'var(--text-faint)', fontSize: 12 }}>
        {info.status === 'checking' ? '…' : info.ms != null ? `${info.ms} ms` : 'down'}
      </span>
    </div>
  )
}

const select = {
  background: 'var(--panel-2)',
  color: 'var(--text)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '5px 10px',
  fontSize: 13,
  maxWidth: 260,
}
const toggle = (on) => ({
  background: on ? 'var(--accent)' : 'transparent',
  color: on ? '#fff' : 'var(--text)',
  border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
  borderRadius: 8,
  padding: '5px 14px',
  cursor: 'pointer',
  fontSize: 13,
})
const chip = (on) => ({
  background: on ? 'var(--panel-2)' : 'transparent',
  color: on ? 'var(--text)' : 'var(--text-dim)',
  border: `1px solid ${on ? 'var(--accent)' : 'var(--border)'}`,
  borderRadius: 6,
  padding: '4px 9px',
  cursor: 'pointer',
  fontSize: 12,
})
