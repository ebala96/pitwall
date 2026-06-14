import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell.jsx'
import { useReminders } from './hooks/useReminders.js'
import Live from './routes/Live.jsx'
import Schedule from './routes/Schedule.jsx'
import Standings from './routes/Standings.jsx'
import Results from './routes/Results.jsx'
import Telemetry from './routes/Telemetry.jsx'
import Track from './routes/Track.jsx'
import Compare from './routes/Compare.jsx'
import Profile from './routes/Profile.jsx'
import Settings from './routes/Settings.jsx'

export default function App() {
  useReminders()
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/live" replace />} />
        <Route path="/live" element={<Live />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/standings" element={<Standings />} />
        <Route path="/results" element={<Results />} />
        <Route path="/telemetry" element={<Telemetry />} />
        <Route path="/track" element={<Track />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/profile/:type/:id" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/live" replace />} />
      </Routes>
    </AppShell>
  )
}
