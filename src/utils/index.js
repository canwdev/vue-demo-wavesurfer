export function timeToHMS(ms) {
  const h = parseInt(ms / (60 * 60)).toString().padStart(2, '0')
  const m = parseInt((ms / 60) % 60).toString().padStart(2, '0')
  const s = parseInt(ms % 60).toString().padStart(2, '0')
  return h + ':' + m + ':' + s
}

export function timeToMS(ms) {
  const m = parseInt(ms / 60).toString().padStart(2, '0')
  const s = parseInt(ms % 60).toString().padStart(2, '0')
  return m + ':' + s
}
