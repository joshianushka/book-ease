const toMin = (t) => parseInt(t.slice(0, 2)) * 60 + parseInt(t.slice(3))
const toTime = (m) =>
  String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')

export function generateSlots({ workingHours, date, duration, bookings }) {
  const dayOfWeek = new Date(date + 'T00:00:00').getDay()
  const hours = workingHours.find((h) => h.day === dayOfWeek)
  if (!hours || hours.isOff) return []

  const open = toMin(hours.open)
  const close = toMin(hours.close)
  const taken = bookings.map((b) => [toMin(b.startTime), toMin(b.endTime)])

  const slots = []
  for (let start = open; start + duration <= close; start += 30) {   // 30-min grid
    const end = start + duration
    const clash = taken.some(([bs, be]) => start < be && end > bs)   // overlap check
    if (!clash) slots.push(toTime(start))
  }
  return slots
}