require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');

const { sequelize, User } = require('./models');

const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/application');
const adminRoutes = require('./routes/admin');
const adminExtraRoutes = require('./routes/admin_extra');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminExtraRoutes);

// Health check
app.get('/', (req, res) => {
res.status(200).json({
success: true,
message: 'ESIHLAHLENI membership backend is running'
});
});

// Test database connection
async function testConnection() {
try {
await sequelize.authenticate();
console.log('Database connected successfully');
} catch (error) {
console.error('Unable to connect to database:', error);
throw error;
}
}

// Ensure default admin exists
async function ensureDefaultAdmin() {
try {
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;


if (!email || !password) {
  console.log('ADMIN_EMAIL or ADMIN_PASSWORD missing');
  return;
}

const existing = await User.findOne({
  where: { email: email }
});

if (existing) {
  console.log('Admin user already exists: ' + email);
  return;
}

const hashed = await bcrypt.hash(password, 10);

await User.create({
  name: 'Admin',
  email: email,
  password: hashed,
  role: 'admin'
});

console.log('Created default admin user: ' + email);


} catch (error) {
console.error('Error creating admin user:', error);
}
}

// Start server
async function startServer() {
try {
console.log('Starting application...');


await testConnection();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('Server listening on port ' + PORT);
});


} catch (error) {
console.error('Unable to start application:', error);
process.exit(1);
}
}

startServer();


