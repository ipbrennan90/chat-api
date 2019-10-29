'use strict'
import { eventSerializer } from '../serializers'
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

  Event.associate = function(models) {
    // associations can be defined here
  }

  return Event
}
