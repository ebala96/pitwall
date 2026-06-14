// Race-replay segments as fractions of the session duration. `full` is default.
export const RACE_SEGMENTS = [
  { value: 'full', label: 'Full race', from: 0, to: 1 },
  { value: 'start', label: 'Start', from: 0, to: 0.2 },
  { value: 'mid', label: 'Mid', from: 0.4, to: 0.6 },
  { value: 'half', label: '2nd half', from: 0.5, to: 1 },
  { value: 'end', label: 'End', from: 0.8, to: 1 },
]

export function segmentByValue(value) {
  return RACE_SEGMENTS.find((s) => s.value === value) ?? RACE_SEGMENTS[0]
}
