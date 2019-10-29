import { DateTime } from 'luxon'

const iso8601 = date => {
  return DateTime.fromJSDate(date)
    .toUTC()
    .toISO({ suppressMilliseconds: true })
}

export { iso8601 }
