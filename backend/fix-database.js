import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const DB_URL = process.env.DB_URL;

async function fixDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(DB_URL);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const usersCollection = db.collection("users");

    console.log("\nChecking indexes...");
    const indexes = await usersCollection.indexes();
    console.log("Current indexes:", indexes.map(i => i.name));

    // Drop the clerkId index if it exists
    const clerkIdIndex = indexes.find(i => i.name === "clerkId_1");
    if (clerkIdIndex) {
      console.log("\n❌ Found problematic clerkId_1 index");
      console.log("Dropping clerkId_1 index...");
      await usersCollection.dropIndex("clerkId_1");
      console.log("✅ Dropped clerkId_1 index");
    } else {
      console.log("\n✅ No clerkId_1 index found");
    }

    // Show final indexes
    const finalIndexes = await usersCollection.indexes();
    console.log("\nFinal indexes:", finalIndexes.map(i => i.name));

    console.log("\n✅ Database fixed successfully!");
    console.log("You can now signup users without errors.");

    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error fixing database:", error);
    process.exit(1);
  }
}

fixDatabase();
