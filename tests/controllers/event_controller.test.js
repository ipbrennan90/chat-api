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

  describe('with multiple events', () => {
    beforeEach(async () => {
      const createEvents = [
        Event.create({
          date: '2019-10-31T09:00:00Z',
          user: 'Marty',
          type: 'ENTER'
        }),
        Event.create({
          date: '2019-10-31T09:01:00Z',
          user: 'Marty',
          type: 'LEAVE'
        }),
        Event.create({
          date: '2019-10-31T09:02:00Z',
          user: 'Marty',
          type: 'HIGHFIVE',
          otheruser: 'Doc'
        }),
        Event.create({
          date: '2019-10-31T09:03:00Z',
          user: 'Doc',
          type: 'COMMENT',
          message: 'Sup marty??'
        })
      ]
      await Promise.all(createEvents)
    })

    describe('#clear', () => {
      it('clears all events in database', async () => {
        const beginEventCount = await Event.count()
        const res = await request(app).post('/events/clear')
        const endEventCount = await Event.count()
        expect(res.statusCode).toEqual(200)
        expect(res.body).toEqual({ status: 'ok' })
        expect(beginEventCount).toEqual(4)
        expect(endEventCount).toEqual(0)
      })
    })

    describe('#index', () => {
      describe('when successful', () => {
        it('returns a list of all events in ascending order by date', async () => {
          const res = await request(app).get(
            '/events?from=2019-10-31T09:00:00Z&to=2019-10-31T09:03:00Z'
          )
          expect(res.statusCode).toEqual(200)
          expect(res.body).toEqual({
            events: [
              {
                date: '2019-10-31T09:00:00Z',
                type: 'enter',
                user: 'Marty'
              },
              {
                date: '2019-10-31T09:01:00Z',
                type: 'leave',
                user: 'Marty'
              },
              {
                date: '2019-10-31T09:02:00Z',
                otheruser: 'Doc',
                type: 'highfive',
                user: 'Marty'
              },
              {
                date: '2019-10-31T09:03:00Z',
                user: 'Doc',
                type: 'comment',
                message: 'Sup marty??'
              }
            ]
          })
        })

        it('returns only the dates within the time frame', async () => {
          const res = await request(app).get(
            '/events?from=2019-10-31T09:00:00Z&to=2019-10-31T09:01:00Z'
          )
          expect(res.statusCode).toEqual(200)
          expect(res.body).toEqual({
            events: [
              {
                date: '2019-10-31T09:00:00Z',
                type: 'enter',
                user: 'Marty'
              },
              {
                date: '2019-10-31T09:01:00Z',
                type: 'leave',
                user: 'Marty'
              }
            ]
          })
        })
      })

      describe('when not successful', () => {
        it('returns a 400 if from missing from params', async () => {
          const res = await request(app).get('/events?to=2019-10-31T09:01:00Z')
          expect(res.statusCode).toEqual(400)
          expect(res.body).toEqual({ status: 'error' })
        })

        it('returns a 400 if to missing from params', async () => {
          const res = await request(app).get(
            '/events?from=2019-10-31T09:00:00Z'
          )
          expect(res.statusCode).toEqual(400)
          expect(res.body).toEqual({ status: 'error' })
        })
      })
    })
  })
})

afterAll(async done => {
  Event.sequelize.close()
  done()
})
