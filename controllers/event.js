import { Event } from '../database/models'
import { Op } from 'sequelize'

const EventController = {
  index: async (req, res) => {
    const from = new Date(req.query.from)
    const to = new Date(req.query.to)

    try {
      const events = await Event.findAll({
        where: { date: { [Op.between]: [from, to] } },
        order: [['date', 'ASC']]
      })
      const serializedEvents = events.map(event => {
        return event.serialize()
      })
      return res.status(200).json({ events: serializedEvents })
    } catch (e) {
      console.warn(e)
      return res.status(500).json({ status: 'error' })
    }
  },
  create: async (req, res) => {
    const data = {
      user: req.body.user,
      type: req.body.type.toUpperCase(),
      date: new Date(req.body.date),
      message: req.body.message,
      otheruser: req.body.otheruser
    }
    try {
      await Event.create(data)
      return res.status(200).json({
        status: 'ok'
      })
    } catch (e) {
      console.warn(e)
      return res.status(500).json({ status: 'error' })
    }
  },
  clear: async (req, res) => {
    try {
      await Event.destroy({ where: {} })
      return res.status(200).json({
        status: 'ok'
      })
    } catch (e) {
      console.warn(e)
      return res.status(500).json({ status: 'error' })
    }
  }
}

export default EventController
