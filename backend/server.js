require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');

// IMPORTANT: ONLY use models/index.js setup
const { sequelize, User, Application } = require('./models');

const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/application');
const adminRoutes = require('./routes/admin');
const adminExtraRoutes = require('./routes/admin_extra');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminExtraRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'ES’HLAHLENI membership backend is running.' });
});

// Test DB connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

// Create default admin
async function ensureDefaultAdmin() {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.log('ADMIN_EMAIL or ADMIN_PASSWORD missing in .env');
      return;
    }

    const existing = await User.findOne({ where: { email } });

    if (existing) {
      console.log(`Admin user already exists: ${email}`);
      return;
    }

    const hashed = await bcrypt.hash(password, 10);

    await User.create({
      name: 'Admin',
      email,
      password: hashed,
      role: 'admin',
    });

    console.log(`Created default admin user: ${email}`);

  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// Start server
sequelize.sync({ alter: true })
  .then(async () => {
    await testConnection();
    await ensureDefaultAdmin();
  })
  .then(() => {
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });