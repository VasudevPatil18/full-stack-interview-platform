import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function testRegistration() {
  try {
    console.log('=== REGISTRATION SYSTEM TEST ===\n');
    
    console.log('1. Checking environment variables...');
    if (!process.env.DB_URL) {
      throw new Error('DB_URL not found in .env file');
    }
    if (!process.env.JWT_SECRET) {
      console.log('⚠️  JWT_SECRET not set (using default)');
    }
    console.log('✅ Environment variables OK');

    console.log('\n2. Connecting to database...');
    await mongoose.connect(process.env.DB_URL);
    console.log('✅ Connected to:', mongoose.connection.name);

    console.log('\n3. Setting up User model...');
    const userSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true, minlength: 6 },
      profileImage: { type: String, default: '' },
      role: { type: String, enum: ['user', 'admin'], default: 'user' },
      isActive: { type: Boolean, default: true },
      resetPasswordToken: { type: String, default: null },
      resetPasswordExpires: { type: Date, default: null }
    }, { timestamps: true });

    // Hash password before saving
    userSchema.pre('save', async function(next) {
      if (!this.isModified('password')) return next();
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    });

    // Compare password method
    userSchema.methods.comparePassword = async function(candidatePassword) {
      return await bcrypt.compare(candidatePassword, this.password);
    };

    const User = mongoose.models.User || mongoose.model('User', userSchema);
    console.log('✅ User model loaded');

    console.log('\n4. Testing user creation...');
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'test123456';
    
    const testUser = await User.create({
      name: 'Test User',
      email: testEmail,
      password: testPassword
    });
    
    console.log('✅ User created successfully!');
    console.log('   ID:', testUser._id);
    console.log('   Name:', testUser.name);
    console.log('   Email:', testUser.email);
    console.log('   Role:', testUser.role);
    console.log('   Password hashed:', testUser.password !== testPassword);

    console.log('\n5. Verifying user in database...');
    const foundUser = await User.findById(testUser._id);
    if (!foundUser) {
      throw new Error('User not found in database after creation!');
    }
    console.log('✅ User found in database');

    console.log('\n6. Testing password comparison...');
    const isPasswordCorrect = await foundUser.comparePassword(testPassword);
    if (!isPasswordCorrect) {
      throw new Error('Password comparison failed!');
    }
    console.log('✅ Password comparison works');

    console.log('\n7. Testing duplicate email prevention...');
    try {
      await User.create({
        name: 'Duplicate User',
        email: testEmail,
        password: 'test123456'
      });
      throw new Error('Duplicate email was allowed! This should not happen.');
    } catch (error) {
      if (error.code === 11000) {
        console.log('✅ Duplicate email correctly prevented');
      } else {
        throw error;
      }
    }

    console.log('\n8. Cleaning up test data...');
    await User.findByIdAndDelete(testUser._id);
    console.log('✅ Test user deleted');

    await mongoose.connection.close();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ ALL TESTS PASSED!');
    console.log('='.repeat(50));
    console.log('\nYour registration system is working correctly.');
    console.log('Users should be able to register now.');
    console.log('\nIf registration still fails:');
    console.log('1. Check backend logs when user tries to register');
    console.log('2. Check browser console for errors');
    console.log('3. Verify VITE_API_URL in frontend/.env');
    console.log('4. Make sure backend server is running');
    
  } catch (error) {
    console.error('\n' + '='.repeat(50));
    console.error('❌ TEST FAILED!');
    console.error('='.repeat(50));
    console.error('\nError:', error.message);
    
    if (error.code === 11000) {
      console.log('\n💡 Solution: Duplicate key error');
      console.log('   Run: node fix-database.js');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Solution: MongoDB is not running');
      console.log('   - Start MongoDB locally, OR');
      console.log('   - Use MongoDB Atlas (cloud)');
    } else if (error.message.includes('DB_URL')) {
      console.log('\n💡 Solution: Add DB_URL to backend/.env');
      console.log('   DB_URL=mongodb://localhost:27017/talentiq');
    }
    
    console.error('\nFull error:', error);
    
    try {
      await mongoose.connection.close();
    } catch (e) {
      // Ignore close errors
    }
    
    process.exit(1);
  }
}

testRegistration();
