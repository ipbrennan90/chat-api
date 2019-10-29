import { DateTime } from 'luxon'
const base = {
  options: {
    attributes: ['date', 'type', 'user']
  },
  type: type => type.toLowerCase(),
  date: date => {
    debugger
    return DateTime.fromJSDate(date)
      .toUTC()
      .toFormat("yyyy-LL-dd'T'hh:mm:ss'Z'")
  }
}

const comment = {
  ...base,
  options: {
    attributes: [...base.options.attributes, 'message']
  }
}

const highfive = {
  ...base,
  options: {
    attributes: [...base.options.attributes, 'otheruser']
  }
}

export { base, comment, highfive }
