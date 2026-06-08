const { Sequelize } = require('sequelize');
const UserModel = require('./User');
const ApplicationModel = require('./Application');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
  }
);

const User = UserModel(sequelize);
const Application = ApplicationModel(sequelize);

User.hasMany(Application, { foreignKey: 'userId', onDelete: 'CASCADE' });
Application.belongsTo(User, { foreignKey: 'userId' });

module.exports = { sequelize, User, Application };
