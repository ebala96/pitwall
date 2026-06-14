import './tokens.css'

// Single dark broadcast theme for v1. Kept as a provider so a theme toggle
// (Settings) can later swap a data-theme attribute without touching components.
export function ThemeProvider({ children }) {
  return children
}
