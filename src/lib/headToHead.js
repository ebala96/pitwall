// Pure head-to-head metric builders. `dir` = which side wins: 'lower' (position,
// grid) or 'higher' (points, wins).
function metric(label, a, b, dir) {
  let winner = null
  if (a != null && b != null) {
    winner = a === b ? 'tie' : dir === 'lower' ? (a < b ? 'a' : 'b') : a > b ? 'a' : 'b'
  }
  return { label, a: a ?? null, b: b ?? null, winner }
}

export function weekendH2H(raceA, raceB, qualiA, qualiB) {
  return [
    metric('Qualifying', qualiA?.position, qualiB?.position, 'lower'),
    metric('Grid', raceA?.grid, raceB?.grid, 'lower'),
    metric('Finish', raceA?.position, raceB?.position, 'lower'),
    metric('Points', raceA?.points, raceB?.points, 'higher'),
  ]
}

export function seasonH2H(profA, profB) {
  const a = profA?.stats
  const b = profB?.stats
  return [
    metric('Season points', a?.points, b?.points, 'higher'),
    metric('Wins', a?.wins, b?.wins, 'higher'),
    metric('Podiums', a?.podiums, b?.podiums, 'higher'),
    metric('Best finish', a?.bestFinish, b?.bestFinish, 'lower'),
  ]
}
