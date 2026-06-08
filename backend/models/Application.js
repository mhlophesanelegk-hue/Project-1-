const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Application', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    membershipNumber: {
      type: DataTypes.STRING,
      unique: true,
    },
    duration: {
      type: DataTypes.INTEGER,
      defaultValue: 12,
    },
    proofFile: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cardPath: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.ENUM('pending', 'awaiting_payment_verification', 'approved', 'declined'),
      defaultValue: 'pending',
    },
    expiryDate: {
      type: DataTypes.DATE,
    },
    approvedAt: {
      type: DataTypes.DATE,
    },
  });
};
