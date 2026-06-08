require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./models');

async function promoteAdmin() {
  const email = process.argv[2] || process.env.PROMOTE_EMAIL;
  if (!email) {
    console.error('Usage: node promoteAdmin.js <email>');
    process.exit(1);
  }

  await sequelize.sync();
  const user = await User.findOne({ where: { email } });
  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  user.role = 'admin';
  await user.save();
  console.log(`User promoted to admin: ${email}`);
  process.exit(0);
}

promoteAdmin().catch((err) => {
  console.error('Promotion failed:', err);
  process.exit(1);
});
