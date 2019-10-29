import { iso8601 } from '../../utils/date_formatter'

const toNumber = string => Number(string)

const base = {
  options: {
    attributes: ['date', 'enters', 'leaves', 'comments', 'highfives']
  },
  enters: toNumber,
  leaves: toNumber,
  comments: toNumber,
  highfives: toNumber,
  date: iso8601
}

export { base }
