import { iso8601 } from '../../utils/date_formatter'

const base = {
  options: {
    attributes: ['date', 'type', 'user']
  },
  type: type => type.toLowerCase(),
  date: iso8601
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
