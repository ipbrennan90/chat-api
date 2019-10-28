import { Event } from '../database/models'

const EventController = {
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
