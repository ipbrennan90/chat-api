import request from 'supertest'
import app from '../../server'
import { Event } from '../../database/models'

describe('EventController', () => {
  beforeEach(async done => {
    try {
      await Event.sync({ force: true }) // drops table and re-creates it
      done()
    } catch (e) {
      done(e)
    }
  })

  describe('#create', () => {
    describe('when successful', () => {
      it('should create a new event', async () => {
        const res = await request(app)
          .post('/events')
          .send({ date: '1985-10-26T09:03:00Z', user: 'Doc', type: 'leave' })
        expect(res.statusCode).toEqual(200)
        expect(res.body.status).toEqual('ok')
        const event = await Event.findOne({
          where: { user: 'Doc', type: 'LEAVE' },
          order: [['createdAt', 'DESC']]
        })
        expect(event).not.toBe(null)
        expect(event).toEqual(
          expect.objectContaining({
            date: new Date('1985-10-26T09:03:00Z'),
            user: 'Doc',
            type: 'LEAVE'
          })
        )
      })

      it('should create a new Event with a comment', async () => {
        const res = await request(app)
          .post('/events')
          .send({
            date: '1985-10-26T09:03:00Z',
            user: 'Doc',
            type: 'comment',
            message: 'I love plutonium.'
          })
        expect(res.statusCode).toEqual(200)
        expect(res.body.status).toEqual('ok')
        const event = await Event.findOne({
          where: { user: 'Doc', type: 'COMMENT' },
          order: [['createdAt', 'DESC']]
        })
        expect(event).not.toBe(null)
        expect(event).toEqual(
          expect.objectContaining({
            date: new Date('1985-10-26T09:03:00Z'),
            user: 'Doc',
            type: 'COMMENT',
            message: 'I love plutonium.'
          })
        )
      })

      it('should create a new Event with an otheruser', async () => {
        const res = await request(app)
          .post('/events')
          .send({
            date: '1985-10-26T09:03:00Z',
            user: 'Marty',
            type: 'highfive',
            otheruser: 'Doc'
          })
        expect(res.statusCode).toEqual(200)
        expect(res.body.status).toEqual('ok')
        const event = await Event.findOne({
          where: { user: 'Marty', type: 'HIGHFIVE' },
          order: [['createdAt', 'DESC']]
        })
        expect(event).not.toBe(null)
        expect(event).toEqual(
          expect.objectContaining({
            date: new Date('1985-10-26T09:03:00Z'),
            user: 'Marty',
            type: 'HIGHFIVE',
            otheruser: 'Doc'
          })
        )
      })
    })

    describe('when not successful', () => {
      it('returns a 400 if event has no user', async () => {
        const beginEventCount = await Event.count()
        const res = await request(app)
          .post('/events')
          .send({
            date: '1985-10-26T09:03:00Z',
            user: null,
            type: 'highfive',
            otheruser: 'Doc'
          })
        const endEventCount = await Event.count()
        expect(res.statusCode).toEqual(400)
        expect(res.body.status).toEqual('error')
        expect(beginEventCount).toEqual(endEventCount)
      })

      it('returns a 400 if event has no type', async () => {
        const beginEventCount = await Event.count()
        const res = await request(app)
          .post('/events')
          .send({
            date: '1985-10-26T09:03:00Z',
            user: 'Marty',
            type: null,
            otheruser: 'Doc'
          })
        const endEventCount = await Event.count()
        expect(res.statusCode).toEqual(400)
        expect(res.body.status).toEqual('error')
        expect(beginEventCount).toEqual(endEventCount)
      })

      it('returns a 400 if event has no date', async () => {
        const beginEventCount = await Event.count()
        const res = await request(app)
          .post('/events')
          .send({
            date: null,
            user: 'Marty',
            type: 'highfive',
            otheruser: 'Doc'
          })
        const endEventCount = await Event.count()
        expect(res.statusCode).toEqual(400)
        expect(res.body.status).toEqual('error')
        expect(beginEventCount).toEqual(endEventCount)
      })

      it('returns a 500 if the event type is not recognized', async () => {
        const beginEventCount = await Event.count()
        const res = await request(app)
          .post('/events')
          .send({
            date: null,
            user: 'Marty',
            type: 'unknown'
          })
        const endEventCount = await Event.count()
        expect(res.statusCode).toEqual(400)
        expect(res.body.status).toEqual('error')
        expect(beginEventCount).toEqual(endEventCount)
      })
    })
  })

  describe('#clear', () => {
    it('clears all events in database', async () => {
      const createEvents = [
        Event.create({
          date: '2019-10-31T09:03:00Z',
          user: 'Marty',
          type: 'ENTER'
        }),
        Event.create({
          date: '2019-10-31T09:03:00Z',
          user: 'Marty',
          type: 'LEAVE'
        }),
        Event.create({
          date: '1985-10-26T09:03:00Z',
          user: 'Marty',
          type: 'HIGHFIVE',
          otheruser: 'Doc'
        })
      ]
      await Promise.all(createEvents)
      const beginEventCount = await Event.count()
      const res = await request(app).post('/events/clear')
      const endEventCount = await Event.count()
      expect(res.statusCode).toEqual(200)
      expect(res.body).toEqual({ status: 'ok' })
      expect(beginEventCount).toEqual(3)
      expect(endEventCount).toEqual(0)
    })
  })
})

afterAll(async done => {
  Event.sequelize.close()
  done()
})
