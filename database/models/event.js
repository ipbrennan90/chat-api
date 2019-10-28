'use strict'
module.exports = (sequelize, DataTypes) => {
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
  Event.associate = function(models) {
    // associations can be defined here
  }
  return Event
}
