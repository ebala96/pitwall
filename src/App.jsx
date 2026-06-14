import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell.jsx'
import Live from './routes/Live.jsx'
import Schedule from './routes/Schedule.jsx'
import Standings from './routes/Standings.jsx'
import Results from './routes/Results.jsx'
import Telemetry from './routes/Telemetry.jsx'
import Profile from './routes/Profile.jsx'
import Settings from './routes/Settings.jsx'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/live" replace />} />
        <Route path="/live" element={<Live />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/standings" element={<Standings />} />
        <Route path="/results" element={<Results />} />
        <Route path="/telemetry" element={<Telemetry />} />
        <Route path="/profile/:type/:id" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/live" replace />} />
      </Routes>
    </AppShell>
  )
}
