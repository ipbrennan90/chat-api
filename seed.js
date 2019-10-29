import { Event } from './database/models'

console.log('creating events')

const createEvents = async () => {
  await Event.destroy({ where: {} })
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
}

createEvents().then(() => {
  console.log('Seeded Events')
  Event.sequelize.close()
})
