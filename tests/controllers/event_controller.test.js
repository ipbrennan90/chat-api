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
      await Event.bulkCreate([
        {
          date: '2019-10-31T09:00:55Z',
          user: 'Biff',
          type: 'LEAVE'
        },
        {
          date: '2019-10-31T09:00:40Z',
          user: 'Marty',
          type: 'ENTER'
        },
        {
          date: '2019-10-31T09:00:30Z',
          user: 'Marty',
          type: 'ENTER'
        },
        {
          date: '2019-10-31T09:01:00Z',
          user: 'Marty',
          type: 'LEAVE'
        },
        {
          date: '2019-10-31T09:02:00Z',
          user: 'Marty',
          type: 'HIGHFIVE',
          otheruser: 'Doc'
        },
        {
          date: '2019-10-31T09:03:00Z',
          user: 'Doc',
          type: 'COMMENT',
          message: 'Sup marty??'
        },
        {
          date: '2019-11-01T09:03:00Z',
          user: 'Doc',
          type: 'COMMENT',
          message: 'Sup marty??'
        }
      ])
    })

    describe('#clear', () => {
      it('clears all events in database', async () => {
        const beginEventCount = await Event.count()
        const res = await request(app).post('/events/clear')
        const endEventCount = await Event.count()
        expect(res.statusCode).toEqual(200)
        expect(res.body).toEqual({ status: 'ok' })
        expect(beginEventCount).toEqual(7)
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
                date: '2019-10-31T09:00:30Z',
                user: 'Marty',
                type: 'enter'
              },
              {
                date: '2019-10-31T09:00:40Z',
                user: 'Marty',
                type: 'enter'
              },
              {
                date: '2019-10-31T09:00:55Z',
                user: 'Biff',
                type: 'leave'
              },
              {
                date: '2019-10-31T09:01:00Z',
                user: 'Marty',
                type: 'leave'
              },
              {
                date: '2019-10-31T09:02:00Z',
                user: 'Marty',
                type: 'highfive',
                otheruser: 'Doc'
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
                date: '2019-10-31T09:00:30Z',
                user: 'Marty',
                type: 'enter'
              },
              {
                date: '2019-10-31T09:00:40Z',
                user: 'Marty',
                type: 'enter'
              },
              {
                date: '2019-10-31T09:00:55Z',
                user: 'Biff',
                type: 'leave'
              },
              {
                date: '2019-10-31T09:01:00Z',
                user: 'Marty',
                type: 'leave'
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

    describe('#summary', () => {
      describe('when successful', () => {
        it('returns a summation of the events by minute', async () => {
          const res = await request(app).get(
            '/events/summary?from=2019-10-31T09:00:00Z&to=2019-10-31T09:03:00Z&by=minute'
          )
          expect(res.statusCode).toEqual(200)
          expect(res.body).toEqual({
            events: [
              {
                date: '2019-10-31T09:00:00Z',
                enters: 2,
                leaves: 1,
                comments: 0,
                highfives: 0
              },
              {
                date: '2019-10-31T09:01:00Z',
                enters: 0,
                leaves: 1,
                comments: 0,
                highfives: 0
              },
              {
                date: '2019-10-31T09:02:00Z',
                enters: 0,
                leaves: 0,
                comments: 0,
                highfives: 1
              },
              {
                date: '2019-10-31T09:03:00Z',
                enters: 0,
                leaves: 0,
                comments: 1,
                highfives: 0
              }
            ]
          })
        })

        it('returns a summation of the events by hour', async () => {
          const res = await request(app).get(
            '/events/summary?from=2019-10-31T09:00:00Z&to=2019-10-31T10:00:00Z&by=hour'
          )
          expect(res.statusCode).toEqual(200)
          expect(res.body).toEqual({
            events: [
              {
                date: '2019-10-31T09:00:00Z',
                enters: 2,
                leaves: 2,
                comments: 1,
                highfives: 1
              }
            ]
          })
        })

        it('returns a summation of the events by day', async () => {
          const res = await request(app).get(
            '/events/summary?from=2019-10-31T09:00:00Z&to=2019-11-01T10:00:00Z&by=day'
          )
          expect(res.statusCode).toEqual(200)
          expect(res.body).toEqual({
            events: [
              {
                date: '2019-10-31T00:00:00Z',
                enters: 2,
                leaves: 2,
                comments: 1,
                highfives: 1
              },
              {
                date: '2019-11-01T00:00:00Z',
                comments: 1,
                enters: 0,
                highfives: 0,
                leaves: 0
              }
            ]
          })
        })
      })

      describe('when not successful', () => {
        it('returns a 400 if from is missing from parameters', async () => {
          const res = await request(app).get(
            '/events/summary?to=2019-10-31T09:03:00Z&by=minute'
          )
          expect(res.statusCode).toEqual(400)
        })

        it('returns a 400 if to is missing from parameters', async () => {
          const res = await request(app).get(
            '/events/summary?from=2019-10-31T09:00:00Z&by=minute'
          )
          expect(res.statusCode).toEqual(400)
        })

        it('returns a 400 if by is missing from parameters', async () => {
          const res = await request(app).get(
            '/events/summary?from=2019-10-31T09:00:00Z&to=2019-10-31T09:03:00Z'
          )
          expect(res.statusCode).toEqual(400)
        })
      })
    })
  })
})

afterAll(async done => {
  Event.sequelize.close()
  done()
})
