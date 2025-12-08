require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin@12345';
    const adminFirstName = 'Admin';
    const adminLastName = 'User';

    let user = await User.findOne({ email: adminEmail });

    if (user) {
      console.log(`User with email ${adminEmail} already exists.`);
      if (user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
        console.log(`Updated role to admin for ${adminEmail}`);
      } else {
        console.log(`User ${adminEmail} is already an admin.`);
      }
    } else {
      console.log(`Creating new admin user: ${adminEmail}`);
      const hashedPassword = await bcrypt.hash(adminPassword, 8);
      user = new User({
        firstName: adminFirstName,
        lastName: adminLastName,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isEmailVerified: true
      });
      await user.save();
      console.log(`Admin user created successfully.`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin();
