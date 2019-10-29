'use strict'
import { eventSerializer } from '../serializers'
import { Op } from 'sequelize'
import serialize from '../../utils/serialize'

module.exports = (sequelize, DataTypes) => {
  const getSerializerFromType = type => {
    let typeSerializer = eventSerializer.base
    if (type in eventSerializer) {
      typeSerializer = eventSerializer[type]
    }
    return typeSerializer
  }

  const Event = sequelize.define(
    'Event',
    {
      user: DataTypes.STRING,
      date: DataTypes.DATE,
      type: DataTypes.ENUM('LEAVE', 'ENTER', 'COMMENT', 'HIGHFIVE'),
      message: DataTypes.TEXT,
      otheruser: DataTypes.STRING
    },
    {}
  )

  Event.prototype.serialize = function() {
    const serializer = getSerializerFromType(this.type.toLowerCase())
    return serialize(this, serializer)
  }

  Event.summary = (from, to, by) => {
    return Event.findAll({
      where: {
        date: {
          [Op.between]: [from, to]
        }
      },
      attributes: [
        [sequelize.fn('date_trunc', by, sequelize.col('date')), by],
        [
          sequelize.fn(
            'sum',
            sequelize.literal("case when type='HIGHFIVE' then 1 else 0 end")
          ),
          'highfives'
        ],
        [
          sequelize.fn(
            'sum',
            sequelize.literal("case when type='COMMENT' then 1 else 0 end")
          ),
          'comments'
        ],
        [
          sequelize.fn(
            'sum',
            sequelize.literal("case when type='LEAVE' then 1 else 0 end")
          ),
          'leaves'
        ],
        [
          sequelize.fn(
            'sum',
            sequelize.literal("case when type='ENTER' then 1 else 0 end")
          ),
          'enters'
        ]
      ],
      group: [by],
      raw: true,
      order: sequelize.literal(`${by} ASC`)
    })
  }

  return Event
}
