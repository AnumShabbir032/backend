import mongoose from "mongoose";
// import { DB_Name } from "../constant.js";

const connectDB = async () => {
  try {
     await mongoose.connect(
      `${process.env.MONGODB}`
    );
    console.log(`\n MongoDB connected !! `);
  } catch (error) {
    console.log("MongoDB connection error", error);
    process.exit(1)
  }
};

export default connectDB;