import mongoose from "mongoose";
import User from "./src/models/User.js";
import { ENV } from "./src/lib/env.js";

// Script to make a user an admin
// Usage: node make-admin.js <email>

const makeAdmin = async (email) => {
  try {
    // Connect to database
    await mongoose.connect(ENV.DB_URL);
    console.log("✅ Connected to MongoDB");

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      console.error(`❌ User with email "${email}" not found`);
      process.exit(1);
    }

    // Update role to admin
    user.role = "admin";
    await user.save();

    console.log(`✅ Successfully made ${user.name} (${user.email}) an admin!`);
    console.log(`   User ID: ${user._id}`);
    console.log(`   Role: ${user.role}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
};

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error("❌ Please provide an email address");
  console.log("Usage: node make-admin.js <email>");
  console.log("Example: node make-admin.js user@example.com");
  process.exit(1);
}

makeAdmin(email);
