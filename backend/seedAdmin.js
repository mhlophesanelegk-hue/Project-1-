require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./models');

async function seedAdmin() {
  await sequelize.sync();
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'password123';
  const name = 'Admin';

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    console.log(`Admin user already exists: ${email}`);
    process.exit(0);
  }

  const hashed = await bcrypt.hash(password, 10);
  await User.create({ name, email, password: hashed, role: 'admin' });
  console.log(`Admin user created: ${email}`);
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
